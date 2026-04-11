import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ChevronDown, Copy } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { db as supabase } from '@/lib/db';

const ALL_TYPES = [
  { type: -1, typeName: 'All' },
  { type: 0, typeName: 'Bet amount reduced' },
  { type: 1, typeName: 'Agency commission' },
  { type: 2, typeName: 'Jackpot increase' },
  { type: 3, typeName: 'Red envelope' },
  { type: 4, typeName: 'Recharge increase' },
  { type: 5, typeName: 'Withdrawal reduction' },
  { type: 6, typeName: 'Cash back' },
  { type: 7, typeName: 'Daily check-in' },
  { type: 8, typeName: 'Agent red envelope recharge' },
  { type: 9, typeName: 'Withdrawal rejected' },
  { type: 10, typeName: 'Recharge gift' },
  { type: 11, typeName: 'Manual recharge' },
  { type: 12, typeName: 'Sign up to send money' },
  { type: 13, typeName: 'Bonus recharge' },
  { type: 14, typeName: 'First full gift' },
  { type: 15, typeName: 'First charge rebate' },
  { type: 16, typeName: 'Investment and financial management' },
  { type: 17, typeName: 'Financial income' },
  { type: 18, typeName: 'Financial principal' },
  { type: 19, typeName: 'Redemption principal' },
  { type: 20, typeName: 'Invite bonus' },
  { type: 21, typeName: 'Game transfer in' },
  { type: 22, typeName: 'Game transfer out' },
  { type: 24, typeName: 'Jackpot increase' },
  { type: 25, typeName: 'Card binding gift' },
  { type: 26, typeName: 'Game money refund' },
  { type: 27, typeName: 'Usdt recharge' },
  { type: 28, typeName: 'Betting rebate' },
  { type: 29, typeName: 'Vip member upgrade package' },
  { type: 30, typeName: 'Monthly rewards for VIP members' },
  { type: 31, typeName: 'Recharge Rewards for VIP Members' },
  { type: 100, typeName: 'Bonus deduction' },
  { type: 101, typeName: 'Manual withdrawal' },
  { type: 102, typeName: 'One key wash code reverse water' },
  { type: 103, typeName: 'Electronic Awards' },
  { type: 104, typeName: 'Bind Mobile Awards' },
  { type: 105, typeName: 'XOSO Issue Canceled' },
  { type: 106, typeName: 'Bind Email Awards' },
  { type: 107, typeName: 'Weekly Awards' },
  { type: 108, typeName: 'C2C Withdraw Awards' },
  { type: 109, typeName: 'C2C Withdraw' },
  { type: 110, typeName: 'C2C Withdraw Back' },
  { type: 111, typeName: 'C2C Recharge' },
  { type: 112, typeName: 'C2C Recharge Awards' },
  { type: 113, typeName: 'Newbie gift pack' },
  { type: 114, typeName: 'Tournament Rewards' },
  { type: 115, typeName: 'Return Awards' },
  { type: 116, typeName: 'New members first deposit bonus' },
  { type: 117, typeName: 'New members game bonus' },
  { type: 118, typeName: 'Daily Awards' },
  { type: 119, typeName: 'Turntable Awards' },
  { type: 122, typeName: 'Partner Rewards' },
  { type: 123, typeName: 'ARPay Cash Back' },
  { type: 124, typeName: 'Join TG Awards' },
  { type: 125, typeName: 'Recharge Replenishment' },
  { type: 126, typeName: 'Withdraw Awards' },
  { type: 130, typeName: 'Invitation Wheel Rewards' },
  { type: 131, typeName: 'Download APP recharge reward' },
  { type: 132, typeName: 'Recharge Level Rewards' },
  { type: 133, typeName: 'VIP Recharge Level Rewards' },
  { type: 134, typeName: 'Old User Return Recharge Rewards' },
];

const themeRed = '#b42525';
const themeRedLight = '#e8443a';
const themeGold = '#d4a017';
const themeBg = '#FAF5E9';

