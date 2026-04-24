import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Headphones, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { db as supabase } from '@/lib/db';
import { Duration, MULTIPLIERS, pad, getRoundState, buildPeriodId, hashStr } from '@/lib/lotteryShared';

const numberMeta = (n: number) => {
  const colors: ('red' | 'green' | 'violet')[] =
    n === 0 ? ['red', 'violet'] : n === 5 ? ['green', 'violet'] : n % 2 === 0 ? ['red'] : ['green'];
  const size = n >= 5 ? 'Big' : 'Small';
  return { colors, size };
};

const BALL_BG = (n: number) => {
  if (n === 0) return 'linear-gradient(135deg,#ef4444 0%,#ef4444 50%,#a855f7 50%,#a855f7 100%)';
  if (n === 5) return 'linear-gradient(135deg,#22c55e 0%,#22c55e 50%,#a855f7 50%,#a855f7 100%)';
  return n % 2 === 0
    ? 'linear-gradient(135deg,#fb7185 0%,#dc2626 100%)'
    : 'linear-gradient(135deg,#34d399 0%,#16a34a 100%)';
};

interface TrxResult { number: number; color: string; size: string; hash: string; blockId: number; blockTime: string; }

function trxPayoutMul(b: { selection_type: string; selection_value: string }, r: TrxResult): number {
  const meta = numberMeta(r.number);
  if (b.selection_type === 'number') return Number(b.selection_value) === r.number ? 9 : 0;
  if (b.selection_type === 'color') {
    if (b.selection_value === 'violet' && meta.colors.includes('violet')) return 4.5;
    if (b.selection_value === r.color) return meta.colors.includes('violet') ? 1.5 : 2;
    return 0;
  }
  if (b.selection_type === 'size') return b.selection_value === r.size ? 2 : 0;
  return 0;
}

function genHash(periodId: string): { hash: string; blockId: number; blockTime: string } {
  const h = hashStr(periodId);
  const hex = h.toString(16).padStart(8, '0');
  const longHash = (hex + (h * 7).toString(16).padStart(8, '0') + 'd289').slice(-32);
  const blockId = 82000000 + (h % 200000);
  const d = new Date();
  const blockTime = `${pad(d.getHours(), 2)}:${pad(d.getMinutes(), 2)}:${pad(d.getSeconds(), 2)}`;
  return { hash: longHash, blockId, blockTime };
}

async function findOptimalTrx(periodId: string, pendings: any[]): Promise<TrxResult> {
  const meta = genHash(periodId);
  if (!pendings.length) {
    const n = hashStr(periodId) % 10;
    const m = numberMeta(n);
    return { number: n, color: m.colors[0], size: m.size.toLowerCase(), ...meta };
  }
  let bestN = 0; let bestPayout = Infinity;
  for (let n = 0; n < 10; n++) {
    const m = numberMeta(n);
    const r = { number: n, color: m.colors[0], size: m.size.toLowerCase(), ...meta };
    let total = 0;
    for (const b of pendings) total += Number(b.amount) * trxPayoutMul(b, r);
    if (total < bestPayout) { bestPayout = total; bestN = n; }
  }
  const m = numberMeta(bestN);
  return { number: bestN, color: m.colors[0], size: m.size.toLowerCase(), ...meta };
}

interface BetDraft { type: 'color' | 'number' | 'size'; value: string; label: string; bg: string; }

