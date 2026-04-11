import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { Copy, CheckCircle, LogOut, ChevronRight, Wallet, Camera, ArrowUpRight, Download, Upload, Crown, Bell, Gift, Gamepad2, BarChart3, Globe, Settings, MessageCircle, Megaphone, HelpCircle, BookOpen, Info } from 'lucide-react';
import { ProfileSkeleton } from '@/components/SkeletonScreens';
import BottomNav from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';

/* ── About Us Page ── */
function AboutUsPage({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 max-w-[480px] mx-auto overflow-y-auto" style={{ background: '#FAF5E9' }}>
      <div className="sticky top-0 z-50 flex items-center justify-between px-4" style={{ background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)', height: 50 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <ChevronRight size={22} color="#fff" style={{ transform: 'rotate(180deg)' }} />
        </button>
        <span className="font-bold text-[17px] text-white">About Us</span>
        <div style={{ width: 28 }} />
      </div>
      <div className="px-5 py-6">
        {/* Logo / Brand */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)', boxShadow: '0 4px 20px rgba(200,16,46,0.25)' }}>
            <Crown size={36} color="#FFD700" />
          </div>
          <h1 className="text-xl font-extrabold" style={{ color: '#1a1a1a' }}>Techie<span style={{ color: '#C8102E' }}>404</span></h1>
          <p className="text-xs mt-1" style={{ color: '#999' }}>Version 1.0.0</p>
        </div>

        {/* About Content */}
        <div className="rounded-2xl p-5 mb-4" style={{ background: '#fff', border: '1px solid #f0e0c0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <h2 className="text-sm font-bold mb-3" style={{ color: '#C8102E' }}>Who We Are</h2>
          <p className="text-xs leading-relaxed mb-4" style={{ color: '#555' }}>
            Techie404 is a premium entertainment and gaming platform designed to deliver an exceptional experience to users worldwide. Built with cutting-edge technology, our platform offers a seamless, secure, and thrilling gaming environment.
          </p>
          <h2 className="text-sm font-bold mb-3" style={{ color: '#C8102E' }}>Our Mission</h2>
          <p className="text-xs leading-relaxed mb-4" style={{ color: '#555' }}>
            To provide a world-class gaming experience with transparency, fairness, and top-notch security. We believe in creating a platform where every user feels valued and rewarded.
          </p>
          <h2 className="text-sm font-bold mb-3" style={{ color: '#C8102E' }}>Key Features</h2>
          <div className="space-y-2.5">
            {[
              { icon: '🔒', title: 'Secure & Safe', desc: 'Bank-grade encryption protecting all transactions and data' },
              { icon: '⚡', title: 'Instant Transactions', desc: 'Lightning-fast deposits and withdrawals with multiple payment methods' },
              { icon: '🎮', title: 'Premium Games', desc: 'Curated collection of top-tier games from leading providers' },
              { icon: '🎁', title: 'Generous Rewards', desc: 'Daily bonuses, VIP programs, and referral commissions up to 85%' },
              { icon: '📱', title: 'Mobile First', desc: 'Optimized for mobile with a smooth, responsive interface' },
              { icon: '🌐', title: '24/7 Support', desc: 'Round-the-clock customer service in multiple languages' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(200,16,46,0.04)' }}>
                <span className="text-lg mt-0.5">{f.icon}</span>
                <div>
                  <div className="text-xs font-bold" style={{ color: '#333' }}>{f.title}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: '#888' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legal */}
        <div className="rounded-2xl p-5 mb-4" style={{ background: '#fff', border: '1px solid #f0e0c0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <h2 className="text-sm font-bold mb-3" style={{ color: '#C8102E' }}>Legal & Compliance</h2>
          <p className="text-xs leading-relaxed" style={{ color: '#555' }}>
            Techie404 operates in compliance with applicable regulations and promotes responsible gaming practices. Users must be 18+ to participate. We are committed to fair play and employ certified random number generators for all games.
          </p>
        </div>

        {/* Contact */}
        <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid #f0e0c0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <h2 className="text-sm font-bold mb-3" style={{ color: '#C8102E' }}>Contact Us</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs">📧</span>
              <span className="text-xs" style={{ color: '#555' }}>support@techie404.app</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">🌐</span>
              <span className="text-xs" style={{ color: '#555' }}>www.techie404.app</span>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] mt-6 mb-4" style={{ color: '#bbb' }}>© 2026 Techie404. All rights reserved.</p>
      </div>
    </div>
  );
}

export default function ProfileManagement() {
  const navigate = useNavigate();
  const { user, profile, wallet, signOut } = useAuth();
  const { t, languages, lang } = useI18n();
  const [copied, setCopied] = useState(false);

  const avatarUrl = profile?.avatar_url || '/avatars/avatar-1.jpg';

  const data = {
    uid: profile?.uid || 'N/A',
    username: profile?.username || 'Member',
    balance: wallet ? Number(wallet.balance) : 0,
    vipLevel: profile?.vip_level || 0,
    lastLogin: profile?.updated_at ? new Date(profile.updated_at).toLocaleString('en-IN') : 'N/A',
  };

  if (!user) { navigate('/sign-up-login-screen'); return null; }
  if (!profile || !wallet) return <><ProfileSkeleton /><BottomNav /></>;

  const copyUID = () => {
    navigator.clipboard.writeText(String(data.uid)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('UID copied');
    });
  };

  const quickActions = [
    { icon: Wallet, label: t('wallet'), action: () => navigate('/wallet') },
    { icon: Download, label: t('deposit'), action: () => navigate('/deposit') },
    { icon: Upload, label: t('withdraw'), action: () => navigate('/withdraw') },
    { icon: Crown, label: t('vip'), action: () => toast.info('VIP — Coming soon') },
  ];

  const menuGrid = [
    { icon: Gamepad2, label: t('game_history'), desc: t('game_history_desc'), action: () => navigate('/bet-history') },
    { icon: ArrowUpRight, label: t('transaction'), desc: t('transaction_desc'), action: () => navigate('/transaction-history') },
    { icon: Download, label: t('deposit'), desc: t('deposit_desc'), action: () => navigate('/deposit-history') },
    { icon: Upload, label: t('withdraw'), desc: t('withdraw_desc'), action: () => navigate('/withdraw-history') },
  ];

  const menuList = [
    { icon: Bell, label: t('notification'), action: () => navigate('/notifications') },
    { icon: Gift, label: t('gift'), action: () => navigate('/gift') },
    { icon: BarChart3, label: t('game_statistics'), action: () => navigate('/game-statistics') },
    { icon: Globe, label: t('language'), value: languages[lang]?.name, action: () => navigate('/language') },
  ];

  const serviceCenter = [
    { icon: Settings, label: t('settings') },
    { icon: MessageCircle, label: t('feedback') },
    { icon: Megaphone, label: t('announcement') },
    { icon: HelpCircle, label: t('support') },
    { icon: BookOpen, label: t('guide') },
    { icon: Info, label: t('about') },
  ];

  return (
    <div className="min-h-screen w-full max-w-[430px] mx-auto pb-20" style={{ background: '#FAF5E9' }}>
      <Toaster position="top-center" richColors />

      {/* Header */}
      <div className="px-4 pt-5 pb-14 rounded-b-[28px]" style={{ background: 'linear-gradient(160deg, #C8102E 0%, #8B0000 100%)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/avatar-select')} className="relative shrink-0">
            <img src={avatarUrl} alt="avatar" className="w-14 h-14 rounded-full object-cover" style={{ border: '2.5px solid rgba(255,255,255,0.35)' }} />
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)' }}>
              <Camera size={10} style={{ color: '#c8102e' }} />
            </div>
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[15px] truncate" style={{ color: '#fff' }}>{data.username}</span>
              <span className="text-[9px] font-bold px-1.5 py-[1px] rounded" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>VIP{data.vipLevel}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>UID</span>
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>|</span>
              <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{data.uid}</span>
              <button onClick={copyUID} className="ml-0.5">
                {copied ? <CheckCircle size={11} style={{ color: '#86efac' }} /> : <Copy size={11} style={{ color: 'rgba(255,255,255,0.4)' }} />}
              </button>
            </div>
            <span className="text-[9px] mt-0.5 block" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('last_login')}: {data.lastLogin}</span>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="mx-3 -mt-9 relative z-10">
        <div className="rounded-2xl p-4" style={{ background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #f0e0c0' }}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px]" style={{ color: '#999' }}>{t('total_balance')}</span>
              <div className="mt-0.5">
                <span className="text-[22px] font-extrabold" style={{ color: '#1a1a1a' }}>₹{data.balance.toFixed(2)}</span>
              </div>
            </div>
            <button onClick={() => navigate('/wallet')} className="px-4 py-2 rounded-full text-[11px] font-bold" style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)', color: '#fff' }}>
              {t('my_wallet')} →
            </button>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid #f0f0f0' }}>
            {quickActions.map((a, i) => (
              <button key={i} onClick={a.action} className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(200,16,46,0.08)' }}>
                  <a.icon size={18} style={{ color: '#C8102E' }} />
                </div>
                <span className="text-[10px] font-medium" style={{ color: '#666' }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="mx-3 mt-3">
        <div className="rounded-2xl p-2.5 grid grid-cols-2 gap-1.5" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #f0e0c0' }}>
          {menuGrid.map((item, i) => (
            <button key={i} onClick={item.action} className="flex items-center gap-2 p-2.5 rounded-xl active:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(200,16,46,0.08)' }}>
                <item.icon size={15} style={{ color: '#C8102E' }} />
              </div>
              <div className="text-left min-w-0">
                <div className="text-[11px] font-bold" style={{ color: '#333' }}>{item.label}</div>
                <div className="text-[9px]" style={{ color: '#aaa' }}>{item.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Menu List */}
      <div className="mx-3 mt-3">
        <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #f0e0c0' }}>
          {menuList.map((item, i) => (
            <button key={i} onClick={item.action} className="w-full flex items-center justify-between px-4 py-3 active:bg-gray-50 transition-colors" style={i < menuList.length - 1 ? { borderBottom: '1px solid #f5f5f5' } : {}}>
              <div className="flex items-center gap-3">
                <item.icon size={16} style={{ color: '#C8102E' }} />
                <span className="text-[13px] font-semibold" style={{ color: '#444' }}>{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.value && <span className="text-[11px]" style={{ color: '#bbb' }}>{item.value}</span>}
                <ChevronRight size={14} style={{ color: '#ccc' }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Service Center */}
      <div className="mx-3 mt-3">
        <div className="rounded-2xl p-3" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #f0e0c0' }}>
          <span className="text-[12px] font-bold block mb-2.5" style={{ color: '#333' }}>{t('service_center')}</span>
          <div className="grid grid-cols-3 gap-y-3">
            {serviceCenter.map((s, i) => (
              <button key={i} onClick={() => toast.info(`${s.label} — Coming soon`)} className="flex flex-col items-center gap-1">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(200,16,46,0.08)' }}>
                  <s.icon size={15} style={{ color: '#C8102E' }} />
                </div>
                <span className="text-[10px] font-medium text-center leading-tight" style={{ color: '#666' }}>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="mx-3 mt-3 mb-4">
        <button
          onClick={async () => { await signOut(); toast.success('Logged out'); navigate('/sign-up-login-screen'); }}
          className="w-full py-2.5 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 active:opacity-80 transition-opacity"
          style={{ background: '#fff', color: '#C8102E', border: '1.5px solid #f0e0c0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
        >
          <LogOut size={14} />
          {t('logout')}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
