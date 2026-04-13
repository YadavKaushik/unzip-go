import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle, History, X, CheckCircle, Wallet } from 'lucide-react';
import { SpinSkeleton } from '@/components/SkeletonScreens';
import { useNavigate } from 'react-router-dom';


// ─── Constants ────────────────────────────────────────────────────────────────
// Wheel segments: 0-10 range only
const WHEEL_SEGMENTS = [
  { label: '₹0',  colorA: '#F5C842', colorB: '#E8C800' },
  { label: '₹2',  colorA: '#FFF8DC', colorB: '#F5E642' },
  { label: '₹5',  colorA: '#F5C842', colorB: '#E8C800' },
  { label: '₹1',  colorA: '#FFF8DC', colorB: '#F5E642' },
  { label: '₹8',  colorA: '#F5C842', colorB: '#E8C800' },
  { label: '₹3',  colorA: '#FFF8DC', colorB: '#F5E642' },
  { label: '₹10', colorA: '#F5C842', colorB: '#E8C800' },
  { label: '₹6',  colorA: '#FFF8DC', colorB: '#F5E642' },
  { label: '₹4',  colorA: '#F5C842', colorB: '#E8C800' },
  { label: '₹7',  colorA: '#FFF8DC', colorB: '#F5E642' },
  { label: '₹9',  colorA: '#F5C842', colorB: '#E8C800' },
];

// Map label to amount value
const SEGMENT_VALUES: Record<string, number> = {
  '₹0': 0, '₹1': 1, '₹2': 2, '₹3': 3, '₹4': 4,
  '₹5': 5, '₹6': 6, '₹7': 7, '₹8': 8, '₹9': 9, '₹10': 10,
};

const segAngle = 360 / WHEEL_SEGMENTS.length;

const LS_TOTAL_AMOUNT     = 'techie404-total-amount';
const LS_SPIN_RECORDS     = 'techie404-spin-records';
const LS_WALLET           = 'techie404-wallet-balance';
const LS_CASHOUT_RECORDS  = 'techie404-cashout-records';

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

// ─── Celebration Sound ────────────────────────────────────────────────────────
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
  let s = size;
  if (opened) {
    return (
      <svg width={s} height={s} viewBox="0 0 120 120" fill="none">
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
        <ellipse cx="52" cy="64" rx="18" ry="7" fill="#FFE566" opacity="0.5" />
        <polygon points="17,36 79,36 82,58 22,58" fill="#E03030" />
        <polygon points="79,36 93,26 96,48 82,58" fill="#9B0D0D" />
        <polygon points="17,36 79,36 93,26 31,26" fill="#C82020" />
        <rect x="50" y="26" width="11" height="32" fill="#FFFFFF" opacity="0.85" />
      </svg>
    );
  }
  return (
    <svg width={s} height={s} viewBox="0 0 120 120" fill="none">
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

  return (
    <div
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: isSpinning ? 'transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 1.0)' : 'none',
        willChange: 'transform',
      }}
    >
      <svg width="320" height="320" viewBox="0 0 320 320">
        <defs>
          <radialGradient id="wheel-center-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF6B35" />
            <stop offset="100%" stopColor="#C8102E" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r + 12} fill="#D4880A" />
        <circle cx={cx} cy={cy} r={r + 9} fill="#E8A020" />
        <circle cx={cx} cy={cy} r={r + 6} fill="#FFD700" />
        <circle cx={cx} cy={cy} r={r + 3} fill="#C8102E" />
        {Array.from({ length: 24 }, (_, i) => {
          const dotAngle = (i * 360) / 24;
          const dotPos = polarToCartesian(cx, cy, r + 8, dotAngle);
          return <circle key={i} cx={dotPos.x} cy={dotPos.y} r="3.5" fill={i % 2 === 0 ? '#FFFFFF' : '#FFD700'} opacity={i % 2 === 0 ? 1 : 0.8} />;
        })}
        {WHEEL_SEGMENTS.map((seg, i) => {
          const startAngle = i * angle;
          const endAngle = startAngle + angle;
          const midAngle = startAngle + angle / 2;
          const textPos = polarToCartesian(cx, cy, r * 0.72, midAngle);
          const isEven = i % 2 === 0;
          return (
            <g key={i}>
              <path d={describeArc(cx, cy, r, startAngle, endAngle)}
                fill={isEven ? '#F5C842' : '#FFF8DC'} stroke="#D4880A" strokeWidth="1" />
              <text x={textPos.x} y={textPos.y} textAnchor="middle" dominantBaseline="middle"
                fill="#C8102E" fontSize="12" fontWeight="900"
                transform={`rotate(${midAngle}, ${textPos.x}, ${textPos.y})`}>
                {seg.label}
              </text>
            </g>
          );
        })}
        {/* Center hub */}
        <circle cx={cx} cy={cy} r={r * 0.38} fill="#E8A020" />
        <circle cx={cx} cy={cy} r={r * 0.35} fill="#FFD700" />
        <circle cx={cx} cy={cy} r={r * 0.32} fill="url(#wheel-center-grad)" />
        <circle cx={cx} cy={cy} r={r * 0.30} fill="#FF4500" />
        <circle cx={cx} cy={cy} r={r * 0.28} fill="#C8102E" stroke="#FFD700" strokeWidth="2" />
        <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize="20" fontWeight="900">X1</text>
        <text x={cx} y={cy + 12} textAnchor="middle" dominantBaseline="middle" fill="#FFD700" fontSize="8" fontWeight="700" letterSpacing="1">FREE SPIN</text>
      </svg>
    </div>
  );
}

