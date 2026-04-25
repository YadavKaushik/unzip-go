import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { db as supabase } from '@/lib/db';
import { toast } from 'sonner';

/* Tier list — small to large for vertical scroll */
const TIERS = [
  { id: 8, deposit: 100,    bonus: 28 },
  { id: 7, deposit: 200,    bonus: 48 },
  { id: 6, deposit: 500,    bonus: 108 },
  { id: 5, deposit: 1000,   bonus: 188 },
  { id: 4, deposit: 5000,   bonus: 488 },
  { id: 3, deposit: 12000,  bonus: 1388 },
  { id: 2, deposit: 60000,  bonus: 5888 },
  { id: 1, deposit: 110000, bonus: 9999 },
];

const todayKey = () => new Date().toISOString().slice(0, 10);

export default function FirstDepositBonusPopup() {
  const nav = useNavigate();
  const { user, wallet, refreshWallet } = useAuth();
  const [open, setOpen] = useState(false);
  const [snooze, setSnooze] = useState(false);
  const [claimingId, setClaimingId] = useState<number | null>(null);

  const userId = user?.id;
  const claimedKey = userId ? `fdb_claimed_${userId}` : '';
  const snoozeKey = userId ? `fdb_snooze_${userId}` : '';
  const firstDepKey = userId ? `fdb_first_deposit_${userId}` : '';

  // First deposit amount — captured from localStorage (set on DepositPage submit)
  const firstDepositAmount = useMemo(() => {
    if (!userId) return 0;
    const v = localStorage.getItem(firstDepKey);
    return v ? Number(v) : 0;
  }, [userId, firstDepKey, open]);

  useEffect(() => {
    if (!userId) return;
    const claimed = localStorage.getItem(claimedKey) === '1';
    const snoozedToday = localStorage.getItem(snoozeKey) === todayKey();
    if (claimed || snoozedToday) return;
    // Show popup with small delay so dashboard renders first
    const t = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(t);
  }, [userId, claimedKey, snoozeKey]);

  if (!userId) return null;

  const close = () => {
    if (snooze) localStorage.setItem(snoozeKey, todayKey());
    setOpen(false);
  };

  const goDeposit = () => {
    setOpen(false);
    nav('/deposit');
  };

  const goActivity = () => {
    setOpen(false);
    nav('/activity-history');
  };

  const claim = async (tier: typeof TIERS[number]) => {
    if (firstDepositAmount < tier.deposit) {
      toast.error(`Deposit ₹${tier.deposit} first to claim this bonus`);
      return;
    }
    setClaimingId(tier.id);
    try {
      // Add bonus to wallet balance
      const currentBal = wallet ? Number(wallet.balance) : 0;
      const newBal = currentBal + tier.bonus;
      const { error } = await supabase
        .from('wallets')
        .update({ balance: newBal })
        .eq('user_id', userId);

      if (error) throw error;

      // Mark claimed forever
      localStorage.setItem(claimedKey, '1');
      await refreshWallet();
      toast.success(`+₹${tier.bonus.toFixed(2)} bonus credited!`);
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to claim bonus');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 360,
              background: '#fff', borderRadius: 18,
              overflow: 'hidden', position: 'relative',
              boxShadow: '0 25px 60px rgba(200,16,46,0.35)',
              fontFamily: "'Plus Jakarta Sans', Bahnschrift, sans-serif",
            }}
          >
            {/* Header */}
            <div style={{
              background: 'linear-gradient(160deg, #FF3A1C 0%, #C8102E 60%, #8B0000 100%)',
              padding: '18px 18px 26px',
              textAlign: 'center', position: 'relative',
              borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
            }}>
              {/* sparkle dots */}
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  top: 10 + Math.random() * 80,
                  left: 10 + Math.random() * 320,
                  width: 3, height: 3, borderRadius: '50%',
                  background: '#FFD86B', opacity: 0.7,
                  boxShadow: '0 0 6px #FFD86B',
                }} />
              ))}
              <div style={{
                display: 'inline-block',
                background: 'linear-gradient(90deg, #FFD86B, #F59E0B)',
                color: '#7a3a00', fontSize: 11, fontWeight: 900,
                letterSpacing: 1.5, padding: '4px 14px', borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}>BONUS</div>
              <h2 style={{
                color: '#fff', fontSize: 22, fontWeight: 900, margin: '10px 0 6px',
                textShadow: '0 2px 6px rgba(0,0,0,0.25)',
              }}>Extra first deposit bonus</h2>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, margin: '4px 0 8px',
              }}>
                <div style={{ width: 24, height: 1, background: 'rgba(255,216,107,0.6)' }} />
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#FFD86B' }} />
                <div style={{ width: 24, height: 1, background: 'rgba(255,216,107,0.6)' }} />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.92)', fontSize: 12, margin: 0 }}>
                Each account can only receive rewards once
              </p>
            </div>

            {/* Scrollable Tier List */}
            <div style={{
              maxHeight: '50vh', overflowY: 'auto',
              padding: '12px 14px 6px',
              background: 'linear-gradient(180deg, #fff 0%, #fff5f5 100%)',
            }}>
              {TIERS.map((t) => {
                const progress = Math.min(firstDepositAmount, t.deposit);
                const pct = (progress / t.deposit) * 100;
                const eligible = firstDepositAmount >= t.deposit;
                return (
                  <div key={t.id} style={{
                    background: '#fff', borderRadius: 12,
                    padding: '12px 12px 10px',
                    marginBottom: 10,
                    boxShadow: '0 2px 8px rgba(200,16,46,0.08)',
                    border: '1px solid #ffe4e6',
                    borderLeft: '4px solid #C8102E',
                    position: 'relative',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      {/* tier number badge */}
                      <div style={{
                        flexShrink: 0,
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #FF3A1C, #C8102E)',
                        color: '#fff', fontWeight: 900, fontSize: 14,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 0 3px #fff, 0 0 0 4px #ffc1c7',
                      }}>{t.id}</div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#222' }}>first deposit</span>
                          <span style={{ fontSize: 18, fontWeight: 900, color: '#C8102E' }}>{t.deposit}</span>
                        </div>
                        <p style={{
                          fontSize: 10.5, color: '#888', margin: '2px 0 0', lineHeight: 1.4,
                        }}>
                          Deposit {t.deposit} for the first time in your account and you can receive {t.bonus}
                        </p>
                      </div>

                      {/* bonus pill */}
                      <div style={{
                        flexShrink: 0,
                        background: 'linear-gradient(180deg, #fff5d6, #ffe4a8)',
                        color: '#C8102E', fontWeight: 900, fontSize: 13,
                        padding: '6px 10px', borderRadius: 8,
                        whiteSpace: 'nowrap',
                      }}>+₹{t.bonus.toFixed(2)}</div>
                    </div>

                    {/* progress + button row */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10, marginTop: 10,
                    }}>
                      <div style={{
                        flex: 1, height: 8, borderRadius: 6,
                        background: '#ffe4e6', overflow: 'hidden', position: 'relative',
                      }}>
                        <div style={{
                          height: '100%', width: `${pct}%`,
                          background: 'linear-gradient(90deg, #FF6B7A, #C8102E)',
                          borderRadius: 6, transition: 'width 0.4s',
                        }} />
                        <span style={{
                          position: 'absolute', inset: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9, fontWeight: 700, color: '#666',
                        }}>{progress}/{t.deposit}</span>
                      </div>
                      <button
                        onClick={() => eligible ? claim(t) : goDeposit()}
                        disabled={claimingId === t.id}
                        style={{
                          background: eligible ? 'linear-gradient(180deg, #FF3A1C, #C8102E)' : '#fff',
                          color: eligible ? '#fff' : '#C8102E',
                          border: eligible ? 'none' : '1px solid #C8102E',
                          borderRadius: 16, padding: '6px 14px',
                          fontSize: 11, fontWeight: 800, cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          opacity: claimingId === t.id ? 0.6 : 1,
                        }}
                      >
                        {claimingId === t.id ? '...' : eligible ? 'Claim' : 'to Deposit'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{
              borderTop: '1px solid #f1f1f1',
              padding: '10px 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
              background: '#fff',
            }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                fontSize: 11, color: '#888', fontWeight: 600,
              }}>
                <input
                  type="checkbox"
                  checked={snooze}
                  onChange={(e) => setSnooze(e.target.checked)}
                  style={{
                    width: 14, height: 14, accentColor: '#C8102E', cursor: 'pointer',
                  }}
                />
                No more reminders today
              </label>
              <button
                onClick={goActivity}
                style={{
                  background: 'linear-gradient(180deg, #FF3A1C, #C8102E)',
                  border: 'none', color: '#fff',
                  padding: '8px 18px', borderRadius: 18,
                  fontSize: 12, fontWeight: 800, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                  boxShadow: '0 4px 12px rgba(200,16,46,0.4)',
                }}
              >
                activity <ChevronRight size={14} />
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={close}
              style={{
                position: 'absolute', top: 10, right: 10,
                background: 'rgba(0,0,0,0.25)', border: 'none',
                width: 26, height: 26, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff',
              }}
            >
              <X size={14} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
