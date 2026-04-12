import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, ChevronRight, CheckCircle, XCircle, Users, Wallet, ChevronLeft, TrendingUp, BarChart2, Clock } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';


// ─── Super Jackpot Modal ─────────────────────────────────────────────────────
function SuperJackpotModal({ onClose }: { onClose: () => void }) {
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showWinningStarModal, setShowWinningStarModal] = useState(false);
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-stretch justify-center"
        style={{ background: 'rgba(0,0,0,0.75)' }}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="relative w-full flex flex-col"
          style={{
            maxWidth: 540,
            margin: '0 auto',
            background: '#FFF8F0',
            height: '100dvh',
          }}
        >
          {/* ── Top Bar ── */}
          <div
            className="flex-shrink-0 flex items-center justify-between px-4 pt-4 pb-3"
            style={{
              background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)',
              boxShadow: '0 2px 12px rgba(200,16,46,0.3)',
            }}
          >
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full"
              style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
            <span className="text-white font-black text-base tracking-wide" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
              🏆 Super Jackpot
            </span>
            <div className="w-8 h-8" />
          </div>

          {/* ── Scrollable Content ── */}
          <div
            className="flex-1 overflow-y-auto"
            style={{
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              paddingBottom: 100,
            }}
          >
            {/* ── Hero Banner ── */}
            <div
              className="relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #C8102E 0%, #FF4500 40%, #FF6B00 70%, #FF9A3C 100%)',
                minHeight: 200,
              }}
            >
              {/* Decorative rays */}
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: 'repeating-conic-gradient(from 0deg at 80% 50%, transparent 0deg, rgba(255,255,255,0.4) 5deg, transparent 10deg)',
                }}
              />
              {/* Glow circle */}
              <div className="absolute top-4 right-12 w-36 h-36 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #FF4444 0%, transparent 70%)' }} />

              <div className="relative flex items-center px-5 py-6 gap-4">
                {/* Text */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,68,68,0.25)', color: '#FF4444', border: '1px solid rgba(255,68,68,0.4)' }}>
                      PREMIUM
                    </span>
                  </div>
                  <h2 className="text-white font-black text-2xl leading-tight" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                    Super Jackpot
                  </h2>
                  <p className="text-white/90 text-[12px] mt-2 leading-relaxed font-medium">
                    Win the Super Jackpot in 【Slots】 and get 1 additional bonus reward!
                  </p>
                  <p className="text-red-200 text-[11px] mt-1 leading-relaxed font-medium">
                    ⏰ Valid for 30 days — claim before expiry!
                  </p>
                </div>
                {/* Gift box */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center">
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center text-6xl"
                    style={{
                      background: 'rgba(255,255,255,0.18)',
                      border: '2px solid rgba(255,68,68,0.5)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
                    }}
                  >
                    🎁
                  </div>
                  <div className="flex gap-1 mt-2">
                    <span className="text-lg">🪙</span>
                    <span className="text-base">⭐</span>
                    <span className="text-lg">🪙</span>
                  </div>
                </div>
              </div>

              {/* Bottom wave */}
              <div
                className="absolute bottom-0 left-0 right-0 h-8"
                style={{ background: 'linear-gradient(to bottom, transparent, #FFF8F0)' }}
              />
            </div>

            {/* ── Receive in batches button ── */}
            <div className="px-4 mt-4">
              <button
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-sm tracking-wide transition-all"
                style={{
                  background: 'linear-gradient(135deg, #fff0f0 0%, #ffe8e8 100%)',
                  border: '1.5px solid #ffb3b3',
                  color: '#C8102E',
                  boxShadow: '0 2px 12px rgba(200,16,46,0.12)',
                }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: '#C8102E', border: '1.5px solid #8B0000' }}
                >
                  <span className="text-white text-xs font-black">+</span>
                </div>
                <span>Receive in batches</span>
              </button>
            </div>

            {/* ── Rule & Winning Star buttons ── */}
            <div className="px-4 mt-3 grid grid-cols-2 gap-3">
              {/* Rule button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowRuleModal(true)}
                className="flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-sm"
                style={{
                  background: 'linear-gradient(135deg, #fff0f0 0%, #ffe8e8 100%)',
                  border: '1.5px solid #FF6B6B',
                  color: '#C8102E',
                  boxShadow: '0 4px 16px rgba(200,16,46,0.1)',
                }}
              >
                <span className="text-xl">📋</span>
                <span>Rule</span>
              </motion.button>

              {/* Winning Star button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowWinningStarModal(true)}
                className="flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-sm"
                style={{
                  background: 'linear-gradient(135deg, #fff0f0 0%, #ffe8e8 100%)',
                  border: '1.5px solid #FF6B6B',
                  color: '#C8102E',
                  boxShadow: '0 4px 16px rgba(200,16,46,0.1)',
                }}
              >
                <span className="text-xl">👑</span>
                <span>Winning star</span>
              </motion.button>
            </div>

            {/* ── Empty State Card ── */}
            <div className="px-4 mt-3">
              <div
                className="rounded-2xl flex flex-col items-center justify-center py-12 px-6"
                style={{
                  background: 'linear-gradient(135deg, #fff0f0 0%, #fff8f0 100%)',
                  border: '1.5px solid #ffd0d0',
                  minHeight: 220,
                  boxShadow: '0 4px 20px rgba(200,16,46,0.08)',
                }}
              >
                {/* Empty state illustration */}
                <div className="relative mb-4">
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #ffe8e8 0%, #ffe8e8 100%)',
                      border: '1.5px solid #ffb3b3',
                    }}
                  >
                    <span className="text-5xl opacity-60">🎰</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full" style={{ background: '#FF4444' }} />
                  <div className="absolute -bottom-1 -left-2 w-2 h-2 rounded-full" style={{ background: '#FF9A3C' }} />
                  <div className="absolute top-2 -left-3 w-1.5 h-1.5 rounded-full" style={{ background: '#C8102E' }} />
                </div>
                <p className="font-bold text-sm text-center leading-relaxed" style={{ color: '#C8102E' }}>
                  You don&apos;t have a big jackpot yet
                </p>
                <p className="text-xs text-center mt-1" style={{ color: '#999' }}>
                  Play Slots to win the Super Jackpot!
                </p>
              </div>
            </div>

            {/* ── Go Bet Button ── */}
            <div className="px-4 mt-4">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(200,16,46,0.5)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { onClose(); navigate('/game-screen'); }}
                className="w-full py-4 rounded-full font-black text-base tracking-wide"
                style={{
                  background: 'linear-gradient(135deg, #C8102E 0%, #FF1744 40%, #C8102E 70%, #8B0000 100%)',
                  color: '#ffffff',
                  boxShadow: '0 6px 24px rgba(200,16,46,0.5)',
                  border: '1px solid rgba(255,100,100,0.4)',
                  textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  letterSpacing: '0.05em',
                }}
              >
                🎰 Go Bet Now
              </motion.button>
            </div>

            {/* ── Red accent strip ── */}
            <div className="mx-4 mt-4 rounded-xl py-3 px-4 flex items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, #fff0f0 0%, #ffe8e8 100%)',
                border: '1.5px solid #FF4444',
                boxShadow: '0 2px 12px rgba(255,68,68,0.2)',
              }}
            >
              <span className="text-2xl">💰</span>
              <div>
                <p className="text-xs font-black" style={{ color: '#C8102E' }}>Jackpot Bonus credited instantly</p>
                <p className="text-[10px] mt-0.5" style={{ color: '#8B0000' }}>Directly to your main wallet balance</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Rule Sub-Modal ── */}
        <AnimatePresence>
          {showRuleModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-60 flex items-stretch justify-center"
              style={{ background: 'rgba(0,0,0,0.6)' }}
              onClick={() => setShowRuleModal(false)}
            >
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="relative w-full flex flex-col"
                style={{ maxWidth: 540, margin: '0 auto', background: '#f5f5f5', height: '100dvh' }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* ── Dark Header ── */}
                <div
                  className="flex-shrink-0 flex items-center justify-between px-4 pt-4 pb-3"
                  style={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
                  }}
                >
                  <button
                    onClick={() => setShowRuleModal(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full"
                    style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    <ChevronLeft size={20} className="text-white" />
                  </button>
                  <span className="text-white font-black text-base tracking-wide">Game Rules</span>
                  <div className="w-8 h-8" />
                </div>

                {/* ── Scrollable Content ── */}
                <div
                  className="flex-1 overflow-y-auto"
                  style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', paddingBottom: 100 }}
                >
                  {/* ── Table Card ── */}
                  <div className="mx-4 mt-5 rounded-2xl overflow-hidden" style={{ border: '1.5px solid #e0e0e0', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                    {/* Table Header */}
                    <div
                      className="grid grid-cols-3 text-center"
                      style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}
                    >
                      <div className="py-3 px-2 text-xs font-black text-white border-r" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                        Continuous<br />attendance
                      </div>
                      <div className="py-3 px-2 text-xs font-black text-white border-r" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                        Accumulated<br />amount
                      </div>
                      <div className="py-3 px-2 text-xs font-black text-white">
                        Attendance<br />bonus
                      </div>
                    </div>

                    {/* Table Rows — zebra striping */}
                    {[
                      { day: 1, accumulated: '₹300.00',    bonus: '₹7.00' },
                      { day: 2, accumulated: '₹1,500.00',  bonus: '₹20.00' },
                      { day: 3, accumulated: '₹6,000.00',  bonus: '₹100.00' },
                      { day: 4, accumulated: '₹20,000.00', bonus: '₹200.00' },
                      { day: 5, accumulated: '₹40,000.00', bonus: '₹450.00' },
                      { day: 6, accumulated: '₹1,00,000.00', bonus: '₹2,400.00' },
                      { day: 7, accumulated: '₹2,00,000.00', bonus: '₹6,400.00' },
                    ].map((row, i) => (
                      <div
                        key={row.day}
                        className="grid grid-cols-3 text-center"
                        style={{ background: i % 2 === 0 ? '#2a2a2a' : '#1a1a1a' }}
                      >
                        <div className="py-3 px-2 text-xs font-bold text-white border-r" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                          {row.day} {row.day === 1 ? 'Day' : 'Days'}
                        </div>
                        <div className="py-3 px-2 text-xs font-semibold border-r" style={{ color: '#FF4444', borderColor: 'rgba(255,255,255,0.08)' }}>
                          {row.accumulated}
                        </div>
                        <div className="py-3 px-2 text-xs font-bold" style={{ color: '#FF4444' }}>
                          {row.bonus}
                        </div>
                      </div>
                    ))}

                    {/* ── Rules Card ── */}
                    <div className="mx-4 mt-5 rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1.5px solid #e8e8e8', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                      {/* Rules Header */}
                      <div
                        className="px-4 py-3 flex items-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)' }}
                      >
                        <span className="text-base">📋</span>
                        <span className="font-black text-sm text-white tracking-wide">Rules</span>
                      </div>

                      {/* Rules List */}
                      <div className="p-4 space-y-3">
                        {[
                          'The reward system is based on 7 consecutive days of login. Each day you must check in to maintain your streak.',
                          'Daily check-in is mandatory. Missing even one day will reset your consecutive attendance count back to Day 1.',
                          'To claim the attendance bonus, you must have a valid deposit history in your account.',
                          'Deposit requirements must be fulfilled starting from Day 1. Ensure your account is funded before beginning your streak.',
                          'The final interpretation of this activity belongs to the platform. For any issues or disputes, please contact customer service.',
                        ].map((rule, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 p-3 rounded-xl"
                            style={{ background: '#fff5f5', border: '1px solid #ffd0d0' }}
                          >
                            <div
                              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white mt-0.5"
                              style={{ background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)', minWidth: 20 }}
                            >
                              {i + 1}
                            </div>
                            <span className="text-xs leading-relaxed" style={{ color: '#5a0000' }}>{rule}</span>
                          </div>
                        ))}

                        {/* Customer service link */}
                        <div
                          className="flex items-center justify-center gap-2 py-3 rounded-xl mt-1"
                          style={{ background: 'linear-gradient(135deg, #fff0f0 0%, #ffe8e8 100%)', border: '1.5px solid #FF6B6B' }}
                        >
                          <span className="text-base">💬</span>
                          <span className="text-xs font-bold" style={{ color: '#C8102E' }}>
                            Need help?{' '}
                            <span className="underline" style={{ color: '#FF4444' }}>Contact Customer Service</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Winning Star Sub-Modal ── */}
        <AnimatePresence>
          {showWinningStarModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-60 flex items-end justify-center"
              style={{ background: 'rgba(0,0,0,0.6)' }}
              onClick={() => setShowWinningStarModal(false)}
            >
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="w-full rounded-t-3xl p-6 pb-10"
                style={{ maxWidth: 540, background: '#FFF8F0', border: '1.5px solid #ffd0d0' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-lg" style={{ color: '#C8102E' }}>🌟 Winning Stars</h3>
                  <button onClick={() => setShowWinningStarModal(false)} className="text-gray-400 text-xl font-bold">✕</button>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { stars: 1, bonus: '₹50', label: 'Starter' },
                    { stars: 3, bonus: '₹200', label: 'Rising' },
                    { stars: 5, bonus: '₹500', label: 'Pro' },
                    { stars: 10, bonus: '₹1,500', label: 'Elite' },
                    { stars: 20, bonus: '₹5,000', label: 'Master' },
                    { stars: 50, bonus: '₹20,000', label: 'Legend' },
                  ].map((tier, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center p-3 rounded-2xl"
                      style={{
                        background: 'linear-gradient(135deg, #fff0f0 0%, #ffe8e8 100%)',
                        border: '1.5px solid #FF4444',
                        boxShadow: '0 2px 12px rgba(255,68,68,0.15)',
                      }}
                    >
                      <div className="text-2xl mb-1">{'⭐'.repeat(Math.min(tier.stars, 3))}{tier.stars > 3 ? `×${tier.stars}` : ''}</div>
                      <div className="font-black text-sm" style={{ color: '#C8102E' }}>{tier.bonus}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: '#888' }}>{tier.label}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-center" style={{ color: '#999' }}>Collect winning stars by hitting jackpots. More stars = bigger bonus!</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Invitation Bonus Data ───────────────────────────────────────────────────
const bonusTiers = [
  { id: 1, bonus: 57, invitees: 1, depositPerPerson: 300, currentInvitees: 1, currentDeposit: 1, claimed: true },
  { id: 2, bonus: 177, invitees: 3, depositPerPerson: 300, currentInvitees: 3, currentDeposit: 3, claimed: true },
  { id: 3, bonus: 577, invitees: 10, depositPerPerson: 500, currentInvitees: 10, currentDeposit: 10, claimed: false },
  { id: 4, bonus: 1577, invitees: 30, depositPerPerson: 800, currentInvitees: 30, currentDeposit: 30, claimed: false },
  { id: 5, bonus: 2777, invitees: 50, depositPerPerson: 1000, currentInvitees: 4, currentDeposit: 1, claimed: false },
  { id: 6, bonus: 4177, invitees: 75, depositPerPerson: 1100, currentInvitees: 4, currentDeposit: 1, claimed: false },
  { id: 7, bonus: 5777, invitees: 100, depositPerPerson: 1200, currentInvitees: 4, currentDeposit: 1, claimed: false },
  { id: 8, bonus: 11777, invitees: 200, depositPerPerson: 1200, currentInvitees: 4, currentDeposit: 1, claimed: false },
  { id: 9, bonus: 28777, invitees: 500, depositPerPerson: 1200, currentInvitees: 4, currentDeposit: 1, claimed: false },
  { id: 10, bonus: 57777, invitees: 1000, depositPerPerson: 1200, currentInvitees: 4, currentDeposit: 1, claimed: false },
];

// ─── Invitation Bonus Modal ──────────────────────────────────────────────────
function InvitationBonusModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'rules' | 'record'>('rules');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-stretch justify-center"
        style={{ background: 'rgba(0,0,0,0.5)' }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative w-full overflow-y-auto"
          style={{ maxWidth: 540, margin: '0 auto', background: '#f5f5f5', height: '100dvh', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
        >
          {/* Header — scrolls with content */}
          <div
            className="relative"
            style={{
              background: 'linear-gradient(160deg, #C8102E 0%, #8B0000 60%, #5a0000 100%)',
              paddingBottom: 24,
            }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <ChevronLeft size={20} className="text-white" />
              </button>
              <span className="text-white font-bold text-base tracking-wide">Invitation bonus</span>
              <button
                onClick={() => setActiveTab(activeTab === 'record' ? 'rules' : 'record')}
                className="h-8 flex items-center justify-center rounded-full px-3 gap-1"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                <span className="text-white text-[10px] font-bold">{activeTab === 'record' ? '📋 Rules' : '📊 Record'}</span>
              </button>
            </div>

            {/* Hero content */}
            <div className="px-4 pt-1 pb-2 flex items-start gap-3">
              <div className="text-4xl mt-1">🎁</div>
              <div className="flex-1">
                <div className="text-white font-black text-lg leading-tight">Invite friends and Deposit</div>
                <div className="text-red-200 text-[11px] mt-1 leading-relaxed">
                  Both parties can receive rewards{'\n'}
                  Invite friends to Register and Deposit to receive rewards on the activity date.
                </div>
              </div>
            </div>

            {/* Date range pill */}
            <div className="mx-4 mt-2">
              <div
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <span className="text-[11px] font-bold" style={{ color: '#FF4444' }}>📅</span>
                <span className="text-white font-bold text-xs tracking-wide">2023-12-01 — 2030-01-01</span>
              </div>
            </div>

          </div>

          {/* Body — directly below header, no separate scroll container */}
          <div className="pb-28" style={{ background: '#f5f5f5' }}>
            {activeTab === 'rules' ? (
              <div className="px-3 pt-4 space-y-3">
                {bonusTiers.map((tier, idx) => (
                  <BonusTierCard key={tier.id} tier={tier} index={idx} />
                ))}
              </div>
            ) : (
              <InvitationRecord />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Bonus Tier Card ─────────────────────────────────────────────────────────
function BonusTierCard({ tier, index }: { tier: typeof bonusTiers[0]; index: number }) {
  const inviteePct = Math.min((tier.currentInvitees / tier.invitees) * 100, 100);
  const depositPct = Math.min((tier.currentDeposit / tier.invitees) * 100, 100);

  const isComplete = tier.currentInvitees >= tier.invitees && tier.currentDeposit >= tier.invitees;
  const isClaimed = tier.claimed;

  // ── Unified game dark-red theme for all card elements ─────────────────────
  const cardTheme = {
    headerBg: 'linear-gradient(135deg, #C8102E 0%, #7a0018 100%)',
    cardBg: '#ffffff',
    cardBorder: '1.5px solid #ffd0d0',
    badgeBg: 'rgba(255,255,255,0.2)',
    badgeBorder: '1px solid rgba(255,255,255,0.3)',
    numberCircleBg: 'rgba(255,255,255,0.9)',
    numberCircleColor: '#C8102E',
    bonusColor: '#FF4444',
    statsBg: '#fff5f5',
    statsBorder: '1px solid #ffd0d0',
    statsText: '#C8102E',
    statsValue: '#8B0000',
    depositValue: '#C8102E',
    dividerColor: 'linear-gradient(to right, transparent, #ffd0d0, transparent)',
    progressBg: '#ffe8e8',
    progressFill: 'linear-gradient(90deg, #C8102E, #FF6B6B)',
    progressNumColor: '#C8102E',
    progressLabelColor: '#888888',
    iconEl: isClaimed
      ? <CheckCircle size={16} style={{ color: '#888888' }} />
      : isComplete
      ? <CheckCircle size={16} style={{ color: '#00c853' }} />
      : <XCircle size={16} style={{ color: '#C8102E' }} />,
  };

  // ── Button-only theme (changes per state) ─────────────────────────────────
  const btnTheme = isClaimed
    ? {
        btnBg: 'linear-gradient(135deg, #3a3a3a 0%, #1a1a1a 100%)',
        btnColor: '#888888',
        btnBorder: '1.5px solid #555555',
        btnShadow: '0 2px 8px rgba(0,0,0,0.5)',
        btnText: '✓ Claimed',
        btnDisabled: true,
      }
    : isComplete
    ? {
        btnBg: 'linear-gradient(135deg, #00c853 0%, #43a047 50%, #1b5e20 100%)',
        btnColor: '#ffffff',
        btnBorder: '1.5px solid #66bb6a',
        btnShadow: '0 4px 16px rgba(0,200,83,0.5)',
        btnText: '🎁 Claim Now',
        btnDisabled: false,
      }
    : {
        btnBg: 'linear-gradient(135deg, #FF1744 0%, #C8102E 50%, #7a0018 100%)',
        btnColor: '#ffffff',
        btnBorder: '1.5px solid #FF4560',
        btnShadow: '0 4px 16px rgba(200,16,46,0.55)',
        btnText: '🔒 Not Yet Done',
        btnDisabled: false,
      };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="rounded-2xl overflow-hidden shadow-lg"
      style={{ background: cardTheme.cardBg, border: cardTheme.cardBorder }}
    >
      {/* Tier header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ background: cardTheme.headerBg }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: cardTheme.badgeBg, border: cardTheme.badgeBorder }}
          >
            <span className="text-white font-black text-xs">Bonus</span>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
              style={{ background: cardTheme.numberCircleBg, color: cardTheme.numberCircleColor }}
            >
              {tier.id}
            </div>
          </div>
          {cardTheme.iconEl}
        </div>
        <div className="font-black text-base" style={{ color: cardTheme.bonusColor, textShadow: '0 0 20px rgba(255,68,68,0.5)' }}>
          ₹{tier.bonus.toLocaleString('en-IN')}.00
        </div>
      </div>

      {/* Stats rows */}
      <div className="px-4 pt-3 pb-1 space-y-2">
        <div className="flex items-center justify-between py-2 rounded-xl px-3" style={{ background: cardTheme.statsBg, border: cardTheme.statsBorder }}>
          <div className="flex items-center gap-1.5">
            <Users size={13} style={{ color: cardTheme.statsText }} />
            <span className="text-xs font-medium" style={{ color: cardTheme.statsText }}>Number of invitees</span>
          </div>
          <span className="text-sm font-bold" style={{ color: cardTheme.statsValue }}>{tier.invitees}</span>
        </div>
        <div className="flex items-center justify-between py-2 rounded-xl px-3" style={{ background: cardTheme.statsBg, border: cardTheme.statsBorder }}>
          <div className="flex items-center gap-1.5">
            <Wallet size={13} style={{ color: cardTheme.statsText }} />
            <span className="text-xs font-medium" style={{ color: cardTheme.statsText }}>Deposit per people</span>
          </div>
          <span className="text-sm font-bold" style={{ color: cardTheme.depositValue }}>₹{tier.depositPerPerson.toLocaleString('en-IN')}.00</span>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 my-2" style={{ height: 1, background: cardTheme.dividerColor }} />

      {/* Progress row */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="text-center">
            <div className="font-black text-lg" style={{ color: cardTheme.progressNumColor }}>
              {tier.currentInvitees} / {tier.invitees}
            </div>
            <div className="text-[10px] font-medium mt-0.5" style={{ color: cardTheme.progressLabelColor }}>Number of invitees</div>
            <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: cardTheme.progressBg }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${inviteePct}%`, background: cardTheme.progressFill }}
              />
            </div>
          </div>
          <div className="text-center">
            <div className="font-black text-lg" style={{ color: cardTheme.progressNumColor }}>
              {tier.currentDeposit} / {tier.invitees}
            </div>
            <div className="text-[10px] font-medium mt-0.5" style={{ color: cardTheme.progressLabelColor }}>Deposit number</div>
            <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: cardTheme.progressBg }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${depositPct}%`, background: cardTheme.progressFill }}
              />
            </div>
          </div>
        </div>

        {/* Claim button — only this changes per state */}
        <button
          disabled={btnTheme.btnDisabled}
          className="w-full py-3 rounded-2xl font-bold text-sm tracking-wide"
          style={{
            background: btnTheme.btnBg,
            color: btnTheme.btnColor,
            border: btnTheme.btnBorder,
            boxShadow: btnTheme.btnShadow,
            opacity: btnTheme.btnDisabled ? 0.65 : 1,
            cursor: btnTheme.btnDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          {btnTheme.btnText}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Invitation Record Tab ─────────────────────────────────────────────────────
function InvitationRecord() {
  const records = [
    { uid: 'UID8823****', date: '2024-01-15 10:23', bonus: 57, tier: 1 },
    { uid: 'UID4412****', date: '2024-01-14 08:45', bonus: 177, tier: 2 },
    { uid: 'UID9901****', date: '2024-01-12 14:10', bonus: 57, tier: 1 },
  ];

  return (
    <div className="px-3 pt-4 space-y-3">
      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <span className="text-5xl">📭</span>
          <span className="text-gray-400 text-sm font-medium">No invitation records yet</span>
        </div>
      ) : (
        records.map((rec, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl overflow-hidden shadow-sm"
            style={{ background: '#ffffff', border: '1px solid #e8e8e8' }}
          >
            <div className="flex items-center justify-between px-4 py-2" style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)' }}>
              <span className="text-white font-bold text-xs">{rec.uid}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,68,68,0.2)', color: '#FF4444', border: '1px solid #FF4444' }}>
                Tier {rec.tier}
              </span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-gray-400">Date</div>
                <div className="text-xs font-semibold text-gray-700 mt-0.5">{rec.date}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-400">Bonus earned</div>
                <div className="font-black text-base mt-0.5" style={{ color: '#FF4444' }}>₹{rec.bonus}.00</div>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────
const quickActions = [
  {
    key: 'qa-invitation',
    label: 'Invitation\nBonus',
    icon: '🎁',
    gradient: 'linear-gradient(135deg, #C8102E, #E83E52)',
  },
  {
    key: 'qa-rebate',
    label: 'Betting\nRebate',
    icon: '💰',
    gradient: 'linear-gradient(135deg, #C8102E, #F5D060)',
  },
  {
    key: 'qa-jackpot',
    label: 'Super\nJackpot',
    icon: '🏆',
    gradient: 'linear-gradient(135deg, #C8102E, #8B0000)',
  },
  {
    key: 'qa-wheel',
    label: 'Invite\nWheel',
    icon: '🎡',
    gradient: 'linear-gradient(135deg, #C8102E, #FF6B6B)',
  },
];

const banners = [
  {
    key: 'banner-gifts',
    title: 'Gifts',
    subtitle: 'Claim daily gifts',
    icon: '🎁',
    gradient: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)',
    half: true,
    tag: 'Daily',
  },
  {
    key: 'banner-attendance',
    title: 'Attendance\nBonus',
    subtitle: 'Check in daily for rewards',
    icon: '📅',
    gradient: 'linear-gradient(135deg, #C8102E 0%, #F5D060 100%)',
    half: true,
    tag: 'Streak',
    border: '#C8102E',
  },
  {
    key: 'banner-recharge',
    title: 'Recharge Bonus',
    subtitle: 'Deposit & get instant bonus on every recharge',
    icon: '🃏',
    gradient: 'linear-gradient(135deg, #C8102E, #8B0000)',
    tag: 'HOT',
    tagColor: '#FF4444',
    detail: 'Up to ₹5,000 bonus',
  },
  {
    key: 'banner-first-second',
    title: 'First / Second Recharge Bonus',
    subtitle: 'Exclusive bonus on your 1st & 2nd deposit',
    icon: '💎',
    gradient: 'linear-gradient(135deg, #C8102E, #C8102E)',
    tag: 'NEW',
    tagColor: '#fff',
    detail: 'Get up to ₹2,000 extra',
  },
  {
    key: 'banner-lucky10',
    title: 'LUCKY 10 Days Recharge Bonus',
    subtitle: 'Recharge for 10 days and unlock mega rewards',
    icon: '🔟',
    gradient: 'linear-gradient(135deg, #8B0000, #C8102E)',
    tag: 'LIMITED',
    tagColor: '#FF4444',
    detail: '10-day streak reward',
  },
  {
    key: 'banner-luckyspin',
    title: 'Lucky Spin',
    subtitle: 'Spin to win iPhone 16 Pro Max!',
    icon: '📱',
    gradient: 'linear-gradient(135deg, #C8102E, #E83E52)',
    tag: 'WIN',
    tagColor: '#FF4444',
    detail: 'iPhone 16 Pro Max Giveaway 🎉',
  },
  {
    key: 'banner-invitation',
    title: 'Invitation Bonus',
    subtitle: 'Invite friends and earn massive rewards',
    icon: '👥',
    gradient: 'linear-gradient(135deg, #8B0000, #C8102E)',
    tag: 'MEGA',
    tagColor: '#FF4444',
    detail: 'Bonus up to ₹3,655,555',
    bigText: true,
  },
  {
    key: 'banner-winstreak',
    title: 'Win Streak Bonus',
    subtitle: 'Keep winning to unlock streak multipliers',
    icon: '🎲',
    gradient: 'linear-gradient(135deg, #C8102E, #F5D060)',
    tag: 'STREAK',
    tagColor: '#fff',
    detail: 'Lottery game rewards',
  },
  {
    key: 'banner-aviator',
    title: 'Aviator Bonus',
    subtitle: 'Fly high and earn exclusive Aviator bonuses',
    icon: '✈️',
    gradient: 'linear-gradient(135deg, #C8102E, #FF4444)',
    tag: 'FLY',
    tagColor: '#FF4444',
    detail: 'Pilot bonus rewards',
  },
  {
    key: 'banner-vip',
    title: 'VIP Upgrade Bonus',
    subtitle: 'Unlock luxury rewards as you level up',
    icon: '👑',
    gradient: 'linear-gradient(135deg, #C8102E, #C8102E)',
    tag: 'VIP',
    tagColor: '#fff',
    detail: 'Exclusive premium rewards',
  },
];

const halfBanners = banners?.filter((b) => b?.half);
const fullBanners = banners?.filter((b) => !b?.half);

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// ─── Betting Rebate Modal ────────────────────────────────────────────────────
const rebateTiers = [
  { level: 'Bronze', minBet: 1000, maxBet: 9999, rebate: 0.3, icon: '🥉', color: '#CD7F32', bg: 'linear-gradient(135deg, #3d1f00, #7a3f00)' },
  { level: 'Silver', minBet: 10000, maxBet: 49999, rebate: 0.5, icon: '🥈', color: '#C0C0C0', bg: 'linear-gradient(135deg, #1a1a1a, #3a3a3a)' },
  { level: 'Gold', minBet: 50000, maxBet: 199999, rebate: 0.8, icon: '🥇', color: '#FF4444', bg: 'linear-gradient(135deg, #1a0000, #3a0000)' },
  { level: 'Platinum', minBet: 200000, maxBet: 499999, rebate: 1.0, icon: '💎', color: '#00E5FF', bg: 'linear-gradient(135deg, #001a2a, #003a5a)' },
  { level: 'Diamond', minBet: 500000, maxBet: 999999, rebate: 1.2, icon: '👑', color: '#FF6B6B', bg: 'linear-gradient(135deg, #1a0000, #5a0000)' },
  { level: 'VIP', minBet: 1000000, maxBet: null, rebate: 1.5, icon: '🌟', color: '#FF4500', bg: 'linear-gradient(135deg, #1a0a00, #6a2000)' },
];

const rebateRecords = [
  { date: '2024-01-15', game: 'Aviator', betAmount: 5200, rebate: 15.6, status: 'Credited' },
  { date: '2024-01-14', game: 'Roulette', betAmount: 3800, rebate: 11.4, status: 'Credited' },
  { date: '2024-01-13', game: 'Slots', betAmount: 7500, rebate: 22.5, status: 'Credited' },
  { date: '2024-01-12', game: 'Poker', betAmount: 2100, rebate: 6.3, status: 'Pending' },
];

function BettingRebateModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'tiers' | 'record'>('tiers');
  const userBetTotal = 5200;
  const currentTier = rebateTiers[0];
  const nextTier = rebateTiers[1];
  const progressPct = Math.min(((userBetTotal - currentTier.minBet) / (nextTier.minBet - currentTier.minBet)) * 100, 100);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-stretch justify-center"
        style={{ background: 'rgba(0,0,0,0.5)' }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative w-full overflow-y-auto"
          style={{ maxWidth: 540, margin: '0 auto', background: '#f5f5f5', height: '100dvh', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
        >
          {/* Header */}
          <div
            className="relative"
            style={{
              background: 'linear-gradient(160deg, #8B0000 0%, #C8102E 50%, #E8352A 100%)',
              paddingBottom: 24,
            }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <ChevronLeft size={20} className="text-white" />
              </button>
              <span className="text-white font-bold text-base tracking-wide">Betting Rebate</span>
              <div className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <span className="text-white text-xs">ℹ</span>
              </div>
            </div>

            {/* Hero content */}
            <div className="px-4 pt-1 pb-2 flex items-start gap-3">
              <div className="text-4xl mt-1">💰</div>
              <div className="flex-1">
                <div className="text-white font-black text-lg leading-tight">Bet More, Earn More!</div>
                <div className="text-[11px] mt-1 leading-relaxed" style={{ color: '#FFD580' }}>
                  Get cashback rebate on every bet you place.{'\n'}
                  Higher bets unlock better rebate tiers automatically.
                </div>
              </div>
            </div>

            {/* Current tier card */}
            <div className="mx-4 mt-2 rounded-2xl p-3" style={{ background: '#ffffff', border: '1px solid #ffd0d0' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{currentTier.icon}</span>
                  <div>
                    <div className="font-black text-sm" style={{ color: '#C8102E' }}>{currentTier.level} Tier</div>
                    <div className="text-gray-500 text-[10px]">Current rebate: <span className="font-bold" style={{ color: '#C8102E' }}>{currentTier.rebate}%</span></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-500">Total bet</div>
                  <div className="font-black text-base" style={{ color: '#C8102E' }}>₹{userBetTotal.toLocaleString('en-IN')}</div>
                </div>
              </div>
              <div className="text-[10px] text-gray-500 mb-1 flex justify-between">
                <span>Progress to {nextTier.level}</span>
                <span className="font-bold" style={{ color: '#C8102E' }}>₹{(nextTier.minBet - userBetTotal).toLocaleString('en-IN')} more</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: '#ffe8e8' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #C8102E, #FF6B6B)' }}
                />
              </div>
            </div>

            {/* Tab buttons */}
            <div className="mx-4 mt-3 grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveTab('tiers')}
                className="flex flex-col items-center gap-1 py-3 rounded-2xl transition-all"
                style={{
                  background: activeTab === 'tiers' ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)',
                  border: activeTab === 'tiers' ? '1.5px solid rgba(255,68,68,0.8)' : '1.5px solid rgba(255,255,255,0.15)',
                  boxShadow: activeTab === 'tiers' ? '0 0 12px rgba(212,175,55,0.3)' : 'none',
                }}
              >
                <span className="text-xl">📊</span>
                <span className="text-white text-[11px] font-semibold">Rebate Tiers</span>
              </button>
              <button
                onClick={() => setActiveTab('record')}
                className="flex flex-col items-center gap-1 py-3 rounded-2xl transition-all"
                style={{
                  background: activeTab === 'record' ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)',
                  border: activeTab === 'record' ? '1.5px solid rgba(255,68,68,0.8)' : '1.5px solid rgba(255,255,255,0.15)',
                  boxShadow: activeTab === 'record' ? '0 0 12px rgba(212,175,55,0.3)' : 'none',
                }}
              >
                <span className="text-xl">📋</span>
                <span className="text-white text-[11px] font-semibold">Rebate Record</span>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="pb-28" style={{ background: '#f5f5f5' }}>
            {activeTab === 'tiers' ? (
              <div className="px-3 pt-4 space-y-3">
                {/* Rules info */}
                <div className="rounded-2xl p-3" style={{ background: '#ffffff', border: '1px solid #ffd0d0' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={14} style={{ color: '#C8102E' }} />
                    <span className="font-bold text-xs" style={{ color: '#C8102E' }}>How Rebate Works</span>
                  </div>
                  <ul className="space-y-1">
                    {[
                      'Rebate is calculated daily on total bets placed',
                      'Rebate is auto-credited to your wallet every day',
                      'Higher tier = higher rebate percentage',
                      'Tier is determined by monthly total bet amount',
                    ].map((rule, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[10px] mt-0.5" style={{ color: '#C8102E' }}>•</span>
                        <span className="text-gray-600 text-[10px]">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tier cards */}
                {rebateTiers.map((tier, idx) => {
                  const isActive = tier.level === currentTier.level;
                  return (
                    <motion.div
                      key={tier.level}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="rounded-2xl overflow-hidden shadow-lg"
                      style={{
                        background: tier.bg,
                        border: isActive ? `2px solid ${tier.color}` : '1px solid rgba(255,255,255,0.1)',
                        boxShadow: isActive ? `0 0 16px ${tier.color}44` : 'none',
                      }}
                    >
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{tier.icon}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-sm" style={{ color: tier.color }}>{tier.level}</span>
                              {isActive && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${tier.color}33`, color: tier.color, border: `1px solid ${tier.color}` }}>
                                  CURRENT
                                </span>
                              )}
                            </div>
                            <div className="text-white/60 text-[10px] mt-0.5">
                              ₹{tier.minBet.toLocaleString('en-IN')}{tier.maxBet ? ` – ₹${tier.maxBet.toLocaleString('en-IN')}` : '+'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-white/50">Rebate</div>
                          <div className="font-black text-xl" style={{ color: '#C8102E' }}>{tier.rebate}%</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="px-3 pt-4 space-y-3">
                {/* Summary row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl p-3 flex flex-col items-center" style={{ background: '#ffffff', border: '1px solid #ffd0d0' }}>
                    <BarChart2 size={18} style={{ color: '#C8102E' }} />
                    <div className="font-black text-lg mt-1" style={{ color: '#C8102E' }}>₹55.80</div>
                    <div className="text-[10px] text-gray-500">Total Rebate Earned</div>
                  </div>
                  <div className="rounded-2xl p-3 flex flex-col items-center" style={{ background: '#ffffff', border: '1px solid #ffd0d0' }}>
                    <Clock size={18} style={{ color: '#FF4444' }} />
                    <div className="font-black text-lg mt-1" style={{ color: '#FF4444' }}>₹6.30</div>
                    <div className="text-[10px] text-gray-500">Pending Rebate</div>
                  </div>
                </div>

                {/* Records */}
                {rebateRecords.map((rec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-2xl overflow-hidden shadow-sm"
                    style={{ background: '#ffffff', border: '1px solid #ffd0d0' }}
                  >
                    <div className="flex items-center justify-between px-4 py-2" style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)' }}>
                      <span className="text-white font-bold text-xs">{rec.game}</span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: rec.status === 'Credited' ? 'rgba(0,200,83,0.15)' : 'rgba(255,68,68,0.15)',
                          color: rec.status === 'Credited' ? '#00C853' : '#FF4444',
                          border: `1px solid ${rec.status === 'Credited' ? '#00C853' : '#FF4444'}`,
                        }}
                      >
                        {rec.status}
                      </span>
                    </div>
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-gray-400">Date</div>
                        <div className="text-xs font-semibold text-gray-700 mt-0.5">{rec.date}</div>
                        <div className="text-[10px] text-gray-400 mt-1">Bet Amount</div>
                        <div className="text-xs font-semibold text-gray-700 mt-0.5">₹{rec.betAmount.toLocaleString('en-IN')}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-gray-400">Rebate Earned</div>
                        <div className="font-black text-xl mt-0.5" style={{ color: '#C8102E' }}>₹{rec.rebate.toFixed(2)}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Gift Modal ──────────────────────────────────────────────────────────────
function GiftModal({ onClose }: { onClose: () => void }) {
  const [giftCode, setGiftCode] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleReceive = () => {
    if (!giftCode.trim()) {
      setError('Please enter a valid gift code');
      return;
    }
    setError('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
    setGiftCode('');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-stretch justify-center"
        style={{ background: 'rgba(0,0,0,0.65)' }}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full flex flex-col"
          style={{
            maxWidth: 540,
            margin: '0 auto',
            background: '#FFF8F0',
            height: '100dvh',
          }}
        >
          {/* ── Fixed Top Bar ── */}
          <div
            className="flex-shrink-0 flex items-center justify-between px-4 pt-5 pb-4"
            style={{
              background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)',
              boxShadow: '0 2px 16px rgba(200,16,46,0.4)',
            }}
          >
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full"
              style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
            <span className="text-white font-black text-base tracking-wide" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.35)', letterSpacing: '0.12em' }}>
              🎁 Gift
            </span>
            <div className="w-9 h-9" />
          </div>

          {/* ── Fully Scrollable Content ── */}
          <div
            className="flex-1 overflow-y-auto"
            style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', background: '#FFF8F0', paddingBottom: 40 }}
          >
            {/* ── Hero Banner ── */}
            <div
              className="relative overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #FFD580 0%, #FFBF47 35%, #FFA830 65%, #FF9500 100%)',
                minHeight: 230,
              }}
            >
              {/* Radial glow */}
              <div
                className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at 50% 80%, rgba(255,200,50,0.55) 0%, transparent 65%)' }}
              />
              {/* Concentric arc decorations */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ width: 340, height: 200, overflow: 'hidden' }}>
                {[180, 220, 260, 300].map((size, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: size,
                      height: size,
                      bottom: -size / 2,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      border: `2px solid rgba(255,255,255,${0.18 - i * 0.03})`,
                    }}
                  />
                ))}
              </div>
              {/* Gift box illustration */}
              <div className="relative flex flex-col items-center pt-6 pb-4">
                <div className="relative" style={{ width: 140, height: 130 }}>
                  {/* Box body */}
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-b-2xl"
                    style={{
                      width: 110,
                      height: 80,
                      background: 'linear-gradient(160deg, #FF9500 0%, #8B0000 100%)',
                      border: '2px solid rgba(255,255,255,0.25)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.22)',
                    }}
                  >
                    {/* Ribbon vertical */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-5" style={{ background: 'rgba(255,255,255,0.22)' }} />
                  </div>
                  {/* Box lid */}
                  <div
                    className="absolute rounded-t-xl"
                    style={{
                      width: 122,
                      height: 28,
                      bottom: 76,
                      left: '50%',
                      transform: 'translateX(-50%) rotate(-4deg)',
                      background: 'linear-gradient(135deg, #FF6B6B 0%, #FF4444 100%)',
                      border: '2px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                    }}
                  >
                    {/* Ribbon on lid */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-5" style={{ background: 'rgba(255,255,255,0.25)' }} />
                  </div>
                  {/* Floating lottery balls */}
                  <span className="absolute text-2xl" style={{ top: 0, right: 2, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' }}>🎱</span>
                  <span className="absolute text-xl" style={{ top: 18, left: 0, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>🟢</span>
                  <span className="absolute text-lg" style={{ bottom: 60, right: -8, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>🔴</span>
                  {/* Coins */}
                  <span className="absolute text-base" style={{ top: 8, right: -14 }}>🪙</span>
                  <span className="absolute text-sm" style={{ bottom: 30, left: -10 }}>🪙</span>
                </div>
              </div>
              {/* Bottom fade into page bg */}
              <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: 'linear-gradient(to bottom, transparent, #FFF8F0)' }} />
            </div>

            {/* ── Gift Code Card ── */}
            <div className="mx-3 mt-3">
              <div
                className="rounded-2xl p-5"
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #ffd0d0',
                  boxShadow: '0 4px 20px rgba(200,16,46,0.08)',
                }}
              >
                {/* Greeting */}
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-2xl">👋</span>
                  <div>
                    <p className="text-base font-bold" style={{ color: '#C8102E' }}>Hi!</p>
                    <p className="text-sm font-medium mt-0.5" style={{ color: '#666' }}>We have a gift for you</p>
                  </div>
                </div>

                <p className="text-sm font-bold mb-3" style={{ color: '#333' }}>
                  Please enter the gift code below
                </p>

                {/* Input */}
                <div
                  className="rounded-full overflow-hidden flex items-center"
                  style={{
                    border: error ? '1.5px solid #C8102E' : '1.5px solid #e0c0c0',
                    background: '#fff5f5',
                  }}
                >
                  <input
                    type="text"
                    value={giftCode}
                    onChange={(e) => { setGiftCode(e.target.value); setError(''); }}
                    placeholder="Please enter gift code"
                    className="flex-1 px-5 py-4 text-sm bg-transparent outline-none"
                    style={{ color: '#333', caretColor: '#C8102E' }}
                  />
                </div>
                {error && (
                  <p className="text-xs mt-1.5 ml-2" style={{ color: '#C8102E' }}>{error}</p>
                )}

                {/* Info strip */}
                <div
                  className="mt-3 rounded-xl py-2 px-3 flex items-center gap-2"
                  style={{ background: '#fff0f0', border: '1px solid #FF4444' }}
                >
                  <span className="text-sm">💡</span>
                  <span className="text-[11px] font-medium" style={{ color: '#C8102E' }}>Gift codes are case-sensitive</span>
                </div>

                {/* Receive Button */}
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 28px rgba(200,16,46,0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleReceive}
                  className="w-full mt-4 py-4 rounded-full font-bold text-base tracking-wide"
                  style={{
                    background: submitted
                      ? 'linear-gradient(135deg, #00c853 0%, #43a047 100%)'
                      : 'linear-gradient(135deg, #C8102E 0%, #FF1744 50%, #C8102E 100%)',
                    color: '#ffffff',
                    boxShadow: submitted
                      ? '0 4px 16px rgba(0,200,83,0.4)'
                      : '0 6px 24px rgba(200,16,46,0.5)',
                    border: '1px solid rgba(255,100,100,0.4)',
                    textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {submitted ? '✓ Gift Received!' : 'Receive'}
                </motion.button>
              </div>
            </div>

            {/* ── History Section ── */}
            <div className="mx-3 mt-3 mb-6">
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: '#ffffff',
                  border: '1px solid #ffd0d0',
                  boxShadow: '0 4px 20px rgba(200,16,46,0.08)',
                }}
              >
                {/* History header */}
                <div className="flex items-center gap-2.5 px-4 py-3.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #F5C842 0%, #C8102E 100%)' }}
                  >
                    <span className="text-sm">📋</span>
                  </div>
                  <span className="font-bold text-base text-white">History</span>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: '#ffd0d0' }} />

                {/* Empty state */}
                <div className="flex flex-col items-center justify-center py-14 px-6">
                  <div className="relative mb-4">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #fff0f0 0%, #fff8f0 100%)',
                        border: '1px solid #ffd0d0',
                      }}
                    >
                      <span className="text-4xl opacity-60">🎁</span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full" style={{ background: '#FF4444' }} />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full" style={{ background: '#C8102E' }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#C8102E' }}>No data</p>
                  <p className="text-xs mt-1" style={{ color: '#aaa' }}>Redeem a gift code to see history</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Attendance Bonus Modal ──────────────────────────────────────────────────
const attendanceRewards = [
  { day: 1, amount: '₹7.00' },
  { day: 2, amount: '₹20.00' },
  { day: 3, amount: '₹100.00' },
  { day: 4, amount: '₹200.00' },
  { day: 5, amount: '₹450.00' },
  { day: 6, amount: '₹2,400.00' },
];

function AttendanceBonusModal({ onClose }: { onClose: () => void }) {
  const [claimed, setClaimed] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const consecutiveDays = 0;
  const accumulated = 56.00;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-stretch justify-center"
        style={{ background: 'rgba(0,0,0,0.65)' }}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full flex flex-col"
          style={{ maxWidth: 540, margin: '0 auto', background: '#f5f5f5', height: '100dvh' }}
        >
          {/* ── Fixed Top Bar ── */}
          <div
            className="flex-shrink-0 flex items-center justify-between px-4 pt-5 pb-4"
            style={{
              background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)',
              boxShadow: '0 2px 16px rgba(200,16,46,0.4)',
            }}
          >
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full"
              style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
            <span className="text-white font-bold text-base tracking-wide">
              Attendance
            </span>
            <div className="w-9 h-9" />
          </div>

          {/* ── Scrollable Content ── */}
          <div
            className="flex-1 overflow-y-auto"
            style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', background: '#f5f5f5', paddingBottom: 100 }}
          >
            {/* ── Red Hero Banner ── */}
            <div
              className="relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #C8102E 0%, #e8192e 50%, #FF4444 100%)',
                minHeight: 200,
              }}
            >
              {/* Decorative arc */}
              <div
                className="absolute right-0 top-0 bottom-0"
                style={{
                  width: 180,
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '50% 0 0 50%',
                }}
              />
              <div
                className="absolute right-8 top-4 bottom-4"
                style={{
                  width: 160,
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: '50% 0 0 50%',
                }}
              />

              {/* Left content */}
              <div className="relative px-5 pt-5 pb-4">
                <h2 className="text-white font-black text-xl leading-tight">Attendance bonus</h2>
                <p className="text-white/80 text-xs mt-1 leading-relaxed">
                  Get rewards based on consecutive<br />login days
                </p>

                {/* Consecutive day badge */}
                <div
                  className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-sm"
                  style={{
                    background: '#ffffff',
                    clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)',
                    paddingRight: 20,
                  }}
                >
                  <span className="text-xs font-bold" style={{ color: '#C8102E' }}>Attended consecutively</span>
                  <span className="text-xl font-black" style={{ color: '#C8102E' }}>{consecutiveDays}</span>
                  <span className="text-xs font-bold" style={{ color: '#C8102E' }}>Day</span>
                </div>

                {/* Accumulated */}
                <div className="mt-3">
                  <p className="text-white/80 text-xs">Accumulated</p>
                  <p className="text-white font-black text-3xl mt-0.5">₹{accumulated.toFixed(2)}</p>
                </div>

                {/* Buttons row */}
                <div className="flex gap-3 mt-4">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setShowRules(true)}
                    className="flex-1 py-2.5 rounded-full font-bold text-sm"
                    style={{
                      background: 'linear-gradient(135deg, #FF6B6B 0%, #FF4444 100%)',
                      color: '#fff',
                      boxShadow: '0 3px 12px rgba(255,140,0,0.4)',
                    }}
                  >
                    Game Rules
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setShowHistory(true)}
                    className="flex-1 py-2.5 rounded-full font-bold text-sm"
                    style={{
                      background: 'linear-gradient(135deg, #FF6B6B 0%, #FF4444 100%)',
                      color: '#fff',
                      boxShadow: '0 3px 12px rgba(255,140,0,0.4)',
                    }}
                  >
                    Attendance history
                  </motion.button>
                </div>
              </div>

              {/* Calendar illustration (right side) */}
              <div
                className="absolute right-3 top-4 flex items-center justify-center"
                style={{ width: 130, height: 130 }}
              >
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '2px solid rgba(255,255,255,0.25)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  }}
                >
                  📅
                </div>
                <div className="absolute -bottom-1 -right-1 text-2xl">✏️</div>
              </div>
            </div>

            {/* ── 6 Reward Day Cards (3x2 grid) ── */}
            <div className="px-3 mt-3">
              <div className="grid grid-cols-3 gap-2">
                {attendanceRewards.map((item, i) => (
                  <motion.div
                    key={item.day}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-2xl flex flex-col items-center py-4 px-2"
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e8e8e8',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                  >
                    <p className="text-xs font-bold text-gray-800 mb-2">{item.amount}</p>
                    {/* Gold star coin */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                      style={{
                        background: 'radial-gradient(circle at 35% 35%, #FF6B6B 0%, #FF4444 40%, #C8102E 70%, #8B0000 100%)',
                        boxShadow: '0 4px 12px rgba(255,68,68,0.5), inset 0 1px 0 rgba(255,255,255,0.4)',
                        border: '2px solid #C8102E',
                      }}
                    >
                      <span className="text-xl" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}>⭐</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-1">{item.day} Day</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ── 7th Day Special Gift Card ── */}
            <div className="px-3 mt-2">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl flex items-center px-4 py-5"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e8e8e8',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                {/* Gift illustration */}
                <div className="flex-shrink-0 mr-4">
                  <div className="relative" style={{ width: 90, height: 90 }}>
                    <span className="text-7xl" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}>🎁</span>
                    <span className="absolute -bottom-1 -right-2 text-2xl">🪙</span>
                    <span className="absolute bottom-2 -left-2 text-xl">🪙</span>
                  </div>
                </div>
                {/* Amount + day */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1" style={{ background: '#e0e0e0', width: 20 }} />
                    <p className="text-xl font-black text-gray-800">₹6,400.00</p>
                    <div className="h-px flex-1" style={{ background: '#e0e0e0', width: 20 }} />
                  </div>
                  <p className="text-sm text-gray-500 font-medium mt-1">7 Day</p>
                </div>
              </motion.div>
            </div>

            {/* ── Check-In Button ── */}
            <div className="px-3 mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setClaimed(true)}
                disabled={claimed}
                className="w-full py-3.5 rounded-full font-black text-base tracking-wide text-white"
                style={{
                  background: claimed
                    ? 'linear-gradient(135deg, #888 0%, #666 100%)'
                    : 'linear-gradient(135deg, #FF4444 0%, #C8102E 50%, #8B0000 100%)',
                  boxShadow: claimed
                    ? 'none'
                    : '0 4px 16px rgba(200,16,46,0.5), 0 0 20px rgba(255,68,68,0.3)',
                }}
              >
                {claimed ? '✓ Attended Today!' : '📅 Check In Today'}
              </motion.button>
            </div>

            {/* ── Rules Section ── */}
            <div className="px-3 mt-4 mb-4">
              <div
                className="rounded-2xl p-4"
                style={{ background: '#ffffff', border: '1px solid #e8e8e8', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">📋</span>
                  <span className="font-black text-sm" style={{ color: '#C8102E' }}>Rules</span>
                </div>
                <div className="space-y-2">
                  {[
                    '📅 Log in every day to check in and earn rewards.',
                    '🔥 Consecutive check-ins increase your reward amount.',
                    '⚠️ Missing a day will reset your consecutive count to 0.',
                    '🎁 Day 7 special reward: ₹6,400.00 gift bonus.',
                    '💰 All rewards are credited directly to your main wallet.',
                    '⏰ Check-in window resets at 00:00 midnight daily.',
                    '✅ Each account can only check in once per day.',
                    '🏆 The accumulated amount shown is your total earned.',
                    '💬 Need help? Contact Customer Service',
                  ].map((rule, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl" style={{ background: '#fff5f5', border: '1px solid #ffd0d0' }}>
                      <span className="text-sm leading-relaxed" style={{ color: '#5a0000' }}>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Fixed Bottom Attendance Button ── */}
          <div
            className="flex-shrink-0 px-4 py-4"
            style={{ background: '#f5f5f5', borderTop: '1px solid #e8e8e8' }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setClaimed(true)}
              disabled={claimed}
              className="w-full py-4 rounded-full font-black text-base tracking-wide"
              style={{
                background: claimed
                  ? 'linear-gradient(135deg, #00c853 0%, #43a047 100%)'
                  : 'linear-gradient(135deg, #FF6B6B 0%, #FF4444 50%, #8B0000 100%)',
                color: claimed ? '#ffffff' : '#7a3800',
                boxShadow: claimed
                  ? '0 4px 16px rgba(0,200,83,0.4)'
                  : '0 6px 24px rgba(255,140,0,0.45)',
                border: 'none',
                opacity: claimed ? 0.85 : 1,
                cursor: claimed ? 'not-allowed' : 'pointer',
                letterSpacing: '0.06em',
                fontSize: '1rem',
              }}
            >
              {claimed ? '✓ Attended Today!' : 'Attendance'}
            </motion.button>
          </div>

          {/* ── Attendance History Sub-Modal ── */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-60 flex items-end justify-center"
                style={{ background: 'rgba(0,0,0,0.5)' }}
                onClick={() => setShowHistory(false)}
              >
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  className="w-full rounded-t-3xl p-6 pb-10"
                  style={{ maxWidth: 540, background: '#ffffff', border: '1px solid #ffd0d0' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-lg" style={{ color: '#C8102E' }}>📅 Attendance History</h3>
                    <button onClick={() => setShowHistory(false)} className="text-gray-400 text-xl font-bold">✕</button>
                  </div>
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <span className="text-5xl">📭</span>
                    <span className="font-semibold text-sm" style={{ color: '#C8102E' }}>No attendance history yet</span>
                    <span className="text-xs text-gray-400">Start checking in daily to build your streak!</span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Game Rules Sub-Modal ── */}
          <AnimatePresence>
            {showRules && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-60 flex items-stretch justify-center"
                style={{ background: 'rgba(0,0,0,0.6)' }}
                onClick={() => setShowRules(false)}
              >
                <motion.div
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 60, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  className="relative w-full flex flex-col"
                  style={{ maxWidth: 540, margin: '0 auto', background: '#ffffff', height: '100dvh' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* ── Dark Header ── */}
                  <div
                    className="flex-shrink-0 flex items-center justify-between px-4 pt-4 pb-3"
                    style={{
                      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
                    }}
                  >
                    <button
                      onClick={() => setShowRules(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full"
                      style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
                    >
                      <ChevronLeft size={20} className="text-white" />
                    </button>
                    <span className="text-white font-black text-base tracking-wide">Game Rules</span>
                    <div className="w-8 h-8" />
                  </div>

                  {/* ── Scrollable Content ── */}
                  <div
                    className="flex-1 overflow-y-auto"
                    style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', paddingBottom: 100 }}
                  >
                    {/* ── Table Card ── */}
                    <div className="mx-4 mt-5 rounded-2xl overflow-hidden" style={{ border: '1.5px solid #e0e0e0', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                      {/* Table Header */}
                      <div
                        className="grid grid-cols-3 text-center"
                        style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}
                      >
                        <div className="py-3 px-2 text-xs font-black text-white border-r" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                          Continuous<br />attendance
                        </div>
                        <div className="py-3 px-2 text-xs font-black text-white border-r" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                          Accumulated<br />amount
                        </div>
                        <div className="py-3 px-2 text-xs font-black text-white">
                          Attendance<br />bonus
                        </div>
                      </div>

                      {/* Table Rows — zebra striping */}
                      {[
                        { day: 1, accumulated: '₹300.00',    bonus: '₹7.00' },
                        { day: 2, accumulated: '₹1,500.00',  bonus: '₹20.00' },
                        { day: 3, accumulated: '₹6,000.00',  bonus: '₹100.00' },
                        { day: 4, accumulated: '₹20,000.00', bonus: '₹200.00' },
                        { day: 5, accumulated: '₹40,000.00', bonus: '₹450.00' },
                        { day: 6, accumulated: '₹1,00,000.00', bonus: '₹2,400.00' },
                        { day: 7, accumulated: '₹2,00,000.00', bonus: '₹6,400.00' },
                      ].map((row, i) => (
                        <div
                          key={row.day}
                          className="grid grid-cols-3 text-center"
                          style={{ background: i % 2 === 0 ? '#2a2a2a' : '#1a1a1a' }}
                        >
                          <div className="py-3 px-2 text-xs font-bold text-white border-r" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                            {row.day} {row.day === 1 ? 'Day' : 'Days'}
                          </div>
                          <div className="py-3 px-2 text-xs font-semibold border-r" style={{ color: '#FF4444', borderColor: 'rgba(255,255,255,0.08)' }}>
                            {row.accumulated}
                          </div>
                          <div className="py-3 px-2 text-xs font-bold" style={{ color: '#FF4444' }}>
                            {row.bonus}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ── Rules Card ── */}
                    <div className="mx-4 mt-5 rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1.5px solid #e8e8e8', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                      {/* Rules Header */}
                      <div
                        className="px-4 py-3 flex items-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)' }}
                      >
                        <span className="text-base">📋</span>
                        <span className="font-black text-sm text-white tracking-wide">Rules</span>
                      </div>

                      {/* Rules List */}
                      <div className="p-4 space-y-3">
                        {[
                          'The reward system is based on 7 consecutive days of login. Each day you must check in to maintain your streak.',
                          'Daily check-in is mandatory. Missing even one day will reset your consecutive attendance count back to Day 1.',
                          'To claim the attendance bonus, you must have a valid deposit history in your account.',
                          'Deposit requirements must be fulfilled starting from Day 1. Ensure your account is funded before beginning your streak.',
                          'The final interpretation of this activity belongs to the platform. For any issues or disputes, please contact customer service.',
                        ].map((rule, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 p-3 rounded-xl"
                            style={{ background: '#fff5f5', border: '1px solid #ffd0d0' }}
                          >
                            <div
                              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white mt-0.5"
                              style={{ background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)', minWidth: 20 }}
                            >
                              {i + 1}
                            </div>
                            <span className="text-xs leading-relaxed" style={{ color: '#5a0000' }}>{rule}</span>
                          </div>
                        ))}

                        {/* Customer service link */}
                        <div
                          className="flex items-center justify-center gap-2 py-3 rounded-xl mt-1"
                          style={{ background: 'linear-gradient(135deg, #fff0f0 0%, #ffe8e8 100%)', border: '1.5px solid #FF6B6B' }}
                        >
                          <span className="text-base">💬</span>
                          <span className="text-xs font-bold" style={{ color: '#C8102E' }}>
                            Need help?{' '}
                            <span className="underline" style={{ color: '#FF4444' }}>Contact Customer Service</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Generic Promo Modal ─────────────────────────────────────────────────────
function PromoModal({ onClose, title, icon, heroGradient, heroDesc, rules, features }: {
  onClose: () => void;
  title: string;
  icon: string;
  heroGradient: string;
  heroDesc: string;
  rules: string[];
  features?: { label: string; value: string; icon: string }[];
}) {
  const navigate = useNavigate();
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-stretch justify-center"
        style={{ background: 'rgba(0,0,0,0.65)' }}
      >
        <motion.div
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full flex flex-col"
          style={{ maxWidth: 540, margin: '0 auto', background: '#FFF8F0', height: '100dvh' }}
        >
          {/* Top Bar */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 pt-5 pb-4"
            style={{ background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)', boxShadow: '0 2px 16px rgba(200,16,46,0.4)' }}>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full"
              style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)' }}>
              <ChevronLeft size={20} className="text-white" />
            </button>
            <span className="text-white font-black text-base tracking-wide" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.35)' }}>
              {icon} {title}
            </span>
            <div className="w-9 h-9" />
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', paddingBottom: 100 }}>
            {/* Hero */}
            <div className="relative overflow-hidden" style={{ background: heroGradient, minHeight: 180 }}>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-conic-gradient(from 0deg at 80% 50%, transparent 0deg, rgba(255,255,255,0.4) 5deg, transparent 10deg)' }} />
              <div className="relative px-5 py-6">
                <div className="text-6xl mb-3">{icon}</div>
                <h2 className="text-white font-black text-2xl leading-tight" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>{title}</h2>
                <p className="text-white/90 text-xs mt-2 leading-relaxed font-medium">{heroDesc}</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: 'linear-gradient(to bottom, transparent, #FFF8F0)' }} />
            </div>

            {/* Features */}
            {features && features.length > 0 && (
              <div className="px-4 mt-4 grid grid-cols-2 gap-3">
                {features.map((f, i) => (
                  <div key={i} className="rounded-2xl p-3 flex flex-col items-center" style={{ background: '#ffffff', border: '1.5px solid #ffd0d0', boxShadow: '0 2px 12px rgba(200,16,46,0.08)' }}>
                    <span className="text-2xl mb-1">{f.icon}</span>
                    <div className="font-black text-base" style={{ color: '#C8102E' }}>{f.value}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{f.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Rules */}
            <div className="px-4 mt-4">
              <div className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1.5px solid #ffd0d0', boxShadow: '0 4px 20px rgba(200,16,46,0.08)' }}>
                <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)' }}>
                  <span className="text-base">📋</span>
                  <span className="font-black text-sm text-white tracking-wide">Rules & Details</span>
                </div>
                <div className="p-4 space-y-2">
                  {rules.map((rule, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: '#fff5f5', border: '1px solid #ffd0d0' }}>
                      <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white mt-0.5"
                        style={{ background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)', minWidth: 20 }}>{i + 1}</div>
                      <span className="text-xs leading-relaxed" style={{ color: '#5a0000' }}>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="px-4 mt-4">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { onClose(); navigate('/main-dashboard'); }}
                className="w-full py-4 rounded-full font-black text-base tracking-wide"
                style={{ background: 'linear-gradient(135deg, #C8102E 0%, #FF1744 40%, #C8102E 70%, #8B0000 100%)', color: '#ffffff', boxShadow: '0 6px 24px rgba(200,16,46,0.5)', border: '1px solid rgba(255,100,100,0.4)', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
              >
                🎰 Play Now
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Promo modal configs
const PROMO_CONFIGS: Record<string, { title: string; icon: string; heroGradient: string; heroDesc: string; rules: string[]; features?: { label: string; value: string; icon: string }[] }> = {
  activityAward: {
    title: 'Activity Award',
    icon: '🎖️',
    heroGradient: 'linear-gradient(135deg, #C8102E 0%, #FF4444 40%, #FF6B00 100%)',
    heroDesc: 'Complete daily activities and earn amazing rewards! The more active you are, the bigger your rewards.',
    features: [
      { label: 'Daily Login', value: '₹10', icon: '📅' },
      { label: 'First Bet', value: '₹25', icon: '🎲' },
      { label: 'Win Streak', value: '₹50', icon: '🔥' },
      { label: 'VIP Bonus', value: '₹100', icon: '👑' },
    ],
    rules: [
      'Complete daily tasks to earn activity points and bonuses.',
      'Daily login reward is credited automatically at midnight.',
      'First bet bonus requires minimum ₹100 bet amount.',
      'Win streak bonus activates after 3 consecutive wins.',
      'All rewards are credited directly to your main wallet.',
      'Activity resets daily at 00:00 IST.',
    ],
  },
  firstGift: {
    title: 'First Deposit Gift',
    icon: '🎁',
    heroGradient: 'linear-gradient(135deg, #C8102E 0%, #C8102E 50%, #8B0000 100%)',
    heroDesc: 'Make your first deposit and receive an exclusive welcome bonus! Limited time offer for new members.',
    features: [
      { label: 'Min Deposit', value: '₹200', icon: '💳' },
      { label: 'Bonus', value: '50%', icon: '🎉' },
      { label: 'Max Bonus', value: '₹5,000', icon: '💰' },
      { label: 'Valid', value: '7 Days', icon: '⏰' },
    ],
    rules: [
      'Available only for first-time depositors.',
      'Minimum deposit of ₹200 required to qualify.',
      'Bonus is 50% of your first deposit amount, up to ₹5,000.',
      'Bonus must be wagered 5x before withdrawal.',
      'Offer expires 7 days after account creation.',
      'Cannot be combined with other welcome offers.',
    ],
  },
  rechargeBonus: {
    title: 'Recharge Bonus',
    icon: '🃏',
    heroGradient: 'linear-gradient(135deg, #C8102E 0%, #8B0000 50%, #5a0000 100%)',
    heroDesc: 'Get instant bonus on every recharge! Deposit more and earn bigger rewards with our recharge bonus program.',
    features: [
      { label: '₹500+', value: '3%', icon: '🥉' },
      { label: '₹5,000+', value: '5%', icon: '🥈' },
      { label: '₹20,000+', value: '8%', icon: '🥇' },
      { label: '₹50,000+', value: '12%', icon: '💎' },
    ],
    rules: [
      'Bonus is calculated as a percentage of your deposit amount.',
      'Minimum deposit of ₹500 required to qualify.',
      'Higher deposits unlock higher bonus percentages.',
      'Maximum bonus per transaction: ₹5,000.',
      'Bonus is credited instantly to your account.',
      'Bonus amount must be wagered 3x before withdrawal.',
    ],
  },
  firstSecondRecharge: {
    title: 'First & Second Recharge',
    icon: '💎',
    heroGradient: 'linear-gradient(135deg, #C8102E 0%, #C8102E 100%)',
    heroDesc: 'Exclusive bonus on your 1st & 2nd deposit! Double the rewards for your first two recharges.',
    features: [
      { label: '1st Deposit', value: '100%', icon: '1️⃣' },
      { label: '2nd Deposit', value: '50%', icon: '2️⃣' },
      { label: 'Max 1st', value: '₹2,000', icon: '💰' },
      { label: 'Max 2nd', value: '₹1,000', icon: '🎁' },
    ],
    rules: [
      '100% bonus on your first deposit (max ₹2,000).',
      '50% bonus on your second deposit (max ₹1,000).',
      'Minimum deposit of ₹300 required for each.',
      'Bonus must be wagered 5x before withdrawal.',
      'Second deposit bonus must be claimed within 48 hours of first.',
      'This offer is exclusive and cannot be combined with other promotions.',
    ],
  },
  lucky10: {
    title: 'LUCKY 10 Days Recharge',
    icon: '🔟',
    heroGradient: 'linear-gradient(135deg, #8B0000 0%, #C8102E 50%, #FF4444 100%)',
    heroDesc: 'Recharge for 10 consecutive days and unlock mega rewards! The longer your streak, the bigger the bonus.',
    features: [
      { label: '3 Days', value: '₹100', icon: '🌟' },
      { label: '5 Days', value: '₹500', icon: '⭐' },
      { label: '7 Days', value: '₹1,500', icon: '🏆' },
      { label: '10 Days', value: '₹5,000', icon: '👑' },
    ],
    rules: [
      'Deposit minimum ₹300 daily to maintain your streak.',
      'Missing a day resets your consecutive count to 0.',
      'Rewards are cumulative — you earn all tier bonuses.',
      'Day 10 mega bonus: ₹5,000 credited to wallet.',
      'Only one streak can be active at a time.',
      'Streak resets at 00:00 IST daily.',
    ],
  },
  luckySpin: {
    title: 'Lucky Spin',
    icon: '📱',
    heroGradient: 'linear-gradient(135deg, #C8102E 0%, #E83E52 50%, #FF6B6B 100%)',
    heroDesc: 'Spin to win iPhone 16 Pro Max! Every spin gives you a chance to win amazing prizes including the latest iPhone.',
    features: [
      { label: 'Grand Prize', value: 'iPhone 16', icon: '📱' },
      { label: 'Cash Prize', value: '₹50,000', icon: '💰' },
      { label: 'Free Spins', value: 'Daily', icon: '🎡' },
      { label: 'Bonus', value: '₹1,000', icon: '🎁' },
    ],
    rules: [
      'Every user gets 1 free spin daily.',
      'Additional spins can be earned by depositing ₹500+.',
      'Grand prize: iPhone 16 Pro Max (drawn monthly).',
      'Cash prizes are credited instantly to your wallet.',
      'Free spin tokens expire at midnight.',
      'Winners will be notified via in-app notification.',
    ],
  },
  winStreak: {
    title: 'Win Streak Bonus',
    icon: '🎲',
    heroGradient: 'linear-gradient(135deg, #C8102E 0%, #F5D060 50%, #FF6B6B 100%)',
    heroDesc: 'Keep winning to unlock streak multipliers! The more consecutive wins you get, the higher your bonus.',
    features: [
      { label: '3 Wins', value: '1.5x', icon: '🔥' },
      { label: '5 Wins', value: '2x', icon: '⚡' },
      { label: '7 Wins', value: '3x', icon: '💎' },
      { label: '10 Wins', value: '5x', icon: '👑' },
    ],
    rules: [
      'Win streak is counted across all lottery games.',
      'Minimum bet of ₹50 per game to qualify.',
      'Streak multiplier applies to your next win.',
      'Losing a game resets your streak to 0.',
      'Maximum streak bonus: ₹10,000 per day.',
      'Streak bonus is credited instantly after qualifying win.',
    ],
  },
  aviatorBonus: {
    title: 'Aviator Bonus',
    icon: '✈️',
    heroGradient: 'linear-gradient(135deg, #C8102E 0%, #FF4444 50%, #FF6B6B 100%)',
    heroDesc: 'Fly high and earn exclusive Aviator bonuses! Special rewards for Aviator game players.',
    features: [
      { label: 'Daily Bonus', value: '₹200', icon: '🎯' },
      { label: 'Cashout 5x+', value: '₹500', icon: '🚀' },
      { label: 'Cashout 10x+', value: '₹2,000', icon: '🌟' },
      { label: 'Cashout 50x+', value: '₹10,000', icon: '💎' },
    ],
    rules: [
      'Play Aviator and cash out at high multipliers to earn bonuses.',
      'Daily bonus requires minimum 10 rounds played.',
      'Cashout bonus triggers automatically on qualifying rounds.',
      'Minimum bet of ₹100 per round to qualify.',
      'Maximum daily bonus: ₹15,000.',
      'Bonuses are credited to your main wallet instantly.',
    ],
  },
  vipUpgrade: {
    title: 'VIP Upgrade Bonus',
    icon: '👑',
    heroGradient: 'linear-gradient(135deg, #C8102E 0%, #C8102E 50%, #8B0000 100%)',
    heroDesc: 'Unlock luxury rewards as you level up! VIP members enjoy exclusive perks, higher limits, and premium bonuses.',
    features: [
      { label: 'Silver VIP', value: '₹1,000', icon: '🥈' },
      { label: 'Premium VIP', value: '₹5,000', icon: '🥇' },
      { label: 'Platinum', value: '₹15,000', icon: '💎' },
      { label: 'Diamond', value: '₹50,000', icon: '👑' },
    ],
    rules: [
      'VIP level is determined by total deposit and bet amount.',
      'Each VIP upgrade gives a one-time bonus.',
      'Higher VIP levels unlock better rebate rates.',
      'VIP members get priority customer support.',
      'Monthly VIP rewards are credited on the 1st of each month.',
      'VIP status is reviewed quarterly based on activity.',
    ],
  },
};

export default function ActivityPage() {
  const [showInvitationBonus, setShowInvitationBonus] = useState(false);
  const [showBettingRebate, setShowBettingRebate] = useState(false);
  const [showSuperJackpot, setShowSuperJackpot] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [activePromo, setActivePromo] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full max-w-[420px] sm:max-w-[480px] md:max-w-[540px] lg:max-w-[600px] mx-auto pb-28"
      style={{ background: '#FAF5E9', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Modals */}
      {showInvitationBonus && <InvitationBonusModal onClose={() => setShowInvitationBonus(false)} />}
      {showBettingRebate && <BettingRebateModal onClose={() => setShowBettingRebate(false)} />}
      {showSuperJackpot && <SuperJackpotModal onClose={() => setShowSuperJackpot(false)} />}
      {showGift && <GiftModal onClose={() => setShowGift(false)} />}
      {showAttendance && <AttendanceBonusModal onClose={() => setShowAttendance(false)} />}
      {activePromo && PROMO_CONFIGS[activePromo] && (
        <PromoModal onClose={() => setActivePromo(null)} {...PROMO_CONFIGS[activePromo]} />
      )}

      {/* Header */}
      <div
        className="sticky top-0 z-40 px-4 py-3"
        style={{ background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)' }}
      >
        <div className="flex items-center justify-center gap-2">
          <Crown size={22} color="#FF4444" fill="#FF4444" />
          <span
            className="text-xl font-black tracking-widest"
            style={{ color: '#FF4444', textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}
          >
            𝐓𝐞𝐜𝐡𝐢𝐞⁴⁰⁴
          </span>
          <Crown size={22} color="#FF4444" fill="#FF4444" />
        </div>
      </div>

      {/* Bonus Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-3 mt-3 rounded-2xl p-4"
        style={{ background: '#fff', border: '1px solid #f0e0c0', boxShadow: '0 2px 12px rgba(212,175,55,0.1)' }}
      >
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="text-xs font-medium" style={{ color: '#888' }}>Today&apos;s bonus</div>
            <div className="text-xl font-black mt-0.5" style={{ color: '#C8102E' }}>RS0.00</div>
          </div>
          <button
            className="px-4 py-1.5 rounded-full text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #C8102E, #F5D060)', color: '#fff', border: 'none' }}
          >
            Bonus details
          </button>
          <div className="text-center flex-1">
            <div className="text-xs font-medium" style={{ color: '#888' }}>Total bonus</div>
            <div className="text-xl font-black mt-0.5" style={{ color: '#C8102E' }}>RS0.00</div>
          </div>
        </div>
      </motion.div>

      {/* Quick Action Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-3 mt-4 p-3 rounded-2xl grid grid-cols-4 gap-4 justify-items-center"
        style={{ background: '#fff', border: '1px solid #f0e0c0' }}
      >
        {quickActions?.map((action) => (
          <motion.button
            key={action?.key}
            variants={itemVariants}
            whileHover={{ scale: 1.08, y: -4 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="flex flex-col items-center gap-1.5"
            onClick={
              action?.key === 'qa-invitation'
                ? () => setShowInvitationBonus(true)
                : action?.key === 'qa-rebate'
                ? () => setShowBettingRebate(true)
                : action?.key === 'qa-jackpot'
                ? () => setShowSuperJackpot(true)
                : action?.key === 'qa-wheel'
                ? () => navigate('/spin-wheel')
                : undefined
            }
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg"
              style={{ background: action?.gradient }}
            >
              {action?.icon}
            </div>
            <span className="text-[10px] text-center text-gray-600 font-medium leading-tight whitespace-pre-line">
              {action?.label}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Activity Banners */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-3 mt-5 space-y-3"
      >
        {/* Half-width row */}
        <div className="grid grid-cols-2 gap-3">
          {halfBanners?.map((banner) => (
            <motion.button
              key={banner?.key}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.2)' }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              className="rounded-xl overflow-hidden text-left"
              style={{
                background: banner?.gradient,
                border: banner?.border ? `1.5px solid ${banner?.border}` : '1px solid #e0e0e0',
                minHeight: 100,
              }}
              onClick={banner?.key === 'banner-gifts' ? () => setShowGift(true) : banner?.key === 'banner-attendance' ? () => setShowAttendance(true) : undefined}
            >
              <div className="p-3 h-full flex flex-col justify-between">
                <div>
                  {banner?.tag && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: `${banner?.tagColor ?? 'rgba(255,255,255,0.2)'}22`,
                        color: banner?.tagColor ?? '#ffffff',
                        border: `1px solid ${banner?.tagColor ?? 'rgba(255,255,255,0.4)'}`,
                      }}
                    >
                      {banner?.tag}
                    </span>
                  )}
                  <div className="text-2xl mt-1">{banner?.icon}</div>
                </div>
                <div>
                  <div className="text-white font-bold text-sm leading-tight whitespace-pre-line">{banner?.title}</div>
                  <div className="text-gray-300 text-[11px] mt-0.5">{banner?.subtitle}</div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Full-width banners */}
        {fullBanners?.map((banner) => (
          <motion.button
            key={banner?.key}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -3, boxShadow: '0 10px 28px rgba(0,0,0,0.2)' }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="w-full rounded-xl overflow-hidden text-left"
            style={{
              background: banner?.gradient,
              border: '1px solid #e0e0e0',
              minHeight: 90,
            }}
            onClick={
              banner?.key === 'banner-invitation' ? () => setShowInvitationBonus(true)
              : banner?.key === 'banner-gifts' ? () => setShowGift(true)
              : banner?.key === 'banner-recharge' ? () => setActivePromo('rechargeBonus')
              : banner?.key === 'banner-first-second' ? () => setActivePromo('firstSecondRecharge')
              : banner?.key === 'banner-lucky10' ? () => setActivePromo('lucky10')
              : banner?.key === 'banner-luckyspin' ? () => setActivePromo('luckySpin')
              : banner?.key === 'banner-winstreak' ? () => setActivePromo('winStreak')
              : banner?.key === 'banner-aviator' ? () => setActivePromo('aviatorBonus')
              : banner?.key === 'banner-vip' ? () => setActivePromo('vipUpgrade')
              : undefined
            }
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  {banner?.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-bold text-sm">{banner?.title}</span>
                    {banner?.tag && (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          background: `${banner?.tagColor}22`,
                          color: banner?.tagColor,
                          border: `1px solid ${banner?.tagColor}`,
                        }}
                      >
                        {banner?.tag}
                      </span>
                    )}
                  </div>
                  <div className="text-gray-300 text-[11px] mt-0.5">{banner?.subtitle}</div>
                  {banner?.detail && (
                    <div
                      className={`mt-1 font-bold ${banner?.bigText ? 'text-sm' : 'text-[11px]'}`}
                      style={{ color: banner?.tagColor || '#FF4444' }}
                    >
                      {banner?.detail}
                    </div>
                  )}
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-400 flex-shrink-0 ml-2" />
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* No More */}
      <div className="flex items-center justify-center gap-3 py-6 mx-3">
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #C8102E)' }} />
        <span className="text-xs font-medium" style={{ color: '#C8102E' }}>No more</span>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, #C8102E)' }} />
      </div>
      <BottomNav />
    </div>
  );
}