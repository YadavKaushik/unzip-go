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
  const [showHowTo, setShowHowTo] = useState(false);

  const lastSettledPeriod = useRef<string>('');
  const [resultBanner, setResultBanner] = useState<null | { won: boolean; amount: number; number: number; color: string }>(null);

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
            setResultBanner({ won: true, amount: totalPayout, number: r.number, color: r.color });
          } else {
            setResultBanner({ won: false, amount: 0, number: r.number, color: r.color });
          }
        }
      }

      setTimeout(() => { loadHistory(); loadMyBets(); loadBalance(); }, 2000);
    })();
  }, [remaining, duration, user, balance, loadHistory, loadMyBets, loadBalance]);

  // Auto-dismiss result banner after 4s
  useEffect(() => {
    if (!resultBanner) return;
    const t = setTimeout(() => setResultBanner(null), 4000);
    return () => clearTimeout(t);
  }, [resultBanner]);

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

  // ── Premium Cream + Gold theme tokens ──
  const CREAM_BG =
    'radial-gradient(circle at 12% 8%, rgba(245,208,96,0.18) 0%, transparent 45%),' +
    'radial-gradient(circle at 88% 92%, rgba(168,120,20,0.12) 0%, transparent 50%),' +
    'repeating-linear-gradient(45deg, rgba(168,120,20,0.05) 0 1px, transparent 1px 14px),' +
    'repeating-linear-gradient(-45deg, rgba(168,120,20,0.05) 0 1px, transparent 1px 14px),' +
    'linear-gradient(160deg, #fbf3df 0%, #f5e7c1 50%, #ecd9a3 100%)';
  const GOLD_TEXT: React.CSSProperties = {
    background: 'linear-gradient(180deg,#fff4c2 0%,#e7c25c 45%,#8a6612 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(0 1px 0 rgba(255,255,255,0.6)) drop-shadow(0 1px 1px rgba(120,80,10,0.35))',
  };
  const CARD_BORDER = '1px solid rgba(168,120,20,0.45)';
  const CARD_SHADOW =
    '0 6px 18px rgba(120,80,10,0.18), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(168,120,20,0.25)';

  return (
    <div className="min-h-screen w-full text-foreground flex flex-col" style={{ background: 'linear-gradient(180deg,#1a0606 0%,#2a0a0a 100%)' }}>
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
      <div className="mx-3 mt-3 rounded-2xl p-4" style={{ background: CREAM_BG, border: CARD_BORDER, boxShadow: CARD_SHADOW }}>
        <div className="flex items-center justify-center gap-2 text-2xl font-serif font-extrabold" style={GOLD_TEXT}>
          ₹{balance.toFixed(2)}
          <button onClick={loadBalance} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(168,120,20,0.12)', border: '1px solid rgba(168,120,20,0.4)' }}>
            <RefreshCw size={13} style={{ color: '#a87814' }} />
          </button>
        </div>
        <div className="text-center text-[11px] mt-1 flex items-center justify-center gap-1 font-serif tracking-wide" style={{ color: '#8a6612' }}>
          <span>💳</span> wallet balance
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <button onClick={() => navigate('/withdraw')} className="py-2.5 rounded-full font-bold text-white" style={{ background: 'linear-gradient(135deg, #C8102E, #6b0808)', border: '1px solid #f5d060', boxShadow: '0 2px 8px rgba(120,10,10,0.4), inset 0 1px 0 rgba(255,255,255,0.25)' }}>
            Withdraw
          </button>
          <button onClick={() => navigate('/deposit')} className="py-2.5 rounded-full font-bold" style={{ background: 'linear-gradient(180deg,#fff4c2 0%,#e7c25c 50%,#a87814 100%)', color: '#5b3a06', border: '1px solid #8a6612', boxShadow: '0 2px 8px rgba(168,120,20,0.4), inset 0 1px 0 rgba(255,255,255,0.6)' }}>
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
              className="rounded-xl py-3 flex flex-col items-center justify-center transition"
              style={active
                ? { background: 'linear-gradient(135deg, #C8102E, #6b0808)', border: '1px solid #f5d060', boxShadow: '0 4px 12px rgba(120,10,10,0.45), inset 0 1px 0 rgba(255,255,255,0.2)' }
                : { background: CREAM_BG, border: CARD_BORDER, boxShadow: CARD_SHADOW }
              }
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center mb-1" style={active ? { background: 'rgba(245,208,96,0.2)', border: '1px solid rgba(245,208,96,0.5)' } : { background: 'rgba(168,120,20,0.1)', border: '1px solid rgba(168,120,20,0.3)' }}>
                <span className="text-lg">⏱️</span>
              </div>
              <div className={`text-[10px] font-bold font-serif leading-tight text-center`} style={active ? { color: '#f5d060', textShadow: '0 1px 2px rgba(0,0,0,0.4)' } : { ...GOLD_TEXT }}>
                {label.split(' ').map((w, i) => <div key={i}>{w}</div>)}
              </div>
            </button>
          );
        })}
      </div>

      {/* ─── Period + Timer ─── */}
      <div className="mx-3 mt-3 rounded-2xl p-3 shadow-md border border-red-100" style={{ background: 'linear-gradient(135deg, #fff 0%, #fff5f5 100%)' }}>
        <div className="flex items-start justify-between">
          <div>
            <button onClick={() => setShowHowTo(true)} className="px-3 py-1 rounded-full text-xs flex items-center gap-1 text-[#8B0000] bg-red-50 border border-red-100">
              <HelpCircle size={12} /> How to play
            </button>
            <div className="text-xs text-gray-600 mt-2 font-semibold">Win Go {duration === 30 ? '30s' : duration === 60 ? '1Min' : duration === 180 ? '3Min' : '5Min'}</div>
            <div className="flex gap-1 mt-1.5">
              {history.slice(0, 5).map((h) => (
                <div key={h.id} className="w-6 h-6 rounded-full text-white text-[11px] font-extrabold flex items-center justify-center shadow" style={{ background: BALL_BG(h.number) }}>
                  {h.number}
                </div>
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-500 mb-1 tracking-widest">TIME OF PURCHASE</div>
            <div
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md"
              style={{
                background: 'linear-gradient(180deg, #1a0000 0%, #2a0505 100%)',
                border: '1.5px solid #f5d060',
                boxShadow: isClosing
                  ? '0 0 14px rgba(245,208,96,0.65), inset 0 0 8px rgba(200,16,46,0.5)'
                  : '0 2px 8px rgba(0,0,0,0.35), inset 0 0 6px rgba(245,208,96,0.18)',
              }}
            >
              <span
                className={`font-mono font-black text-2xl leading-none tracking-[0.08em] ${isClosing ? 'animate-pulse' : ''}`}
                style={{
                  fontFamily: '"DS-Digital","Share Tech Mono","Orbitron",ui-monospace,monospace',
                  color: isClosing ? '#ff6b6b' : '#f5d060',
                  textShadow: isClosing
                    ? '0 0 8px rgba(255,80,80,0.9), 0 0 14px rgba(200,16,46,0.7)'
                    : '0 0 6px rgba(245,208,96,0.85), 0 0 12px rgba(245,208,96,0.4)',
                }}
              >
                {mm}:{ss}
              </span>
            </div>
            <div className="font-extrabold text-sm mt-1.5" style={{ color: '#8B0000' }}>{periodId}</div>
          </div>
        </div>
      </div>

      {/* ─── Betting Panel ─── */}
      <div className="relative mx-3 mt-3 rounded-2xl p-3 shadow-md border border-red-100 bg-white">
        {/* Colors */}
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => openBet({ type: 'color', value: 'green', label: 'Green', bg: 'linear-gradient(135deg,#22c55e,#16a34a)' })}
            className="py-3 rounded-l-2xl rounded-tr-2xl font-bold text-white shadow" style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>green</button>
          <button onClick={() => openBet({ type: 'color', value: 'violet', label: 'Violet', bg: 'linear-gradient(135deg,#a855f7,#7c3aed)' })}
            className="py-3 rounded-2xl font-bold text-white shadow" style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)' }}>purple</button>
          <button onClick={() => openBet({ type: 'color', value: 'red', label: 'Red', bg: 'linear-gradient(135deg,#ef4444,#b91c1c)' })}
            className="py-3 rounded-r-2xl rounded-tl-2xl font-bold text-white shadow" style={{ background: 'linear-gradient(135deg,#ef4444,#b91c1c)' }}>red</button>
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
            className="px-3 py-1.5 text-xs rounded-full border border-red-200 text-[#8B0000] bg-red-50 whitespace-nowrap font-semibold">random bet</button>
          {MULTIPLIERS.map((m) => (
            <button key={m} onClick={() => setMult(m)}
              className={`px-3 py-1.5 text-xs rounded-md font-bold whitespace-nowrap ${mult === m ? 'text-white shadow' : 'bg-gray-100 text-gray-600'}`}
              style={mult === m ? { background: 'linear-gradient(135deg, #C8102E, #8B0000)' } : undefined}>
              X{m}
            </button>
          ))}
        </div>

        {/* Big / Small */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button onClick={() => openBet({ type: 'size', value: 'big', label: 'Big', bg: 'linear-gradient(135deg,#fbbf24,#f59e0b)' })}
            className="py-3 rounded-l-full rounded-tr-full font-bold text-[#8B0000] shadow" style={{ background: 'linear-gradient(135deg,#fde68a,#fbbf24)' }}>Big</button>
          <button onClick={() => openBet({ type: 'size', value: 'small', label: 'Small', bg: 'linear-gradient(135deg,#a855f7,#7c3aed)' })}
            className="py-3 rounded-r-full rounded-tl-full font-bold text-white shadow" style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)' }}>small</button>
        </div>

        {/* ─── Local Freeze Overlay (covers betting panel only) ─── */}
        {isClosing && remaining > 0 && (
          <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center z-20"
            style={{
              background: 'rgba(15,0,0,0.55)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          >
            <div
              key={remaining}
              className="font-black leading-none"
              style={{
                fontSize: '110px',
                fontFamily: '"DS-Digital","Orbitron",ui-monospace,monospace',
                background: 'linear-gradient(180deg,#fff4c2 0%,#f5d060 45%,#a87814 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 18px rgba(245,208,96,0.85)) drop-shadow(0 0 28px rgba(200,16,46,0.6))',
              }}
            >
              {remaining}
            </div>
            <div
              className="mt-2 text-xs font-bold tracking-[0.25em] uppercase"
              style={{ color: '#f5d060', textShadow: '0 0 10px rgba(245,208,96,0.7)' }}
            >
              Wait for the draw...
            </div>
          </div>
        )}
      </div>

      {/* ─── History tabs ─── */}
      <div className="mx-3 mt-4">
        <div className="flex gap-1 mb-2">
          {([['record','Game Record'],['chart','Chart Trends'],['mine','My Game Record']] as const).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-3 py-2 text-xs font-bold rounded-t-lg ${tab === k ? 'text-white shadow' : 'text-gray-500 bg-white/60'}`}
              style={tab === k ? { background: 'linear-gradient(135deg, #C8102E, #8B0000)' } : undefined}>
              {label}
            </button>
          ))}
        </div>

        <div className="rounded-xl p-2 shadow-md border border-red-100 bg-white">
          {tab === 'record' && (
            <table className="w-full text-xs">
              <thead><tr style={{ color: '#8B0000' }}>
                <th className="py-2 text-left pl-2">Period</th><th>Number</th><th>Size</th><th className="pr-2">Color</th>
              </tr></thead>
              <tbody>
                {history.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-gray-400">No data yet</td></tr>}
                {history.map((h) => (
                  <tr key={h.id} className="border-t border-red-50">
                    <td className="py-2.5 pl-2 text-gray-600 text-[11px]">{h.period_id}</td>
                    <td className="text-center font-extrabold text-xl" style={{ color: h.number % 2 === 0 ? '#ef4444' : '#22c55e' }}>{h.number}</td>
                    <td className="text-center text-gray-600 capitalize">{h.size}</td>
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
            <div className="p-4 text-center text-gray-400 text-sm">Chart trends coming soon</div>
          )}
          {tab === 'mine' && (
            <table className="w-full text-xs">
              <thead><tr style={{ color: '#8B0000' }}>
                <th className="py-2 text-left pl-2">Period</th><th>Pick</th><th>Amount</th><th className="pr-2">Result</th>
              </tr></thead>
              <tbody>
                {myBets.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-gray-400">No bets yet</td></tr>}
                {myBets.map((b) => (
                  <tr key={b.id} className="border-t border-red-50">
                    <td className="py-2.5 pl-2 text-gray-600 text-[11px]">{b.period_id}</td>
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

      {/* ─── How to Play Modal (Light Red Theme) ─── */}
      {showHowTo && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-5"
          style={{ background: 'rgba(60,0,0,0.35)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          onClick={() => setShowHowTo(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-[#e5b85a]/50"
            style={{ background: '#ffffff', boxShadow: '0 20px 50px rgba(139,0,0,0.25)' }}
          >
            {/* Header */}
            <div
              className="px-5 py-3 text-center relative"
              style={{
                background: 'linear-gradient(180deg,#8B0000 0%,#C8102E 100%)',
                borderBottom: '2px solid #f5d060',
              }}
            >
              <h2
                className="font-extrabold text-lg tracking-wide"
                style={{
                  background: 'linear-gradient(180deg,#fff4c2 0%,#f5d060 50%,#a87814 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                How to Play
              </h2>
            </div>

            {/* Content */}
            <div className="px-5 py-4 text-[#3a0a0a] text-[12.5px] leading-relaxed space-y-2.5 max-h-[60vh] overflow-y-auto bg-[#fff8f8]">
              <p>30 seconds per issue, 25 seconds to place an order, 5 seconds to draw a prize. Open all day, total <span className="text-[#C8102E] font-bold">2880</span> issues.</p>
              <p>Contract calculation: If you spend <span className="text-[#C8102E] font-bold">100</span>, after a 2% service fee, the contract amount is <span className="text-[#C8102E] font-bold">98</span>.</p>
              <p><span className="text-green-600 font-bold">Green:</span> Win (98×2)=<span className="text-[#C8102E] font-bold">196</span> on numbers 1, 3, 7, 9. Win (98×1.5)=<span className="text-[#C8102E] font-bold">147</span> on number 5.</p>
              <p><span className="text-[#C8102E] font-bold">Red:</span> Win (98×2)=<span className="text-[#C8102E] font-bold">196</span> on numbers 2, 4, 6, 8. Win (98×1.5)=<span className="text-[#C8102E] font-bold">147</span> on number 0.</p>
              <p><span className="text-purple-600 font-bold">Violet:</span> Win (98×4.5)=<span className="text-[#C8102E] font-bold">441</span> on number 0 or 5.</p>
              <p><span className="font-bold text-[#8B0000]">Numbers:</span> Win (98×9)=<span className="text-[#C8102E] font-bold">882</span> if you hit the specific number.</p>
              <p><span className="font-bold text-[#8B0000]">Big/Small:</span> Win (98×2)=<span className="text-[#C8102E] font-bold">196</span> on correct prediction (Big: 5–9, Small: 0–4).</p>
            </div>

            {/* Close Button */}
            <div className="px-5 pb-5 pt-3 bg-[#fff8f8]">
              <button
                onClick={() => setShowHowTo(false)}
                className="w-full py-3 rounded-xl font-extrabold text-white text-base tracking-wide shadow-lg"
                style={{
                  background: 'linear-gradient(180deg,#C8102E 0%,#8B0000 100%)',
                  boxShadow: '0 4px 14px rgba(139,0,0,0.35)',
                  border: '1px solid #f5d060',
                }}
              >
                closure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* (full-screen freeze removed — local overlay covers betting panel only) */}

      {/* ─── Win / Loss Result Banner ─── */}
      {resultBanner && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
          onClick={() => setResultBanner(null)}
        >
          {resultBanner.won ? (
            <div
              className="relative w-full max-w-sm rounded-3xl overflow-hidden text-center px-6 py-8 border-2 border-[#f5d060]"
              style={{
                background: 'linear-gradient(180deg,#8B0000 0%,#C8102E 60%,#8B0000 100%)',
                boxShadow: '0 0 40px rgba(245,208,96,0.45), 0 20px 60px rgba(0,0,0,0.5)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Confetti dots */}
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-sm animate-bounce"
                  style={{
                    left: `${(i * 53) % 100}%`,
                    top: `${(i * 37) % 80}%`,
                    background: i % 3 === 0 ? '#f5d060' : i % 3 === 1 ? '#fff4c2' : '#ffeb99',
                    animationDelay: `${(i % 6) * 0.15}s`,
                    animationDuration: `${1 + (i % 4) * 0.3}s`,
                  }}
                />
              ))}
              <div
                className="text-3xl font-black tracking-wide mb-2"
                style={{
                  background: 'linear-gradient(180deg,#fff4c2,#f5d060,#a87814)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))',
                }}
              >
                🎉 Congratulations!
              </div>
              <div className="text-white/90 text-sm mb-4">You won this round</div>
              <div
                className="text-5xl font-black mb-4"
                style={{
                  color: '#f5d060',
                  textShadow: '0 0 16px rgba(245,208,96,0.8)',
                }}
              >
                +₹{resultBanner.amount.toFixed(2)}
              </div>
              <div className="flex items-center justify-center gap-2 text-white/80 text-xs">
                <span>Result:</span>
                <div
                  className="w-7 h-7 rounded-full text-white font-extrabold flex items-center justify-center"
                  style={{ background: BALL_BG(resultBanner.number) }}
                >
                  {resultBanner.number}
                </div>
                <span className="capitalize">{resultBanner.color}</span>
              </div>
              <button
                onClick={() => setResultBanner(null)}
                className="mt-5 w-full py-3 rounded-xl font-extrabold text-[#8B0000]"
                style={{ background: 'linear-gradient(180deg,#fff4c2,#f5d060,#e0b840)' }}
              >
                Collect
              </button>
            </div>
          ) : (
            <div
              className="w-full max-w-sm rounded-3xl overflow-hidden text-center px-6 py-7 bg-white border border-red-100"
              style={{ boxShadow: '0 20px 60px rgba(139,0,0,0.3)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-2xl font-black mb-2" style={{ color: '#8B0000' }}>
                Better Luck Next Time
              </div>
              <div className="text-gray-500 text-sm mb-5">The result for this round is</div>
              <div className="flex flex-col items-center gap-3 mb-5">
                <div
                  className="w-20 h-20 rounded-full text-white text-4xl font-black flex items-center justify-center shadow-lg"
                  style={{ background: BALL_BG(resultBanner.number) }}
                >
                  {resultBanner.number}
                </div>
                <div className="text-sm capitalize text-gray-700">
                  <span className="font-bold" style={{ color: '#C8102E' }}>{resultBanner.color}</span>
                  {' • '}
                  {resultBanner.number >= 5 ? 'Big' : 'Small'}
                </div>
              </div>
              <button
                onClick={() => setResultBanner(null)}
                className="w-full py-3 rounded-xl font-extrabold text-white"
                style={{ background: 'linear-gradient(180deg,#C8102E,#8B0000)', border: '1px solid #f5d060' }}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