// ─── Pedestal SVG ─────────────────────────────────────────────────────────────
function PedestalSVG() {
  return (
    <svg width="340" height="70" viewBox="0 0 340 70" fill="none">
      <defs>
        <linearGradient id="ped-top" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C8860A" />
          <stop offset="30%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFE566" />
          <stop offset="70%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#C8860A" />
        </linearGradient>
        <linearGradient id="ped-body" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E8A020" />
          <stop offset="50%" stopColor="#C8860A" />
          <stop offset="100%" stopColor="#8B5E00" />
        </linearGradient>
      </defs>
      <path d="M 30 10 L 310 10 L 330 65 L 10 65 Z" fill="url(#ped-body)" />
      <ellipse cx="170" cy="10" rx="140" ry="10" fill="url(#ped-top)" />
      <path d="M 60 10 L 80 10 L 95 65 L 75 65 Z" fill="rgba(255,255,255,0.12)" />
    </svg>
  );
}

// ─── History Panel (Cashout Only) ─────────────────────────────────────────────
function HistoryPanel({ records, onClose }: { records: { amount: number; date: string }[]; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="fixed top-0 right-0 h-full w-72 z-[200] flex flex-col"
      style={{ background: 'linear-gradient(180deg, #1A0A00 0%, #2E1200 100%)', borderLeft: '1px solid rgba(255,215,0,0.2)', boxShadow: '-8px 0 32px rgba(0,0,0,0.6)' }}
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

// ─── Cashout Confirmation Popup ───────────────────────────────────────────────
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
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="w-full max-w-[300px] rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1A0303 0%, #2E0505 100%)', border: '1.5px solid rgba(255,215,0,0.4)', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-full h-1" style={{ background: 'linear-gradient(90deg, #C8102E, #FFD700, #C8102E)' }} />
        <div className="px-6 pt-6 pb-6 flex flex-col items-center text-center gap-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ fontSize: '48px' }}
          >
            💰
          </motion.div>
          <div>
            <p style={{ color: '#FFD700', fontSize: '18px', fontWeight: 900, marginBottom: '6px' }}>Confirm Cashout</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: 1.5 }}>
              Transfer <span style={{ color: '#FFD700', fontWeight: 700 }}>₹{amount.toFixed(2)}</span> to your main wallet?
            </p>
          </div>
          <div className="w-full rounded-xl px-4 py-3" style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.15)' }}>
            <div className="flex justify-between items-center">
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Amount</span>
              <span style={{ color: '#FFD700', fontSize: '16px', fontWeight: 700 }}>₹{amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Destination</span>
              <span style={{ color: '#4CAF50', fontSize: '12px', fontWeight: 600 }}>Main Wallet</span>
            </div>
          </div>
          <div className="flex gap-3 w-full">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl font-bold text-sm"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Cancel
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl font-black text-sm"
              style={{ background: 'linear-gradient(135deg, #FF8C00, #FFD700)', color: '#000' }}
            >
              Confirm
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Cashout Success Popup ────────────────────────────────────────────────────
function CashoutSuccessPopup({ amount, onClose }: { amount: number; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 20 }}
        className="w-full max-w-[300px] rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0A1A0A 0%, #0D2E0D 100%)', border: '1.5px solid rgba(76,175,80,0.4)', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}
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
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ color: '#4CAF50', fontSize: '20px', fontWeight: 900, marginBottom: '6px' }}>
              🎉 Transferred!
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
              <span style={{ color: '#FFD700', fontWeight: 700 }}>₹{amount.toFixed(2)}</span> added to your main wallet
            </motion.p>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
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
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="w-full max-w-[300px] rounded-2xl overflow-hidden flex flex-col"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.6)', border: '1px solid rgba(100,160,255,0.3)', maxHeight: '70vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-center py-3 relative flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 700, letterSpacing: '0.05em' }}>Rules</h2>
        </div>
        <div className="overflow-y-auto flex-1 px-4 py-3" style={{ background: '#EEF4FF' }}>
          <div className="space-y-2.5">
            {[
              <>When the accumulated amount reaches the displayed amount, you can apply for a bonus.</>,
              <>Every time you invite a friend to register, Minimum deposit <span style={{ color: '#EF4444', fontWeight: 700 }}>100RS or more</span>! you will get 1-time free spin.</>,
              <>The activity lasts for 3 days. After the activity period ends, the accumulated rewards will be reset, and the activity will start again.</>,
              <>Each user can enjoy 1 free spin opportunity per day.</>,
              <>After approval of the application, the bonus will be directly deposited into your balance.</>,
              <>The bonus requires one time of wagering before withdrawal.</>,
              <>To successfully recommend someone, the invitee must use the inviter's invitation code.</>,
              <><span style={{ color: '#2563EB', fontWeight: 700 }}>SIKKIMGAME</span> reserves the interpretation of the activity. If you have any questions, please get in touch with customer service.</>,
            ].map((text, i) => (
              <p key={i} style={{ color: '#1A1A2E', fontSize: '12px', lineHeight: 1.6 }}>{text}</p>
            ))}
          </div>
        </div>
        <div className="px-4 py-3 flex-shrink-0" style={{ background: '#EEF4FF', borderTop: '1px solid rgba(59,130,246,0.15)' }}>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onClose}
            className="w-full py-2.5 rounded-xl font-bold text-sm tracking-widest"
            style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', color: '#FFFFFF', fontSize: '13px', boxShadow: '0 4px 12px rgba(37,99,235,0.35)' }}>
            OK
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Spin Wheel Content ───────────────────────────────────────────────────────
function SpinWheelContent() {
  const navigate = useNavigate();
  const [isSpinning, setIsSpinning] = useState(false);
  const [targetRotation, setTargetRotation] = useState(0);
  const [currentBaseRotation, setCurrentBaseRotation] = useState(0);
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [spinsLeft, setSpinsLeft] = useState(1);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [spinRecords, setSpinRecords] = useState<{ name: string; amount: number; date: string }[]>([]);
  const [cashoutRecords, setCashoutRecords] = useState<{ amount: number; date: string }[]>([]);
  const [timer, setTimer] = useState('71:38:00');
  const [showHistory, setShowHistory] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCashoutConfirm, setShowCashoutConfirm] = useState(false);
  const [showCashoutSuccess, setShowCashoutSuccess] = useState(false);
  const [cashedOutAmount, setCashedOutAmount] = useState(0);

  useEffect(() => {
    const savedTotal = parseFloat(localStorage.getItem(LS_TOTAL_AMOUNT) || '0');
    const savedSpinRecords = JSON.parse(localStorage.getItem(LS_SPIN_RECORDS) || '[]');
    const savedCashoutRecords = JSON.parse(localStorage.getItem(LS_CASHOUT_RECORDS) || '[]');
    setTotalAmount(savedTotal);
    setSpinRecords(savedSpinRecords);
    setCashoutRecords(savedCashoutRecords);

    const interval = setInterval(() => {
      setTimer(prev => {
        const parts = prev.split(':').map(Number);
        let [h, m, s] = parts;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 0; m = 0; s = 0; }
        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSpin = useCallback(() => {
    if (isSpinning || spinsLeft <= 0) return;
    setShowResult(false);
    setSpinResult(null);
    setIsSpinning(true);
    setSpinsLeft(prev => prev - 1);

    // Pick a random segment index (all are 0-10 values)
    const resultIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const wonAmount = SEGMENT_VALUES[WHEEL_SEGMENTS[resultIndex].label] ?? 0;

    // Calculate rotation so pointer lands on chosen segment
    // Pointer is at top (0 deg). Segment i starts at i*segAngle.
    // We want segment center (i*segAngle + segAngle/2) to be at top (0).
    // So wheel needs to rotate: -(i*segAngle + segAngle/2) mod 360
    const segCenter = resultIndex * segAngle + segAngle / 2;
    const extraSpins = 5 + Math.floor(Math.random() * 4); // 5-8 full rotations
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
      const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
      const newRecord = { name: 'Member', amount: wonAmount, date: dateStr };
      const updatedSpinRecords = [newRecord, ...spinRecords].slice(0, 20);
      setSpinRecords(updatedSpinRecords);
      localStorage.setItem(LS_SPIN_RECORDS, JSON.stringify(updatedSpinRecords));

      if (wonAmount > 0) {
        setShowConfetti(true);
        playCelebrationSound();
        setTimeout(() => setShowConfetti(false), 4000);
      }

      setTimeout(() => setShowResult(true), 300);
    }, 4700);
  }, [isSpinning, spinsLeft, currentBaseRotation, totalAmount, spinRecords]);

  const handleCashOut = useCallback(() => {
    if (totalAmount < 500) return;
    setShowCashoutConfirm(true);
  }, [totalAmount]);

  const handleCashoutConfirm = useCallback(() => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    
    // Transfer to main wallet
    const currentWallet = parseFloat(localStorage.getItem(LS_WALLET) || '0');
    localStorage.setItem(LS_WALLET, String(currentWallet + totalAmount));
    
    // Save cashout record
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

  const prizeTarget = 500;
  const remaining = Math.max(0, prizeTarget - totalAmount).toFixed(2);
  const progressPct = Math.min(100, (totalAmount / prizeTarget) * 100);
  const canCashOut = totalAmount >= 500;

  return (
    <div className="fixed inset-0 flex flex-col overflow-y-auto"
      style={{ background: 'linear-gradient(180deg, #E83030 0%, #C8102E 30%, #B80020 60%, #8B0000 100%)' }}>

      <ConfettiCanvas active={showConfetti} />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-2 flex-shrink-0">
        <button
          onClick={() => navigate('/main-dashboard')}
          className="w-9 h-9 flex items-center justify-center rounded-full"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        >
          <ArrowLeft size={20} color="#fff" />
        </button>
        <h1 style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: 700 }}>Invite Wheel</h1>
        <div className="flex items-center gap-2">
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.2)' }}
            onClick={() => setShowRules(true)}
          >
            <HelpCircle size={20} color="#fff" />
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,215,0,0.4)' }}
          >
            <History size={14} color="#FFD700" />
            <span style={{ color: '#FFD700', fontSize: '11px', fontWeight: 700 }}>History</span>
            {cashoutRecords.length > 0 && (
              <span className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#4CAF50', fontSize: '9px', color: '#fff', fontWeight: 700 }}>
                {cashoutRecords.length > 9 ? '9+' : cashoutRecords.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* My Amount + Timer */}
      <div className="flex flex-col items-center pt-2 pb-1 flex-shrink-0">
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: 400 }}>
          my amount ({timer})
        </p>
        <motion.p
          style={{ color: '#FFFFFF', fontSize: '2.4rem', fontWeight: 900, lineHeight: 1.1, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          ₹{totalAmount.toFixed(2)}
        </motion.p>
        <div className="w-48 mt-2 mb-1">
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.2)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #FFD700, #FF8C00)', width: `${progressPct}%` }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', textAlign: 'center', marginTop: '2px' }}>
            ₹{remaining} more to ₹500 wallet transfer
          </p>
        </div>
      </div>

      {/* CASH OUT Button */}
      <div className="flex flex-col items-center mt-1 mb-3 flex-shrink-0 gap-1">
        <motion.button
          whileTap={canCashOut ? { scale: 0.96 } : {}}
          onClick={handleCashOut}
          disabled={!canCashOut}
          className="px-10 py-3 rounded-full font-black text-base tracking-widest relative overflow-hidden"
          style={{
            background: canCashOut ? 'linear-gradient(135deg, #FFB800 0%, #FF8C00 50%, #FFB800 100%)' : 'rgba(0,0,0,0.25)',
            color: canCashOut ? '#fff' : 'rgba(255,255,255,0.35)',
            boxShadow: canCashOut ? '0 4px 20px rgba(255,140,0,0.5)' : 'none',
            border: 'none',
            fontSize: '15px',
            cursor: canCashOut ? 'pointer' : 'not-allowed',
          }}
        >
          {canCashOut && (
            <motion.div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,215,0,0.15) 50%, transparent 65%)' }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
          )}
          💰 CASH OUT
        </motion.button>
        {!canCashOut && (
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px' }}>
            Need ₹500 to cash out (₹{remaining} more)
          </p>
        )}
      </div>

      {/* Wheel + Pedestal */}
      <div className="flex flex-col items-center flex-shrink-0 relative">
        <div className="absolute left-2 top-8 z-10">
          <motion.div animate={{ y: [0,-8,0], rotate: [0,15,0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
            <svg width="40" height="40" viewBox="0 0 40 40">
              <ellipse cx="20" cy="20" rx="18" ry="18" fill="#FFD700" />
              <ellipse cx="20" cy="20" rx="14" ry="14" fill="#FFE566" />
              <text x="20" y="25" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#C8860A">₹</text>
            </svg>
          </motion.div>
        </div>
        <div className="absolute right-2 top-16 z-10">
          <motion.div animate={{ y: [0,-10,0], rotate: [0,-12,0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}>
            <svg width="32" height="32" viewBox="0 0 32 32">
              <ellipse cx="16" cy="16" rx="14" ry="14" fill="#FFD700" />
              <ellipse cx="16" cy="16" rx="10" ry="10" fill="#FFE566" />
              <text x="16" y="20" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#C8860A">₹</text>
            </svg>
          </motion.div>
        </div>
        {/* Pointer */}
        <div className="relative z-20 mb-[-14px]">
          <svg width="32" height="40" viewBox="0 0 32 40">
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
        <div className="relative z-10" style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))' }}>
          <SpinWheelSVG rotation={targetRotation} isSpinning={isSpinning} />
        </div>
        {/* Pedestal */}
        <div className="relative z-10 mt-[-10px]">
          <PedestalSVG />
        </div>
      </div>

      {/* SPIN Button */}
      <div className="flex flex-col items-center px-6 mb-3 flex-shrink-0 mt-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          className="w-full max-w-xs py-4 rounded-full font-black text-sm tracking-widest relative overflow-hidden"
          style={{
            background: isSpinning || spinsLeft <= 0
              ? 'rgba(255,255,255,0.15)'
              : 'linear-gradient(135deg, #FFB800 0%, #FF8C00 50%, #FFB800 100%)',
            color: isSpinning || spinsLeft <= 0 ? 'rgba(255,255,255,0.5)' : '#fff',
            boxShadow: isSpinning || spinsLeft <= 0 ? 'none' : '0 6px 24px rgba(255,140,0,0.5)',
            border: 'none',
            fontSize: '14px',
            letterSpacing: '0.1em',
          }}
          onClick={handleSpin}
          disabled={isSpinning || spinsLeft <= 0}
        >
          {!isSpinning && spinsLeft > 0 && (
            <motion.div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.3) 50%, transparent 65%)' }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
          )}
          {isSpinning ? '🎰 SPINNING...' : spinsLeft <= 0 ? '✅ SPIN USED' : 'INVITE FRIENDS TO GET SPIN'}
        </motion.button>
        <p className="mt-2 text-center" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px' }}>
          {spinsLeft > 0 ? `🎁 ${spinsLeft} Free Spin Available` : `Only ₹${remaining} left to get ₹500 wallet transfer`}
        </p>
      </div>

      {/* Record Section */}
      <div className="mx-4 mb-6 flex-shrink-0">
        <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Record</h3>
        {spinRecords.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>No spins yet. Spin to win!</p>
        ) : (
          spinRecords.slice(0, 5).map((rec, idx) => (
            <div key={idx} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <span style={{ fontSize: '20px' }}>👤</span>
                </div>
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{rec.name}</span>
              </div>
              <div className="text-right">
                <p style={{ color: '#FF4444', fontSize: '14px', fontWeight: 700 }}>₹{rec.amount.toFixed(2)}</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{rec.date}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Spin Result Popup */}
      <AnimatePresence>
        {showResult && spinResult !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}
          >
            <motion.div
              initial={{ scale: 0.5, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.5, y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className="w-full max-w-xs rounded-[24px] flex flex-col items-center text-center relative overflow-hidden"
              style={{ background: 'linear-gradient(160deg, #1A0303 0%, #2E0505 50%, #1A0303 100%)', border: '1.5px solid rgba(255,215,0,0.4)', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}
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
                  style={{ fontSize: '3.5rem', color: '#FFD700', textShadow: '0 0 20px rgba(255,215,0,0.5)' }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.4, repeat: 2 }}
                >
                  ₹{spinResult}
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
                  style={{ background: 'linear-gradient(135deg, #FF8C00 0%, #FFD700 100%)', color: '#000', boxShadow: '0 6px 20px rgba(255,140,0,0.5)' }}
                >
                  COLLECT ₹{spinResult}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cashout Confirm Popup */}
      <AnimatePresence>
        {showCashoutConfirm && (
          <CashoutConfirmPopup
            amount={totalAmount}
            onConfirm={handleCashoutConfirm}
            onCancel={() => setShowCashoutConfirm(false)}
          />
        )}
      </AnimatePresence>

      {/* Cashout Success Popup */}
      <AnimatePresence>
        {showCashoutSuccess && (
          <CashoutSuccessPopup
            amount={cashedOutAmount}
            onClose={() => setShowCashoutSuccess(false)}
          />
        )}
      </AnimatePresence>

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[190] bg-black"
              onClick={() => setShowHistory(false)}
            />
            <HistoryPanel records={cashoutRecords} onClose={() => setShowHistory(false)} />
          </>
        )}
      </AnimatePresence>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Gift Box Step ─────────────────────────────────────────────────────────────
function GiftBoxStep({ onSelect }: { onSelect: () => void }) {
  const navigate = useNavigate();
  const [opened, setOpened] = useState<number | null>(null);
  const [rewards] = useState<number[]>(() =>
    Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 490)
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
    setTimeout(() => onSelect(), 900);
  };

  return (
    <div className="fixed inset-0 z-30 flex flex-col overflow-hidden" style={{ background: '#000000' }}>
      <div className="relative z-10 flex items-center px-4 pt-8 pb-2">
        <button
          onClick={() => navigate('/main-dashboard')}
          className="w-9 h-9 flex items-center justify-center"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={22} style={{ color: 'rgba(255,255,255,0.8)' }} />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex items-center justify-center px-6 mt-6 mb-8"
      >
        <h1 style={{ fontSize: '1.55rem', fontWeight: 700, color: '#D4AF37', textShadow: '0 0 20px rgba(212,175,55,0.5)', letterSpacing: '0.02em', fontFamily: 'Georgia, serif' }}>
          ✨ Cash everyday ✨
        </h1>
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
        <p style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 400 }}>Choose your reward</p>
      </motion.div>
    </div>
  );
}

// ─── Page Entry ────────────────────────────────────────────────────────────────
export default function SpinWheelPage() {
  const [step, setStep] = useState<'gift' | 'spin'>('gift');

  if (step === 'gift') {
    return <GiftBoxStep onSelect={() => setStep('spin')} />;
  }

  return <SpinWheelContent />;
}