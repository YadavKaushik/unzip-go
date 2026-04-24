import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Headphones, Volume2, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { db as supabase } from '@/lib/db';
import { Duration, DURATIONS, MULTIPLIERS, pad, getRoundState, buildPeriodId, hashStr, seededRand } from '@/lib/lotteryShared';

// ─── K3 result generation ─────────────────────────────────────────
// "smallest payout wins" — pick the dice triple (out of all 216) that has the
// minimum total payout across this period's pending bets. Deterministic fallback.
type K3Result = { d1: number; d2: number; d3: number; sum: number; size: 'Big' | 'Small'; parity: 'Odd' | 'Even' };

function k3PayoutMul(b: { selection_type: string; selection_value: string }, r: K3Result): number {
  const dice = [r.d1, r.d2, r.d3].sort();
  const isAllSame = dice[0] === dice[1] && dice[1] === dice[2];
  const isPair = dice[0] === dice[1] || dice[1] === dice[2];
  const isDiff = !isPair;
  const sumStr = String(r.sum);
  const v = b.selection_value;
  switch (b.selection_type) {
    case 'sum': // 3..18
      return v === sumStr ? K3_SUM_MUL[r.sum] || 0 : 0;
    case 'size':
      if (r.sum === 3 || r.sum === 18) return 0; // triple 1 / triple 6 voids size & parity
      if (v === r.size.toLowerCase()) return 1.92;
      return 0;
    case 'parity':
      if (r.sum === 3 || r.sum === 18) return 0;
      if (v === r.parity.toLowerCase()) return 1.92;
      return 0;
    case 'twoSame': // value: "1"-"6" any pair
      if (isPair) {
        const num = isAllSame ? dice[0] : (dice[0] === dice[1] ? dice[0] : dice[1]);
        return num === Number(v) ? 13.83 : 0;
      }
      return 0;
    case 'threeSame': // value: "1"-"6"
      return isAllSame && dice[0] === Number(v) ? 207.36 : 0;
    case 'threeAny': // any triple
      return isAllSame ? 34.56 : 0;
    case 'diff': // 3 different numbers
      return isDiff ? 8.3 : 0;
    default: return 0;
  }
}

const K3_SUM_MUL: Record<number, number> = {
  3: 207.36, 4: 69.12, 5: 34.56, 6: 20.74, 7: 13.83, 8: 9.88, 9: 8.3, 10: 7.68,
  11: 7.68, 12: 8.3, 13: 9.88, 14: 13.83, 15: 20.74, 16: 34.56, 17: 69.12, 18: 207.36,
};

function buildK3Result(periodId: string): K3Result {
  const d1 = (seededRand(periodId, 0, 6)) + 1;
  const d2 = (seededRand(periodId, 1, 6)) + 1;
  const d3 = (seededRand(periodId, 2, 6)) + 1;
  const sum = d1 + d2 + d3;
  return { d1, d2, d3, sum, size: sum >= 11 ? 'Big' : 'Small', parity: sum % 2 === 0 ? 'Even' : 'Odd' };
}

// Find house-favourable result by enumerating 216 combos
async function findOptimalK3(periodId: string, pendings: any[]): Promise<K3Result> {
  if (!pendings.length) return buildK3Result(periodId);
  let best: K3Result | null = null;
  let bestPayout = Infinity;
  for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) for (let c = 1; c <= 6; c++) {
    const sum = a + b + c;
    const r: K3Result = { d1: a, d2: b, d3: c, sum, size: sum >= 11 ? 'Big' : 'Small', parity: sum % 2 === 0 ? 'Even' : 'Odd' };
    let total = 0;
    for (const bet of pendings) total += Number(bet.amount) * k3PayoutMul(bet, r);
    if (total < bestPayout) { bestPayout = total; best = r; }
  }
  return best || buildK3Result(periodId);
}

