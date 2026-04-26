import React, { useState, useCallback } from 'react';
import { Home, Gift, TrendingUp, Wallet as WalletIcon, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useI18n } from '@/hooks/useI18n';

interface Ripple { id: number; x: number; y: number; }

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [ripples, setRipples] = useState<Record<string, Ripple[]>>({});
  const [spinPressed, setSpinPressed] = useState(false);

  const navItems = [
    { key: 'nav-home', label: t('home'), icon: Home, path: '/main-dashboard' },
    { key: 'nav-activity', label: t('activity'), icon: Gift, path: '/activity-history' },
    { key: 'nav-spin', label: t('spin'), icon: null, path: '/spin-wheel', center: true },
    { key: 'nav-promote', label: t('promote'), icon: TrendingUp, path: '/promotions-detail' },
    { key: 'nav-my', label: t('account'), icon: User, path: '/profile-management' },
  ];

  const addRipple = useCallback((key: string, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(prev => ({ ...prev, [key]: [...(prev[key] || []), { id, x, y }] }));
    setTimeout(() => {
      setRipples(prev => ({ ...prev, [key]: (prev[key] || []).filter(r => r.id !== id) }));
    }, 600);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center z-50 pointer-events-none">
      <style>{`
        @keyframes spinWheel { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes counterSpin { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes outerRingPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(255,215,0,0.7), 0 0 22px rgba(255,215,0,0.55), 0 0 44px rgba(255,80,80,0.45); } 50% { box-shadow: 0 0 0 8px rgba(255,215,0,0); 0 0 32px rgba(255,215,0,0.85), 0 0 64px rgba(255,80,80,0.6); } }
        @keyframes haloPulse { 0%, 100% { opacity: 0.55; transform: translateX(-50%) scale(1); } 50% { opacity: 1; transform: translateX(-50%) scale(1.18); } }
        @keyframes sparkleOrbit { 0% { opacity: 0; transform: rotate(var(--deg)) translateY(-50px) scale(0.4); } 40% { opacity: 1; transform: rotate(var(--deg)) translateY(-50px) scale(1.1); } 100% { opacity: 0; transform: rotate(var(--deg)) translateY(-50px) scale(0.4); } }
        @keyframes navIconBounce { 0%, 100% { transform: translateY(0) scale(1); } 40% { transform: translateY(-3px) scale(1.1); } }
        @keyframes rippleEffect { 0% { transform: scale(0); opacity: 0.7; } 100% { transform: scale(4); opacity: 0; } }
        @keyframes spinPressScale { 0% { transform: scale(1); } 40% { transform: scale(0.88); } 70% { transform: scale(1.08); } 100% { transform: scale(1); } }
        @keyframes goldFlash { 0% { opacity: 0; } 30% { opacity: 0.6; } 100% { opacity: 0; } }
        @keyframes crownBounce { 0%, 100% { transform: scale(1) rotate(0deg); } 30% { transform: scale(1.3) rotate(-8deg); } 60% { transform: scale(1.15) rotate(5deg); } }
        @keyframes labelShine { 0% { background-position: -100% center; } 100% { background-position: 200% center; } }
        @keyframes barShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .nav-active-icon { animation: navIconBounce 1.8s ease-in-out infinite; }
        .spin-press { animation: spinPressScale 0.4s ease-out forwards; }
        .spin-label-shine { background: linear-gradient(90deg, #FFD700 0%, #FFF8DC 40%, #FFD700 60%, #FFA500 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: labelShine 2s linear infinite; }
      `}</style>

      <div className="w-full max-w-[420px] sm:max-w-[480px] md:max-w-[540px] lg:max-w-[600px] relative pointer-events-auto" style={{ height: 88 }}>
        {/* SVG curved bar with center notch */}
        <svg viewBox="0 0 420 96" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 w-full" style={{ height: 96, filter: 'drop-shadow(0 -6px 18px rgba(0,0,0,0.55))' }}>
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A30015" />
              <stop offset="45%" stopColor="#7A0010" />
              <stop offset="100%" stopColor="#4A0008" />
            </linearGradient>
            <linearGradient id="barRim" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3a0006" />
              <stop offset="20%" stopColor="#FFD700" />
              <stop offset="50%" stopColor="#FFF1A8" />
              <stop offset="80%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#3a0006" />
            </linearGradient>
            <radialGradient id="notchShade" cx="50%" cy="35%" r="55%">
              <stop offset="0%" stopColor="#3a0006" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#3a0006" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Top rim line */}
          <path d="M0 14 Q 0 8 6 8 L 165 8 Q 180 8 184 18 A 28 28 0 0 0 236 18 Q 240 8 255 8 L 414 8 Q 420 8 420 14 L 420 96 L 0 96 Z"
                fill="url(#barGrad)" />
          <path d="M0 14 Q 0 8 6 8 L 165 8 Q 180 8 184 18 A 28 28 0 0 0 236 18 Q 240 8 255 8 L 414 8 Q 420 8 420 14"
                fill="none" stroke="url(#barRim)" strokeWidth="1.2" />
          {/* notch inner shading */}
          <ellipse cx="210" cy="14" rx="34" ry="10" fill="url(#notchShade)" />
        </svg>

        {/* nav items row */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-around px-1 pb-3" style={{ height: 90 }}>
          {navItems?.map((item) => {
            const isActive = pathname === item?.path;
            const IconComp = item?.icon;

            if (item?.center) {
              return (
                <button key={item?.key} onClick={() => { setSpinPressed(true); setTimeout(() => setSpinPressed(false), 400); navigate(item?.path); }} className="flex flex-col items-center -mt-10 relative" style={{ outline: 'none', width: 72 }}>
                  {/* outer halo */}
                  <div className="absolute" style={{ width: 96, height: 96, top: -14, left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle, rgba(255,215,0,0.5) 0%, rgba(255,80,80,0.25) 45%, transparent 75%)', animation: 'haloPulse 2s ease-in-out infinite', borderRadius: '50%', pointerEvents: 'none' }} />
                  {spinPressed && <div className="absolute pointer-events-none" style={{ width: 78, height: 78, top: -5, left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle, rgba(255,255,200,0.85) 0%, transparent 70%)', animation: 'goldFlash 0.4s ease-out forwards', borderRadius: '50%', zIndex: 20 }} />}

                  <div className={spinPressed ? 'spin-press' : ''} style={{ width: 70, height: 70, borderRadius: '50%', padding: 3, background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 40%, #FFD700 70%, #FFEC8B 100%)', animation: 'outerRingPulse 2s ease-in-out infinite', position: 'relative' }}>
                    <div className="w-full h-full rounded-full relative flex items-center justify-center overflow-hidden" style={{ background: 'conic-gradient(#C8102E 0deg 45deg, #D4AF37 45deg 90deg, #8B0000 90deg 135deg, #F5D060 135deg 180deg, #C8102E 180deg 225deg, #D4AF37 225deg 270deg, #8B0000 270deg 315deg, #F5D060 315deg 360deg)', animation: 'spinWheel 3s linear infinite', boxShadow: 'inset 0 0 12px rgba(0,0,0,0.45)' }}>
                      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (<div key={i} className="absolute" style={{ width: 1, height: '50%', background: 'rgba(255,255,255,0.25)', top: 0, left: '50%', transformOrigin: 'bottom center', transform: `rotate(${deg}deg)` }} />))}
                    </div>
                    <div className="absolute flex items-center justify-center rounded-full" style={{ width: 26, height: 26, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, #FFFACD 0%, #FFD700 60%, #D4AF37 100%)', border: '2px solid #8B0000', boxShadow: '0 0 10px rgba(255,215,0,0.9), 0 0 20px rgba(255,165,0,0.5)', animation: 'counterSpin 3s linear infinite', zIndex: 10 }}>
                      <span style={{ fontSize: 14, lineHeight: 1, animation: 'crownBounce 2s ease-in-out infinite' }}>👑</span>
                    </div>
                  </div>

                  {/* sparkles */}
                  <div className="absolute pointer-events-none" style={{ width: 96, height: 96, top: -14, left: '50%', transform: 'translateX(-50%)' }}>
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (<div key={i} className="absolute rounded-full" style={{ width: i % 2 === 0 ? 6 : 4, height: i % 2 === 0 ? 6 : 4, background: i % 2 === 0 ? '#FFD700' : '#FFA500', top: '50%', left: '50%', marginTop: i % 2 === 0 ? -3 : -2, marginLeft: i % 2 === 0 ? -3 : -2, transform: `rotate(${deg}deg) translateY(-48px)`, animation: `sparkleOrbit 1.6s ease-in-out ${i * 0.2}s infinite`, '--deg': `${deg}deg`, boxShadow: '0 0 6px #FFD700, 0 0 10px rgba(255,215,0,0.6)' } as React.CSSProperties} />))}
                  </div>

                  <span className="spin-label-shine text-[11px] font-black mt-1 tracking-wider relative z-10" style={{ letterSpacing: '0.08em' }}>{item?.label}</span>
                </button>
              );
            }

            return (
              <button key={item?.key} onClick={(e) => { addRipple(item.key, e); navigate(item?.path); }} className="flex flex-col items-center pt-3 pb-1 px-2 min-w-[56px] relative transition-all duration-200 overflow-hidden" style={{ outline: 'none' }}>
                {(ripples[item.key] || []).map(r => (<span key={r.id} className="absolute rounded-full pointer-events-none" style={{ width: 60, height: 60, left: r.x - 30, top: r.y - 30, background: isActive ? 'radial-gradient(circle, rgba(255,215,0,0.5) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(255,200,200,0.4) 0%, transparent 70%)', animation: 'rippleEffect 0.6s ease-out forwards', zIndex: 5 }} />))}

                <div className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ${isActive ? 'nav-active-icon' : ''}`} style={isActive ? { background: 'linear-gradient(135deg, rgba(255,215,0,0.28), rgba(255,215,0,0.08))', boxShadow: '0 0 12px rgba(255,215,0,0.4), inset 0 0 6px rgba(255,215,0,0.25)' } : {}}>
                  {IconComp && <IconComp size={22} className={isActive ? 'text-yellow-300' : 'text-red-100/85'} style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(255,215,0,0.95))' } : { filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }} />}
                </div>
                <span className={`text-[10.5px] mt-1 font-bold tracking-wide transition-all duration-200 ${isActive ? 'text-yellow-300' : 'text-red-100/80'}`} style={isActive ? { textShadow: '0 0 8px rgba(255,215,0,0.85)' } : { textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{item?.label}</span>
                {isActive && <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 rounded-full" style={{ width: 22, height: 3, background: 'linear-gradient(90deg, transparent, #FFD700, transparent)', boxShadow: '0 0 8px rgba(255,215,0,0.9)' }} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
