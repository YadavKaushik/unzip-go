import React, { useState, useCallback } from 'react';
import { Home, Activity, TrendingUp, User } from 'lucide-react';
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
    { key: 'nav-activity', label: t('activity'), icon: Activity, path: '/activity-history' },
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
    <div className="fixed bottom-0 left-0 right-0 flex justify-center z-50">
      <style>{`
        @keyframes spinWheel { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes counterSpin { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes outerRingPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(255,215,0,0.7), 0 0 20px rgba(255,215,0,0.5), 0 0 40px rgba(255,165,0,0.3); } 50% { box-shadow: 0 0 0 6px rgba(255,215,0,0.0), 0 0 30px rgba(255,215,0,0.8), 0 0 60px rgba(255,165,0,0.5); } }
        @keyframes winGlow { 0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); } 50% { opacity: 1; transform: translateX(-50%) scale(1.3); } }
        @keyframes sparkleOrbit { 0% { opacity: 0; transform: rotate(var(--deg)) translateY(-46px) scale(0.4); } 40% { opacity: 1; transform: rotate(var(--deg)) translateY(-46px) scale(1.1); } 70% { opacity: 0.8; transform: rotate(var(--deg)) translateY(-46px) scale(0.9); } 100% { opacity: 0; transform: rotate(var(--deg)) translateY(-46px) scale(0.4); } }
        @keyframes navActiveGlow { 0%, 100% { box-shadow: 0 0 8px rgba(212,175,55,0.6); } 50% { box-shadow: 0 0 18px rgba(212,175,55,1); } }
        @keyframes navIconBounce { 0%, 100% { transform: translateY(0) scale(1); } 40% { transform: translateY(-4px) scale(1.1); } 60% { transform: translateY(-2px) scale(1.05); } }
        @keyframes rippleEffect { 0% { transform: scale(0); opacity: 0.7; } 100% { transform: scale(4); opacity: 0; } }
        @keyframes spinPressScale { 0% { transform: scale(1); } 40% { transform: scale(0.88); } 70% { transform: scale(1.08); } 100% { transform: scale(1); } }
        @keyframes goldFlash { 0% { opacity: 0; } 30% { opacity: 0.6; } 100% { opacity: 0; } }
        @keyframes crownBounce { 0%, 100% { transform: scale(1) rotate(0deg); } 30% { transform: scale(1.3) rotate(-8deg); } 60% { transform: scale(1.15) rotate(5deg); } }
        @keyframes labelShine { 0% { background-position: -100% center; } 100% { background-position: 200% center; } }
        .nav-active-icon { animation: navIconBounce 1.8s ease-in-out infinite; }
        .spin-press { animation: spinPressScale 0.4s ease-out forwards; }
        .spin-label-shine { background: linear-gradient(90deg, #FFD700 0%, #FFF8DC 40%, #FFD700 60%, #FFA500 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: labelShine 2s linear infinite; }
      `}</style>
      <div className="w-full max-w-[420px] sm:max-w-[480px] md:max-w-[540px] lg:max-w-[600px]">
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #D4AF37 30%, #FFD700 50%, #D4AF37 70%, transparent)', opacity: 0.9 }} />
        <div className="flex items-end justify-around px-1 pb-3 pt-1" style={{ background: 'linear-gradient(180deg, #6B0000 0%, #8B0000 40%, #A00000 100%)', boxShadow: '0 -4px 24px rgba(0,0,0,0.5)' }}>
          {navItems?.map((item) => {
            const isActive = pathname === item?.path;
            const IconComp = item?.icon;

            if (item?.center) {
              return (
                <button key={item?.key} onClick={() => { setSpinPressed(true); setTimeout(() => setSpinPressed(false), 400); navigate(item?.path); }} className="flex flex-col items-center -mt-9 relative" style={{ outline: 'none' }}>
                  <div className="absolute" style={{ width: 80, height: 80, top: -6, left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle, rgba(255,215,0,0.45) 0%, rgba(255,140,0,0.2) 50%, transparent 75%)', animation: 'winGlow 2s ease-in-out infinite', borderRadius: '50%', pointerEvents: 'none' }} />
                  {spinPressed && <div className="absolute inset-0 rounded-full pointer-events-none" style={{ width: 72, height: 72, top: -2, left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle, rgba(255,255,200,0.8) 0%, transparent 70%)', animation: 'goldFlash 0.4s ease-out forwards', borderRadius: '50%', zIndex: 20 }} />}
                  <div className={spinPressed ? 'spin-press' : ''} style={{ width: 72, height: 72, borderRadius: '50%', padding: 4, background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 40%, #FFD700 70%, #FFEC8B 100%)', animation: 'outerRingPulse 2s ease-in-out infinite', position: 'relative' }}>
                    <div className="w-full h-full rounded-full relative flex items-center justify-center overflow-hidden" style={{ background: 'conic-gradient(#C8102E 0deg 45deg, #D4AF37 45deg 90deg, #8B0000 90deg 135deg, #F5D060 135deg 180deg, #C8102E 180deg 225deg, #D4AF37 225deg 270deg, #8B0000 270deg 315deg, #F5D060 315deg 360deg)', animation: 'spinWheel 3s linear infinite', boxShadow: 'inset 0 0 12px rgba(0,0,0,0.4)' }}>
                      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (<div key={i} className="absolute" style={{ width: 1, height: '50%', background: 'rgba(255,255,255,0.25)', top: 0, left: '50%', transformOrigin: 'bottom center', transform: `rotate(${deg}deg)` }} />))}
                    </div>
                    <div className="absolute flex items-center justify-center rounded-full" style={{ width: 26, height: 26, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, #FFFACD 0%, #FFD700 60%, #D4AF37 100%)', border: '2px solid #8B0000', boxShadow: '0 0 10px rgba(255,215,0,0.9), 0 0 20px rgba(255,165,0,0.5)', animation: 'counterSpin 3s linear infinite', zIndex: 10 }}>
                      <span style={{ fontSize: 14, lineHeight: 1, animation: 'crownBounce 2s ease-in-out infinite' }}>👑</span>
                    </div>
                  </div>
                  <div className="absolute pointer-events-none" style={{ width: 88, height: 88, top: -10, left: '50%', transform: 'translateX(-50%)' }}>
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (<div key={i} className="absolute rounded-full" style={{ width: i % 2 === 0 ? 6 : 4, height: i % 2 === 0 ? 6 : 4, background: i % 2 === 0 ? '#FFD700' : '#FFA500', top: '50%', left: '50%', marginTop: i % 2 === 0 ? -3 : -2, marginLeft: i % 2 === 0 ? -3 : -2, transform: `rotate(${deg}deg) translateY(-44px)`, animation: `sparkleOrbit 1.6s ease-in-out ${i * 0.2}s infinite`, '--deg': `${deg}deg`, boxShadow: '0 0 6px #FFD700, 0 0 10px rgba(255,215,0,0.6)' } as React.CSSProperties} />))}
                  </div>
                  <span className="spin-label-shine text-[11px] font-black mt-1 tracking-wider" style={{ letterSpacing: '0.08em' }}>{item?.label}</span>
                </button>
              );
            }

            return (
              <button key={item?.key} onClick={(e) => { addRipple(item.key, e); navigate(item?.path); }} className="flex flex-col items-center py-1 px-2 min-w-[52px] sm:min-w-[60px] relative transition-all duration-200 overflow-hidden" style={{ outline: 'none' }}>
                {(ripples[item.key] || []).map(r => (<span key={r.id} className="absolute rounded-full pointer-events-none" style={{ width: 60, height: 60, left: r.x - 30, top: r.y - 30, background: isActive ? 'radial-gradient(circle, rgba(255,215,0,0.5) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(255,100,100,0.4) 0%, transparent 70%)', animation: 'rippleEffect 0.6s ease-out forwards', zIndex: 5 }} />))}
                {isActive && <div className="absolute inset-x-0 top-0 bottom-0 rounded-xl mx-0.5" style={{ background: 'linear-gradient(180deg, rgba(212,175,55,0.22) 0%, rgba(212,175,55,0.08) 100%)', border: '1px solid rgba(212,175,55,0.4)' }} />}
                {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 rounded-b-full" style={{ width: 30, height: 3, background: 'linear-gradient(90deg, #D4AF37, #FFD700, #D4AF37)', boxShadow: '0 0 10px rgba(212,175,55,1)', animation: 'navActiveGlow 2s ease-in-out infinite' }} />}
                <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl mt-1 transition-all duration-200 ${isActive ? 'nav-active-icon' : ''}`} style={isActive ? { background: 'linear-gradient(135deg, rgba(212,175,55,0.28), rgba(212,175,55,0.1))' } : {}}>
                  {IconComp && <IconComp size={20} className={isActive ? 'text-yellow-300' : 'text-red-200/70'} style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.9))' } : {}} />}
                </div>
                <span className={`text-[10px] mt-0.5 font-semibold tracking-wide transition-all duration-200 ${isActive ? 'text-yellow-300' : 'text-red-200/60'}`} style={isActive ? { textShadow: '0 0 8px rgba(212,175,55,0.8)' } : {}}>{item?.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
