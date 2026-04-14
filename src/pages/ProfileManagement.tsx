import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { Copy, CheckCircle, LogOut, ChevronRight, Wallet, Camera, ArrowUpRight, Download, Upload, Crown, Bell, Gift, Gamepad2, BarChart3, Globe, Settings, MessageCircle, Megaphone, HelpCircle, BookOpen, Info, Lock, Eye, EyeOff, Star, Send, AlertCircle, ChevronDown, Shield, Zap, Award } from 'lucide-react';
import { ProfileSkeleton } from '@/components/SkeletonScreens';
import BottomNav from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';
import { supabase } from '@/integrations/supabase/client';

const themeRed = '#C8102E';
const pageStyle = { background: '#FAF5E9' };
const headerStyle = { background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)', height: 50 };

function OverlayHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between px-4" style={headerStyle}>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
        <ChevronRight size={22} color="#fff" style={{ transform: 'rotate(180deg)' }} />
      </button>
      <span className="font-bold text-[17px] text-white">{title}</span>
      <div style={{ width: 28 }} />
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-5 mb-4 ${className}`} style={{ background: '#fff', border: '1px solid #f0e0c0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
      {children}
    </div>
  );
}

/* ── VIP Page ── */
function VIPPage({ onClose, vipLevel }: { onClose: () => void; vipLevel: number }) {
  const levels = [
    { level: 0, name: 'Bronze', minBet: 0, bonus: '0%', icon: '🥉', color: '#CD7F32' },
    { level: 1, name: 'Silver', minBet: 1000, bonus: '1%', icon: '🥈', color: '#C0C0C0' },
    { level: 2, name: 'Gold', minBet: 5000, bonus: '2%', icon: '🥇', color: '#FFD700' },
    { level: 3, name: 'Platinum', minBet: 20000, bonus: '3%', icon: '💎', color: '#E5E4E2' },
    { level: 4, name: 'Diamond', minBet: 50000, bonus: '5%', icon: '👑', color: '#B9F2FF' },
    { level: 5, name: 'Royal', minBet: 100000, bonus: '8%', icon: '🏆', color: '#FF4500' },
  ];

  return (
    <div className="fixed inset-0 z-50 max-w-[480px] mx-auto overflow-y-auto" style={pageStyle}>
      <OverlayHeader title="VIP Club" onClose={onClose} />
      <div className="px-4 py-5">
        {/* Current Level */}
        <Card>
          <div className="text-center">
            <span className="text-4xl">{levels[vipLevel]?.icon || '🥉'}</span>
            <h2 className="text-lg font-extrabold mt-2" style={{ color: '#1a1a1a' }}>VIP {vipLevel}</h2>
            <p className="text-xs mt-1" style={{ color: themeRed }}>{levels[vipLevel]?.name || 'Bronze'}</p>
            <p className="text-[10px] mt-2" style={{ color: '#999' }}>Cashback Bonus: {levels[vipLevel]?.bonus || '0%'}</p>
          </div>
        </Card>

        {/* VIP Benefits */}
        <Card>
          <h3 className="text-sm font-bold mb-3" style={{ color: themeRed }}>VIP Benefits</h3>
          <div className="space-y-2">
            {[
              { icon: '💰', title: 'Cashback Rewards', desc: 'Get cashback on every bet based on your VIP level' },
              { icon: '🎁', title: 'Exclusive Bonuses', desc: 'Special deposit bonuses only for VIP members' },
              { icon: '⚡', title: 'Faster Withdrawals', desc: 'Priority withdrawal processing for higher VIP levels' },
              { icon: '🎯', title: 'Personal Manager', desc: 'Dedicated account manager from VIP 3+' },
              { icon: '🏅', title: 'Weekly Rewards', desc: 'Extra weekly bonuses based on activity' },
            ].map((b, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(200,16,46,0.04)' }}>
                <span className="text-lg">{b.icon}</span>
                <div>
                  <div className="text-xs font-bold" style={{ color: '#333' }}>{b.title}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: '#888' }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Level Progression */}
        <Card>
          <h3 className="text-sm font-bold mb-3" style={{ color: themeRed }}>Level Requirements</h3>
          <div className="space-y-2">
            {levels.map((l) => (
              <div key={l.level} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: l.level === vipLevel ? 'rgba(200,16,46,0.08)' : 'transparent', border: l.level === vipLevel ? '1px solid rgba(200,16,46,0.2)' : '1px solid transparent' }}>
                <span className="text-lg">{l.icon}</span>
                <div className="flex-1">
                  <div className="text-xs font-bold" style={{ color: l.level === vipLevel ? themeRed : '#555' }}>VIP {l.level} - {l.name}</div>
                  <div className="text-[10px]" style={{ color: '#999' }}>Min Bet: ₹{l.minBet.toLocaleString()}</div>
                </div>
                <span className="text-[10px] font-bold" style={{ color: l.level === vipLevel ? themeRed : '#bbb' }}>{l.bonus}</span>
                {l.level === vipLevel && <CheckCircle size={14} style={{ color: themeRed }} />}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ── Settings Page ── */
function SettingsPage({ onClose, user }: { onClose: () => void; user: any }) {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (!newPass || newPass.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (newPass !== confirmPass) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPass });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Password changed successfully');
    setOldPass(''); setNewPass(''); setConfirmPass('');
  };

  return (
    <div className="fixed inset-0 z-50 max-w-[480px] mx-auto overflow-y-auto" style={pageStyle}>
      <OverlayHeader title="Settings" onClose={onClose} />
      <div className="px-4 py-5">
        {/* Account Info */}
        <Card>
          <h3 className="text-sm font-bold mb-3" style={{ color: themeRed }}>Account Information</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #f5f5f5' }}>
              <span className="text-xs" style={{ color: '#666' }}>Email</span>
              <span className="text-xs font-medium" style={{ color: '#333' }}>{user?.email || 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #f5f5f5' }}>
              <span className="text-xs" style={{ color: '#666' }}>Phone</span>
              <span className="text-xs font-medium" style={{ color: '#333' }}>{user?.phone || 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs" style={{ color: '#666' }}>Account Created</span>
              <span className="text-xs font-medium" style={{ color: '#333' }}>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </Card>

        {/* Change Password */}
        <Card>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: themeRed }}>
            <Lock size={14} /> Change Password
          </h3>
          <div className="space-y-3">
            <div className="relative">
              <input type={showOld ? 'text' : 'password'} value={oldPass} onChange={e => setOldPass(e.target.value)} placeholder="Current Password" className="w-full px-3 py-2.5 rounded-xl text-xs" style={{ border: '1px solid #e0d4c0', background: '#FAFAFA' }} />
              <button onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2">{showOld ? <EyeOff size={14} color="#999" /> : <Eye size={14} color="#999" />}</button>
            </div>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="New Password (min 6 chars)" className="w-full px-3 py-2.5 rounded-xl text-xs" style={{ border: '1px solid #e0d4c0', background: '#FAFAFA' }} />
              <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2">{showNew ? <EyeOff size={14} color="#999" /> : <Eye size={14} color="#999" />}</button>
            </div>
            <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Confirm New Password" className="w-full px-3 py-2.5 rounded-xl text-xs" style={{ border: '1px solid #e0d4c0', background: '#FAFAFA' }} />
            <button onClick={handleChangePassword} disabled={saving} className="w-full py-2.5 rounded-xl text-white font-bold text-xs" style={{ background: saving ? '#ccc' : 'linear-gradient(135deg, #C8102E, #8B0000)' }}>
              {saving ? 'Saving...' : 'Update Password'}
            </button>
          </div>
        </Card>

        {/* Preferences */}
        <Card>
          <h3 className="text-sm font-bold mb-3" style={{ color: themeRed }}>Preferences</h3>
          <div className="space-y-3">
            {[
              { label: 'Push Notifications', key: 'push' },
              { label: 'Email Notifications', key: 'email' },
              { label: 'Sound Effects', key: 'sound' },
            ].map((pref) => (
              <ToggleRow key={pref.key} label={pref.label} storageKey={`pref-${pref.key}`} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ToggleRow({ label, storageKey }: { label: string; storageKey: string }) {
  const [on, setOn] = useState(() => localStorage.getItem(storageKey) !== 'off');
  const toggle = () => {
    const next = !on;
    setOn(next);
    localStorage.setItem(storageKey, next ? 'on' : 'off');
    toast.success(`${label} ${next ? 'enabled' : 'disabled'}`);
  };
  return (
    <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #f5f5f5' }}>
      <span className="text-xs" style={{ color: '#555' }}>{label}</span>
      <button onClick={toggle} className="w-10 h-5 rounded-full relative transition-colors" style={{ background: on ? themeRed : '#ddd' }}>
        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform" style={{ left: on ? 20 : 2 }} />
      </button>
    </div>
  );
}

/* ── Feedback Page ── */
function FeedbackPage({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<'bug' | 'feature' | 'general'>('general');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    if (!message.trim()) { toast.error('Please write your feedback'); return; }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success('Thank you for your feedback!');
      setMessage('');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 max-w-[480px] mx-auto overflow-y-auto" style={pageStyle}>
      <OverlayHeader title="Feedback" onClose={onClose} />
      <div className="px-4 py-5">
        <Card>
          <h3 className="text-sm font-bold mb-3" style={{ color: themeRed }}>We'd love to hear from you</h3>
          <div className="flex gap-2 mb-4">
            {(['general', 'bug', 'feature'] as const).map(t => (
              <button key={t} onClick={() => setType(t)} className="px-3 py-1.5 rounded-full text-[10px] font-bold capitalize" style={{ background: type === t ? themeRed : 'rgba(200,16,46,0.08)', color: type === t ? '#fff' : themeRed }}>
                {t === 'bug' ? '🐛 Bug Report' : t === 'feature' ? '💡 Feature' : '💬 General'}
              </button>
            ))}
          </div>
          <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your feedback here..." rows={5} className="w-full px-3 py-2.5 rounded-xl text-xs resize-none" style={{ border: '1px solid #e0d4c0', background: '#FAFAFA' }} />
          <button onClick={handleSend} disabled={sending} className="w-full py-2.5 rounded-xl text-white font-bold text-xs mt-3 flex items-center justify-center gap-2" style={{ background: sending ? '#ccc' : 'linear-gradient(135deg, #C8102E, #8B0000)' }}>
            <Send size={14} /> {sending ? 'Sending...' : 'Submit Feedback'}
          </button>
        </Card>

        <Card>
          <h3 className="text-sm font-bold mb-2" style={{ color: themeRed }}>FAQ</h3>
          {[
            { q: 'How long does withdrawal take?', a: 'Withdrawals are processed within 1-24 hours depending on the method.' },
            { q: 'How to increase VIP level?', a: 'Place more bets to increase your VIP level automatically.' },
            { q: 'Is my data safe?', a: 'Yes, we use bank-grade encryption for all data and transactions.' },
          ].map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </Card>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-2" style={{ borderBottom: '1px solid #f5f5f5' }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between text-left">
        <span className="text-xs font-medium" style={{ color: '#444' }}>{question}</span>
        <ChevronDown size={14} style={{ color: '#999', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && <p className="text-[10px] mt-2 leading-relaxed" style={{ color: '#888' }}>{answer}</p>}
    </div>
  );
}

/* ── Announcement Page ── */
function AnnouncementPage({ onClose }: { onClose: () => void }) {
  const announcements = [
    { id: 1, title: '🎉 Welcome Bonus Increased!', desc: 'New users now get up to ₹500 welcome bonus on first deposit. Limited time offer!', date: '2026-04-14', type: 'promo' },
    { id: 2, title: '🔧 Scheduled Maintenance', desc: 'System maintenance on April 16, 2:00 AM - 4:00 AM IST. Services may be briefly unavailable.', date: '2026-04-13', type: 'system' },
    { id: 3, title: '🏆 New Games Added', desc: 'Check out 15+ new slot games from top providers now available on our platform!', date: '2026-04-12', type: 'update' },
    { id: 4, title: '💰 Referral Program Update', desc: 'Earn up to 85% commission on referrals. Invite friends and earn more!', date: '2026-04-10', type: 'promo' },
    { id: 5, title: '🔒 Security Update', desc: 'We have enhanced our security measures. Please update your password for added safety.', date: '2026-04-08', type: 'system' },
  ];

  const typeColors: Record<string, string> = { promo: '#FF6B35', system: '#4A90D9', update: '#28A745' };

  return (
    <div className="fixed inset-0 z-50 max-w-[480px] mx-auto overflow-y-auto" style={pageStyle}>
      <OverlayHeader title="Announcements" onClose={onClose} />
      <div className="px-4 py-5">
        {announcements.map(a => (
          <Card key={a.id}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: `${typeColors[a.type]}18` }}>
                <Megaphone size={14} style={{ color: typeColors[a.type] }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold" style={{ color: '#333' }}>{a.title}</span>
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: '#888' }}>{a.desc}</p>
                <span className="text-[9px] mt-2 block" style={{ color: '#bbb' }}>{a.date}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ── Customer Support Page ── */
function SupportPage({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 max-w-[480px] mx-auto overflow-y-auto" style={pageStyle}>
      <OverlayHeader title="Customer Support" onClose={onClose} />
      <div className="px-4 py-5">
        <Card>
          <div className="text-center mb-4">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3" style={{ background: 'rgba(200,16,46,0.08)' }}>
              <HelpCircle size={28} style={{ color: themeRed }} />
            </div>
            <h2 className="text-sm font-bold" style={{ color: '#333' }}>How can we help?</h2>
            <p className="text-[10px] mt-1" style={{ color: '#999' }}>We're available 24/7 to assist you</p>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-bold mb-3" style={{ color: themeRed }}>Contact Methods</h3>
          <div className="space-y-2">
            {[
              { icon: '📧', title: 'Email Support', desc: 'support@techie404.app', action: 'Response within 2 hours' },
              { icon: '💬', title: 'Live Chat', desc: 'Chat with our support team', action: 'Available 24/7' },
              { icon: '📱', title: 'Telegram', desc: '@Techie404Support', action: 'Quick responses' },
              { icon: '📞', title: 'WhatsApp', desc: '+91 XXXXX XXXXX', action: 'Mon-Sat, 9AM-9PM' },
            ].map((c, i) => (
              <button key={i} onClick={() => toast.info(`Opening ${c.title}...`)} className="w-full flex items-center gap-3 p-3 rounded-xl active:bg-gray-50" style={{ background: 'rgba(200,16,46,0.03)', border: '1px solid #f0e0c0' }}>
                <span className="text-lg">{c.icon}</span>
                <div className="text-left flex-1">
                  <div className="text-xs font-bold" style={{ color: '#333' }}>{c.title}</div>
                  <div className="text-[10px]" style={{ color: '#888' }}>{c.desc}</div>
                </div>
                <span className="text-[9px] px-2 py-1 rounded-full" style={{ background: 'rgba(200,16,46,0.08)', color: themeRed }}>{c.action}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-bold mb-3" style={{ color: themeRed }}>Common Issues</h3>
          {[
            { q: 'Deposit not credited', a: 'Please wait 5-10 minutes. If still pending, contact support with your transaction ID.' },
            { q: 'Withdrawal delayed', a: 'Withdrawals take 1-24 hours. Check your withdrawal history for status updates.' },
            { q: 'Account locked', a: 'Contact support via email with your UID to unlock your account.' },
            { q: 'Game not loading', a: 'Clear your browser cache, check internet connection, and try again.' },
          ].map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </Card>
      </div>
    </div>
  );
}

/* ── Guide Page ── */
function GuidePage({ onClose }: { onClose: () => void }) {
  const steps = [
    { icon: '1️⃣', title: 'Create Account', desc: 'Sign up with your phone number or email. It takes less than 30 seconds!' },
    { icon: '2️⃣', title: 'Make a Deposit', desc: 'Add funds using UPI, Bank Transfer, or USDT. Minimum deposit is just ₹100.' },
    { icon: '3️⃣', title: 'Play Games', desc: 'Browse our collection of 500+ games. Choose from slots, live casino, sports betting and more.' },
    { icon: '4️⃣', title: 'Win & Withdraw', desc: 'Win real money and withdraw to your bank account, UPI, or USDT wallet instantly.' },
    { icon: '5️⃣', title: 'Invite & Earn', desc: 'Share your referral link and earn up to 85% commission on referrals.' },
  ];

  const tips = [
    { icon: '🎯', title: 'Set a Budget', desc: 'Always decide your budget before playing and stick to it.' },
    { icon: '📊', title: 'Check Statistics', desc: 'Use Game Statistics to track your wins and losses.' },
    { icon: '🎁', title: 'Claim Bonuses', desc: 'Check Activity page daily for attendance bonus, spin wheel, and promotions.' },
    { icon: '🔒', title: 'Stay Secure', desc: 'Never share your password. Enable all security features in Settings.' },
    { icon: '📱', title: 'Add to Home Screen', desc: 'Add Techie404 to your home screen for the best experience.' },
  ];

  return (
    <div className="fixed inset-0 z-50 max-w-[480px] mx-auto overflow-y-auto" style={pageStyle}>
      <OverlayHeader title="Beginner's Guide" onClose={onClose} />
      <div className="px-4 py-5">
        <Card>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: themeRed }}>
            <BookOpen size={14} /> Getting Started
          </h3>
          <div className="space-y-3">
            {steps.map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(200,16,46,0.04)' }}>
                <span className="text-lg">{s.icon}</span>
                <div>
                  <div className="text-xs font-bold" style={{ color: '#333' }}>{s.title}</div>
                  <div className="text-[10px] mt-0.5 leading-relaxed" style={{ color: '#888' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: themeRed }}>
            <Shield size={14} /> Pro Tips
          </h3>
          <div className="space-y-3">
            {tips.map((t, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(200,16,46,0.04)' }}>
                <span className="text-lg">{t.icon}</span>
                <div>
                  <div className="text-xs font-bold" style={{ color: '#333' }}>{t.title}</div>
                  <div className="text-[10px] mt-0.5 leading-relaxed" style={{ color: '#888' }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: themeRed }}>
            <Zap size={14} /> Quick Links
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Deposit', icon: '💳' },
              { label: 'Withdraw', icon: '🏧' },
              { label: 'Games', icon: '🎮' },
              { label: 'Support', icon: '💬' },
            ].map((l, i) => (
              <button key={i} className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(200,16,46,0.04)', border: '1px solid #f0e0c0' }}>
                <span>{l.icon}</span>
                <span className="text-xs font-bold" style={{ color: '#444' }}>{l.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ── About Us Page ── */
function AboutUsPage({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 max-w-[480px] mx-auto overflow-y-auto" style={pageStyle}>
      <OverlayHeader title="About Us" onClose={onClose} />
      <div className="px-5 py-6">
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)', boxShadow: '0 4px 20px rgba(200,16,46,0.25)' }}>
            <Crown size={36} color="#FFD700" />
          </div>
          <h1 className="text-xl font-extrabold" style={{ color: '#1a1a1a' }}>Techie<span style={{ color: '#C8102E' }}>404</span></h1>
          <p className="text-xs mt-1" style={{ color: '#999' }}>Version 1.0.0</p>
        </div>
        <Card>
          <h2 className="text-sm font-bold mb-3" style={{ color: '#C8102E' }}>Who We Are</h2>
          <p className="text-xs leading-relaxed mb-4" style={{ color: '#555' }}>
            Techie404 is a premium entertainment and gaming platform designed to deliver an exceptional experience to users worldwide.
          </p>
          <h2 className="text-sm font-bold mb-3" style={{ color: '#C8102E' }}>Our Mission</h2>
          <p className="text-xs leading-relaxed mb-4" style={{ color: '#555' }}>
            To provide a world-class gaming experience with transparency, fairness, and top-notch security.
          </p>
          <h2 className="text-sm font-bold mb-3" style={{ color: '#C8102E' }}>Key Features</h2>
          <div className="space-y-2.5">
            {[
              { icon: '🔒', title: 'Secure & Safe', desc: 'Bank-grade encryption protecting all transactions' },
              { icon: '⚡', title: 'Instant Transactions', desc: 'Lightning-fast deposits and withdrawals' },
              { icon: '🎮', title: 'Premium Games', desc: 'Curated collection from leading providers' },
              { icon: '🎁', title: 'Generous Rewards', desc: 'Daily bonuses, VIP programs, referral commissions' },
              { icon: '📱', title: 'Mobile First', desc: 'Smooth, responsive interface' },
              { icon: '🌐', title: '24/7 Support', desc: 'Round-the-clock customer service' },
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
        </Card>
        <Card>
          <h2 className="text-sm font-bold mb-3" style={{ color: '#C8102E' }}>Contact Us</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs">📧</span><span className="text-xs" style={{ color: '#555' }}>support@techie404.app</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">🌐</span><span className="text-xs" style={{ color: '#555' }}>www.techie404.app</span>
            </div>
          </div>
        </Card>
        <p className="text-center text-[10px] mt-6 mb-4" style={{ color: '#bbb' }}>© 2026 Techie404. All rights reserved.</p>
      </div>
    </div>
  );
}

/* ── Main Profile Page ── */
export default function ProfileManagement() {
  const navigate = useNavigate();
  const { user, profile, wallet, signOut } = useAuth();
  const { t, languages, lang } = useI18n();
  const [copied, setCopied] = useState(false);
  const [overlay, setOverlay] = useState<string | null>(null);

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
    { icon: Crown, label: t('vip'), action: () => setOverlay('vip') },
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
    { icon: Settings, label: t('settings'), key: 'settings' },
    { icon: MessageCircle, label: t('feedback'), key: 'feedback' },
    { icon: Megaphone, label: t('announcement'), key: 'announcement' },
    { icon: HelpCircle, label: t('support'), key: 'support' },
    { icon: BookOpen, label: t('guide'), key: 'guide' },
    { icon: Info, label: t('about'), key: 'about' },
  ];

  return (
    <div className="min-h-screen w-full max-w-[430px] mx-auto pb-20" style={pageStyle}>
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
              <button key={i} onClick={() => setOverlay(s.key)} className="flex flex-col items-center gap-1">
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

      <AnimatePresence>
        {overlay && (
          <motion.div key={overlay} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}>
            {overlay === 'about' && <AboutUsPage onClose={() => setOverlay(null)} />}
            {overlay === 'vip' && <VIPPage onClose={() => setOverlay(null)} vipLevel={data.vipLevel} />}
            {overlay === 'settings' && <SettingsPage onClose={() => setOverlay(null)} user={user} />}
            {overlay === 'feedback' && <FeedbackPage onClose={() => setOverlay(null)} />}
            {overlay === 'announcement' && <AnnouncementPage onClose={() => setOverlay(null)} />}
            {overlay === 'support' && <SupportPage onClose={() => setOverlay(null)} />}
            {overlay === 'guide' && <GuidePage onClose={() => setOverlay(null)} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
