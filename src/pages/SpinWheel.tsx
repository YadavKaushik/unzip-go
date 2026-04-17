import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle, History, X, CheckCircle, Wallet, Share2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── Constants ────────────────────────────────────────────────────────────────
const WHEEL_SEGMENTS = [
  { label: '₹198', value: 198 },
  { label: '₹0.10', value: 0.10 },
  { label: '₹178', value: 178 },
  { label: '₹38', value: 38 },
  { label: '₹98', value: 98 },
  { label: '₹0.05', value: 0.05 },
  { label: '₹158', value: 158 },
  { label: '₹118', value: 118 },
];

const segAngle = 360 / WHEEL_SEGMENTS.length;
const PRIZE_TARGET = 500;

const LS_TOTAL_AMOUNT    = 'techie404-total-amount';
const LS_SPIN_RECORDS    = 'techie404-spin-records';
const LS_WALLET          = 'techie404-wallet-balance';
const LS_CASHOUT_RECORDS = 'techie404-cashout-records';
const LS_GIFT_TIMESTAMP  = 'techie404-gift-timestamp';
const LS_DAILY_SPIN_DATE = 'techie404-daily-spin-date';
const LS_SPINS_LEFT      = 'techie404-spins-left';
const GIFT_COOLDOWN_MS   = 72 * 60 * 60 * 1000;

// ─── Global Reset (bump version to wipe all users' spin data) ─────────────────
const LS_RESET_VERSION   = 'techie404-spin-reset-version';
const CURRENT_RESET_VERSION = '2';
(function performGlobalResetIfNeeded() {
  try {
    const v = localStorage.getItem(LS_RESET_VERSION);
    if (v !== CURRENT_RESET_VERSION) {
      localStorage.removeItem(LS_TOTAL_AMOUNT);
      localStorage.removeItem(LS_SPIN_RECORDS);
      localStorage.removeItem(LS_GIFT_TIMESTAMP);
      localStorage.removeItem(LS_DAILY_SPIN_DATE);
      localStorage.removeItem(LS_SPINS_LEFT);
      localStorage.setItem(LS_RESET_VERSION, CURRENT_RESET_VERSION);
    }
  } catch (e) {
    // ignore
  }
})();

// ─── Weighted Spin Algorithm ──────────────────────────────────────────────────
function getWeightedSegmentIndex(currentBalance: number): number {
  const remaining = PRIZE_TARGET - currentBalance;

  if (remaining <= 1) {
    // Very close to 500 — always land on tiny amounts
    const tinyIndices = WHEEL_SEGMENTS.map((s, i) => s.value <= 0.10 ? i : -1).filter(i => i >= 0);
    return tinyIndices[Math.floor(Math.random() * tinyIndices.length)];
  }

  if (remaining <= 5) {
    // Close to 500 — heavily weight small amounts
    const smallIndices = WHEEL_SEGMENTS.map((s, i) => s.value <= 38 ? i : -1).filter(i => i >= 0);
    return smallIndices[Math.floor(Math.random() * smallIndices.length)];
  }

  if (remaining <= 50) {
    // Getting close — weight toward smaller values
    const weights = WHEEL_SEGMENTS.map(s => {
      if (s.value <= 0.10) return 40;
      if (s.value <= 38) return 30;
      if (s.value <= 98) return 5;
      return 1;
    });
    return weightedRandom(weights);
  }

  // Far from 500 — normal distribution, slightly favor medium amounts
  const weights = WHEEL_SEGMENTS.map(s => {
    if (s.value >= 158) return 8;
    if (s.value >= 98) return 15;
    if (s.value >= 38) return 20;
    return 10;
  });
  return weightedRandom(weights);
}

function weightedRandom(weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

// ─── Daily Spin Check ─────────────────────────────────────────────────────────
function getDailySpinsLeft(): number {
  const today = new Date().toDateString();
  const savedDate = localStorage.getItem(LS_DAILY_SPIN_DATE);
  if (savedDate !== today) {
    localStorage.setItem(LS_DAILY_SPIN_DATE, today);
    localStorage.setItem(LS_SPINS_LEFT, '1');
    return 1;
  }
  return parseInt(localStorage.getItem(LS_SPINS_LEFT) || '0');
}

// ─── Fake Winners ─────────────────────────────────────────────────────────────
const FAKE_NAMES = ['Raj***', 'Aman***', 'Priy***', 'Vik***', 'Nee***', 'Ark***', 'Sum***', 'Roh***', 'Ani***', 'Kav***'];
const FAKE_AVATARS = ['🧑', '👩', '👨', '🧔', '👱', '👩‍🦰', '🧑‍🦱', '👨‍🦳', '👩‍🦳', '🧑‍🦲'];

function generateFakeWinners(): { name: string; avatar: string; amount: number; time: string }[] {
  return Array.from({ length: 8 }, (_, i) => {
    const mins = Math.floor(Math.random() * 58) + 1;
    return {
      name: FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)],
      avatar: FAKE_AVATARS[Math.floor(Math.random() * FAKE_AVATARS.length)],
      amount: [198, 178, 98, 118, 158, 38, 0.10, 0.05][Math.floor(Math.random() * 8)],
      time: `${mins}m ago`,
    };
  });
}

