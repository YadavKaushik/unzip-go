import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Headphones, Volume2, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { db as supabase } from '@/lib/db';
import { Duration, DURATIONS, MULTIPLIERS, pad, getRoundState, buildPeriodId, seededRand } from '@/lib/lotteryShared';

type Pos = 'A' | 'B' | 'C' | 'D' | 'E' | 'SUM';

interface FivedResult { a: number; b: number; c: number; d: number; e: number; sum: number; }

function fivedPayoutMul(bet: { position: string; selection_type: string; selection_value: string }, r: FivedResult): number {
  const map: Record<string, number> = { A: r.a, B: r.b, C: r.c, D: r.d, E: r.e, SUM: r.sum };
  const v = map[bet.position];
  if (bet.selection_type === 'digit') {
    return Number(bet.selection_value) === v ? 9 : 0;
  }
  if (bet.selection_type === 'size') {
    const isBig = bet.position === 'SUM' ? v >= 23 : v >= 5;
    if (bet.selection_value === 'big' && isBig) return 1.98;
    if (bet.selection_value === 'small' && !isBig) return 1.98;
    return 0;
  }
  if (bet.selection_type === 'parity') {
    if (bet.selection_value === 'odd' && v % 2 === 1) return 1.98;
    if (bet.selection_value === 'even' && v % 2 === 0) return 1.98;
    return 0;
  }
  return 0;
}

function buildFivedDeterministic(periodId: string): FivedResult {
  const a = seededRand(periodId, 0, 10);
  const b = seededRand(periodId, 1, 10);
  const c = seededRand(periodId, 2, 10);
  const d = seededRand(periodId, 3, 10);
  const e = seededRand(periodId, 4, 10);
  return { a, b, c, d, e, sum: a + b + c + d + e };
}

// House-favourable: try a small set of candidates (deterministic + nearby variations)
async function findOptimalFived(periodId: string, pendings: any[]): Promise<FivedResult> {
  if (!pendings.length) return buildFivedDeterministic(periodId);
  // Generate 200 candidate combinations seeded by periodId
  const candidates: FivedResult[] = [];
  for (let i = 0; i < 200; i++) {
    const a = seededRand(periodId, i * 5, 10);
    const b = seededRand(periodId, i * 5 + 1, 10);
    const c = seededRand(periodId, i * 5 + 2, 10);
    const d = seededRand(periodId, i * 5 + 3, 10);
    const e = seededRand(periodId, i * 5 + 4, 10);
    candidates.push({ a, b, c, d, e, sum: a + b + c + d + e });
  }
  let best = candidates[0]; let bestPayout = Infinity;
  for (const r of candidates) {
    let total = 0;
    for (const bet of pendings) total += Number(bet.amount) * fivedPayoutMul(bet, r);
    if (total < bestPayout) { bestPayout = total; best = r; }
  }
  return best;
}

const Ball: React.FC<{ n: number; size?: number; gold?: boolean }> = ({ n, size = 36, gold }) => (
  <div className="relative rounded-full flex items-center justify-center font-black"
    style={{
      width: size, height: size,
      background: gold ? 'radial-gradient(circle at 30% 25%, #fff7c2, #f5d060 60%, #a87814)' : 'radial-gradient(circle at 30% 25%, #fff, #f5f5f5 60%, #d0d0d0)',
      boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.8), 0 3px 6px rgba(0,0,0,0.2)',
      color: gold ? '#5a0000' : '#8B0000', fontSize: size * 0.5,
    }}>{n}</div>
);

interface BetDraft { position: Pos; type: string; value: string; label: string; multHint: string; }