export default function TransactionHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(-1);
  const [selectedDate, setSelectedDate] = useState('');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    let query = supabase.from('transactions').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(50);

    // We filter client-side since description maps to type names
    query.then(({ data }: any) => {
      setRecords(data || []);
      setLoading(false);
    });
  }, [user]);

  const selectedTypeName = ALL_TYPES.find(t => t.type === selectedType)?.typeName || 'All';

  // Client-side filtering by type and date
  const filteredRecords = useMemo(() => {
    let filtered = records;

    if (selectedType !== -1) {
      const typeName = ALL_TYPES.find(t => t.type === selectedType)?.typeName || '';
      filtered = filtered.filter(r => {
        const desc = (r.description || '').toLowerCase();
        return desc.includes(typeName.toLowerCase());
      });
    }

    if (selectedDate) {
      filtered = filtered.filter(r => {
        const d = new Date(r.created_at);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return dateStr === selectedDate;
      });
    }

    return filtered;
  }, [records, selectedType, selectedDate]);

  if (!user) { navigate('/sign-up-login-screen'); return null; }

  return (
    <div style={{ minHeight: '100vh', width: '100%', maxWidth: 480, margin: '0 auto', background: themeBg, fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      <Toaster position="top-center" richColors />

      {/* Header */}
      <div style={{
        background: '#fff', padding: '0 16px', height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid #eee',
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
          <ArrowLeft size={22} color="#333" />
        </button>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#333' }}>Transaction history</span>
        <div style={{ width: 28 }} />
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 12px', background: themeBg }}>
        {/* Type dropdown */}
        <div style={{ flex: 1, position: 'relative' }}>
          <button onClick={() => { setShowTypeDropdown(!showTypeDropdown); setShowDatePicker(false); }}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd',
              background: '#fff', fontSize: 13, color: '#333', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedTypeName}</span>
            <ChevronDown size={14} color="#999" />
          </button>

          {showTypeDropdown && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 60,
              background: '#fff', borderRadius: 8, border: '1px solid #eee',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxHeight: 300, overflowY: 'auto',
              marginTop: 4,
            }}>
              {ALL_TYPES.map(t => (
                <button key={t.type} onClick={() => { setSelectedType(t.type); setShowTypeDropdown(false); }}
                  style={{
                    width: '100%', padding: '10px 14px', border: 'none', cursor: 'pointer',
                    background: selectedType === t.type ? '#fef2f2' : '#fff',
                    color: selectedType === t.type ? themeRed : '#333',
                    fontSize: 12, textAlign: 'left', fontWeight: selectedType === t.type ? 700 : 400,
                    borderBottom: '1px solid #f5f5f5',
                  }}>
                  {t.typeName}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date picker */}
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{
            width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd',
            background: '#fff', fontSize: 13, color: selectedDate ? '#333' : '#999', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'relative',
          }} onClick={() => setShowDatePicker(!showDatePicker)}>
            <span>{selectedDate || 'Choose a date'}</span>
            <ChevronDown size={14} color="#999" />
          </div>
          {showDatePicker && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 60,
              background: '#fff', borderRadius: 8, border: '1px solid #eee',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)', marginTop: 4, padding: 12,
            }}>
              <input type="date" value={selectedDate}
                onChange={e => { setSelectedDate(e.target.value); setShowDatePicker(false); }}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13 }}
              />
              {selectedDate && (
                <button onClick={() => { setSelectedDate(''); setShowDatePicker(false); }}
                  style={{ width: '100%', marginTop: 8, padding: '8px 0', borderRadius: 6, border: 'none', background: '#f5f5f5', color: '#666', fontSize: 12, cursor: 'pointer' }}>
                  Clear date
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Close dropdowns on outside click */}
      {(showTypeDropdown || showDatePicker) && (
        <div onClick={() => { setShowTypeDropdown(false); setShowDatePicker(false); }}
          style={{ position: 'fixed', inset: 0, zIndex: 55 }} />
      )}

      {/* Records */}
      <div style={{ padding: '0 12px', paddingBottom: 30 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: 8, padding: 16, height: 100 }}>
                <div style={{ height: 16, background: '#eee', borderRadius: 4, width: '50%', marginBottom: 12 }} />
                <div style={{ height: 12, background: '#f5f5f5', borderRadius: 4, width: '80%', marginBottom: 8 }} />
                <div style={{ height: 12, background: '#f5f5f5', borderRadius: 4, width: '60%' }} />
              </div>
            ))}
          </div>
        ) : filteredRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>📭</div>
            <p style={{ fontSize: 13, color: '#999' }}>No records</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {filteredRecords.map(txn => {
              const d = new Date(txn.created_at);
              const timeStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${d.toLocaleTimeString('en-IN', { hour12: false })}`;

              // Determine display name from description or type
              const displayType = txn.description || txn.type || 'Transaction';

              // Color: green for positive/deposit type, red for withdrawal/deduction type
              const isPositive = txn.type === 'deposit' || (txn.amount > 0 && txn.type !== 'withdraw');
              const amountColor = isPositive ? '#22a06b' : themeRed;

              return (
                <div key={txn.id} style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #eee' }}>
                  {/* Yellow header bar with type name */}
                  <div style={{
                    background: `linear-gradient(135deg, ${themeGold}, #e6b422)`,
                    padding: '10px 14px',
                    color: '#fff', fontWeight: 700, fontSize: 13,
                  }}>
                    {displayType}
                  </div>

                  {/* Details */}
                  <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Row label="Detail" value={displayType} />
                    <Row label="Time" value={timeStr} valueColor="#999" />
                    <Row label="Balance" value={`₹${Math.abs(Number(txn.amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} valueColor={amountColor} bold />
                  </div>
                </div>
              );
            })}

            <p style={{ textAlign: 'center', fontSize: 12, color: '#999', padding: '16px 0' }}>No more</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, valueColor, bold }: { label: string; value: string; valueColor?: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f5f5f5', paddingBottom: 6 }}>
      <span style={{ fontSize: 12, color: '#888' }}>{label}</span>
      <span style={{ fontSize: 13, color: valueColor || '#333', fontWeight: bold ? 700 : 400 }}>{value}</span>
    </div>
  );
}
