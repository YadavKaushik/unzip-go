import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Grid2X2, ChevronDown, CreditCard, Smartphone, CircleDollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { db as supabase } from '@/lib/db';

const paymentTabs = [
  { key: 'all', label: 'All', icon: <Grid2X2 size={16} /> },
  { key: 'BANK CARD', label: 'BANK CARD' },
  { key: 'UPI', label: 'UPI' },
  { key: 'USDT', label: 'USDT' },
];

export default function WithdrawHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    let query = supabase.from('transactions').select('*')
      .eq('user_id', user.id).eq('type', 'withdraw');
    if (activeTab !== 'all') {
      query = query.ilike('description', `%${activeTab}%`);
    }
    query.order('created_at', { ascending: false }).limit(50)
      .then(({ data }: any) => { setRecords(data || []); setLoading(false); });
  }, [user, activeTab]);

  if (!user) { navigate('/sign-up-login-screen'); return null; }

  const getStatusColor = (status: string) => {
    if (status === 'completed') return '#34be8b';
    if (status === 'processing') return '#3b82f6';
    if (status === 'failed') return '#f44336';
    return '#f59e0b';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'completed') return 'Complete';
    if (status === 'processing') return 'To be paid';
    if (status === 'failed') return 'Failed';
    return 'Pending';
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', maxWidth: 430, margin: '0 auto', background: '#f5f5f5', fontFamily: "'Plus Jakarta Sans', Bahnschrift, sans-serif", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: '#fff', position: 'sticky', top: 0, zIndex: 30, borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', height: 48 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer' }}>
            <ArrowLeft size={22} color="#333" />
          </button>
          <span style={{ color: '#333', fontWeight: 800, fontSize: 17 }}>Withdrawal history</span>
          <div style={{ width: 28 }} />
        </div>
      </div>

      {/* Payment Method Tabs */}
      <div style={{ padding: '12px 14px 0', background: '#fff' }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12 }}>
          {paymentTabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                background: activeTab === t.key
                  ? 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)'
                  : '#f0f0f0',
                color: activeTab === t.key ? '#fff' : '#666',
                boxShadow: activeTab === t.key ? '0 2px 8px rgba(200,16,46,0.3)' : 'none',
                transition: 'all 0.2s',
              }}>
              {t.icon && t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: 10, padding: '10px 14px', background: '#fff', borderBottom: '1px solid #eee' }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', borderRadius: 6, background: '#f5f5f5', fontSize: 13, color: '#999',
        }}>
          <span>All</span>
          <ChevronDown size={14} color="#999" />
        </div>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', borderRadius: 6, background: '#f5f5f5', fontSize: 13, color: '#999',
        }}>
          <span>Choose a date</span>
          <ChevronDown size={14} color="#999" />
        </div>
      </div>

      {/* Records */}
      <div style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} style={{ background: '#fff', borderRadius: 10, padding: 16, height: 150 }}>
              <div style={{ height: 16, background: '#eee', borderRadius: 4, width: '30%', marginBottom: 14 }} />
              <div style={{ height: 12, background: '#f5f5f5', borderRadius: 4, width: '80%', marginBottom: 10 }} />
              <div style={{ height: 12, background: '#f5f5f5', borderRadius: 4, width: '60%', marginBottom: 10 }} />
              <div style={{ height: 12, background: '#f5f5f5', borderRadius: 4, width: '70%' }} />
            </div>
          ))
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>📭</div>
            <p style={{ fontSize: 13, color: '#999' }}>No withdrawal records yet</p>
          </div>
        ) : (
          <>
            {records.map(txn => {
              const d = new Date(txn.created_at);
              const statusColor = getStatusColor(txn.status);
              const statusLabel = getStatusLabel(txn.status);
              const orderId = `WD${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}${txn.id.replace(/-/g,'').slice(0,16)}`;

              return (
                <div key={txn.id} style={{ background: '#fff', borderRadius: 10, overflow: 'hidden' }}>
                  {/* Card Header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderBottom: '1px solid #f0f0f0',
                  }}>
                    <span style={{
                      background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)', color: '#fff', fontSize: 13, fontWeight: 700,
                      padding: '3px 14px', borderRadius: 5,
                    }}>
                      Withdraw
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: statusColor }}>{statusLabel}</span>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <Row label="Balance" value={`₹${Number(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} valueColor="#f5a623" bold />
                    <Row label="Type" value={txn.description || 'BANK CARD'} />
                    <Row label="Time" value={`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${d.toLocaleTimeString('en-IN', { hour12: false })}`} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: '#999' }}>Order number</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, color: '#666' }}>{orderId.slice(0, 28)}</span>
                        <button onClick={() => { navigator.clipboard.writeText(orderId); toast.success('Copied!'); }}
                          style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer' }}>
                          <Copy size={13} color="#999" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <p style={{ textAlign: 'center', fontSize: 13, color: '#ccc', padding: '16px 0' }}>— No more —</p>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, valueColor, bold }: { label: string; value: string; valueColor?: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: '#999' }}>{label}</span>
      <span style={{ fontSize: 13, color: valueColor || '#333', fontWeight: bold ? 700 : 400 }}>{value}</span>
    </div>
  );
}
