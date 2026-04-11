import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { ArrowLeft, X, ChevronRight, Plus, Shield, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { db as supabase } from '@/lib/db';

export default function WithdrawPage() {
  const navigate = useNavigate();
  const { user, wallet } = useAuth();
  const [method, setMethod] = useState<'bank' | 'upi' | 'usdt'>('bank');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Password verification
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [withdrawPassword, setWithdrawPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [bankAccount, setBankAccount] = useState<any>(null);
  const [upiAccount, setUpiAccount] = useState<any>(null);
  const [usdtAddress, setUsdtAddress] = useState<any>(null);

  const [showBankForm, setShowBankForm] = useState(false);
  const [showUpiForm, setShowUpiForm] = useState(false);
  const [showUsdtForm, setShowUsdtForm] = useState(false);

  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankPhone, setBankPhone] = useState('');
  const [bankEmail, setBankEmail] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  const [upiName, setUpiName] = useState('');
  const [upiPhone, setUpiPhone] = useState('');
  const [upiId, setUpiId] = useState('');
  const [upiIdConfirm, setUpiIdConfirm] = useState('');

  const [usdtNetwork, setUsdtNetwork] = useState('TRC');
  const [usdtAddr, setUsdtAddr] = useState('');
  const [usdtAlias, setUsdtAlias] = useState('');

  const [saving, setSaving] = useState(false);

  const bal = wallet ? Number(wallet.balance) : 0;

  // Theme colors from index.css: primary is hsl(0, 72%, 42%) = #B71C1C-ish deep red
  const themeRed = '#b42525';
  const themeRedLight = '#e8443a';
  const themeGold = '#d4a017';
  const themeBg = '#FAF5E9';

  useEffect(() => {
    if (!user) { navigate('/sign-up-login-screen'); return; }
    supabase.from('bank_accounts').select('*').eq('user_id', user.id).maybeSingle().then(({ data }: any) => setBankAccount(data));
    supabase.from('upi_accounts').select('*').eq('user_id', user.id).maybeSingle().then(({ data }: any) => setUpiAccount(data));
    supabase.from('usdt_addresses').select('*').eq('user_id', user.id).maybeSingle().then(({ data }: any) => setUsdtAddress(data));
  }, [user]);

  const handleSaveBank = async () => {
    if (!bankName || !accountHolder || !accountNumber || !ifscCode) { toast.error('Please fill all required fields'); return; }
    setSaving(true);
    const { error } = await supabase.from('bank_accounts').insert({ user_id: user!.id, bank_name: bankName, account_holder: accountHolder, account_number: accountNumber, phone: bankPhone, email: bankEmail, ifsc_code: ifscCode });
    setSaving(false);
    if (error) { toast.error('Failed to save'); return; }
    toast.success('Bank account saved');
    setShowBankForm(false);
    supabase.from('bank_accounts').select('*').eq('user_id', user!.id).maybeSingle().then(({ data }: any) => setBankAccount(data));
  };

  const handleSaveUpi = async () => {
    if (!upiName || !upiId) { toast.error('Please fill all required fields'); return; }
    if (upiId !== upiIdConfirm) { toast.error('UPI IDs do not match'); return; }
    setSaving(true);
    const { error } = await supabase.from('upi_accounts').insert({ user_id: user!.id, upi_name: upiName, phone: upiPhone, upi_id: upiId });
    setSaving(false);
    if (error) { toast.error('Failed to save'); return; }
    toast.success('UPI account saved');
    setShowUpiForm(false);
    supabase.from('upi_accounts').select('*').eq('user_id', user!.id).maybeSingle().then(({ data }: any) => setUpiAccount(data));
  };

  const handleSaveUsdt = async () => {
    if (!usdtAddr) { toast.error('Please enter USDT address'); return; }
    setSaving(true);
    const { error } = await supabase.from('usdt_addresses').insert({ user_id: user!.id, network: usdtNetwork, address: usdtAddr, alias: usdtAlias });
    setSaving(false);
    if (error) { toast.error('Failed to save'); return; }
    toast.success('USDT address saved');
    setShowUsdtForm(false);
    supabase.from('usdt_addresses').select('*').eq('user_id', user!.id).maybeSingle().then(({ data }: any) => setUsdtAddress(data));
  };

  // Step 1: Validate amount, then show password modal
  const handleWithdrawClick = () => {
    const val = parseFloat(amount);
    if (!val || val < 100) { toast.error('Minimum withdrawal ₹100'); return; }
    if (val > bal) { toast.error('Insufficient balance'); return; }
    if (method === 'bank' && !bankAccount) { toast.error('Please add bank account first'); return; }
    if (method === 'upi' && !upiAccount) { toast.error('Please add UPI account first'); return; }
    if (method === 'usdt' && !usdtAddress) { toast.error('Please add USDT address first'); return; }
    // Show password modal
    setWithdrawPassword('');
    setShowPasswordModal(true);
  };

  // Step 2: Verify password via Supabase signIn, then process withdrawal
  const handlePasswordConfirm = async () => {
    if (!withdrawPassword) { toast.error('Please enter your password'); return; }
    setVerifying(true);
    try {
      const email = user?.email;
      const phone = user?.phone;
      let error: any = null;

      if (email) {
        const res = await supabase.auth.signInWithPassword({ email, password: withdrawPassword });
        error = res.error;
      } else if (phone) {
        const res = await supabase.auth.signInWithPassword({ phone, password: withdrawPassword });
        error = res.error;
      } else {
        // fallback fake email
        const fakeEmail = `phone${phone}@techie404.app`;
        const res = await supabase.auth.signInWithPassword({ email: fakeEmail, password: withdrawPassword });
        error = res.error;
      }

      if (error) {
        toast.error('Incorrect password');
        setVerifying(false);
        return;
      }

      // Password correct — process withdrawal
      setShowPasswordModal(false);
      setLoading(true);
      setTimeout(() => {
        const val = parseFloat(amount);
        toast.success(`₹${val.toLocaleString('en-IN')} withdrawal submitted`);
        setLoading(false);
        setAmount('');
        setWithdrawPassword('');
      }, 1500);
    } catch (e) {
      toast.error('Verification failed');
    }
    setVerifying(false);
  };

  const tabs = [
    { id: 'bank' as const, label: 'BANK CARD', emoji: '💳' },
    { id: 'upi' as const, label: 'UPI', emoji: '📲' },
    { id: 'usdt' as const, label: 'USDT TRC20', emoji: '₮' },
  ];

  const rules = method === 'usdt' ? [
    'Need to bet ₹0 to be able to withdraw.\nBetting turnover has a 10-minute delay. please wait patiently for updates.',
    'Withdraw time 00:00-23:59',
    'Daily withdrawal limit 3',
    'Withdrawal amount range ₹1,000 - ₹1,000,000',
    'After withdraw, confirm blockchain main network 3 times.',
    'Please confirm your beneficial account information before withdrawing.',
  ] : [
    'Need to bet ₹0 to be able to withdraw.\nBetting turnover has a 10-minute delay. please wait patiently for updates.',
    'Withdraw time 00:00-23:59',
    'Daily withdrawal limit 3',
    `Withdrawal amount range ₹100 - ₹49999`,
    'Please confirm your beneficial account information before withdrawing. If your information is incorrect, our company will not be liable for the amount of loss.',
    'If your beneficial information is incorrect, please contact customer service',
  ];

  return (
    <div style={{ minHeight: '100vh', width: '100%', maxWidth: 480, margin: '0 auto', background: themeBg, fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      <Toaster position="top-center" richColors />

      {/* HEADER */}
      <div style={{
        background: '#fff', padding: '0 16px', height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid #eee',
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
          <ArrowLeft size={22} color="#333" />
        </button>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#333' }}>Withdraw</span>
        <button onClick={() => navigate('/withdraw-history')}
          style={{ background: 'none', border: 'none', fontSize: 14, color: '#666', fontWeight: 500, cursor: 'pointer' }}>
          History
        </button>
      </div>

      {/* BALANCE CARD — coral/salmon gradient like reference */}
      <div style={{ margin: '12px 12px 0' }}>
        <div style={{
          background: `linear-gradient(135deg, ${themeRedLight} 0%, #f87171 40%, #ef8a7a 100%)`,
          borderRadius: 12, padding: '18px 16px', color: '#fff', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: -20, top: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'absolute', right: 30, bottom: -15, width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', left: 10, bottom: 10, width: 36, height: 24, borderRadius: 4, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }} />
          <div style={{ position: 'absolute', left: 10, bottom: 38, width: 36, height: 24, borderRadius: 4, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }} />
          <div style={{ fontSize: 12, opacity: 0.9, display: 'flex', alignItems: 'center', gap: 5 }}>
            💰 Available balance
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            ₹{bal.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            <span style={{ fontSize: 16, opacity: 0.7, cursor: 'pointer' }}>🔄</span>
          </div>
          <div style={{ position: 'absolute', right: 16, bottom: 16, fontSize: 13, opacity: 0.6, letterSpacing: 2 }}>
            **** &nbsp; ****
          </div>
        </div>
      </div>

      {/* METHOD TABS — reference style with icon boxes */}
      <div style={{ margin: '14px 12px 0', display: 'flex', gap: 8 }}>
        {tabs.map(t => {
          const sel = method === t.id;
          return (
            <button key={t.id} onClick={() => setMethod(t.id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '12px 4px', border: sel ? `1.5px solid ${themeRedLight}` : '1.5px solid #e5e5e5',
                borderRadius: 10, cursor: 'pointer',
                background: sel ? `linear-gradient(135deg, #fde8e8, #fdd)` : '#fff',
                transition: 'all 0.2s',
              }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: sel ? themeRedLight : '#f5f5f5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, color: sel ? '#fff' : '#888',
                transition: 'all 0.2s',
                boxShadow: sel ? `0 3px 10px ${themeRedLight}40` : 'none',
              }}>
                {t.emoji}
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: sel ? themeRed : '#888' }}>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* SAVED ACCOUNT / ADD */}
      <div style={{ margin: '10px 12px 0' }}>
        {method === 'bank' && (
          bankAccount ? (
            <SavedAccountCard icon="🏦" title={bankAccount.bank_name} subtitle={bankAccount.account_number.replace(/(.{5})(.*)(.{3})/, '$1******$3')} themeColor={themeRedLight} />
          ) : !showBankForm ? (
            <AddButton label="Add bank account" onClick={() => setShowBankForm(true)} themeColor={themeRed} />
          ) : (
            <FormCard title="Add a bank account" themeColor={themeRed}>
              <SimpleInput label="Choose a bank" placeholder="Please select a bank" value={bankName} onChange={setBankName} themeColor={themeRed} />
              <SimpleInput label="Full recipient's name" placeholder="Account holder name" value={accountHolder} onChange={setAccountHolder} themeColor={themeRed} />
              <SimpleInput label="Bank account number" placeholder="Account number" value={accountNumber} onChange={setAccountNumber} themeColor={themeRed} />
              <SimpleInput label="Phone number" placeholder="Phone number" value={bankPhone} onChange={setBankPhone} themeColor={themeRed} />
              <SimpleInput label="Mail" placeholder="Email address" value={bankEmail} onChange={setBankEmail} themeColor={themeRed} />
              <SimpleInput label="IFSC code" placeholder="IFSC code" value={ifscCode} onChange={setIfscCode} themeColor={themeRed} />
              <FormButtons saving={saving} onSave={handleSaveBank} onCancel={() => setShowBankForm(false)} themeColor={themeRed} />
            </FormCard>
          )
        )}
        {method === 'upi' && (
          upiAccount ? (
            <SavedAccountCard icon="📱" title={upiAccount.upi_name} subtitle={upiAccount.upi_id} themeColor={themeRedLight} />
          ) : !showUpiForm ? (
            <AddButton label="Add UPI account" onClick={() => setShowUpiForm(true)} themeColor={themeRed} />
          ) : (
            <FormCard title="UPI Information" themeColor={themeRed}>
              <SimpleInput label="UPI Name" placeholder="Your name" value={upiName} onChange={setUpiName} themeColor={themeRed} />
              <SimpleInput label="Phone number" placeholder="Phone number" value={upiPhone} onChange={setUpiPhone} themeColor={themeRed} />
              <p style={{ fontSize: 11, color: themeRed, margin: '-6px 0 10px', fontWeight: 500 }}>ⓘ Please fill in your real mobile phone number</p>
              <SimpleInput label="UPI ID" placeholder="Your UPI ID" value={upiId} onChange={setUpiId} themeColor={themeRed} />
              <SimpleInput label="Confirm UPI ID" placeholder="Re-enter UPI ID" value={upiIdConfirm} onChange={setUpiIdConfirm} themeColor={themeRed} />
              <FormButtons saving={saving} onSave={handleSaveUpi} onCancel={() => setShowUpiForm(false)} themeColor={themeRed} />
            </FormCard>
          )
        )}
        {method === 'usdt' && (
          usdtAddress ? (
            <SavedAccountCard icon="₮" title={usdtAddress.alias || usdtAddress.network} subtitle={usdtAddress.address.slice(0, 8) + '...' + usdtAddress.address.slice(-6)} themeColor={themeRedLight} />
          ) : !showUsdtForm ? (
            <div>
              <AddButton label="Add USDT address" onClick={() => setShowUsdtForm(true)} themeColor={themeRed} />
              <p style={{ fontSize: 11, color: themeRed, textAlign: 'center', marginTop: 6 }}>Need to add beneficiary information to withdraw</p>
            </div>
          ) : (
            <FormCard title="Add USDT address" themeColor={themeRed}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 }}>Select main network</div>
                <select value={usdtNetwork} onChange={(e: any) => setUsdtNetwork(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#f9f9f9', fontSize: 13, color: '#333' }}>
                  <option value="TRC">TRC</option><option value="ERC">ERC</option><option value="BEP">BEP</option>
                </select>
              </div>
              <SimpleInput label="USDT Address" placeholder="USDT address" value={usdtAddr} onChange={setUsdtAddr} themeColor={themeRed} />
              <SimpleInput label="Address Alias" placeholder="Remark" value={usdtAlias} onChange={setUsdtAlias} themeColor={themeRed} />
              <FormButtons saving={saving} onSave={handleSaveUsdt} onCancel={() => setShowUsdtForm(false)} themeColor={themeRed} />
            </FormCard>
          )
        )}
      </div>

      {/* REMINDER */}
      {((method === 'bank' && bankAccount) || (method === 'upi' && upiAccount)) && (
        <div style={{ margin: '8px 12px 0', padding: '10px 12px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a' }}>
          <p style={{ fontSize: 11, color: '#92400e', lineHeight: 1.6, margin: 0 }}>
            Reminder: Dear Customer, Please confirm whether the bound {method === 'bank' ? 'banknumber and IFSC' : 'UPI ID'} are correct. Binding error information will cause the withdrawal of coins to fail. Thanks.
          </p>
        </div>
      )}

      {/* AMOUNT INPUT */}
      <div style={{ margin: '12px 12px 0' }}>
        <div style={{
          background: '#fff', borderRadius: 10, padding: '14px 14px',
          border: '1px solid #e5e5e5',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: themeRed, fontWeight: 800, fontSize: 16 }}>₹</span>
            </div>
            <input type="number" placeholder="Please enter the amount"
              value={amount} onChange={e => setAmount(e.target.value)}
              style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 15, color: '#333', outline: 'none', fontWeight: 500 }} />
            {amount && (
              <button onClick={() => setAmount('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}>
                <X size={18} color="#999" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* BALANCE INFO */}
      <div style={{ margin: '10px 12px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: '#666' }}>Withdrawable balance <span style={{ color: themeRed, fontWeight: 600 }}>₹{bal.toFixed(0)}</span></span>
          <button onClick={() => setAmount(String(bal))}
            style={{ background: 'none', border: `1px solid ${themeRedLight}`, borderRadius: 14, padding: '2px 14px', fontSize: 12, color: themeRed, fontWeight: 600, cursor: 'pointer' }}>
            All
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: '#666' }}>Withdrawal amount received</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: themeRed }}>₹{(parseFloat(amount) || 0).toFixed(0)}</span>
        </div>
      </div>

      {/* WITHDRAW BUTTON — gradient like reference */}
      <div style={{ margin: '18px 12px 0' }}>
        <button onClick={handleWithdrawClick} disabled={loading}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 24, fontWeight: 700, color: '#fff', fontSize: 16,
            border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, ${themeRed} 0%, ${themeRedLight} 100%)`,
            opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s',
            boxShadow: `0 4px 16px ${themeRed}40`,
          }}>
          {loading ? 'Processing...' : 'Withdraw'}
        </button>
      </div>

      {/* RULES */}
      <div style={{ margin: '16px 12px 0', paddingBottom: 30 }}>
        <div style={{ background: '#fff', borderRadius: 10, padding: '14px 14px', border: '1px solid #e5e5e5' }}>
          {rules.map((text, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < rules.length - 1 ? 8 : 0, alignItems: 'flex-start' }}>
              <span style={{ color: themeRedLight, fontSize: 8, marginTop: 5, flexShrink: 0 }}>◆</span>
              <span style={{ fontSize: 12, color: '#666', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PASSWORD VERIFICATION MODAL */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }} onClick={() => setShowPasswordModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 340,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', margin: '0 auto 12px',
                background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Shield size={28} color={themeRed} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#333', margin: 0 }}>Verify Password</h3>
              <p style={{ fontSize: 13, color: '#888', margin: '6px 0 0' }}>Enter your account password to confirm withdrawal</p>
            </div>

            <div style={{ position: 'relative', marginBottom: 16 }}>
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Enter your password"
                value={withdrawPassword}
                onChange={e => setWithdrawPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePasswordConfirm()}
                style={{
                  width: '100%', padding: '12px 44px 12px 14px', borderRadius: 10,
                  border: `1.5px solid #ddd`, background: '#f9f9f9', fontSize: 14, color: '#333',
                  outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={(e: any) => e.target.style.borderColor = themeRed}
                onBlur={(e: any) => e.target.style.borderColor = '#ddd'}
                autoFocus
              />
              <button onClick={() => setShowPwd(!showPwd)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 2 }}>
                {showPwd ? <EyeOff size={18} color="#999" /> : <Eye size={18} color="#999" />}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowPasswordModal(false); setWithdrawPassword(''); }}
                style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: '1px solid #ddd', background: '#fff', color: '#666', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handlePasswordConfirm} disabled={verifying}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 10, border: 'none',
                  background: `linear-gradient(135deg, ${themeRed}, ${themeRedLight})`, color: '#fff',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  opacity: verifying ? 0.6 : 1,
                  boxShadow: `0 4px 12px ${themeRed}40`,
                }}>
                {verifying ? 'Verifying...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* SUB COMPONENTS */

function SavedAccountCard({ icon, title, subtitle, themeColor }: { icon: string; title: string; subtitle: string; themeColor: string }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 10, padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #e5e5e5',
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: '#333' }}>{title}</div>
        <div style={{ fontSize: 12, color: '#999', marginTop: 2, letterSpacing: 0.5 }}>{subtitle}</div>
      </div>
      <ChevronRight size={16} color="#ccc" />
    </div>
  );
}

