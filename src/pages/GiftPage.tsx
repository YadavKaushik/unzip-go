import React, { useState } from 'react';
import { ArrowLeft, Gift } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';

const themeRed = '#b42525';
const themeRedLight = '#e8443a';
const themeBg = '#FAF5E9';

export default function GiftPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const [giftCode, setGiftCode] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) { navigate('/sign-up-login-screen'); return null; }

  const handleReceive = () => {
    if (!giftCode.trim()) { toast.error(t('please_enter_gift_code')); return; }
    setLoading(true);
    setTimeout(() => {
      toast.error('Invalid gift code');
      setLoading(false);
    }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', maxWidth: 480, margin: '0 auto', background: themeBg, fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      <Toaster position="top-center" richColors />

      {/* Header */}
      <div style={{ background: '#fff', padding: '0 16px', height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid #eee' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
          <ArrowLeft size={22} color="#333" />
        </button>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#333' }}>{t('gift')}</span>
        <div style={{ width: 28 }} />
      </div>

      {/* Gift Banner */}
      <div style={{
        margin: '0', padding: '20px 20px', textAlign: 'center',
        background: `linear-gradient(135deg, ${themeRedLight}20 0%, ${themeRed}10 100%)`,
      }}>
        <img src="https://51gamen.com/assets/png/gift-a8f321e1.webp" alt="Gift" style={{ width: '60%', maxWidth: 200, height: 'auto', objectFit: 'contain' }} />
      </div>

      {/* Gift Form */}
      <div style={{ padding: '20px 16px' }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: themeRed, marginBottom: 4 }}>{t('hi')}</p>
        <p style={{ fontSize: 14, color: '#555', marginBottom: 20 }}>{t('we_have_gift')}</p>

        <p style={{ fontSize: 14, fontWeight: 600, color: themeRed, marginBottom: 10 }}>{t('enter_gift_code_below')}</p>

        <input
          type="text" placeholder={t('please_enter_gift_code')}
          value={giftCode} onChange={e => setGiftCode(e.target.value)}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 24, border: '1px solid #ddd',
            background: '#fff', fontSize: 14, color: '#333', outline: 'none', boxSizing: 'border-box',
          }}
          onFocus={(e: any) => e.target.style.borderColor = themeRed}
          onBlur={(e: any) => e.target.style.borderColor = '#ddd'}
        />

        <button onClick={handleReceive} disabled={loading}
          style={{
            width: '100%', marginTop: 16, padding: '14px 0', borderRadius: 24,
            border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16, color: '#fff',
            background: `linear-gradient(135deg, ${themeRed}, ${themeRedLight})`,
            opacity: loading ? 0.7 : 1,
            boxShadow: `0 4px 14px ${themeRed}40`,
          }}>
          {loading ? 'Processing...' : t('receive')}
        </button>
      </div>

      {/* History Section */}
      <div style={{ padding: '0 16px', marginTop: 10 }}>
        <div style={{
          background: '#fff', borderRadius: 10, padding: '16px', border: '1px solid #eee',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Gift size={16} color={themeRed} />
            <span style={{ fontWeight: 700, fontSize: 14, color: '#333' }}>{t('history')}</span>
          </div>

          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div style={{ opacity: 0.15, marginBottom: 12 }}>
              <svg width="80" height="65" viewBox="0 0 100 80" fill="none">
                <path d="M10 70 L30 40 L45 55 L65 25 L90 70Z" fill="#999" opacity="0.3"/>
                <rect x="35" y="20" width="20" height="30" rx="2" fill="#999" opacity="0.4"/>
                <circle cx="75" cy="20" r="8" fill="#999" opacity="0.2"/>
                <path d="M5 72 H95" stroke="#999" strokeWidth="1.5" opacity="0.3"/>
              </svg>
            </div>
            <p style={{ fontSize: 13, color: '#bbb' }}>{t('no_data')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