// ─── Confetti Canvas ──────────────────────────────────────────────────────────
interface ConfettiParticle {
  id: number; x: number; y: number; vx: number; vy: number;
  color: string; shape: 'rect' | 'circle' | 'coin';
  size: number; rotation: number; rotSpeed: number; opacity: number;
}

function ConfettiCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);
  const animRef = useRef<number | null>(null);
  const colors = ['#FFD700','#FF4D6A','#FF8C00','#00E676','#40C4FF','#E040FB','#FFEB3B','#FF6B35','#C8102E'];

  useEffect(() => {
    if (!active) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      particlesRef.current = [];
      const canvas = canvasRef.current;
      if (canvas) { const ctx = canvas.getContext('2d'); ctx?.clearRect(0,0,canvas.width,canvas.height); }
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    particlesRef.current = Array.from({ length: 150 }, (_, i) => ({
      id: i, x: Math.random() * canvas.width, y: -20,
      vx: (Math.random() - 0.5) * 6, vy: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: (['rect','circle','coin'] as const)[Math.floor(Math.random() * 3)],
      size: Math.random() * 10 + 5, rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 8, opacity: 1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = particlesRef.current.filter(p => p.opacity > 0.05);
      particlesRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.rotation += p.rotSpeed;
        if (p.y > canvas.height * 0.7) p.opacity -= 0.02;
        ctx.save(); ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y); ctx.rotate((p.rotation * Math.PI) / 180);
        if (p.shape === 'coin') {
          const grad = ctx.createRadialGradient(0,0,0,0,0,p.size/2);
          grad.addColorStop(0,'#FFE566'); grad.addColorStop(1,'#C8860A');
          ctx.fillStyle = grad; ctx.beginPath();
          ctx.ellipse(0,0,p.size/2,p.size/4,0,0,Math.PI*2); ctx.fill();
          ctx.fillStyle='#C8860A'; ctx.font=`bold ${p.size*0.4}px sans-serif`;
          ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('₹',0,0);
        } else if (p.shape === 'circle') {
          ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(0,0,p.size/2,0,Math.PI*2); ctx.fill();
        } else {
          ctx.fillStyle = p.color; ctx.fillRect(-p.size/2,-p.size/4,p.size,p.size/2);
        }
        ctx.restore();
      });
      if (particlesRef.current.length > 0) animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[100]" style={{ width:'100vw', height:'100vh' }} />;
}

// ─── Sound ────────────────────────────────────────────────────────────────────
function playCelebrationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    [523,659,784,1047,1319].forEach((freq, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq; osc.type = 'sine';
      const t = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0,t); gain.gain.linearRampToValueAtTime(0.3,t+0.05);
      gain.gain.exponentialRampToValueAtTime(0.001,t+0.4);
      osc.start(t); osc.stop(t+0.4);
    });
  } catch(_) {}
}

