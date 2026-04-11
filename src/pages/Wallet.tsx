import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { ArrowLeft, RefreshCw, Download, Upload, FileText, History } from 'lucide-react';
import { WalletSkeleton } from '@/components/SkeletonScreens';
import BottomNav from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { db as supabase } from '@/lib/db';
import { useI18n } from '@/hooks/useI18n';

/* ── Ring ── */
function Ring({ pct, color, amount, label }: { pct: number; color: string; amount: string; label: string }) {
  const s = 68, sw = 6, r = (s - sw) / 2, c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: s, height: s }}>
        <svg width={s} height={s} className="-rotate-90">
          <circle cx={s/2} cy={s/2} r={r} fill="none" stroke="#F1F1F1" strokeWidth={sw} />
          <motion.circle cx={s/2} cy={s/2} r={r} fill="none" stroke={color} strokeWidth={sw}
            strokeLinecap="round" strokeDasharray={c}
            initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c - (pct/100)*c }}
            transition={{ duration: 1, ease: 'easeOut' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-black" style={{ color }}>{pct}%</span>
        </div>
      </div>
      <span className="text-[13px] font-extrabold text-gray-800 mt-1 tabular-nums">{amount}</span>
      <span className="text-[10px] text-gray-400">{label}</span>
    </div>
  );
}

export default function WalletPage() {
  const navigate = useNavigate();
  const { user, wallet } = useAuth();
  const { t } = useI18n();
  const [recycling, setRecycling] = useState(false);
  const [totalDeposit, setTotalDeposit] = useState(0);
  const [totalWithdraw, setTotalWithdraw] = useState(0);

  const bal = wallet ? Number(wallet.balance) : 0;

  useEffect(() => {
    if (!user) return;
    // Fetch lifetime deposit total
    supabase.from('transactions').select('amount').eq('user_id', user.id).eq('type', 'deposit').eq('status', 'completed')
      .then(({ data }: any) => {
        if (data) setTotalDeposit(data.reduce((s: number, r: any) => s + Number(r.amount), 0));
      });
    // Fetch lifetime withdraw total
    supabase.from('transactions').select('amount').eq('user_id', user.id).eq('type', 'withdraw').eq('status', 'completed')
      .then(({ data }: any) => {
        if (data) setTotalWithdraw(data.reduce((s: number, r: any) => s + Number(r.amount), 0));
      });
  }, [user]);

  if (!user) { navigate('/sign-up-login-screen'); return null; }
  if (!wallet) return <><WalletSkeleton /><BottomNav /></>;

  const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtInt = (n: number) => n.toLocaleString('en-IN');

  return (
    <div className="min-h-screen w-full max-w-[480px] mx-auto pb-20" style={{ background: '#F2F2F7' }}>
      <Toaster position="top-center" richColors />

      {/* ═══ HEADER ═══ */}
      <div style={{
        background: 'linear-gradient(180deg, #D10000 0%, #FF3B3B 100%)',
        borderRadius: '0 0 24px 24px',
        paddingBottom: '56px',
      }}>
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <ArrowLeft size={16} className="text-white" />
          </button>
          <span className="text-white font-bold text-[15px]">{t('wallet')}</span>
          <div className="w-8" />
        </div>

        <div className="flex flex-col items-center mt-1">
          <div className="w-11 h-11 rounded-full flex items-center justify-center mb-1" style={{ background: 'rgba(255,255,255,0.18)' }}>
            <span className="text-xl">💰</span>
          </div>
          <div className="text-[28px] font-black text-white tabular-nums leading-tight">₹{fmt(bal)}</div>
          <span className="text-white/60 text-[11px] mt-0.5">{t('total_balance')}</span>
        </div>

        {/* Lifetime Stats */}
        <div className="flex justify-center gap-12 mt-3">
          <div className="text-center">
            <div className="text-white font-extrabold text-[14px] tabular-nums">{fmtInt(totalDeposit)}</div>
            <div className="text-white/50 text-[9px]">{t('total_amount')}</div>
          </div>
          <div className="text-center">
            <div className="text-white font-extrabold text-[14px] tabular-nums">{fmtInt(totalDeposit)}</div>
            <div className="text-white/50 text-[9px]">{t('total_deposit_amount')}</div>
          </div>
        </div>
      </div>

      {/* ═══ CARD ═══ */}
      <div className="mx-4 -mt-8 relative z-10">
        <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: '18px 16px 14px' }}>
          <div className="flex justify-around mb-3">
            <Ring pct={100} color="#D10000" amount={`₹${fmt(bal)}`} label={t('main_wallet')} />
            <Ring pct={0} color="#E0E0E0" amount="₹0.00" label={t('third_party_wallet')} />
          </div>

          <button onClick={() => { setRecycling(true); setTimeout(() => { setRecycling(false); toast.success('Transfer complete'); }, 1200); }}
            disabled={recycling}
            className="w-full flex items-center justify-center gap-2 text-white font-bold text-[13px]"
            style={{ background: 'linear-gradient(135deg, #D10000, #FF3B3B)', borderRadius: '50px', padding: '10px 0', boxShadow: '0 4px 16px rgba(209,0,0,0.3)' }}>
            <motion.div animate={{ rotate: recycling ? 360 : 0 }} transition={{ duration: 0.8, repeat: recycling ? Infinity : 0, ease: 'linear' }}>
              <RefreshCw size={14} />
            </motion.div>
            {recycling ? t('transferring') : t('main_wallet_transfer')}
          </button>

          <div className="flex justify-around mt-4">
            {[
              { icon: Download, label: t('deposit'), path: '/deposit', bg: '#FFF4E5', ic: '#E8930C' },
              { icon: Upload, label: t('withdraw'), path: '/withdraw', bg: '#FFE8E8', ic: '#D10000' },
              { icon: FileText, label: t('deposit_history_short'), path: '/deposit-history', bg: '#EDE9FE', ic: '#7C3AED' },
              { icon: History, label: t('withdrawal_history_short'), path: '/withdraw-history', bg: '#D1FAE5', ic: '#059669' },
            ].map((b, i) => (
              <button key={i} onClick={() => navigate(b.path)} className="flex flex-col items-center gap-1">
                <div className="w-[50px] h-[50px] rounded-[14px] flex items-center justify-center" style={{ background: b.bg, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <b.icon size={20} style={{ color: b.ic }} strokeWidth={2.2} />
                </div>
                <span className="text-[9px] font-semibold text-gray-500 text-center leading-tight whitespace-pre-line">{b.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ GAME WALLETS ═══ */}
      <div className="mx-4 mt-3 flex gap-2">
        <div className="flex-1 text-center py-3 rounded-[14px] bg-white" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
          <span className="text-[14px] font-extrabold text-gray-300 tabular-nums">0.00</span>
          <p className="text-[10px] text-gray-400 mt-0.5">ARGame</p>
        </div>
        <div className="flex-1 text-center py-3 rounded-[14px]" style={{ background: 'linear-gradient(135deg, #D10000, #FF3B3B)', boxShadow: '0 4px 14px rgba(209,0,0,0.25)' }}>
          <span className="text-[14px] font-extrabold text-white tabular-nums">{fmt(bal)}</span>
          <p className="text-[10px] text-white/70 mt-0.5">Lottery</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