export default function TrxWinGo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const duration: Duration = 60;
  const [{ remaining, periodId }, setRound] = useState(() => getRoundState(60, 'TX'));
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [myBets, setMyBets] = useState<any[]>([]);
  const [tab, setTab] = useState<'record' | 'mine'>('record');
  const [draft, setDraft] = useState<BetDraft | null>(null);
  const [mult, setMult] = useState(1);
  const [base, setBase] = useState(1);
  const [agree, setAgree] = useState(true);
  const [placing, setPlacing] = useState(false);
  const lastSettled = useRef('');
  const [refreshingBal, setRefreshingBal] = useState(false);
  const [resultBanner, setResultBanner] = useState<null | { won: boolean; amount: number; r: TrxResult }>(null);

  useEffect(() => { const tick = () => setRound(getRoundState(60, 'TX')); tick(); const id = setInterval(tick, 250); return () => clearInterval(id); }, []);

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
    const { data } = await supabase.from('trx_rounds').select('*').eq('duration_seconds', duration).order('created_at', { ascending: false }).limit(20);
    setHistory(data || []);
  }, []);
  const loadMyBets = useCallback(async () => {
    if (!user) return setMyBets([]);
    const { data } = await supabase.from('trx_bets').select('*').eq('user_id', user.id).eq('duration_seconds', duration).order('created_at', { ascending: false }).limit(20);
    setMyBets(data || []);
  }, [user]);
  useEffect(() => { loadHistory(); loadMyBets(); }, [loadHistory, loadMyBets]);

  useEffect(() => {
    if (remaining !== duration) return;
    const prev = buildPeriodId(new Date(Date.now() - 1000), duration, 'TX');
    if (prev === lastSettled.current) return;
    lastSettled.current = prev;
    (async () => {
      const { data: pendings } = await supabase.from('trx_bets').select('*').eq('period_id', prev).eq('duration_seconds', duration).eq('status', 'pending');
      const r = await findOptimalTrx(prev, pendings || []);
      await supabase.from('trx_rounds').upsert({
        period_id: prev, duration_seconds: duration, block_id: r.blockId, block_time: r.blockTime, hash: r.hash,
        number: r.number, color: r.color, size: r.size,
      }, { onConflict: 'period_id' });
      if (user) {
        const mine = (pendings || []).filter((b: any) => b.user_id === user.id);
        let totalPayout = 0;
        for (const b of mine) {
          const m = trxPayoutMul(b, r);
          const payout = Number(b.amount) * m;
          totalPayout += payout;
          await supabase.from('trx_bets').update({ status: payout > 0 ? 'won' : 'lost', payout }).eq('id', b.id);
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
  }, [remaining, user, balance, loadHistory, loadMyBets, loadBalance]);

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
      const { error } = await supabase.from('trx_bets').insert({
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
  const last5 = history.slice(0, 5);

  return (
    <div className="min-h-screen w-full text-foreground flex flex-col" style={{ background: '#f5f5f5' }}>
      <div className="relative px-3 pt-3 pb-4 flex items-center justify-between border-b-2 border-[#f5d060]/60"
        style={{ background: 'linear-gradient(180deg, #8B0000 0%, #C8102E 100%)' }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full flex items-center justify-center border border-[#f5d060]/50 bg-black/20 text-[#f5d060]"><ArrowLeft size={18} /></button>
        <div className="flex items-center gap-2">
          <h1 className="font-serif font-black tracking-[0.08em] text-[22px]" style={{ background: 'linear-gradient(180deg,#fff4c2,#f5d060,#a87814)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Techie<sup className="text-[12px]">404</sup></h1>
          <span className="text-[10px] font-semibold text-[#f5d060]/90 tracking-widest border-l border-[#f5d060]/40 pl-2">TRX · 1MIN</span>
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

        {/* Single duration selector */}
        <div className="mx-3 mt-3 rounded-2xl p-3 shadow-md border border-red-100 bg-white">
          <div className="grid grid-cols-4 gap-2">
            <button className="rounded-xl py-3 flex flex-col items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)' }}>
              <span className="text-base">⏱️</span>
              <div className="text-[10px] font-semibold leading-tight text-center text-[#f5d060]">Trx Win Go<br />1Min</div>
            </button>
            <div className="opacity-30 rounded-xl py-3 flex flex-col items-center justify-center bg-gray-100"><span className="text-[10px] text-gray-500">Coming soon</span></div>
            <div className="opacity-30 rounded-xl py-3 flex flex-col items-center justify-center bg-gray-100"><span className="text-[10px] text-gray-500">Coming soon</span></div>
            <div className="opacity-30 rounded-xl py-3 flex flex-col items-center justify-center bg-gray-100"><span className="text-[10px] text-gray-500">Coming soon</span></div>
          </div>
        </div>

        {/* Period + draw display */}
        <div className="mx-3 mt-3 rounded-2xl p-3 shadow-md border border-red-100" style={{ background: 'linear-gradient(135deg, #fff 0%, #fff5f5 100%)' }}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex gap-2 items-center">
                <span className="px-2 py-0.5 text-[10px] rounded bg-red-50 text-[#8B0000] font-bold">Period</span>
                <span className="px-2 py-0.5 text-[10px] rounded bg-red-50 text-[#8B0000] font-bold">How to play</span>
              </div>
              <div className="font-extrabold text-sm mt-2" style={{ color: '#8B0000' }}>{periodId}</div>
              <div className="text-xs text-gray-500 mt-1">Draw time</div>
            </div>
            <div className="text-right">
              <button className="text-[10px] px-2 py-1 rounded-full font-bold text-[#5a0000] mb-1.5" style={{ background: 'linear-gradient(180deg,#fff4c2,#f5d060,#c89a1a)' }}>Public chain query</button>
              <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md ml-1" style={{ background: 'linear-gradient(180deg, #1a0000, #2a0505)', border: '1.5px solid #f5d060' }}>
                <span className={`font-mono font-black text-2xl leading-none ${isClosing ? 'animate-pulse' : ''}`} style={{ color: isClosing ? '#ff6b6b' : '#f5d060' }}>{mm}:{ss}</span>
              </div>
            </div>
          </div>
          {/* Hash display: last 5 chars of latest hash as balls */}
          <div className="rounded-xl p-3 flex justify-center gap-2" style={{ background: 'linear-gradient(180deg,#1a0000,#3a0a0a)', border: '2px solid #f5d060' }}>
            {(history[0]?.hash || '00000').slice(-5).split('').map((ch: string, i: number) => {
              const n = isNaN(Number(ch)) ? ch.toUpperCase() : Number(ch);
              const isNum = !isNaN(Number(ch));
              return (
                <div key={i} className="w-12 h-12 rounded-full flex items-center justify-center font-black text-white text-lg"
                  style={{ background: isNum ? BALL_BG(Number(ch)) : 'linear-gradient(135deg,#fb7185,#dc2626)', boxShadow: '0 3px 8px rgba(0,0,0,0.4), inset 0 -3px 6px rgba(0,0,0,0.3)' }}>
                  <span className="text-white drop-shadow">{n}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bet panel */}
        <div className="relative mx-3 mt-3 rounded-2xl p-3 shadow-lg border-2 border-[#f5d060]/40" style={{ background: 'linear-gradient(135deg,#fff,#fff5f5)' }}>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { v: 'green', label: 'green', grad: 'linear-gradient(145deg,#34d399,#16a34a,#0e7a36)' },
              { v: 'violet', label: 'purple', grad: 'linear-gradient(145deg,#c084fc,#a855f7,#7c3aed)' },
              { v: 'red', label: 'red', grad: 'linear-gradient(145deg,#fb7185,#dc2626,#8B0000)' },
            ].map(c => (
              <button key={c.v} onClick={() => openBet({ type: 'color', value: c.v, label: c.label, bg: c.grad })}
                className="py-3.5 rounded-2xl font-extrabold text-white text-base active:scale-[0.97]"
                style={{ background: c.grad, boxShadow: '0 6px 14px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.45)' }}>
                {c.label}
              </button>
            ))}
          </div>

          <div className="mt-3 p-3 rounded-2xl" style={{ background: 'linear-gradient(180deg,#fff,#fff0f0)', border: '1.5px solid rgba(200,16,46,0.15)' }}>
            <div className="grid grid-cols-5 gap-2.5">
              {Array.from({ length: 10 }).map((_, n) => {
                const meta = numberMeta(n);
                const main = meta.colors[0];
                const numColor = main === 'red' ? '#dc2626' : main === 'green' ? '#16a34a' : '#a855f7';
                return (
                  <button key={n} onClick={() => openBet({ type: 'number', value: String(n), label: String(n), bg: BALL_BG(n) })}
                    className="relative aspect-square rounded-full active:scale-90"
                    style={{ background: BALL_BG(n), boxShadow: '0 4px 10px rgba(0,0,0,0.25), inset 0 -4px 8px rgba(0,0,0,0.25), inset 0 3px 6px rgba(255,255,255,0.55)' }}>
                    <span className="absolute inset-[18%] rounded-full flex items-center justify-center text-xl font-black"
                      style={{ background: 'radial-gradient(circle at 30% 25%, #fff, #f5f5f5 60%, #e5e5e5)', color: numColor }}>
                      {n}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto scrollbar-hide">
            <button onClick={() => { setBase(1); setMult(1); toast.message('Random bet ready'); }}
              className="px-3 py-2 text-xs rounded-full whitespace-nowrap font-bold"
              style={{ background: '#fff', color: '#8B0000', border: '1.5px solid #f5d060' }}>random bet</button>
            {MULTIPLIERS.map(m => (
              <button key={m} onClick={() => setMult(m)}
                className="px-3.5 py-2 text-xs rounded-md font-extrabold whitespace-nowrap"
                style={mult === m ? { background: 'linear-gradient(180deg,#fff4c2,#f5d060,#a87814)', color: '#5a0000', border: '1px solid #a87814' } : { background: '#fff', color: '#8B0000', border: '1px solid rgba(200,16,46,0.18)' }}>X{m}</button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-0 mt-3 rounded-full overflow-hidden" style={{ boxShadow: '0 6px 14px rgba(139,0,0,0.18)' }}>
            <button onClick={() => openBet({ type: 'size', value: 'big', label: 'Big', bg: 'linear-gradient(145deg,#fff4c2,#f5d060,#a87814)' })}
              className="py-3.5 font-extrabold text-lg" style={{ background: 'linear-gradient(180deg,#fff4c2,#f5d060,#c89a1a)', color: '#5a0000' }}>Big</button>
            <button onClick={() => openBet({ type: 'size', value: 'small', label: 'Small', bg: 'linear-gradient(145deg,#fb7185,#dc2626,#8B0000)' })}
              className="py-3.5 font-extrabold text-lg text-white" style={{ background: 'linear-gradient(180deg,#a78bfa,#7c3aed)' }}>small</button>
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
                <thead><tr style={{ color: '#8B0000' }}><th className="py-2 text-left pl-1">Period</th><th>Block</th><th>Block Time</th><th>Hash</th><th className="pr-1">Result</th></tr></thead>
                <tbody>
                  {history.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-gray-400">No data yet</td></tr>}
                  {history.map(h => (
                    <tr key={h.id} className="border-t border-red-50">
                      <td className="py-2 pl-1 text-gray-600 text-[10px]">{h.period_id.slice(0, 3)}**{h.period_id.slice(-4)}</td>
                      <td className="text-center text-gray-700 text-[10px]">{h.block_id}</td>
                      <td className="text-center text-gray-600 text-[10px]">{h.block_time}</td>
                      <td className="text-center text-gray-600 text-[10px]">**{h.hash.slice(-4)}</td>
                      <td className="pr-1">
                        <div className="flex justify-center items-center gap-1">
                          <div className="w-6 h-6 rounded-full text-white text-[11px] font-extrabold flex items-center justify-center" style={{ background: BALL_BG(h.number) }}>{h.number}</div>
                          <span className="text-[10px] font-bold" style={{ color: h.size === 'big' ? '#f59e0b' : '#3b82f6' }}>{h.size === 'big' ? 'B' : 'S'}</span>
                        </div>
                      </td>
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
                      <td className="text-center capitalize text-gray-700">{b.selection_value}</td>
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
            <div className="px-4 py-3 text-center font-extrabold text-white" style={{ background: draft.bg }}>
              Trx Win Go 1Min
              <div className="text-xs font-medium opacity-90">Select {draft.label}</div>
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

      {resultBanner && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-6" onClick={() => setResultBanner(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-2xl">
            <div className="text-lg font-extrabold mb-2" style={{ color: resultBanner.won ? '#16a34a' : '#dc2626' }}>
              {resultBanner.won ? `🎉 You won ₹${resultBanner.amount.toFixed(2)}` : 'Better luck next time'}
            </div>
            <div className="flex justify-center my-3">
              <div className="w-16 h-16 rounded-full text-white text-2xl font-extrabold flex items-center justify-center" style={{ background: BALL_BG(resultBanner.r.number) }}>{resultBanner.r.number}</div>
            </div>
            <div className="text-sm text-gray-700 capitalize">{resultBanner.r.color} · {resultBanner.r.size}</div>
            <div className="text-[10px] text-gray-500 mt-1 break-all">Hash: {resultBanner.r.hash}</div>
          </div>
        </div>
      )}
    </div>
  );
}
