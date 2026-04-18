import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Headphones, Volume2, HelpCircle, X } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/useAuth';
import { db as supabase } from '@/lib/db';

// ─── Game config ─────────────────────────────────────────────────────────────
type Duration = 30 | 60 | 180 | 300;
const DURATIONS: { d: Duration; label: string }[] = [
  { d: 30, label: 'Win Go 30s' },
  { d: 60, label: 'Win Go 1Min' },
  { d: 180, label: 'Win Go 3Min' },
  { d: 300, label: 'Win Go 5Min' },
];
const MULTIPLIERS = [1, 5, 10, 20, 50, 100];

// Number → color mapping (standard WinGo): 0=red+violet, 5=green+violet, even (2,4,6,8)=red, odd (1,3,7,9)=green
const numberMeta = (n: number) => {
  const colors: ('red' | 'green' | 'violet')[] =
    n === 0 ? ['red', 'violet'] : n === 5 ? ['green', 'violet'] : n % 2 === 0 ? ['red'] : ['green'];
  const size = n >= 5 ? 'Big' : 'Small';
  return { colors, size };
};

// Period derivation: deterministic, time-based
// Format: YYYYMMDDHHMMSS-style sequence per duration. We use day index + slot index.
const pad = (n: number, w: number) => String(n).padStart(w, '0');
const buildPeriodId = (now: Date, d: Duration) => {
  const y = now.getUTCFullYear();
  const m = pad(now.getUTCMonth() + 1, 2);
  const day = pad(now.getUTCDate(), 2);
  // slot index since UTC midnight
  const secs = now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds();
  const slot = Math.floor(secs / d);
  return `${y}${m}${day}${d === 30 ? '301' : d === 60 ? '101' : d === 180 ? '301' : '501'}${pad(slot + 1, 4)}`;
};

const getRoundState = (d: Duration) => {
  const now = new Date();
  const epochSec = Math.floor(now.getTime() / 1000);
  const elapsed = epochSec % d;
  const remaining = d - elapsed;
  return { remaining, periodId: buildPeriodId(now, d) };
};

// Deterministic pseudo-random per period — used as fallback so finished rounds always have a result.
const hashStr = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};
const resultForPeriod = (periodId: string) => {
  const n = hashStr(periodId) % 10;
  const { colors, size } = numberMeta(n);
  return { number: n, color: colors[0], size: size.toLowerCase() };
};

// Color helpers for ball gradients
const BALL_BG = (n: number) => {
  if (n === 0) return 'linear-gradient(135deg,#ef4444 0%,#ef4444 50%,#a855f7 50%,#a855f7 100%)';
  if (n === 5) return 'linear-gradient(135deg,#22c55e 0%,#22c55e 50%,#a855f7 50%,#a855f7 100%)';
  return n % 2 === 0
    ? 'linear-gradient(135deg,#fb7185 0%,#dc2626 100%)'
    : 'linear-gradient(135deg,#34d399 0%,#16a34a 100%)';
};

interface BetDraft {
  type: 'color' | 'number' | 'size';
  value: string;
  label: string;
  bg: string;
}