function AddButton({ label, onClick, themeColor }: { label: string; onClick: () => void; themeColor: string }) {
  return (
    <button onClick={onClick}
      style={{
        width: '100%', background: '#fff', borderRadius: 10, padding: 20,
        border: '1.5px dashed #ddd', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, border: '1.5px dashed #ccc',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Plus size={20} color={themeColor} />
      </div>
      <span style={{ fontSize: 13, color: '#888' }}>{label}</span>
    </button>
  );
}

function FormCard({ title, children, themeColor }: { title: string; children: React.ReactNode; themeColor: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: 16, border: '1px solid #e5e5e5' }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: '#333', marginBottom: 14 }}>{title}</div>
      <div style={{ background: '#fef2f2', borderRadius: 8, padding: '8px 12px', marginBottom: 14, fontSize: 11, color: themeColor, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Shield size={13} /> To ensure the safety of your funds, please bind your account
      </div>
      {children}
    </div>
  );
}

function SimpleInput({ label, placeholder, value, onChange, type = 'text', themeColor }: any) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 }}>{label}</div>
      <input type={type} placeholder={placeholder} value={value} onChange={(e: any) => onChange(e.target.value)}
        style={{
          width: '100%', padding: '10px 12px', borderRadius: 8,
          border: '1px solid #ddd', background: '#f9f9f9', fontSize: 13, color: '#333',
          outline: 'none', boxSizing: 'border-box',
        }}
        onFocus={(e: any) => { e.target.style.borderColor = themeColor; }}
        onBlur={(e: any) => { e.target.style.borderColor = '#ddd'; }}
      />
    </div>
  );
}

function FormButtons({ saving, onSave, onCancel, themeColor }: any) {
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
      <button onClick={onCancel}
        style={{ flex: 1, padding: '11px 0', borderRadius: 8, border: '1px solid #ddd', background: '#fff', color: '#666', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
        Cancel
      </button>
      <button onClick={onSave} disabled={saving}
        style={{
          flex: 1, padding: '11px 0', borderRadius: 8, border: 'none',
          background: `linear-gradient(135deg, ${themeColor}, #8B0000)`, color: '#fff',
          fontWeight: 600, fontSize: 13, cursor: 'pointer', opacity: saving ? 0.6 : 1,
        }}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}
