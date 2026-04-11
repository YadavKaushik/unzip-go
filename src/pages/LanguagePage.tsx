import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n, type Lang } from '@/hooks/useI18n';

const themeBg = '#FAF5E9';
const themeRed = '#b42525';

export default function LanguagePage() {
  const navigate = useNavigate();
  const { lang, setLang, languages, t } = useI18n();

  const langKeys = Object.keys(languages) as Lang[];

  return (
    <div style={{ minHeight: '100vh', width: '100%', maxWidth: 480, margin: '0 auto', background: themeBg, fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '0 16px', height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid #eee' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
          <ArrowLeft size={22} color="#333" />
        </button>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#333' }}>{t('language')}</span>
        <div style={{ width: 28 }} />
      </div>

      {/* Language Options */}
      <div style={{ padding: '10px 12px' }}>
        {langKeys.map(key => {
          const sel = lang === key;
          const info = languages[key];
          return (
            <button key={key} onClick={() => setLang(key)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 16px', background: '#fff', border: 'none', cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0',
                borderRadius: key === langKeys[0] ? '10px 10px 0 0' : key === langKeys[langKeys.length - 1] ? '0 0 10px 10px' : 0,
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 22 }}>{info.flag}</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: sel ? themeRed : '#333' }}>{info.name}</span>
              </div>
              {sel ? (
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: themeRed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={14} color="#fff" />
                </div>
              ) : (
                <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid #ddd' }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