export default function WinGo() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [duration, setDuration] = useState<Duration>(30);
  const [{ remaining, periodId }, setRound] = useState(() => getRoundState(30));
  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<any[]>([]);
  const [tab, setTab] = useState<'record' | 'chart' | 'mine'>('record');
  const [myBets, setMyBets] = useState<any[]>([]);

  // Bet modal
  const [draft, setDraft] = useState<BetDraft | null>(null);
  const [mult, setMult] = useState(1);
  const [base, setBase] = useState(1);
  const [agree, setAgree] = useState(true);
  const [placing, setPlacing] = useState(false);

  const lastSettledPeriod = useRef<string>('');

  // Tick every 250ms for smooth countdown
  useEffect(() => {
    const tick = () => setRound(getRoundState(duration));
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [duration]);

  // Load wallet balance
  const loadBalance = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('wallets').select('balance').eq('user_id', user.id).maybeSingle();
    if (data) setBalance(Number(data.balance) || 0);
  }, [user]);

  useEffect(() => { loadBalance(); }, [loadBalance]);

  // Load round history
  const loadHistory = useCallback(async () => {
    const { data } = await supabase
      .from('wingo_rounds')
      .select('*')
      .eq('duration_seconds', duration)
      .order('created_at', { ascending: false })
      .limit(20);
    setHistory(data || []);
  }, [duration]);

  const loadMyBets = useCallback(async () => {
    if (!user) return setMyBets([]);
    const { data } = await supabase
      .from('wingo_bets')
      .select('*')
      .eq('user_id', user.id)
      .eq('duration_seconds', duration)
      .order('created_at', { ascending: false })
      .limit(20);
    setMyBets(data || []);
  }, [user, duration]);

  useEffect(() => { loadHistory(); loadMyBets(); }, [loadHistory, loadMyBets]);

  // When a round ends → settle previous period and refresh after 2s
  useEffect(() => {
    if (remaining !== duration) return; // we just rolled into a new period
    // Previous period just finished
    const prev = (() => {
      const now = new Date(Date.now() - 1000);
      return buildPeriodId(now, duration);
    })();
    if (prev === lastSettledPeriod.current) return;
    lastSettledPeriod.current = prev;

    (async () => {
      const r = resultForPeriod(prev);
      // Persist round (idempotent due to UNIQUE index)
      await supabase.from('wingo_rounds').upsert(
        {
          period_id: prev,
          duration_seconds: duration,
          number: r.number,
          color: r.color,
          size: r.size,
        },
        { onConflict: 'period_id,duration_seconds' },
      );

      // Settle this user's pending bets for that period
      if (user) {
        const { data: pendings } = await supabase
          .from('wingo_bets')
          .select('*')
          .eq('user_id', user.id)
          .eq('period_id', prev)
          .eq('duration_seconds', duration)
          .eq('status', 'pending');
        if (pendings && pendings.length) {
          let totalPayout = 0;
          for (const b of pendings) {
            const meta = numberMeta(r.number);
            let won = false;
            let multiplier = 0;
            if (b.selection_type === 'number') {
              if (Number(b.selection_value) === r.number) { won = true; multiplier = 9; }
            } else if (b.selection_type === 'color') {
              if (b.selection_value === 'violet' && meta.colors.includes('violet')) { won = true; multiplier = 4.5; }
              else if (b.selection_value === r.color) { won = true; multiplier = meta.colors.includes('violet') ? 1.5 : 2; }
            } else if (b.selection_type === 'size') {
              if (b.selection_value === r.size) { won = true; multiplier = 2; }
            }
            const payout = won ? Number(b.amount) * multiplier : 0;
            totalPayout += payout;
            await supabase.from('wingo_bets').update({
              status: won ? 'won' : 'lost',
              payout,
            }).eq('id', b.id);
          }
          if (totalPayout > 0) {
            const newBal = balance + totalPayout;
            await supabase.from('wallets').update({ balance: newBal }).eq('user_id', user.id);
            toast.success(`🎉 You won ₹${totalPayout.toFixed(2)}!`);
          }
        }
      }

      setTimeout(() => { loadHistory(); loadMyBets(); loadBalance(); }, 2000);
    })();
  }, [remaining, duration, user, balance, loadHistory, loadMyBets, loadBalance]);

  // Open bet modal
  const openBet = (d: BetDraft) => {
    if (!user) {
      toast.error('Please login to play');
      navigate('/sign-up-login-screen');
      return;
    }
    if (remaining <= 5) {
      toast.error('Betting closed for this period');
      return;
    }
    setDraft(d);
    setMult(1);
    setBase(1);
    setAgree(true);
  };

  const totalBet = base * mult;

  const placeBet = async () => {
    if (!draft || !user) return;
    if (!agree) { toast.error('Please agree to the rules'); return; }
    if (totalBet <= 0) { toast.error('Invalid amount'); return; }
    if (totalBet > balance) { toast.error('Insufficient balance'); return; }
    setPlacing(true);
    try {
      // 1. Insert bet
      const { error: bErr } = await supabase.from('wingo_bets').insert({
        user_id: user.id,
        period_id: periodId,
        duration_seconds: duration,
        selection_type: draft.type,
        selection_value: draft.value,
        multiplier: mult,
        amount: totalBet,
      });
      if (bErr) throw bErr;

      // 2. Deduct from wallet
      const newBal = balance - totalBet;
      const { error: wErr } = await supabase
        .from('wallets')
        .update({ balance: newBal })
        .eq('user_id', user.id);
      if (wErr) throw wErr;
      setBalance(newBal);

      // 3. Record turnover for referral commission (best-effort)
      supabase.functions.invoke('place-bet', {
        body: { amount: totalBet, type: 'bet', reference_id: periodId },
      }).catch(() => {});

      toast.success('Bet placed successfully');
      setDraft(null);
      loadMyBets();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to place bet');
    } finally {
      setPlacing(false);
    }
  };

  const mm = pad(Math.floor(remaining / 60), 2);
  const ss = pad(remaining % 60, 2);
  const isClosing = remaining <= 5;

  const durationLabel = duration === 30 ? '30S' : duration === 60 ? '1MIN' : duration === 180 ? '3MIN' : '5MIN';

  return (
    <div className="min-h-screen w-full text-foreground flex flex-col" style={{ background: '#f5f5f5' }}>
      {/* ─── Premium Header ─── */}
      <div
        className="relative px-3 pt-3 pb-4 flex items-center justify-between border-b-2 border-[#f5d060]/60"
        style={{
          background:
            'radial-gradient(circle at 20% 0%, rgba(245,208,96,0.18) 0%, transparent 55%), radial-gradient(circle at 80% 100%, rgba(245,208,96,0.15) 0%, transparent 55%), linear-gradient(180deg, #8B0000 0%, #C8102E 100%)',
          boxShadow: '0 4px 18px rgba(0,0,0,0.25), inset 0 -1px 0 rgba(245,208,96,0.4)',
        }}
      >
        {/* gold geometric pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #f5d060 0 1px, transparent 1px 12px), repeating-linear-gradient(-45deg, #f5d060 0 1px, transparent 1px 12px)',
          }}
        />
        <button
          onClick={() => navigate(-1)}
          className="relative w-9 h-9 rounded-full flex items-center justify-center border border-[#f5d060]/50 bg-black/20 text-[#f5d060]"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="relative flex items-center gap-2 px-2">
          <h1
            className="font-serif font-black tracking-[0.08em] text-[22px] leading-none whitespace-nowrap"
            style={{
              background: 'linear-gradient(180deg,#fff4c2 0%,#f5d060 45%,#a87814 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 1px 0 rgba(0,0,0,0.4)',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))',
            }}
          >
            Techie<sup className="text-[12px]">404</sup>
          </h1>
          <span className="text-[10px] font-semibold text-[#f5d060]/90 tracking-widest border-l border-[#f5d060]/40 pl-2 ml-1">
            {durationLabel}
          </span>
        </div>

        <div className="relative flex items-center gap-2">
          <button className="w-9 h-9 rounded-full flex items-center justify-center border border-[#f5d060]/50 bg-black/20 text-[#f5d060]">
            <Headphones size={16} />
          </button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center border border-[#f5d060]/50 bg-black/20 text-[#f5d060]">
            <Volume2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
      {/* ─── Wallet ─── */}
      <div className="mx-3 mt-3 rounded-2xl p-4 shadow-md border border-red-100 bg-white">
        <div className="flex items-center justify-center gap-2 text-2xl font-extrabold" style={{ color: '#8B0000' }}>
          ₹{balance.toFixed(2)}
          <button onClick={loadBalance} className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center">
            <RefreshCw size={13} className="text-red-700" />
          </button>
        </div>
        <div className="text-center text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
          <span>💳</span> wallet balance
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <button onClick={() => navigate('/withdraw')} className="py-2.5 rounded-full font-bold text-white" style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)' }}>
            Withdraw
          </button>
          <button onClick={() => navigate('/deposit')} className="py-2.5 rounded-full font-bold text-[#8B0000]" style={{ background: 'linear-gradient(135deg,#fde68a,#fbbf24)' }}>
            Deposit
          </button>
        </div>
      </div>

      {/* ─── Duration tabs ─── */}
      <div className="mx-3 mt-3 grid grid-cols-4 gap-2">
        {DURATIONS.map(({ d, label }) => {
          const active = d === duration;
          return (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`rounded-xl py-3 flex flex-col items-center justify-center transition ${active ? 'bg-gradient-to-br from-[#dc2626] to-[#7f1d1d] shadow-lg shadow-red-900/40' : 'bg-white/5'}`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-1 ${active ? 'bg-[#1a0a1f]' : 'bg-white/10'}`}>
                <span className="text-lg">⏱️</span>
              </div>
              <div className={`text-[10px] font-semibold leading-tight text-center ${active ? 'text-[#f5d060]' : 'text-white/70'}`}>
                {label.split(' ').map((w, i) => <div key={i}>{w}</div>)}
              </div>
            </button>
          );
        })}
      </div>

      {/* ─── Period + Timer ─── */}
      <div className="mx-3 mt-3 rounded-2xl bg-gradient-to-br from-[#4b1a5a] to-[#2a0e36] p-3">
        <div className="flex items-start justify-between">
          <div>
            <button className="px-3 py-1 rounded-full bg-white/10 text-xs flex items-center gap-1">
              <HelpCircle size={12} /> How to play
            </button>
            <div className="text-xs text-white/80 mt-2">Win Go {duration === 30 ? '30s' : duration === 60 ? '1Min' : duration === 180 ? '3Min' : '5Min'}</div>
            <div className="flex gap-1 mt-1.5">
              {history.slice(0, 5).map((h) => (
                <div key={h.id} className="w-6 h-6 rounded-full text-white text-[11px] font-extrabold flex items-center justify-center shadow" style={{ background: BALL_BG(h.number) }}>
                  {h.number}
                </div>
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/70 mb-1">time of purchase</div>
            <div className="flex gap-1 justify-end">
              {[mm[0], mm[1], ':', ss[0], ss[1]].map((c, i) => (
                <div key={i} className={`${c === ':' ? 'w-2' : 'w-7'} h-9 rounded-md ${c === ':' ? '' : 'bg-white'} flex items-center justify-center text-[#1a0a1f] font-extrabold text-lg ${isClosing ? 'animate-pulse' : ''}`}>
                  {c}
                </div>
              ))}
            </div>
            <div className="text-[#f5d060] font-extrabold text-sm mt-1">{periodId}</div>
          </div>
        </div>
      </div>

      {/* ─── Betting Panel ─── */}
      <div className="mx-3 mt-3 rounded-2xl bg-gradient-to-br from-[#2a0e36] to-[#1a0a1f] p-3 border border-white/5">
        {/* Colors */}
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => openBet({ type: 'color', value: 'green', label: 'Green', bg: 'linear-gradient(135deg,#22c55e,#16a34a)' })}
            className="py-3 rounded-l-2xl rounded-tr-2xl font-bold text-white" style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>green</button>
          <button onClick={() => openBet({ type: 'color', value: 'violet', label: 'Violet', bg: 'linear-gradient(135deg,#a855f7,#7c3aed)' })}
            className="py-3 rounded-2xl font-bold text-white" style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)' }}>purple</button>
          <button onClick={() => openBet({ type: 'color', value: 'red', label: 'Red', bg: 'linear-gradient(135deg,#ef4444,#b91c1c)' })}
            className="py-3 rounded-r-2xl rounded-tl-2xl font-bold text-white" style={{ background: 'linear-gradient(135deg,#ef4444,#b91c1c)' }}>red</button>
        </div>

        {/* Numbers */}
        <div className="grid grid-cols-5 gap-2 mt-3">
          {Array.from({ length: 10 }).map((_, n) => (
            <button key={n}
              onClick={() => openBet({ type: 'number', value: String(n), label: String(n), bg: BALL_BG(n) })}
              className="aspect-square rounded-full text-white text-xl font-extrabold shadow-md flex items-center justify-center"
              style={{ background: BALL_BG(n) }}>
              {n}
            </button>
          ))}
        </div>

        {/* Multipliers */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto scrollbar-hide">
          <button onClick={() => { setBase(1); setMult(1); toast.message('Random bet ready — pick a color/number'); }}
            className="px-3 py-1.5 text-xs rounded-full border border-white/20 whitespace-nowrap">random bet</button>
          {MULTIPLIERS.map((m) => (
            <button key={m} onClick={() => setMult(m)}
              className={`px-3 py-1.5 text-xs rounded-md font-bold whitespace-nowrap ${mult === m ? 'bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-[#1a0a1f]' : 'bg-white/5 text-white/70'}`}>
              X{m}
            </button>
          ))}
        </div>

        {/* Big / Small */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button onClick={() => openBet({ type: 'size', value: 'big', label: 'Big', bg: 'linear-gradient(135deg,#fbbf24,#f59e0b)' })}
            className="py-3 rounded-l-full rounded-tr-full font-bold text-[#1a0a1f]" style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>Big</button>
          <button onClick={() => openBet({ type: 'size', value: 'small', label: 'Small', bg: 'linear-gradient(135deg,#a855f7,#7c3aed)' })}
            className="py-3 rounded-r-full rounded-tl-full font-bold text-white" style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)' }}>small</button>
        </div>
      </div>

      {/* ─── History tabs ─── */}
      <div className="mx-3 mt-4">
        <div className="flex gap-1 mb-2">
          {([['record','Game Record'],['chart','Chart Trends'],['mine','My Game Record']] as const).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-3 py-2 text-xs font-bold rounded-t-lg ${tab === k ? 'bg-gradient-to-b from-[#4b1a5a] to-[#2a0e36] text-[#f5d060] border-t border-x border-[#f5d060]/30' : 'text-white/50'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="rounded-xl bg-gradient-to-br from-[#2a0e36] to-[#1a0a1f] p-2 border border-white/5">
          {tab === 'record' && (
            <table className="w-full text-xs">
              <thead><tr className="text-[#f5d060]">
                <th className="py-2 text-left pl-2">Period</th><th>Number</th><th>Size</th><th className="pr-2">Color</th>
              </tr></thead>
              <tbody>
                {history.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-white/40">No data yet</td></tr>}
                {history.map((h) => (
                  <tr key={h.id} className="border-t border-white/5">
                    <td className="py-2.5 pl-2 text-white/80 text-[11px]">{h.period_id}</td>
                    <td className="text-center font-extrabold text-xl" style={{ color: h.number % 2 === 0 ? '#ef4444' : '#22c55e' }}>{h.number}</td>
                    <td className="text-center text-white/70 capitalize">{h.size}</td>
                    <td className="pr-2">
                      <div className="flex justify-center gap-0.5">
                        {numberMeta(h.number).colors.map((c) => (
                          <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c === 'red' ? '#ef4444' : c === 'green' ? '#22c55e' : '#a855f7' }} />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === 'chart' && (
            <div className="p-4 text-center text-white/50 text-sm">Chart trends coming soon</div>
          )}
          {tab === 'mine' && (
            <table className="w-full text-xs">
              <thead><tr className="text-[#f5d060]">
                <th className="py-2 text-left pl-2">Period</th><th>Pick</th><th>Amount</th><th className="pr-2">Result</th>
              </tr></thead>
              <tbody>
                {myBets.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-white/40">No bets yet</td></tr>}
                {myBets.map((b) => (
                  <tr key={b.id} className="border-t border-white/5">
                    <td className="py-2.5 pl-2 text-white/80 text-[11px]">{b.period_id}</td>
                    <td className="text-center capitalize">{b.selection_value}</td>
                    <td className="text-center">₹{Number(b.amount).toFixed(2)}</td>
                    <td className="pr-2 text-center font-bold" style={{ color: b.status === 'won' ? '#22c55e' : b.status === 'lost' ? '#ef4444' : '#fbbf24' }}>
                      {b.status === 'pending' ? '—' : b.status === 'won' ? `+₹${Number(b.payout).toFixed(2)}` : 'Lost'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* close scroll wrapper */}
      </div>




      {/* ─── Bet modal ─── */}
      {draft && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60" onClick={() => setDraft(null)}>
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden bg-[#1a0a1f] border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 text-center font-extrabold text-white" style={{ background: draft.bg }}>
              Win Go {duration}s
              <div className="text-xs font-medium opacity-90">Select {draft.label}</div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="text-xs text-white/60 mb-1">Balance</div>
                <div className="flex gap-2">
                  {[1, 10, 100, 1000].map((v) => (
                    <button key={v} onClick={() => setBase(v)} className={`flex-1 py-2 rounded-md text-sm font-bold ${base === v ? 'bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-[#1a0a1f]' : 'bg-white/5 text-white/80'}`}>{v}</button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs text-white/60 mb-1">Quantity</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setBase(Math.max(1, base - 1))} className="w-9 h-9 rounded-md bg-white/5 text-white text-lg">−</button>
                  <input value={base} onChange={(e) => setBase(Math.max(1, Number(e.target.value) || 1))}
                    className="flex-1 h-9 rounded-md bg-white/10 text-center text-white font-bold" />
                  <button onClick={() => setBase(base + 1)} className="w-9 h-9 rounded-md bg-white/5 text-white text-lg">+</button>
                </div>
              </div>

              <div>
                <div className="text-xs text-white/60 mb-1">Multiplier</div>
                <div className="flex flex-wrap gap-1.5">
                  {MULTIPLIERS.map((m) => (
                    <button key={m} onClick={() => setMult(m)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold ${mult === m ? 'bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-[#1a0a1f]' : 'bg-white/5 text-white/70'}`}>
                      X{m}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-white/70">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="accent-[#f5d060]" />
                I agree to the <span className="text-[#f5d060]">Pre-sale Rules</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setDraft(null)} className="py-3 rounded-lg bg-white/5 text-white font-bold">Cancel</button>
                <button disabled={placing} onClick={placeBet}
                  className="py-3 rounded-lg font-bold text-[#1a0a1f] disabled:opacity-50" style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>
                  {placing ? 'Placing…' : `Total ₹${totalBet.toFixed(2)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