// ─── Dice face component ──────────────────────────────────────────
const Die: React.FC<{ n: number; size?: number }> = ({ n, size = 56 }) => {
  const dot = (key: number, top: string, left: string) => (
    <span key={key} className="absolute rounded-full bg-yellow-300" style={{
      width: size * 0.18, height: size * 0.18, top, left,
      boxShadow: 'inset 0 -1px 1px rgba(0,0,0,0.4)',
    }} />
  );
  const positions: Record<number, [string, string][]> = {
    1: [['41%', '41%']],
    2: [['18%', '18%'], ['64%', '64%']],
    3: [['15%', '15%'], ['41%', '41%'], ['67%', '67%']],
    4: [['18%', '18%'], ['18%', '64%'], ['64%', '18%'], ['64%', '64%']],
    5: [['15%', '15%'], ['15%', '67%'], ['41%', '41%'], ['67%', '15%'], ['67%', '67%']],
    6: [['15%', '20%'], ['41%', '20%'], ['67%', '20%'], ['15%', '62%'], ['41%', '62%'], ['67%', '62%']],
  };
  return (
    <div className="relative rounded-xl" style={{
      width: size, height: size,
      background: 'linear-gradient(145deg,#ef4444 0%,#dc2626 50%,#8B0000 100%)',
      boxShadow: 'inset 0 3px 6px rgba(255,255,255,0.3), inset 0 -3px 6px rgba(0,0,0,0.35), 0 4px 10px rgba(0,0,0,0.3)',
    }}>
      {(positions[n] || []).map(([t, l], i) => dot(i, t, l))}
    </div>
  );
};

interface BetDraft { type: string; value: string; label: string; multHint: string; }