// ─── Gift Box SVG ─────────────────────────────────────────────────────────────
function GiftBox3D({ size = 110, opened = false }: { size?: number; opened?: boolean }) {
  const uid = React.useId().replace(/:/g,'');
  if (opened) {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        <defs>
          <radialGradient id={`og-${uid}`} cx="50%" cy="60%" r="55%">
            <stop offset="0%" stopColor="#FFE566" stopOpacity="1" />
            <stop offset="50%" stopColor="#FFB800" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`ob-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF3535" />
            <stop offset="100%" stopColor="#8B0D0D" />
          </linearGradient>
        </defs>
        <ellipse cx="60" cy="65" rx="50" ry="45" fill={`url(#og-${uid})`} opacity="0.8" />
        <rect x="22" y="58" width="60" height="44" rx="3" fill={`url(#ob-${uid})`} />
        <polygon points="82,58 96,48 96,92 82,102" fill="#6B0808" />
        <polygon points="22,102 82,102 96,92 36,92" fill="#4A0505" />
        <rect x="50" y="58" width="11" height="44" fill="#FFFFFF" opacity="0.9" />
        <rect x="51" y="58" width="4" height="44" fill="rgba(255,180,200,0.7)" />
        <polygon points="17,36 79,36 82,58 22,58" fill="#E03030" />
        <polygon points="79,36 93,26 96,48 82,58" fill="#9B0D0D" />
        <polygon points="17,36 79,36 93,26 31,26" fill="#C82020" />
        <rect x="50" y="26" width="11" height="32" fill="#FFFFFF" opacity="0.85" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <defs>
        <linearGradient id={`bf-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF2020" />
          <stop offset="100%" stopColor="#8B0505" />
        </linearGradient>
        <linearGradient id={`rb-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F0D0DC" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F0D0DC" />
        </linearGradient>
        <linearGradient id={`bwo-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFB8CC" />
          <stop offset="100%" stopColor="#C04060" />
        </linearGradient>
      </defs>
      <polygon points="18,54 78,54 78,100 18,100" fill={`url(#bf-${uid})`} />
      <polygon points="15,40 81,40 78,54 18,54" fill="#E03030" />
      <polygon points="15,40 81,40 97,30 31,30" fill="#C82020" />
      <rect x="46" y="36" width="12" height="18" fill={`url(#rb-${uid})`} />
      <path d="M 52,33 Q 28,16 22,27 Q 18,36 35,38 Q 44,40 52,33 Z" fill={`url(#bwo-${uid})`} />
      <path d="M 52,33 Q 76,16 82,27 Q 86,36 69,38 Q 60,40 52,33 Z" fill={`url(#bwo-${uid})`} />
      <circle cx="52" cy="33" r="8" fill={`url(#bwo-${uid})`} />
      <circle cx="52" cy="33" r="5" fill="rgba(255,255,255,0.8)" />
    </svg>
  );
}

// ─── Spin Wheel SVG ───────────────────────────────────────────────────────────
function SpinWheelSVG({ rotation, isSpinning }: { rotation: number; isSpinning: boolean }) {
  const cx = 160, cy = 160, r = 148;
  const n = WHEEL_SEGMENTS.length;
  const angle = 360 / n;

  const polarToCartesian = (cx: number, cy: number, r: number, deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
  };

  const segColors = ['#C8102E', '#FFD700', '#E83030', '#FFC107', '#B80020', '#F5C842', '#8B0000', '#FFB800'];

  return (
    <div
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: isSpinning ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 1.0)' : 'none',
        willChange: 'transform',
      }}
    >
      <svg width="300" height="300" viewBox="0 0 320 320">
        <defs>
          <radialGradient id="wheel-center-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE566" />
            <stop offset="100%" stopColor="#C8102E" />
          </radialGradient>
          <filter id="wheel-shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.5" />
          </filter>
        </defs>
        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={r + 12} fill="#8B0000" />
        <circle cx={cx} cy={cy} r={r + 9} fill="#C8102E" />
        <circle cx={cx} cy={cy} r={r + 6} fill="#FFD700" />
        <circle cx={cx} cy={cy} r={r + 3} fill="#C8102E" />
        {/* LED dots */}
        {Array.from({ length: 24 }, (_, i) => {
          const dotAngle = (i * 360) / 24;
          const dotPos = polarToCartesian(cx, cy, r + 8, dotAngle);
          return <circle key={i} cx={dotPos.x} cy={dotPos.y} r="3" fill={i % 2 === 0 ? '#FFD700' : '#FFFFFF'} opacity={0.9} />;
        })}
        {/* Segments */}
        {WHEEL_SEGMENTS.map((seg, i) => {
          const startAngle = i * angle;
          const endAngle = startAngle + angle;
          const midAngle = startAngle + angle / 2;
          const textPos = polarToCartesian(cx, cy, r * 0.68, midAngle);
          return (
            <g key={i}>
              <path d={describeArc(cx, cy, r, startAngle, endAngle)}
                fill={segColors[i % segColors.length]} stroke="#8B0000" strokeWidth="1.5" />
              <text x={textPos.x} y={textPos.y} textAnchor="middle" dominantBaseline="middle"
                fill={i % 2 === 0 ? '#FFD700' : '#8B0000'} fontSize="11" fontWeight="900"
                transform={`rotate(${midAngle}, ${textPos.x}, ${textPos.y})`}>
                {seg.label}
              </text>
            </g>
          );
        })}
        {/* Center hub */}
        <circle cx={cx} cy={cy} r={r * 0.35} fill="#8B0000" />
        <circle cx={cx} cy={cy} r={r * 0.32} fill="linear-gradient(#FFD700, #C8102E)" />
        <circle cx={cx} cy={cy} r={r * 0.30} fill="#C8102E" stroke="#FFD700" strokeWidth="2.5" />
        <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="middle" fill="#FFD700" fontSize="18" fontWeight="900">X1</text>
        <text x={cx} y={cy + 12} textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize="7" fontWeight="700" letterSpacing="1.5">FREE SPIN</text>
      </svg>
    </div>
  );
}

// ─── History Panel ────────────────────────────────────────────────────────────
function HistoryPanel({ records, onClose }: { records: { amount: number; date: string }[]; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="fixed top-0 right-0 h-full w-72 z-[200] flex flex-col"
      style={{ background: 'linear-gradient(180deg, #1A0000 0%, #2E0505 100%)', borderLeft: '1px solid rgba(255,215,0,0.2)' }}
    >
      <div className="flex items-center justify-between px-4 pt-10 pb-4" style={{ borderBottom: '1px solid rgba(255,215,0,0.15)' }}>
        <div className="flex items-center gap-2">
          <Wallet size={18} color="#FFD700" />
          <span style={{ color: '#FFD700', fontWeight: 700, fontSize: '15px' }}>Cashout History</span>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <X size={16} color="#fff" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <Wallet size={32} color="rgba(255,215,0,0.3)" />
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>No cashouts yet</p>
          </div>
        ) : (
          records.map((rec, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between py-3 px-3 mb-2 rounded-xl"
              style={{ background: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.2)' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(76,175,80,0.2)' }}>
                  <span style={{ fontSize: '14px' }}>💰</span>
                </div>
                <div>
                  <p style={{ color: '#4CAF50', fontSize: '12px', fontWeight: 600 }}>Cashout</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>{rec.date}</p>
                </div>
              </div>
              <span style={{ color: '#4CAF50', fontWeight: 700, fontSize: '14px' }}>₹{rec.amount.toFixed(2)}</span>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

// ─── Cashout Success Modal ────────────────────────────────────────────────────
function CashoutSuccessPopup({ amount, onClose }: { amount: number; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 20 }}
        className="w-full max-w-[300px] rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0A1A0A 0%, #0D2E0D 100%)', border: '1.5px solid rgba(76,175,80,0.4)' }}
      >
        <div className="w-full h-1" style={{ background: 'linear-gradient(90deg, #2E7D32, #4CAF50, #2E7D32)' }} />
        <div className="px-6 pt-6 pb-6 flex flex-col items-center text-center gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4CAF50, #2E7D32)', boxShadow: '0 0 30px rgba(76,175,80,0.5)' }}
          >
            <CheckCircle size={40} color="#fff" />
          </motion.div>
          <div>
            <p style={{ color: '#4CAF50', fontSize: '20px', fontWeight: 900, marginBottom: '6px' }}>🎉 Bonus Credited!</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: 1.6 }}>
              <span style={{ color: '#FFD700', fontWeight: 700 }}>₹{amount.toFixed(2)}</span> bonus will be credited to your wallet.
            </p>
            <p style={{ color: '#FF8C00', fontSize: '12px', fontWeight: 600, marginTop: '8px' }}>
              1x Turnover required before withdrawal.
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="w-full py-3.5 rounded-xl font-black text-sm"
            style={{ background: 'linear-gradient(135deg, #4CAF50, #2E7D32)', color: '#fff' }}
          >
            OK
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Cashout Confirm ──────────────────────────────────────────────────────────
function CashoutConfirmPopup({ amount, onConfirm, onCancel }: { amount: number; onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="w-full max-w-[300px] rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1A0303 0%, #2E0505 100%)', border: '1.5px solid rgba(255,215,0,0.4)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-full h-1" style={{ background: 'linear-gradient(90deg, #C8102E, #FFD700, #C8102E)' }} />
        <div className="px-6 pt-6 pb-6 flex flex-col items-center text-center gap-4">
          <div style={{ fontSize: '48px' }}>💰</div>
          <div>
            <p style={{ color: '#FFD700', fontSize: '18px', fontWeight: 900 }}>Confirm Cashout</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginTop: '6px' }}>
              Transfer <span style={{ color: '#FFD700', fontWeight: 700 }}>₹{amount.toFixed(2)}</span> to your wallet?
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <motion.button whileTap={{ scale: 0.97 }} onClick={onCancel}
              className="flex-1 py-3 rounded-xl font-bold text-sm"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
              Cancel
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={onConfirm}
              className="flex-1 py-3 rounded-xl font-black text-sm"
              style={{ background: 'linear-gradient(135deg, #FF8C00, #FFD700)', color: '#000' }}>
              Confirm
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Rules Modal ──────────────────────────────────────────────────────────────
function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[250] flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="w-full max-w-[300px] rounded-2xl overflow-hidden flex flex-col"
        style={{ border: '1px solid rgba(255,215,0,0.3)', maxHeight: '70vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-center py-3" style={{ background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)' }}>
          <h2 style={{ color: '#FFD700', fontSize: '15px', fontWeight: 700, letterSpacing: '0.05em' }}>Rules</h2>
        </div>
        <div className="overflow-y-auto flex-1 px-4 py-3" style={{ background: '#1A0303' }}>
          <div className="space-y-2.5">
            {[
              <>When the accumulated amount reaches <span style={{ color: '#FFD700', fontWeight: 700 }}>₹500</span>, you can apply for a bonus.</>,
              <>Every time you invite a friend to register, Minimum deposit <span style={{ color: '#FF4444', fontWeight: 700 }}>100RS or more</span>! you will get 1-time free spin.</>,
              <>The activity lasts for <span style={{ color: '#FFD700', fontWeight: 700 }}>3 days (72 hours)</span>. After the activity period ends, the accumulated rewards will be reset.</>,
              <>Each user can enjoy <span style={{ color: '#FFD700', fontWeight: 700 }}>1 free spin</span> opportunity per day.</>,
              <>After approval, the bonus will be directly deposited into your balance.</>,
              <>The bonus requires <span style={{ color: '#FF8C00', fontWeight: 700 }}>1x turnover</span> before withdrawal.</>,
            ].map((text, i) => (
              <p key={i} style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', lineHeight: 1.6 }}>{text}</p>
            ))}
          </div>
        </div>
        <div className="px-4 py-3" style={{ background: '#1A0303', borderTop: '1px solid rgba(255,215,0,0.1)' }}>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onClose}
            className="w-full py-2.5 rounded-xl font-bold text-sm tracking-widest"
            style={{ background: 'linear-gradient(135deg, #C8102E, #FF4444)', color: '#FFD700', fontSize: '13px' }}>
            OK
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Spin Wheel Content ───────────────────────────────────────────────────────
function SpinWheelContent({ initialGiftAmount = 0 }: { initialGiftAmount?: number }) {
  const navigate = useNavigate();
  const [isSpinning, setIsSpinning] = useState(false);
  const [targetRotation, setTargetRotation] = useState(0);
  const [currentBaseRotation, setCurrentBaseRotation] = useState(0);
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [spinsLeft, setSpinsLeft] = useState(() => getDailySpinsLeft());
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [spinRecords, setSpinRecords] = useState<{ name: string; amount: number; date: string }[]>([]);
  const [cashoutRecords, setCashoutRecords] = useState<{ amount: number; date: string }[]>([]);
  const [timer, setTimer] = useState('72:00:00');
  const [showHistory, setShowHistory] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCashoutConfirm, setShowCashoutConfirm] = useState(false);
  const [showCashoutSuccess, setShowCashoutSuccess] = useState(false);
  const [cashedOutAmount, setCashedOutAmount] = useState(0);
  const [fakeWinners] = useState(() => generateFakeWinners());

  useEffect(() => {
    const savedTotal = parseFloat(localStorage.getItem(LS_TOTAL_AMOUNT) || '0');
    const savedSpinRecords = JSON.parse(localStorage.getItem(LS_SPIN_RECORDS) || '[]');
    const savedCashoutRecords = JSON.parse(localStorage.getItem(LS_CASHOUT_RECORDS) || '[]');
    const newTotal = savedTotal + initialGiftAmount;
    setTotalAmount(newTotal);
    if (initialGiftAmount > 0) {
      localStorage.setItem(LS_TOTAL_AMOUNT, String(newTotal));
    }
    setSpinRecords(savedSpinRecords);
    setCashoutRecords(savedCashoutRecords);

    // Calculate timer from gift timestamp
    const giftTs = localStorage.getItem(LS_GIFT_TIMESTAMP);
    const updateTimer = () => {
      if (!giftTs) { setTimer('72:00:00'); return; }
      const elapsed = Date.now() - Number(giftTs);
      const left = Math.max(0, GIFT_COOLDOWN_MS - elapsed);
      const h = Math.floor(left / 3600000);
      const m = Math.floor((left % 3600000) / 60000);
      const s = Math.floor((left % 60000) / 1000);
      setTimer(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSpin = useCallback(() => {
    if (isSpinning || spinsLeft <= 0) return;
    setShowResult(false);
    setSpinResult(null);
    setIsSpinning(true);
    setSpinsLeft(prev => {
      const newVal = prev - 1;
      localStorage.setItem(LS_SPINS_LEFT, String(newVal));
      return newVal;
    });

    // Weighted segment selection
    const resultIndex = getWeightedSegmentIndex(totalAmount);
    const wonAmount = WHEEL_SEGMENTS[resultIndex].value;

    const segCenter = resultIndex * segAngle + segAngle / 2;
    const extraSpins = 5 + Math.floor(Math.random() * 4);
    const newTarget = currentBaseRotation + extraSpins * 360 + (360 - segCenter % 360);
    setTargetRotation(newTarget);

    setTimeout(() => {
      setCurrentBaseRotation(newTarget);
      setIsSpinning(false);
      setSpinResult(wonAmount);

      const newTotal = totalAmount + wonAmount;
      setTotalAmount(newTotal);
      localStorage.setItem(LS_TOTAL_AMOUNT, String(newTotal));

      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      const newRecord = { name: 'You', amount: wonAmount, date: dateStr };
      const updatedSpinRecords = [newRecord, ...spinRecords].slice(0, 20);
      setSpinRecords(updatedSpinRecords);
      localStorage.setItem(LS_SPIN_RECORDS, JSON.stringify(updatedSpinRecords));

      if (wonAmount > 0) {
        setShowConfetti(true);
        playCelebrationSound();
        setTimeout(() => setShowConfetti(false), 4000);
      }

      setTimeout(() => setShowResult(true), 300);
    }, 5200);
  }, [isSpinning, spinsLeft, currentBaseRotation, totalAmount, spinRecords]);

  const handleCashOut = useCallback(() => {
    if (totalAmount < PRIZE_TARGET) return;
    setShowCashoutConfirm(true);
  }, [totalAmount]);

  const handleCashoutConfirm = useCallback(() => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const currentWallet = parseFloat(localStorage.getItem(LS_WALLET) || '0');
    localStorage.setItem(LS_WALLET, String(currentWallet + totalAmount));
    const cashoutRecord = { amount: totalAmount, date: dateStr };
    const updatedCashout = [cashoutRecord, ...cashoutRecords].slice(0, 20);
    setCashoutRecords(updatedCashout);
    localStorage.setItem(LS_CASHOUT_RECORDS, JSON.stringify(updatedCashout));
    setCashedOutAmount(totalAmount);
    setTotalAmount(0);
    localStorage.setItem(LS_TOTAL_AMOUNT, '0');
    setShowCashoutConfirm(false);
    setShowCashoutSuccess(true);
    setShowConfetti(true);
    playCelebrationSound();
    setTimeout(() => setShowConfetti(false), 5000);
  }, [totalAmount, cashoutRecords]);

  const handleInvite = () => {
    const shareUrl = `${window.location.origin}/signup?ref=invite`;
    if (navigator.share) {
      navigator.share({ title: 'Join & Win ₹500!', text: 'Sign up and deposit ₹100+ to give me a free spin! 🎰', url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Referral link copied!');
    }
  };

  const remaining = Math.max(0, PRIZE_TARGET - totalAmount).toFixed(2);
  const progressPct = Math.min(100, (totalAmount / PRIZE_TARGET) * 100);
  const canCashOut = totalAmount >= PRIZE_TARGET;

  return (
    <div className="fixed inset-0 flex flex-col overflow-y-auto"
      style={{ background: 'linear-gradient(180deg, #C8102E 0%, #8B0000 30%, #4A0000 70%, #1A0000 100%)' }}>

      <ConfettiCanvas active={showConfetti} />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-2 flex-shrink-0">
        <button onClick={() => navigate('/main-dashboard')}
          className="w-9 h-9 flex items-center justify-center rounded-full"
          style={{ background: 'rgba(0,0,0,0.3)' }}>
          <ArrowLeft size={20} color="#fff" />
        </button>
        <h1 style={{ color: '#FFD700', fontSize: '17px', fontWeight: 800, letterSpacing: '0.03em', textShadow: '0 0 12px rgba(255,215,0,0.4)' }}>
          ✨ Cash Everyday ✨
        </h1>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(0,0,0,0.3)' }} onClick={() => setShowRules(true)}>
            <HelpCircle size={18} color="#FFD700" />
          </button>
          <button onClick={() => setShowHistory(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl"
            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,215,0,0.3)' }}>
            <History size={13} color="#FFD700" />
            <span style={{ color: '#FFD700', fontSize: '10px', fontWeight: 700 }}>History</span>
          </button>
        </div>
      </div>

      {/* My Amount Card */}
      <div className="mx-4 mt-2 rounded-2xl px-4 py-4 flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.5), rgba(139,0,0,0.3))', border: '1px solid rgba(255,215,0,0.2)', backdropFilter: 'blur(10px)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p style={{ color: 'rgba(255,215,0,0.7)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>My Amount</p>
            <motion.p
              style={{ color: '#FFD700', fontSize: '2rem', fontWeight: 900, lineHeight: 1.1, textShadow: '0 0 20px rgba(255,215,0,0.4)' }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              ₹{totalAmount.toFixed(2)}
            </motion.p>
          </div>
          <motion.button
            whileTap={canCashOut ? { scale: 0.96 } : {}}
            onClick={handleCashOut}
            disabled={!canCashOut}
            className="px-5 py-2.5 rounded-full font-black text-xs tracking-wider relative overflow-hidden"
            style={{
              background: canCashOut ? 'linear-gradient(135deg, #FFB800, #FF8C00)' : 'rgba(255,255,255,0.1)',
              color: canCashOut ? '#000' : 'rgba(255,255,255,0.3)',
              border: canCashOut ? '1px solid #FFD700' : '1px solid rgba(255,255,255,0.1)',
              cursor: canCashOut ? 'pointer' : 'not-allowed',
            }}
          >
            {canCashOut && (
              <motion.div className="absolute inset-0"
                style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.3) 50%, transparent 65%)' }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} />
            )}
            CASH OUT
          </motion.button>
        </div>
        {/* Timer */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.15)' }}>
            <span style={{ color: '#FF4444', fontSize: '10px' }}>⏰</span>
            <span style={{ color: '#FFD700', fontSize: '11px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{timer}</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>Activity countdown</span>
        </div>
      </div>

      {/* Wheel Section */}
      <div className="flex flex-col items-center flex-shrink-0 mt-4 relative">
        {/* Floating coins */}
        <div className="absolute left-2 top-4 z-10">
          <motion.div animate={{ y: [0,-8,0], rotate: [0,15,0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
            <svg width="36" height="36" viewBox="0 0 40 40">
              <ellipse cx="20" cy="20" rx="18" ry="18" fill="#FFD700" />
              <ellipse cx="20" cy="20" rx="14" ry="14" fill="#FFE566" />
              <text x="20" y="25" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#C8860A">₹</text>
            </svg>
          </motion.div>
        </div>
        <div className="absolute right-2 top-12 z-10">
          <motion.div animate={{ y: [0,-10,0], rotate: [0,-12,0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}>
            <svg width="28" height="28" viewBox="0 0 32 32">
              <ellipse cx="16" cy="16" rx="14" ry="14" fill="#FFD700" />
              <ellipse cx="16" cy="16" rx="10" ry="10" fill="#FFE566" />
              <text x="16" y="20" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#C8860A">₹</text>
            </svg>
          </motion.div>
        </div>

        {/* Pointer */}
        <div className="relative z-20 mb-[-12px]">
          <svg width="30" height="36" viewBox="0 0 32 40">
            <defs>
              <linearGradient id="ptr-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE566" />
                <stop offset="100%" stopColor="#D4AF37" />
              </linearGradient>
            </defs>
            <polygon points="16,38 2,4 30,4" fill="url(#ptr-grad)" />
            <polygon points="16,38 2,4 30,4" fill="none" stroke="#8B6914" strokeWidth="1.5" />
            <circle cx="16" cy="8" r="5" fill="#FFD700" stroke="#8B6914" strokeWidth="1" />
          </svg>
        </div>
        {/* Wheel */}
        <div className="relative z-10" style={{ filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.6))' }}>
          <SpinWheelSVG rotation={targetRotation} isSpinning={isSpinning} />
        </div>
      </div>

      {/* Spin / Invite Button */}
      <div className="flex flex-col items-center px-6 mt-4 mb-2 flex-shrink-0 gap-2">
        {spinsLeft > 0 ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="w-full max-w-xs py-3.5 rounded-full font-black text-sm tracking-wider relative overflow-hidden"
            style={{
              background: isSpinning ? 'rgba(255,255,255,0.15)' : 'linear-gradient(135deg, #FFB800 0%, #FF8C00 50%, #FFB800 100%)',
              color: isSpinning ? 'rgba(255,255,255,0.5)' : '#fff',
              boxShadow: isSpinning ? 'none' : '0 6px 24px rgba(255,140,0,0.5)',
              fontSize: '14px',
            }}
            onClick={handleSpin}
            disabled={isSpinning}
          >
            {!isSpinning && (
              <motion.div className="absolute inset-0"
                style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.3) 50%, transparent 65%)' }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} />
            )}
            {isSpinning ? '🎰 SPINNING...' : `X1 FREE SPIN (${spinsLeft} left)`}
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="w-full max-w-xs py-3.5 rounded-full font-black text-sm tracking-wider relative overflow-hidden flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #C8102E, #FF4444)',
              color: '#FFD700',
              boxShadow: '0 6px 24px rgba(200,16,46,0.5)',
              border: '1px solid rgba(255,215,0,0.3)',
            }}
            onClick={handleInvite}
          >
            <Users size={16} />
            INVITE FRIENDS TO GET SPIN
          </motion.button>
        )}

        {/* Progress text */}
        <div className="w-full max-w-xs">
          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <motion.div className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #FFD700, #FF8C00)', width: `${progressPct}%` }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5 }} />
          </div>
          <p className="text-center mt-1.5" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>
            Only <span style={{ color: '#FFD700', fontWeight: 700 }}>₹{remaining}</span> left to get prize <span style={{ color: '#FFD700', fontWeight: 700 }}>₹{PRIZE_TARGET}.00</span>
          </p>
        </div>
      </div>

      {/* Record Section */}
      <div className="mx-4 mb-6 mt-2 flex-shrink-0 rounded-2xl overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,215,0,0.15)' }}>
        <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,215,0,0.1)' }}>
          <h3 style={{ color: '#FFD700', fontSize: '14px', fontWeight: 700 }}>🏆 Record</h3>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>Recent Winners</span>
        </div>
        <div className="px-3 py-2">
          {fakeWinners.slice(0, 6).map((rec, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between py-2"
              style={{ borderBottom: idx < 5 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)', border: '1px solid rgba(255,215,0,0.3)' }}>
                  <span style={{ fontSize: '16px' }}>{rec.avatar}</span>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: 600 }}>{rec.name}</span>
              </div>
              <div className="text-right">
                <p style={{ color: '#FFD700', fontSize: '13px', fontWeight: 700 }}>₹{rec.amount.toFixed(2)}</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>{rec.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Spin Result Popup */}
      <AnimatePresence>
        {showResult && spinResult !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}
          >
            <motion.div
              initial={{ scale: 0.5, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.5, y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className="w-full max-w-xs rounded-[24px] flex flex-col items-center text-center relative overflow-hidden"
              style={{ background: 'linear-gradient(160deg, #1A0303 0%, #2E0505 50%, #1A0303 100%)', border: '1.5px solid rgba(255,215,0,0.4)' }}
            >
              <div className="w-full h-1" style={{ background: 'linear-gradient(90deg, #C8102E, #FFD700, #C8102E)' }} />
              <div className="px-8 pt-6 pb-6 flex flex-col items-center w-full">
                <motion.div animate={{ rotate: [0,10,-10,10,0], scale: [1,1.2,1] }} transition={{ duration: 0.6 }}
                  style={{ fontSize: '40px', marginBottom: '8px' }}>
                  {spinResult > 5 ? '🎉' : spinResult > 0 ? '🎊' : '😔'}
                </motion.div>
                <p className="text-xs font-black tracking-[0.2em] mb-2" style={{ color: '#FFD700' }}>
                  {spinResult > 0 ? '🎉 YOU WON!' : 'BETTER LUCK NEXT TIME'}
                </p>
                <motion.p
                  className="font-black leading-none mb-1"
                  style={{ fontSize: '3rem', color: '#FFD700', textShadow: '0 0 20px rgba(255,215,0,0.5)' }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.4, repeat: 2 }}
                >
                  ₹{spinResult.toFixed(2)}
                </motion.p>
                <p className="text-sm mb-2" style={{ color: 'rgba(255,200,150,0.6)' }}>added to your balance</p>
                <div className="w-full rounded-xl px-4 py-2 mb-4 flex items-center justify-between"
                  style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.1)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>💰 New Total</span>
                  <span style={{ color: '#FFD700', fontSize: '14px', fontWeight: 700 }}>₹{totalAmount.toFixed(2)}</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowResult(false)}
                  className="w-full py-3.5 rounded-2xl font-black text-sm tracking-widest"
                  style={{ background: 'linear-gradient(135deg, #FF8C00 0%, #FFD700 100%)', color: '#000' }}
                >
                  COLLECT ₹{spinResult.toFixed(2)}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCashoutConfirm && (
          <CashoutConfirmPopup amount={totalAmount} onConfirm={handleCashoutConfirm} onCancel={() => setShowCashoutConfirm(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCashoutSuccess && (
          <CashoutSuccessPopup amount={cashedOutAmount} onClose={() => setShowCashoutSuccess(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[190] bg-black" onClick={() => setShowHistory(false)} />
            <HistoryPanel records={cashoutRecords} onClose={() => setShowHistory(false)} />
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Gift Box Step ────────────────────────────────────────────────────────────
function GiftBoxStep({ onSelect }: { onSelect: (amount: number) => void }) {
  const navigate = useNavigate();
  const [opened, setOpened] = useState<number | null>(null);
  const [rewards] = useState<number[]>(() =>
    Array.from({ length: 4 }, () => +(490 + Math.random() * 8).toFixed(2))
  );
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  const handleBoxClick = (idx: number) => {
    if (opened !== null) return;
    setOpened(idx);
    const newParticles = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 160 - 80,
      y: Math.random() * -140 - 20,
      color: ['#FFD700','#FF4D6A','#FF8C00','#FFF','#C8102E','#F5E6A0','#FFB800','#FF6B35'][Math.floor(Math.random() * 8)],
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1200);
    setTimeout(() => onSelect(rewards[idx]), 900);
  };

  return (
    <div className="fixed inset-0 z-30 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1A0000 0%, #0A0000 50%, #000000 100%)' }}>

      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #C8102E, transparent)' }} />

      <div className="relative z-10 flex items-center px-4 pt-8 pb-2">
        <button onClick={() => navigate('/main-dashboard')}
          className="w-9 h-9 flex items-center justify-center" style={{ background: 'none', border: 'none' }}>
          <ArrowLeft size={22} style={{ color: 'rgba(255,255,255,0.8)' }} />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center justify-center px-6 mt-6 mb-8"
      >
        <motion.div
          className="w-24 h-0.5 mb-3 rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, background: 'linear-gradient(135deg, #FFD700, #FFE566, #D4AF37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.02em' }}>
          Cash everyday
        </h1>
        <motion.div
          className="w-24 h-0.5 mt-3 rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-8">
        <div className="grid grid-cols-2 gap-10 w-full max-w-[320px]">
          {[0, 1, 2, 3].map((idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + idx * 0.08, type: 'spring', stiffness: 220, damping: 18 }}
              onClick={() => handleBoxClick(idx)}
              disabled={opened !== null}
              whileHover={opened === null ? { scale: 1.06 } : {}}
              whileTap={opened === null ? { scale: 0.93 } : {}}
              className="flex items-center justify-center relative"
              style={{ background: 'none', border: 'none', padding: 0, cursor: opened !== null ? 'default' : 'pointer' }}
            >
              {/* Glow under each box */}
              {opened !== idx && (
                <motion.div className="absolute bottom-0 w-20 h-4 rounded-full blur-lg"
                  style={{ background: '#FFD700', opacity: 0.2 }}
                  animate={{ opacity: [0.15, 0.3, 0.15] }}
                  transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }} />
              )}
              {opened === idx ? (
                <motion.div
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 14 }}
                  className="flex flex-col items-center relative"
                >
                  {particles.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                      animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.1 }}
                      transition={{ duration: 1.0, ease: [0.2, 0, 0.8, 1] }}
                      className="absolute rounded-full pointer-events-none"
                      style={{ width: '7px', height: '7px', background: p.color, top: '40%', left: '50%', boxShadow: `0 0 6px ${p.color}` }}
                    />
                  ))}
                  <GiftBox3D size={115} opened={true} />
                  <motion.span
                    className="font-black text-lg mt-1"
                    animate={{ scale: [1, 1.18, 1] }}
                    transition={{ duration: 0.4, repeat: 2 }}
                    style={{ color: '#FFD700', textShadow: '0 2px 12px rgba(255,215,0,0.6)' }}
                  >
                    ₹{rewards[idx]}
                  </motion.span>
                </motion.div>
              ) : (
                <motion.div
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 2.6 + idx * 0.25, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.4 }}
                  className="flex items-center justify-center"
                >
                  <GiftBox3D size={130} />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="relative z-10 flex justify-center pb-16 pt-4"
      >
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', fontWeight: 400 }}>Choose your reward</p>
      </motion.div>
    </div>
  );
}

// ─── Page Entry ───────────────────────────────────────────────────────────────
export default function SpinWheelPage() {
  const [step, setStep] = useState<'gift' | 'spin'>(() => {
    const savedTimestamp = localStorage.getItem(LS_GIFT_TIMESTAMP);
    if (savedTimestamp) {
      const elapsed = Date.now() - Number(savedTimestamp);
      if (elapsed < GIFT_COOLDOWN_MS) {
        return 'spin';
      } else {
        localStorage.removeItem(LS_GIFT_TIMESTAMP);
        localStorage.removeItem(LS_TOTAL_AMOUNT);
        localStorage.removeItem(LS_SPIN_RECORDS);
        localStorage.removeItem(LS_DAILY_SPIN_DATE);
        localStorage.removeItem(LS_SPINS_LEFT);
        return 'gift';
      }
    }
    return 'gift';
  });
  const [giftAmount, setGiftAmount] = useState(0);

  const handleGiftSelect = (amount: number) => {
    localStorage.setItem(LS_GIFT_TIMESTAMP, String(Date.now()));
    setGiftAmount(amount);
    setStep('spin');
  };

  if (step === 'gift') {
    return <GiftBoxStep onSelect={handleGiftSelect} />;
  }

  return <SpinWheelContent initialGiftAmount={giftAmount} />;
}
