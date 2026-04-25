import React, { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { ArrowLeft, X, RotateCw, ChevronRight, Smartphone, QrCode, CreditCard, Coins, Wallet, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/* ── Data ── */
const TABS = [
  { id: 'upiapp', label: 'UPI-APP', Icon: Smartphone },
  { id: 'upiqr', label: 'UPI QR Code', Icon: QrCode },
  { id: 'paytm', label: 'Paytm×QR', Icon: CreditCard },
  { id: 'usdt', label: 'USDT BONUS', Icon: Coins },
];

const CH: Record<string, { id: string; name: string; min: number; max: string; bonus?: string }[]> = {
  upiapp: [
    { id: 'uupay', name: 'UuPay-App', min: 100, max: '20K' },
    { id: 'upipay-s', name: 'UpiPay-S', min: 100, max: '50K' },
    { id: 'upipay-app', name: 'UpiPay-App', min: 200, max: '50K' },
    { id: 'pi', name: 'PI', min: 100, max: '30K' },
  ],
  upiqr: [{ id: 'phonepe', name: 'Phonepe_QR', min: 100, max: '50K', bonus: '3% bonus' }],
  paytm: [{ id: 'paytmqr', name: 'Paytm_QR', min: 100, max: '50K', bonus: '3% bonus' }],
  usdt: [
    { id: 'tronpay', name: 'USDT - TRC20 (Tronpay)', min: 10, max: '100K', bonus: '3% bonus' },
    { id: 'upay', name: 'USDT - TRC20 (Upay)', min: 10, max: '100K' },
    { id: 'binance', name: 'BinancePay-USDT', min: 10, max: '50K', bonus: '3% bonus' },
    { id: 'tetherpay', name: 'USDT - TRC20 (Tetherpay)', min: 10, max: '50K', bonus: '3% bonus' },
  ],
};

const AMT: Record<string, number[]> = {
  upiapp: [100, 500, 1000, 3000, 5000, 10000],
  upiqr: [200, 300, 400, 500, 1000, 1500, 2000, 3000, 5000],
  paytm: [200, 500, 1000, 2000, 5000, 10000],
  usdt: [10, 30, 50, 100, 1000, 10000],
};

const INST = [
  'If the transfer time is up, please fill out the deposit form again.',
  'The transfer amount must match the order you created, otherwise the money cannot be credited successfully.',
  'If you transfer the wrong amount, our company will not be responsible for the lost amount!',
  'Note: do not cancel the deposit order after the money has been transferred.',
];

function f(a: number) { return a >= 1000 ? (a / 1000) + 'K' : String(a); }

/* ── Styles (from real app CSS variables) ── */
const S = {
  bg: '#f5f5f5',
  card: '#fff',
  mainGrad: 'linear-gradient(180deg, #8B0000 0%, #C8102E 100%)',
  text1: '#333',
  text2: '#999',
  text3: '#bbb',
  text4: '#fff',
  border: '#eaedf5',
  red: '#C8102E',
  green: '#49ce9b',
  cardHover: '#f9f9f9',
  inputBg: '#f7f8ff',
};

export default function DepositPage() {
  const nav = useNavigate();
  const { user, wallet } = useAuth();
  const [tab, setTab] = useState('upiapp');
  const [ch, setCh] = useState('uupay');
  const [amt, setAmt] = useState('');

  if (!user) { nav('/sign-up-login-screen'); return null; }
  const bal = wallet ? Number(wallet.balance) : 0;
  const chs = CH[tab] || [];
  const amts = AMT[tab] || [];
  const sel = chs.find(c => c.id === ch) || chs[0];
  const isU = tab === 'usdt';

  const deposit = () => {
    const v = parseFloat(amt);
    if (isU) {
      if (!v || v < 10) return toast.error('Minimum 10 USDT');
      toast.success(`${v} USDT deposit initiated via ${sel?.name}`);
    } else {
      if (!v || v < 100) return toast.error('Minimum ₹100');
      if (v > 50000) return toast.error('Maximum ₹50,000');
      toast.success(`₹${v.toLocaleString('en-IN')} deposit via ${sel?.name}`);
      // Track first deposit amount for First Deposit Bonus popup
      if (user?.id) {
        const key = `fdb_first_deposit_${user.id}`;
        const prev = Number(localStorage.getItem(key) || 0);
        if (v > prev) localStorage.setItem(key, String(v));
      }
    }
    setAmt('');
  };

  const sw = (id: string) => { setTab(id); setCh((CH[id]||[])[0]?.id||''); setAmt(''); };

  /* ── card style helper ── */
  const card = (mt = 10): React.CSSProperties => ({
    background: S.card, borderRadius: 10, padding: '14px 12px', marginTop: mt,
  });

  return (
    <div style={{ minHeight: '100vh', width: '100%', maxWidth: 430, margin: '0 auto', background: S.bg, fontFamily: "'Plus Jakarta Sans', Bahnschrift, sans-serif" }}>
      <Toaster position="top-center" richColors />

      {/* ═══ HEADER ═══ */}
      <div style={{ background: S.mainGrad, position: 'sticky', top: 0, zIndex: 30 }}>
        {/* nav bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', height: 44 }}>
          <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', padding: 4 }}>
            <ArrowLeft size={20} color="#fff" />
          </button>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>Deposit</span>
          <button onClick={() => nav('/deposit-history')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
            Deposit record
          </button>
        </div>

        {/* balance */}
        <div style={{ padding: '4px 12px 16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '12px 14px', backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Wallet size={14} color="rgba(255,255,255,0.6)" />
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600, letterSpacing: 1 }}>BALANCE</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#fff', fontSize: 26, fontWeight: 900, letterSpacing: -1 }}>₹{bal.toFixed(2)}</span>
              <button style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RotateCw size={11} color="#fff" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ BODY ═══ */}
      <div style={{ padding: '0 10px', paddingBottom: 80 }}>

        {/* ── Deposit not credited ── */}
        <div style={{ ...card(10), display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
          <span style={{ color: S.text2, fontSize: 12 }}>Deposit not credited?</span>
          <button onClick={() => nav('/deposit-history')} style={{ background: 'none', border: 'none', color: S.red, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
            Go and see <ChevronRight size={14} />
          </button>
        </div>

        {/* ── Payment Method Tabs (4 column grid like real app) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 12 }}>
          {TABS.map(t => {
            const a = tab === t.id;
            return (
              <button key={t.id} onClick={() => sw(t.id)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                borderRadius: 6, border: 'none', cursor: 'pointer', position: 'relative',
                height: 80,
                background: a ? S.mainGrad : S.card,
                color: a ? S.text4 : S.text2,
                boxShadow: a ? '0 3px 10px rgba(220,38,38,0.2)' : 'none',
                transition: 'all 0.15s',
              }}>
                {/* gift badge */}
                <div style={{
                  position: 'absolute', right: 0, top: 0,
                  background: a ? 'rgba(255,255,255,0.2)' : 'rgba(200,16,46,0.2)',
                  color: a ? '#fde68a' : '#ff6b6b',
                  fontSize: 8, fontWeight: 800, padding: '2px 5px',
                  borderRadius: '0 6px 0 6px',
                }}>+3%</div>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: a ? 'rgba(255,255,255,0.15)' : 'rgba(200,16,46,0.15)', marginBottom: 4,
                }}>
                  <t.Icon size={16} color={a ? '#fff' : '#C8102E'} strokeWidth={2} />
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, lineHeight: 1.2, textAlign: 'center' }}>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Select Channel ── */}
        <div style={card(10)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="#C8102E" opacity={0.2}/><path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#C8102E" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"/></svg>
            <span style={{ fontSize: 14, fontWeight: 700, color: S.text1 }}>Select channel</span>
            {chs.length > 2 && <span style={{ marginLeft: 'auto', fontSize: 10, color: S.text3 }}>view all ▾</span>}
          </div>

          {/* channel items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {chs.map(c => {
              const s = ch === c.id;
              return (
                <button key={c.id} onClick={() => setCh(c.id)} style={{
                  display: 'flex', flexDirection: 'column', gap: 2,
                  background: s ? S.mainGrad : S.inputBg,
                  borderRadius: 10, padding: '12px 14px', border: s ? 'none' : `1px solid ${S.border}`,
                  textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: s ? '#fff' : S.text1 }}>{c.name}</span>
                  <span style={{ fontSize: 10, color: s ? 'rgba(255,255,255,0.7)' : S.text2 }}>
                    Balance: {c.min} - {c.max}
                  </span>
                  {c.bonus && <span style={{ fontSize: 10, fontWeight: 700, color: s ? '#fde68a' : '#f59e0b' }}>{c.bonus}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Deposit Amount ── */}
        <div style={card(10)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#C8102E" opacity={0.15}/><path d="M12 6v12M8 10h8" stroke="#C8102E" strokeWidth={2} strokeLinecap="round"/></svg>
            <span style={{ fontSize: 14, fontWeight: 700, color: S.text1 }}>
              {isU ? 'Select amount of USDT' : 'Deposit amount'}
            </span>
          </div>

          {/* amount grid */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
            {amts.map(a => {
              const v = String(a);
              const s = amt === v;
              const w = `calc((100% - 20px) / 3)`;
              return (
                <button key={a} onClick={() => setAmt(v)} style={{
                  width: w, height: 44, borderRadius: 6, border: s ? 'none' : `1px solid ${S.border}`,
                  background: s ? S.mainGrad : S.card, color: s ? '#fff' : '#C8102E',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: 4, position: 'relative',
                  transition: 'all 0.15s',
                }}>
                  <span style={{ position: 'absolute', left: 6, fontSize: 14, color: s ? 'rgba(255,255,255,0.6)' : S.text3 }}>
                    {isU ? '' : '₹'}
                  </span>
                  {isU ? '' : ''}{f(a)}
                </button>
              );
            })}
          </div>

          {/* input */}
          <div style={{ display: 'flex', alignItems: 'center', height: 44, background: S.inputBg, borderRadius: 22, overflow: 'hidden', border: `1px solid ${S.border}` }}>
            <div style={{
              width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#C8102E', fontWeight: 900, fontSize: 18, position: 'relative',
            }}>
              {isU ? '₮' : '₹'}
              <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', height: 20, borderRight: `1px solid ${S.border}` }} />
            </div>
            <input type="number" inputMode="numeric"
              placeholder={isU ? `₹${sel?.min || 10} - ₹${sel?.max}` : `₹${sel?.min || 100}.00 - ₹50,000.00`}
              value={amt} onChange={e => setAmt(e.target.value)}
              style={{ flex: 1, height: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 14, fontWeight: 700, color: '#C8102E', paddingLeft: 10 }}
            />
            {amt && (
              <button onClick={() => setAmt('')} style={{ background: 'none', border: 'none', padding: '0 12px', cursor: 'pointer' }}>
                <X size={16} color="#bbb" />
              </button>
            )}
          </div>
        </div>

        {/* ── Recharge Instructions ── */}
        <div style={card(10)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="#C8102E" opacity={0.15}/><path d="M12 8v4M12 16h.01" stroke="#C8102E" strokeWidth={2.5} strokeLinecap="round"/></svg>
            <span style={{ fontSize: 14, fontWeight: 700, color: S.text1 }}>Deposit instructions</span>
          </div>
          <div style={{ border: `1px solid ${S.border}`, borderRadius: 10, padding: '10px 14px 16px 16px' }}>
            {INST.map((t, i) => (
              <div key={i} style={{ marginTop: i > 0 ? 10 : 0, display: 'flex', gap: 8 }}>
                <div style={{ width: 5, height: 5, borderRadius: 1, background: S.red, transform: 'rotate(45deg)', marginTop: 5, flexShrink: 0 }} />
                <span style={{ fontSize: 11, lineHeight: 1.7, color: S.text2 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Deposit History ── */}
        <div style={card(10)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Clock size={16} color="#C8102E" />
            <span style={{ fontSize: 14, fontWeight: 700, color: S.text1 }}>Deposit history</span>
          </div>
          <div style={{ textAlign: 'center', padding: '20px 0', color: S.text3, fontSize: 12 }}>
            No data
          </div>
        </div>
      </div>

      {/* ═══ FIXED BOTTOM ═══ */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }}>
        <div style={{
          maxWidth: 430, margin: '0 auto', background: S.card, padding: '10px 12px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.06)',
        }}>
          <div>
            <p style={{ fontSize: 10, color: S.text2, margin: 0 }}>Recharge Method:</p>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: S.text1, margin: 0 }}>{sel?.name}</h2>
          </div>
          <button onClick={deposit} style={{
            background: S.mainGrad, border: 'none', borderRadius: 25, color: '#fff',
            padding: '10px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}>
            Deposit
          </button>
        </div>
      </div>
    </div>
  );
}