export default function K3() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [duration, setDuration] = useState<Duration>(60);
  const [{ remaining, periodId }, setRound] = useState(() => getRoundState(60, 'K3'));
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [myBets, setMyBets] = useState<any[]>([]);
  const [tab, setTab] = useState<'record' | 'mine'>('record');
  const [betTab, setBetTab] = useState<'sum' | 'twoSame' | 'threeSame' | 'diff'>('sum');
  const [draft, setDraft] = useState<BetDraft | null>(null);
  const [mult, setMult] = useState(1);
  const [base, setBase] = useState(1);
  const [agree, setAgree] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const lastSettled = useRef('');
  const [refreshingBal, setRefreshingBal] = useState(false);
  const [resultBanner, setResultBanner] = useState<null | { won: boolean; amount: number; r: K3Result }>(null);

  useEffect(() => {
    const tick = () => setRound(getRoundState(duration, 'K3'));
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [duration]);

  const loadBalance = useCallback(async (showToast = false) => {
    if (!user) return;
    setRefreshingBal(true);
    try {
      const { data } = await supabase.from('wallets').select('balance').eq('user_id', user.id).maybeSingle();
      if (data) setBalance(Number(data.balance) || 0);
      if (showToast) toast.success('Balance updated');
    } finally {
      setTimeout(() => setRefreshingBal(false), 400);
    }
  }, [user]);
  useEffect(() => { loadBalance(); }, [loadBalance]);

  const loadHistory = useCallback(async () => {
    const { data } = await supabase.from('k3_rounds').select('*').eq('duration_seconds', duration).order('created_at', { ascending: false }).limit(20);
    setHistory(data || []);
  }, [duration]);
  const loadMyBets = useCallback(async () => {
    if (!user) return setMyBets([]);
    const { data } = await supabase.from('k3_bets').select('*').eq('user_id', user.id).eq('duration_seconds', duration).order('created_at', { ascending: false }).limit(20);
    setMyBets(data || []);
  }, [user, duration]);
  useEffect(() => { loadHistory(); loadMyBets(); }, [loadHistory, loadMyBets]);

  // settle on round change
  useEffect(() => {
    if (remaining !== duration) return;
    const prev = buildPeriodId(new Date(Date.now() - 1000), duration, 'K3');
    if (prev === lastSettled.current) return;
    lastSettled.current = prev;
    (async () => {
      // load all pending bets across all users for this period (smallest-payout logic)
      const { data: pendings } = await supabase.from('k3_bets').select('*').eq('period_id', prev).eq('duration_seconds', duration).eq('status', 'pending');
      const r = await findOptimalK3(prev, pendings || []);
      await supabase.from('k3_rounds').upsert({
        period_id: prev, duration_seconds: duration, d1: r.d1, d2: r.d2, d3: r.d3, sum: r.sum,
        size: r.size, parity: r.parity,
      }, { onConflict: 'period_id' });
      // settle current user's bets
      if (user) {
        const mine = (pendings || []).filter((b: any) => b.user_id === user.id);
        let totalPayout = 0;
        for (const b of mine) {
          const m = k3PayoutMul(b, r);
          const payout = Number(b.amount) * m;
          totalPayout += payout;
          await supabase.from('k3_bets').update({ status: payout > 0 ? 'won' : 'lost', payout }).eq('id', b.id);
        }
        if (mine.length) {
          if (totalPayout > 0) {
            const newBal = balance + totalPayout;
            await supabase.from('wallets').update({ balance: newBal }).eq('user_id', user.id);
            setResultBanner({ won: true, amount: totalPayout, r });
          } else {
            setResultBanner({ won: false, amount: 0, r });
          }
        }
      }
      setTimeout(() => { loadHistory(); loadMyBets(); loadBalance(); }, 2000);
    })();
  }, [remaining, duration, user, balance, loadHistory, loadMyBets, loadBalance]);

  useEffect(() => { if (resultBanner) { const t = setTimeout(() => setResultBanner(null), 4000); return () => clearTimeout(t); } }, [resultBanner]);

  const openBet = (d: BetDraft) => {
    if (!user) { toast.error('Please login to play'); navigate('/sign-up-login-screen'); return; }
    if (remaining <= 5) { toast.error('Betting closed'); return; }
    setDraft(d); setMult(1); setBase(1); setAgree(true);
  };

  const totalBet = base * mult;
  const placeBet = async () => {
    if (!draft || !user) return;
    if (!agree) return toast.error('Please agree to the rules');
    if (totalBet <= 0) return toast.error('Invalid amount');
    if (totalBet > balance) return toast.error('Insufficient balance');
    setPlacing(true);
    try {
      const { error } = await supabase.from('k3_bets').insert({
        user_id: user.id, period_id: periodId, duration_seconds: duration,
        selection_type: draft.type, selection_value: draft.value, multiplier: mult, amount: totalBet,
      });
      if (error) throw error;
      const newBal = balance - totalBet;
      await supabase.from('wallets').update({ balance: newBal }).eq('user_id', user.id);
      setBalance(newBal);
      supabase.functions.invoke('place-bet', { body: { amount: totalBet, type: 'bet', reference_id: periodId } }).catch(() => {});
      toast.success('Bet placed');
      setDraft(null); loadMyBets();
    } catch (e: any) { toast.error(e?.message || 'Failed'); } finally { setPlacing(false); }
  };

  const mm = pad(Math.floor(remaining / 60), 2);
  const ss = pad(remaining % 60, 2);
  const isClosing = remaining <= 5;
  const durationLabel = duration === 60 ? '1MIN' : duration === 180 ? '3MIN' : duration === 300 ? '5MIN' : '10MIN';

  return (
    <div className="min-h-screen w-full text-foreground flex flex-col" style={{ background: '#f5f5f5' }}>
      {/* Header */}
      <div className="relative px-3 pt-3 pb-4 flex items-center justify-between border-b-2 border-[#f5d060]/60"
        style={{
          background: 'radial-gradient(circle at 20% 0%, rgba(245,208,96,0.18) 0%, transparent 55%), radial-gradient(circle at 80% 100%, rgba(245,208,96,0.15) 0%, transparent 55%), linear-gradient(180deg, #8B0000 0%, #C8102E 100%)',
          boxShadow: '0 4px 18px rgba(0,0,0,0.25), inset 0 -1px 0 rgba(245,208,96,0.4)',
        }}>
        <button onClick={() => navigate(-1)} className="relative w-9 h-9 rounded-full flex items-center justify-center border border-[#f5d060]/50 bg-black/20 text-[#f5d060]">
          <ArrowLeft size={18} />
        </button>
        <div className="relative flex items-center gap-2 px-2">
          <h1 className="font-serif font-black tracking-[0.08em] text-[22px] leading-none whitespace-nowrap"
            style={{ background: 'linear-gradient(180deg,#fff4c2 0%,#f5d060 45%,#a87814 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }}>
            Techie<sup className="text-[12px]">404</sup>
          </h1>
          <span className="text-[10px] font-semibold text-[#f5d060]/90 tracking-widest border-l border-[#f5d060]/40 pl-2 ml-1">K3 · {durationLabel}</span>
        </div>
        <div className="relative flex items-center gap-2">
          <button className="w-9 h-9 rounded-full flex items-center justify-center border border-[#f5d060]/50 bg-black/20 text-[#f5d060]"><Headphones size={16} /></button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center border border-[#f5d060]/50 bg-black/20 text-[#f5d060]"><Volume2 size={16} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {/* Wallet */}
        <div className="mx-3 mt-3 rounded-2xl p-4 shadow-md border border-red-100 bg-white">
          <div className="flex items-center justify-center gap-2 text-2xl font-extrabold" style={{ color: '#8B0000' }}>
            ₹{balance.toFixed(2)}
            <button onClick={() => loadBalance(true)} disabled={refreshingBal} className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center active:scale-90 transition disabled:opacity-60">
              <RefreshCw size={13} className={`text-red-700 ${refreshingBal ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="text-center text-xs text-gray-500 mt-1 flex items-center justify-center gap-1"><span>💳</span> wallet balance</div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <button onClick={() => navigate('/withdraw')} className="py-2.5 rounded-full font-bold text-white" style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)' }}>Withdraw</button>
            <button onClick={() => navigate('/deposit')} className="py-2.5 rounded-full font-bold text-[#8B0000]" style={{ background: 'linear-gradient(135deg,#fde68a,#fbbf24)' }}>Deposit</button>
          </div>
        </div>

        {/* Duration tabs */}
        <div className="mx-3 mt-3 grid grid-cols-4 gap-2">
          {DURATIONS.map(({ d, short }) => {
            const active = d === duration;
            return (
              <button key={d} onClick={() => setDuration(d)}
                className={`rounded-xl py-3 flex flex-col items-center justify-center transition border ${active ? 'shadow-lg border-transparent' : 'bg-white border-red-100'}`}
                style={active ? { background: 'linear-gradient(135deg, #C8102E, #8B0000)' } : undefined}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${active ? 'bg-white/15' : 'bg-red-50'}`}><span className="text-base">🎲</span></div>
                <div className={`text-[10px] font-semibold leading-tight text-center ${active ? 'text-[#f5d060]' : 'text-gray-700'}`}>K3 Lotre<br />{short}</div>
              </button>
            );
          })}
        </div>

        {/* Period + Timer + Dice display */}
        <div className="mx-3 mt-3 rounded-2xl p-3 shadow-md border border-red-100" style={{ background: 'linear-gradient(135deg, #fff 0%, #fff5f5 100%)' }}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <button onClick={() => setShowHowTo(true)} className="px-3 py-1 rounded-full text-xs flex items-center gap-1 text-[#8B0000] bg-red-50 border border-red-100">
                <HelpCircle size={12} /> How to play
              </button>
              <div className="text-xs text-gray-500 mt-2">Issue</div>
              <div className="font-extrabold text-sm" style={{ color: '#8B0000' }}>{periodId}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-500 mb-1 tracking-widest">TIME LEFT TO BUY</div>
              <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md"
                style={{ background: 'linear-gradient(180deg, #1a0000 0%, #2a0505 100%)', border: '1.5px solid #f5d060', boxShadow: isClosing ? '0 0 14px rgba(245,208,96,0.65)' : '0 2px 8px rgba(0,0,0,0.35)' }}>
                <span className={`font-mono font-black text-2xl leading-none tracking-[0.08em] ${isClosing ? 'animate-pulse' : ''}`}
                  style={{ color: isClosing ? '#ff6b6b' : '#f5d060', textShadow: '0 0 6px rgba(245,208,96,0.85)' }}>
                  {mm}:{ss}
                </span>
              </div>
            </div>
          </div>
          {/* dice tray */}
          <div className="rounded-xl p-3 flex justify-center gap-3" style={{ background: 'linear-gradient(180deg,#1a0000,#3a0a0a)', border: '2px solid #f5d060' }}>
            {history[0] ? (
              <>
                <Die n={history[0].d1} />
                <Die n={history[0].d2} />
                <Die n={history[0].d3} />
              </>
            ) : (
              <><Die n={1} /><Die n={1} /><Die n={1} /></>
            )}
          </div>
        </div>

        {/* Bet panel */}
        <div className="relative mx-3 mt-3 rounded-2xl p-3 shadow-lg border-2 border-[#f5d060]/40"
          style={{ background: 'linear-gradient(135deg,#fff 0%,#fff5f5 100%)' }}>
          {/* Inner tabs */}
          <div className="grid grid-cols-4 gap-1 mb-3">
            {([['sum', 'Total Bet'], ['twoSame', '2 Same'], ['threeSame', '3 identical'], ['diff', 'Diff numbers']] as const).map(([k, label]) => (
              <button key={k} onClick={() => setBetTab(k)}
                className={`py-2 text-[11px] font-bold rounded-md ${betTab === k ? 'text-[#5a0000]' : 'text-gray-500 bg-white/60'}`}
                style={betTab === k ? { background: 'linear-gradient(180deg,#fff4c2,#f5d060,#c89a1a)' } : undefined}>
                {label}
              </button>
            ))}
          </div>

          {betTab === 'sum' && (
            <>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 16 }).map((_, i) => {
                  const sum = i + 3;
                  const isGreen = sum % 2 === 1;
                  return (
                    <button key={sum}
                      onClick={() => openBet({ type: 'sum', value: String(sum), label: `Sum ${sum}`, multHint: `${K3_SUM_MUL[sum]}X` })}
                      className="relative aspect-square rounded-full active:scale-90 transition flex flex-col items-center justify-center"
                      style={{
                        background: isGreen ? 'linear-gradient(135deg,#34d399,#16a34a)' : 'linear-gradient(135deg,#fb7185,#dc2626)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2), inset 0 -3px 6px rgba(0,0,0,0.2), inset 0 2px 5px rgba(255,255,255,0.5)',
                      }}>
                      <span className="text-white font-black text-xl drop-shadow">{sum}</span>
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-4 gap-2 mt-1">
                {Array.from({ length: 16 }).map((_, i) => {
                  const sum = i + 3;
                  return <div key={sum} className="text-center text-[10px] font-bold text-[#8B0000]">{K3_SUM_MUL[sum]}X</div>;
                })}
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3">
                <button onClick={() => openBet({ type: 'size', value: 'big', label: 'Big', multHint: '1.92X' })} className="py-3 rounded-lg font-extrabold text-white" style={{ background: 'linear-gradient(180deg,#fbbf24,#f59e0b)' }}>Big<div className="text-[10px] font-medium">1.92X</div></button>
                <button onClick={() => openBet({ type: 'size', value: 'small', label: 'Small', multHint: '1.92X' })} className="py-3 rounded-lg font-extrabold text-white" style={{ background: 'linear-gradient(180deg,#60a5fa,#3b82f6)' }}>Small<div className="text-[10px] font-medium">1.92X</div></button>
                <button onClick={() => openBet({ type: 'parity', value: 'odd', label: 'Odd', multHint: '1.92X' })} className="py-3 rounded-lg font-extrabold text-white" style={{ background: 'linear-gradient(180deg,#fb7185,#dc2626)' }}>Odd<div className="text-[10px] font-medium">1.92X</div></button>
                <button onClick={() => openBet({ type: 'parity', value: 'even', label: 'Even', multHint: '1.92X' })} className="py-3 rounded-lg font-extrabold text-white" style={{ background: 'linear-gradient(180deg,#34d399,#16a34a)' }}>Even<div className="text-[10px] font-medium">1.92X</div></button>
              </div>
            </>
          )}

          {betTab === 'twoSame' && (
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <button key={n} onClick={() => openBet({ type: 'twoSame', value: String(n), label: `Pair ${n}`, multHint: '13.83X' })}
                  className="flex flex-col items-center gap-1 active:scale-95">
                  <div className="flex gap-1"><Die n={n} size={36} /><Die n={n} size={36} /></div>
                  <div className="text-[11px] font-bold text-[#8B0000]">13.83X</div>
                </button>
              ))}
            </div>
          )}

          {betTab === 'threeSame' && (
            <>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <button key={n} onClick={() => openBet({ type: 'threeSame', value: String(n), label: `Triple ${n}`, multHint: '207.36X' })}
                    className="flex flex-col items-center gap-1 active:scale-95">
                    <div className="flex gap-0.5"><Die n={n} size={28} /><Die n={n} size={28} /><Die n={n} size={28} /></div>
                    <div className="text-[11px] font-bold text-[#8B0000]">207.36X</div>
                  </button>
                ))}
              </div>
              <button onClick={() => openBet({ type: 'threeAny', value: 'any', label: 'Any triple', multHint: '34.56X' })}
                className="w-full mt-3 py-3 rounded-lg font-extrabold text-white" style={{ background: 'linear-gradient(180deg,#fbbf24,#f59e0b)' }}>
                Any triple <span className="text-xs">34.56X</span>
              </button>
            </>
          )}

          {betTab === 'diff' && (
            <button onClick={() => openBet({ type: 'diff', value: 'all', label: 'All different', multHint: '8.3X' })}
              className="w-full py-6 rounded-lg font-extrabold text-white text-lg" style={{ background: 'linear-gradient(180deg,#fb7185,#dc2626,#8B0000)' }}>
              All 3 different · 8.3X
            </button>
          )}

          {/* Multipliers */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto scrollbar-hide">
            {MULTIPLIERS.map(m => (
              <button key={m} onClick={() => setMult(m)}
                className="px-3 py-1.5 text-xs rounded-md font-extrabold whitespace-nowrap transition active:scale-95"
                style={mult === m
                  ? { background: 'linear-gradient(180deg,#fff4c2,#f5d060,#a87814)', color: '#5a0000', border: '1px solid #a87814' }
                  : { background: '#fff', color: '#8B0000', border: '1px solid rgba(200,16,46,0.18)' }}>
                X{m}
              </button>
            ))}
          </div>

          {isClosing && remaining > 0 && (
            <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center z-20"
              style={{ background: 'rgba(15,0,0,0.55)', backdropFilter: 'blur(6px)' }}>
              <div className="font-black leading-none" style={{ fontSize: 100, fontFamily: 'monospace', background: 'linear-gradient(180deg,#fff4c2,#f5d060,#a87814)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 18px rgba(245,208,96,0.85))' }}>{remaining}</div>
              <div className="mt-2 text-xs font-bold tracking-[0.25em] uppercase" style={{ color: '#f5d060' }}>Wait for the draw...</div>
            </div>
          )}
        </div>

        {/* History tabs */}
        <div className="mx-3 mt-4">
          <div className="flex gap-1 mb-2">
            {([['record', 'Game Record'], ['mine', 'My Game Record']] as const).map(([k, label]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`px-3 py-2 text-xs font-bold rounded-t-lg ${tab === k ? 'text-white shadow' : 'text-gray-500 bg-white/60'}`}
                style={tab === k ? { background: 'linear-gradient(135deg, #C8102E, #8B0000)' } : undefined}>{label}</button>
            ))}
          </div>
          <div className="rounded-xl p-2 shadow-md border border-red-100 bg-white overflow-x-auto">
            {tab === 'record' && (
              <table className="w-full text-xs">
                <thead><tr style={{ color: '#8B0000' }}><th className="py-2 text-left pl-2">Issue</th><th>Sum</th><th>Size</th><th>Odd/Even</th><th className="pr-2">Result</th></tr></thead>
                <tbody>
                  {history.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-gray-400">No data yet</td></tr>}
                  {history.map(h => (
                    <tr key={h.id} className="border-t border-red-50">
                      <td className="py-2 pl-2 text-gray-600 text-[10px]">{h.period_id}</td>
                      <td className="text-center font-bold">{h.sum}</td>
                      <td className="text-center capitalize">{h.size}</td>
                      <td className="text-center capitalize">{h.parity}</td>
                      <td className="pr-2"><div className="flex justify-center gap-1"><Die n={h.d1} size={20} /><Die n={h.d2} size={20} /><Die n={h.d3} size={20} /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === 'mine' && (
              <table className="w-full text-xs">
                <thead><tr style={{ color: '#8B0000' }}><th className="py-2 text-left pl-2">Period</th><th>Pick</th><th>Amount</th><th className="pr-2">Result</th></tr></thead>
                <tbody>
                  {myBets.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-gray-400">No bets yet</td></tr>}
                  {myBets.map(b => (
                    <tr key={b.id} className="border-t border-red-50">
                      <td className="py-2 pl-2 text-gray-600 text-[10px]">{b.period_id}</td>
                      <td className="text-center capitalize text-gray-700">{b.selection_type}:{b.selection_value}</td>
                      <td className="text-center text-gray-700">₹{Number(b.amount).toFixed(2)}</td>
                      <td className="pr-2 text-center font-bold" style={{ color: b.status === 'won' ? '#22c55e' : b.status === 'lost' ? '#ef4444' : '#f59e0b' }}>
                        {b.status === 'pending' ? '—' : b.status === 'won' ? `+₹${Number(b.payout).toFixed(2)}` : 'Lost'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Bet modal */}
      {draft && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60" onClick={() => setDraft(null)}>
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden bg-[#1a0a0a] border border-[#f5d060]/30" onClick={e => e.stopPropagation()}>
            <div className="px-4 py-3 text-center font-extrabold text-white" style={{ background: 'linear-gradient(135deg,#C8102E,#8B0000)' }}>
              K3 Lotre {duration === 60 ? '1Min' : duration === 180 ? '3Min' : duration === 300 ? '5Min' : '10Min'}
              <div className="text-xs font-medium opacity-90">Select {draft.label} · {draft.multHint}</div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="text-xs text-white/60 mb-1">Balance</div>
                <div className="flex gap-2">{[1, 10, 100, 1000].map(v => (
                  <button key={v} onClick={() => setBase(v)} className={`flex-1 py-2 rounded-md text-sm font-bold ${base === v ? 'bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-[#1a0a0a]' : 'bg-white/5 text-white/80'}`}>{v}</button>
                ))}</div>
              </div>
              <div>
                <div className="text-xs text-white/60 mb-1">Quantity</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setBase(Math.max(1, base - 1))} className="w-9 h-9 rounded-md bg-white/5 text-white text-lg">−</button>
                  <input value={base} onChange={e => setBase(Math.max(1, Number(e.target.value) || 1))} className="flex-1 h-9 rounded-md bg-white/10 text-center text-white font-bold" />
                  <button onClick={() => setBase(base + 1)} className="w-9 h-9 rounded-md bg-white/5 text-white text-lg">+</button>
                </div>
              </div>
              <div>
                <div className="text-xs text-white/60 mb-1">Multiplier</div>
                <div className="flex flex-wrap gap-1.5">{MULTIPLIERS.map(m => (
                  <button key={m} onClick={() => setMult(m)} className={`px-3 py-1.5 rounded-md text-xs font-bold ${mult === m ? 'bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-[#1a0a0a]' : 'bg-white/5 text-white/70'}`}>X{m}</button>
                ))}</div>
              </div>
              <label className="flex items-center gap-2 text-xs text-white/70">
                <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="accent-[#f5d060]" />
                I agree to the <span className="text-[#f5d060]">Pre-sale Rules</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setDraft(null)} className="py-3 rounded-lg bg-white/5 text-white font-bold">Cancel</button>
                <button disabled={placing} onClick={placeBet} className="py-3 rounded-lg font-bold text-[#1a0a0a] disabled:opacity-50" style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>
                  {placing ? 'Placing…' : `Total ₹${totalBet.toFixed(2)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showHowTo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-5" style={{ background: 'rgba(60,0,0,0.35)', backdropFilter: 'blur(8px)' }} onClick={() => setShowHowTo(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-[#e5b85a]/50 bg-white">
            <div className="px-5 py-3 text-center" style={{ background: 'linear-gradient(180deg,#8B0000,#C8102E)', borderBottom: '2px solid #f5d060' }}>
              <h2 className="font-extrabold text-lg" style={{ background: 'linear-gradient(180deg,#fff4c2,#f5d060,#a87814)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>How to Play K3</h2>
            </div>
            <div className="px-5 py-4 text-[#3a0a0a] text-[12.5px] leading-relaxed space-y-2 max-h-[60vh] overflow-y-auto">
              <p>Three dice are rolled each round. Bet on the sum (3–18), pair, triple, all-different, big/small, or odd/even.</p>
              <p>Triple 1 (sum 3) and Triple 6 (sum 18) <b>void</b> Big/Small and Odd/Even bets.</p>
              <p>Sum payouts vary from 1.92x to 207.36x (the harder the prediction, the higher the payout).</p>
              <button onClick={() => setShowHowTo(false)} className="w-full mt-3 py-2.5 rounded-lg font-bold text-white" style={{ background: 'linear-gradient(135deg,#C8102E,#8B0000)' }}>Got it</button>
            </div>
          </div>
        </div>
      )}

      {resultBanner && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-6" onClick={() => setResultBanner(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-2xl">
            <div className="text-lg font-extrabold mb-2" style={{ color: resultBanner.won ? '#16a34a' : '#dc2626' }}>
              {resultBanner.won ? `🎉 You won ₹${resultBanner.amount.toFixed(2)}` : 'Better luck next time'}
            </div>
            <div className="flex justify-center gap-2 my-3"><Die n={resultBanner.r.d1} /><Die n={resultBanner.r.d2} /><Die n={resultBanner.r.d3} /></div>
            <div className="text-sm text-gray-700">Sum {resultBanner.r.sum} · {resultBanner.r.size} · {resultBanner.r.parity}</div>
          </div>
        </div>
      )}
    </div>
  );
}