export default function FiveD() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [duration, setDuration] = useState<Duration>(60);
  const [{ remaining, periodId }, setRound] = useState(() => getRoundState(60, 'FD'));
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [myBets, setMyBets] = useState<any[]>([]);
  const [tab, setTab] = useState<'record' | 'mine'>('record');
  const [pos, setPos] = useState<Pos>('A');
  const [draft, setDraft] = useState<BetDraft | null>(null);
  const [mult, setMult] = useState(1);
  const [base, setBase] = useState(1);
  const [agree, setAgree] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const lastSettled = useRef('');
  const [refreshingBal, setRefreshingBal] = useState(false);
  const [resultBanner, setResultBanner] = useState<null | { won: boolean; amount: number; r: FivedResult }>(null);

  useEffect(() => { const tick = () => setRound(getRoundState(duration, 'FD')); tick(); const id = setInterval(tick, 250); return () => clearInterval(id); }, [duration]);

  const loadBalance = useCallback(async (showToast = false) => {
    if (!user) return;
    setRefreshingBal(true);
    try {
      const { data } = await supabase.from('wallets').select('balance').eq('user_id', user.id).maybeSingle();
      if (data) setBalance(Number(data.balance) || 0);
      if (showToast) toast.success('Balance updated');
    } finally { setTimeout(() => setRefreshingBal(false), 400); }
  }, [user]);
  useEffect(() => { loadBalance(); }, [loadBalance]);

  const loadHistory = useCallback(async () => {
    const { data } = await supabase.from('fived_rounds').select('*').eq('duration_seconds', duration).order('created_at', { ascending: false }).limit(20);
    setHistory(data || []);
  }, [duration]);
  const loadMyBets = useCallback(async () => {
    if (!user) return setMyBets([]);
    const { data } = await supabase.from('fived_bets').select('*').eq('user_id', user.id).eq('duration_seconds', duration).order('created_at', { ascending: false }).limit(20);
    setMyBets(data || []);
  }, [user, duration]);
  useEffect(() => { loadHistory(); loadMyBets(); }, [loadHistory, loadMyBets]);

  useEffect(() => {
    if (remaining !== duration) return;
    const prev = buildPeriodId(new Date(Date.now() - 1000), duration, 'FD');
    if (prev === lastSettled.current) return;
    lastSettled.current = prev;
    (async () => {
      const { data: pendings } = await supabase.from('fived_bets').select('*').eq('period_id', prev).eq('duration_seconds', duration).eq('status', 'pending');
      const r = await findOptimalFived(prev, pendings || []);
      await supabase.from('fived_rounds').upsert({
        period_id: prev, duration_seconds: duration, a: r.a, b: r.b, c: r.c, d: r.d, e: r.e, sum: r.sum,
      }, { onConflict: 'period_id' });
      if (user) {
        const mine = (pendings || []).filter((b: any) => b.user_id === user.id);
        let totalPayout = 0;
        for (const b of mine) {
          const m = fivedPayoutMul(b, r);
          const payout = Number(b.amount) * m;
          totalPayout += payout;
          await supabase.from('fived_bets').update({ status: payout > 0 ? 'won' : 'lost', payout }).eq('id', b.id);
        }
        if (mine.length) {
          if (totalPayout > 0) {
            const newBal = balance + totalPayout;
            await supabase.from('wallets').update({ balance: newBal }).eq('user_id', user.id);
            setResultBanner({ won: true, amount: totalPayout, r });
          } else setResultBanner({ won: false, amount: 0, r });
        }
      }
      setTimeout(() => { loadHistory(); loadMyBets(); loadBalance(); }, 2000);
    })();
  }, [remaining, duration, user, balance, loadHistory, loadMyBets, loadBalance]);

  useEffect(() => { if (resultBanner) { const t = setTimeout(() => setResultBanner(null), 4000); return () => clearTimeout(t); } }, [resultBanner]);

  const openBet = (d: BetDraft) => {
    if (!user) { toast.error('Please login'); navigate('/sign-up-login-screen'); return; }
    if (remaining <= 5) { toast.error('Betting closed'); return; }
    setDraft(d); setMult(1); setBase(1); setAgree(true);
  };

  const totalBet = base * mult;
  const placeBet = async () => {
    if (!draft || !user) return;
    if (!agree) return toast.error('Please agree to rules');
    if (totalBet <= 0) return toast.error('Invalid amount');
    if (totalBet > balance) return toast.error('Insufficient balance');
    setPlacing(true);
    try {
      const { error } = await supabase.from('fived_bets').insert({
        user_id: user.id, period_id: periodId, duration_seconds: duration,
        position: draft.position, selection_type: draft.type, selection_value: draft.value, multiplier: mult, amount: totalBet,
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
  const lastRound = history[0];

  return (
    <div className="min-h-screen w-full text-foreground flex flex-col" style={{ background: '#f5f5f5' }}>
      {/* Header */}
      <div className="relative px-3 pt-3 pb-4 flex items-center justify-between border-b-2 border-[#f5d060]/60"
        style={{ background: 'radial-gradient(circle at 20% 0%, rgba(245,208,96,0.18), transparent 55%), linear-gradient(180deg, #8B0000 0%, #C8102E 100%)' }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full flex items-center justify-center border border-[#f5d060]/50 bg-black/20 text-[#f5d060]"><ArrowLeft size={18} /></button>
        <div className="flex items-center gap-2">
          <h1 className="font-serif font-black tracking-[0.08em] text-[22px]" style={{ background: 'linear-gradient(180deg,#fff4c2,#f5d060,#a87814)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Techie<sup className="text-[12px]">404</sup></h1>
          <span className="text-[10px] font-semibold text-[#f5d060]/90 tracking-widest border-l border-[#f5d060]/40 pl-2">5D · {durationLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full flex items-center justify-center border border-[#f5d060]/50 bg-black/20 text-[#f5d060]"><Headphones size={16} /></button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center border border-[#f5d060]/50 bg-black/20 text-[#f5d060]"><Volume2 size={16} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {/* Wallet */}
        <div className="mx-3 mt-3 rounded-2xl p-4 shadow-md border border-red-100 bg-white">
          <div className="flex items-center justify-center gap-2 text-2xl font-extrabold" style={{ color: '#8B0000' }}>
            ₹{balance.toFixed(2)}
            <button onClick={() => loadBalance(true)} disabled={refreshingBal} className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center"><RefreshCw size={13} className={`text-red-700 ${refreshingBal ? 'animate-spin' : ''}`} /></button>
          </div>
          <div className="text-center text-xs text-gray-500 mt-1">💳 wallet balance</div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <button onClick={() => navigate('/withdraw')} className="py-2.5 rounded-full font-bold text-white" style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)' }}>Withdraw</button>
            <button onClick={() => navigate('/deposit')} className="py-2.5 rounded-full font-bold text-[#8B0000]" style={{ background: 'linear-gradient(135deg,#fde68a,#fbbf24)' }}>Deposit</button>
          </div>
        </div>

        {/* Duration */}
        <div className="mx-3 mt-3 grid grid-cols-4 gap-2">
          {DURATIONS.map(({ d, short }) => {
            const active = d === duration;
            return (
              <button key={d} onClick={() => setDuration(d)}
                className={`rounded-xl py-3 flex flex-col items-center justify-center transition border ${active ? 'shadow-lg border-transparent' : 'bg-white border-red-100'}`}
                style={active ? { background: 'linear-gradient(135deg, #C8102E, #8B0000)' } : undefined}>
                <span className="text-base">🎰</span>
                <div className={`text-[10px] font-semibold leading-tight text-center ${active ? 'text-[#f5d060]' : 'text-gray-700'}`}>5D Lotre<br />{short}</div>
              </button>
            );
          })}
        </div>

        {/* Last result row */}
        <div className="mx-3 mt-3 rounded-2xl p-3 shadow-md border border-red-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500">Lottery<br />results</div>
            <div className="flex items-center gap-1.5">
              {(['a', 'b', 'c', 'd', 'e'] as const).map((k, i) => (
                <div key={k} className="flex flex-col items-center gap-0.5">
                  <Ball n={lastRound?.[k] ?? 0} size={28} />
                  <span className="text-[10px] font-bold text-[#8B0000]">{'ABCDE'[i]}</span>
                </div>
              ))}
              <span className="font-bold text-[#8B0000] mx-1">=</span>
              <Ball n={lastRound?.sum ?? 0} size={32} gold />
            </div>
          </div>
        </div>

        {/* Period + Timer */}
        <div className="mx-3 mt-3 rounded-2xl p-3 shadow-md border border-red-100 bg-white">
          <div className="flex items-start justify-between">
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
                style={{ background: 'linear-gradient(180deg, #1a0000, #2a0505)', border: '1.5px solid #f5d060' }}>
                <span className={`font-mono font-black text-2xl leading-none tracking-[0.08em] ${isClosing ? 'animate-pulse' : ''}`}
                  style={{ color: isClosing ? '#ff6b6b' : '#f5d060' }}>{mm}:{ss}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bet panel */}
        <div className="relative mx-3 mt-3 rounded-2xl p-3 shadow-lg border-2 border-[#f5d060]/40 bg-white">
          <div className="grid grid-cols-6 gap-1 mb-3">
            {(['A', 'B', 'C', 'D', 'E', 'SUM'] as Pos[]).map(p => (
              <button key={p} onClick={() => setPos(p)}
                className={`py-2 text-xs font-extrabold rounded-md ${pos === p ? 'text-[#5a0000]' : 'text-gray-500 bg-gray-100'}`}
                style={pos === p ? { background: 'linear-gradient(180deg,#fff4c2,#f5d060,#c89a1a)' } : undefined}>
                {p}
              </button>
            ))}
          </div>

          {/* Big/small/odd/even */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <button onClick={() => openBet({ position: pos, type: 'size', value: 'big', label: `${pos} Big`, multHint: '1.98X' })} className="py-2.5 rounded-md font-bold text-white text-xs" style={{ background: 'linear-gradient(180deg,#fbbf24,#f59e0b)' }}>Big 1.98</button>
            <button onClick={() => openBet({ position: pos, type: 'size', value: 'small', label: `${pos} Small`, multHint: '1.98X' })} className="py-2.5 rounded-md font-bold text-white text-xs" style={{ background: 'linear-gradient(180deg,#60a5fa,#3b82f6)' }}>Small 1.98</button>
            <button onClick={() => openBet({ position: pos, type: 'parity', value: 'odd', label: `${pos} Odd`, multHint: '1.98X' })} className="py-2.5 rounded-md font-bold text-white text-xs" style={{ background: 'linear-gradient(180deg,#fb7185,#dc2626)' }}>Odd 1.98</button>
            <button onClick={() => openBet({ position: pos, type: 'parity', value: 'even', label: `${pos} Even`, multHint: '1.98X' })} className="py-2.5 rounded-md font-bold text-white text-xs" style={{ background: 'linear-gradient(180deg,#34d399,#16a34a)' }}>Even 1.98</button>
          </div>

          {/* Digits 0-9 (skip for SUM since sum is 0-45) */}
          {pos !== 'SUM' ? (
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 10 }).map((_, n) => (
                <button key={n} onClick={() => openBet({ position: pos, type: 'digit', value: String(n), label: `${pos}=${n}`, multHint: '9X' })}
                  className="aspect-square rounded-full active:scale-90 flex flex-col items-center justify-center"
                  style={{ background: 'radial-gradient(circle at 30% 25%, #fff, #f5f5f5 60%, #c0c0c0)', boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.2), 0 3px 6px rgba(0,0,0,0.2)' }}>
                  <span className="text-2xl font-black" style={{ color: '#8B0000' }}>{n}</span>
                  <span className="text-[10px] font-bold text-[#a87814]">9X</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center text-xs text-gray-500 py-3">SUM only supports Big/Small/Odd/Even (range 0–45)</div>
          )}

          {/* Multipliers */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto scrollbar-hide">
            {MULTIPLIERS.map(m => (
              <button key={m} onClick={() => setMult(m)}
                className="px-3 py-1.5 text-xs rounded-md font-extrabold whitespace-nowrap"
                style={mult === m
                  ? { background: 'linear-gradient(180deg,#fff4c2,#f5d060,#a87814)', color: '#5a0000', border: '1px solid #a87814' }
                  : { background: '#fff', color: '#8B0000', border: '1px solid rgba(200,16,46,0.18)' }}>X{m}</button>
            ))}
          </div>

          {isClosing && remaining > 0 && (
            <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center z-20" style={{ background: 'rgba(15,0,0,0.55)', backdropFilter: 'blur(6px)' }}>
              <div className="font-black leading-none" style={{ fontSize: 100, fontFamily: 'monospace', background: 'linear-gradient(180deg,#fff4c2,#f5d060,#a87814)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{remaining}</div>
              <div className="mt-2 text-xs font-bold tracking-[0.25em] uppercase" style={{ color: '#f5d060' }}>Wait for the draw...</div>
            </div>
          )}
        </div>

        {/* History */}
        <div className="mx-3 mt-4">
          <div className="flex gap-1 mb-2">
            {([['record', 'Game Record'], ['mine', 'My Game Record']] as const).map(([k, label]) => (
              <button key={k} onClick={() => setTab(k)} className={`px-3 py-2 text-xs font-bold rounded-t-lg ${tab === k ? 'text-white shadow' : 'text-gray-500 bg-white/60'}`}
                style={tab === k ? { background: 'linear-gradient(135deg, #C8102E, #8B0000)' } : undefined}>{label}</button>
            ))}
          </div>
          <div className="rounded-xl p-2 shadow-md border border-red-100 bg-white overflow-x-auto">
            {tab === 'record' && (
              <table className="w-full text-xs">
                <thead><tr style={{ color: '#8B0000' }}><th className="py-2 text-left pl-2">Period</th><th>Result</th><th className="pr-2">SUM</th></tr></thead>
                <tbody>
                  {history.length === 0 && <tr><td colSpan={3} className="py-6 text-center text-gray-400">No data</td></tr>}
                  {history.map(h => (
                    <tr key={h.id} className="border-t border-red-50">
                      <td className="py-2 pl-2 text-gray-600 text-[10px]">{h.period_id}</td>
                      <td><div className="flex justify-center gap-1">{[h.a, h.b, h.c, h.d, h.e].map((n, i) => <Ball key={i} n={n} size={20} />)}</div></td>
                      <td className="pr-2 text-center"><Ball n={h.sum} size={22} gold /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === 'mine' && (
              <table className="w-full text-xs">
                <thead><tr style={{ color: '#8B0000' }}><th className="py-2 text-left pl-2">Period</th><th>Pick</th><th>Amount</th><th className="pr-2">Result</th></tr></thead>
                <tbody>
                  {myBets.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-gray-400">No bets</td></tr>}
                  {myBets.map(b => (
                    <tr key={b.id} className="border-t border-red-50">
                      <td className="py-2 pl-2 text-gray-600 text-[10px]">{b.period_id}</td>
                      <td className="text-center text-gray-700">{b.position}:{b.selection_value}</td>
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
              5D Lotre {duration === 60 ? '1Min' : duration === 180 ? '3Min' : duration === 300 ? '5Min' : '10Min'}
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
          <div onClick={e => e.stopPropagation()} className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl bg-white">
            <div className="px-5 py-3 text-center" style={{ background: 'linear-gradient(180deg,#8B0000,#C8102E)', borderBottom: '2px solid #f5d060' }}>
              <h2 className="font-extrabold text-lg" style={{ background: 'linear-gradient(180deg,#fff4c2,#f5d060,#a87814)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>How to Play 5D</h2>
            </div>
            <div className="px-5 py-4 text-[#3a0a0a] text-[12.5px] leading-relaxed space-y-2 max-h-[60vh] overflow-y-auto">
              <p>Each round draws 5 digits (0–9) labelled A, B, C, D, E. Their SUM is also a betting position.</p>
              <p>Pick a position, then bet on a specific digit (9x), Big/Small (1.98x), or Odd/Even (1.98x).</p>
              <p>For positions A–E: digits 0–4 are Small, 5–9 are Big. For SUM: 0–22 Small, 23–45 Big.</p>
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
            <div className="flex justify-center gap-2 my-3 items-center">
              {[resultBanner.r.a, resultBanner.r.b, resultBanner.r.c, resultBanner.r.d, resultBanner.r.e].map((n, i) => <Ball key={i} n={n} size={32} />)}
              <span className="font-bold text-[#8B0000]">=</span>
              <Ball n={resultBanner.r.sum} size={36} gold />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
