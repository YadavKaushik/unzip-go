import React, { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { ChevronRight, Copy, Check, Search, ChevronDown, ArrowLeft, Users, DollarSign, ScrollText, Headphones, BadgePercent, Gift, QrCode, Download } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';

/* ── Red/Cream Theme (matching game UI) ── */
const pageBg = '#FAF5E9';
const cardBg = '#FFFFFF';
const cardBorder = 'rgba(200,16,46,0.12)';
const redPrimary = '#C8102E';
const redDark = '#8B0000';
const goldPrimary = '#D4AF37';
const goldLight = '#F5D060';
const redGradient = 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)';
const redGradientLight = 'linear-gradient(135deg, #C8102E 0%, #d4243c 100%)';
const headerGradient = 'linear-gradient(180deg, #C8102E 0%, #8B0000 60%, #6B0000 100%)';
const textDark = '#1a1a1a';
const textWhite = '#ffffff';
const textMuted = '#888888';
const greenAccent = '#22c55e';
const orangeAccent = '#e89a1c';
const textGold = '#D4AF37';
const redSubtle = 'rgba(200,16,46,0.05)';

const INVITATION_CODE = '552331597041';
const REFERRAL_LINK = `https://app.example.com/register?code=${INVITATION_CODE}`;

/* ── Sub-page header ── */
function SubPageHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{ background: redGradient, padding: '0 16px', height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
        <ArrowLeft size={22} color="#fff" />
      </button>
      <span style={{ fontWeight: 700, fontSize: 17, color: '#fff' }}>{title}</span>
      <div style={{ width: 28 }} />
    </div>
  );
}

/* ═══════════════════════════════════════════ */
/*  SUB-PAGES                                  */
/* ═══════════════════════════════════════════ */

function SubordinateDataPage({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [searchUID, setSearchUID] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  const sampleSubordinates = [
    { uid: '126840', level: 1, depositAmount: 0, commission: 0, time: '2026-04-06' },
    { uid: '126843', level: 1, depositAmount: 0, commission: 0, time: '2026-04-06' },
  ];

  return (
    <div className="fixed inset-0 z-50 max-w-[480px] mx-auto overflow-y-auto" style={{ background: pageBg }}>
      <SubPageHeader title={t('subordinate_data')} onClose={onClose} />
      <div style={{ padding: '12px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input type="text" placeholder={t('search_subordinate_uid')} value={searchUID} onChange={e => setSearchUID(e.target.value)}
            style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: cardBg, fontSize: 14, outline: 'none', color: textDark }} />
          <button style={{ width: 42, height: 42, borderRadius: 8, background: redGradient, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Search size={18} color="#000" />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, padding: '10px 12px', borderRadius: 8, background: cardBg, border: `1px solid ${cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: textDark }}>
            {t('all')} <ChevronDown size={14} color={textMuted} />
          </div>
          <div style={{ flex: 1, padding: '10px 12px', borderRadius: 8, background: cardBg, border: `1px solid ${cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: textDark }}>
            {filterDate} <ChevronDown size={14} color={textMuted} />
          </div>
        </div>
        <div style={{ background: redSubtle, borderRadius: 12, overflow: 'hidden', marginBottom: 16, border: `1px solid rgba(200,16,46,0.2)` }}>
          {[[{ label: t('deposit_number'), value: '0' }, { label: t('deposit_amount'), value: '0' }],
            [{ label: t('number_of_bettors'), value: '0' }, { label: t('total_bet'), value: '0' }],
            [{ label: t('first_deposit_people'), value: '0' }, { label: t('first_deposit_amount'), value: '0' }]
          ].map((row, ri) => (
            <div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              {row.map((s, ci) => (
                <div key={ci} style={{
                  padding: '14px 8px', textAlign: 'center',
                  borderRight: ci === 0 ? '1px solid rgba(200,16,46,0.15)' : 'none',
                  borderBottom: ri < 2 ? '1px solid rgba(200,16,46,0.15)' : 'none',
                }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: textDark }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: textMuted, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
        {sampleSubordinates.map((sub, i) => (
          <div key={i} style={{
            background: cardBg, borderRadius: 10, padding: '14px 16px', marginBottom: 10,
            border: `1px solid ${cardBorder}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${cardBorder}` }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: textDark }}>UID:{sub.uid}</span>
              <button onClick={() => { navigator.clipboard.writeText(sub.uid); toast.success('UID copied'); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                <Copy size={14} color={textMuted} />
              </button>
            </div>
            {[
              { label: 'Level', value: sub.level.toString() },
              { label: t('deposit_amount'), value: sub.depositAmount.toString(), hl: true },
              { label: t('commission_detail'), value: sub.commission.toString(), hl: true },
              { label: 'Time', value: sub.time },
            ].map((row, ri) => (
              <div key={ri} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                <span style={{ color: textMuted }}>{row.label}</span>
                <span style={{ color: row.hl ? greenAccent : textWhite, fontWeight: row.hl ? 600 : 400 }}>{row.value}</span>
              </div>
            ))}
          </div>
        ))}
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ fontSize: 13, color: textMuted }}>No more</p>
        </div>
      </div>
    </div>
  );
}

function CommissionDetailPage({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  return (
    <div className="fixed inset-0 z-50 max-w-[480px] mx-auto overflow-y-auto" style={{ background: pageBg }}>
      <SubPageHeader title={t('commission_detail')} onClose={onClose} />
      <div style={{ padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: cardBg, borderRadius: 8, border: `1px solid ${cardBorder}`, marginBottom: 16 }}>
          <span style={{ fontSize: 14, color: textDark }}>{date}</span>
          <ChevronDown size={16} color={textMuted} />
        </div>
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ fontSize: 13, color: textMuted }}>{t('no_data')}</p>
        </div>
      </div>
    </div>
  );
}

function InvitePage({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [linkCopied, setLinkCopied] = useState(false);
  const copyLink = () => {
    navigator.clipboard.writeText(REFERRAL_LINK).then(() => {
      setLinkCopied(true);
      toast.success(t('invitation_link_copied'));
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };
  return (
    <div className="fixed inset-0 z-50 max-w-[480px] mx-auto overflow-y-auto" style={{ background: pageBg }}>
      <SubPageHeader title={t('invite')} onClose={onClose} />
      <div style={{ padding: '12px 16px' }}>
        <p style={{ fontSize: 12, color: redPrimary, textAlign: 'center', marginBottom: 16 }}>{t('swipe_poster')}</p>
        <div style={{ background: cardBg, borderRadius: 16, padding: '24px 20px', textAlign: 'center', marginBottom: 20, border: `2px solid rgba(200,16,46,0.3)`, boxShadow: '0 4px 15px rgba(200,16,46,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ background: 'rgba(200,16,46,0.08)', color: redPrimary, fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>{t('fair_justice')}</span>
            <span style={{ background: 'rgba(200,16,46,0.08)', color: redPrimary, fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>{t('open_transparent')}</span>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: textDark, marginBottom: 12 }}>{t('full_odds_bonus')}</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ background: 'rgba(200,16,46,0.08)', color: redPrimary, fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>💰 {t('financial_security')}</span>
            <span style={{ background: 'rgba(200,16,46,0.08)', color: redPrimary, fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>⚡ {t('quick_withdrawal')}</span>
          </div>
          <p style={{ fontSize: 14, color: redPrimary, fontWeight: 700, marginBottom: 16 }}>
            {t('permanent_commission')} <span style={{ fontSize: 20 }}>85%</span>
          </p>
          <div style={{ width: 100, height: 100, background: cardBg, border: `2px solid rgba(200,16,46,0.3)`, borderRadius: 8, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QrCode size={40} color={textGold} />
          </div>
        </div>
        <button onClick={copyLink} style={{ width: '100%', padding: '14px 0', borderRadius: 50, cursor: 'pointer', background: redGradient, border: 'none', color: '#fff', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {linkCopied ? <><Check size={16} /> {t('copied')}</> : t('copy_invitation_link')}
        </button>
      </div>
    </div>
  );
}

function NewSubordinatesPage({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('today');
  const tabs = [
    { key: 'today', label: t('today') },
    { key: 'yesterday', label: t('yesterday') },
    { key: 'this_month', label: t('this_month') },
  ];
  return (
    <div className="fixed inset-0 z-50 max-w-[480px] mx-auto overflow-y-auto" style={{ background: pageBg }}>
      <SubPageHeader title={t('new_subordinates')} onClose={onClose} />
      <div style={{ display: 'flex', gap: 8, padding: '12px 12px 0' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: activeTab === tab.key ? redGradient : cardBg,
            color: activeTab === tab.key ? '#000' : textMuted,
            fontSize: 13, fontWeight: 600,
          }}>
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ fontSize: 13, color: textMuted }}>{t('no_data')}</p>
      </div>
    </div>
  );
}

function InvitationRulesPage({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const rebateLevels = [
    { level: 0, team: '0', betting: '0', deposit: '0' },
    { level: 1, team: '5', betting: '500K', deposit: '100K' },
    { level: 2, team: '10', betting: '1,000K', deposit: '200K' },
    { level: 3, team: '15', betting: '2.50M', deposit: '500K' },
    { level: 4, team: '20', betting: '3.50M', deposit: '700K' },
    { level: 5, team: '25', betting: '5M', deposit: '1,000K' },
    { level: 6, team: '30', betting: '10M', deposit: '2M' },
    { level: 7, team: '100', betting: '100M', deposit: '20M' },
    { level: 8, team: '500', betting: '500M', deposit: '100M' },
    { level: 9, team: '1000', betting: '1,000M', deposit: '200M' },
    { level: 10, team: '5000', betting: '1,500M', deposit: '300M' },
  ];
  const rules = [
    { num: '01', text: t('rule_1') },
    { num: '02', text: t('rule_2') },
    { num: '03', text: t('rule_3') },
    { num: '04', text: t('rule_4') },
    { num: '05', text: t('rule_5') },
    { num: '06', text: t('rule_6') },
    { num: '07', text: t('rule_7') },
    { num: '08', text: 'The final interpretation of this activity belongs to the platform.' },
  ];

  return (
    <div className="fixed inset-0 z-50 max-w-[480px] mx-auto overflow-y-auto" style={{ background: pageBg }}>
      <SubPageHeader title={t('invitation_rules')} onClose={onClose} />
      <div style={{ textAlign: 'center', padding: '20px 16px 8px' }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: redPrimary, margin: 0 }}>【Promotion partner】program</h2>
        <p style={{ fontSize: 13, color: textMuted, marginTop: 6 }}>This activity is valid for a long time</p>
      </div>
      <div style={{ padding: '12px 12px 24px' }}>
        {rules.map((rule, i) => (
          <div key={i} style={{ background: cardBg, borderRadius: 12, marginBottom: 16, border: `1px solid ${cardBorder}`, overflow: 'visible' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ background: redGradient, color: '#fff', padding: '6px 28px', borderRadius: 20, fontSize: 16, fontWeight: 700, display: 'inline-block', position: 'relative', top: -16, marginBottom: -8 }}>{rule.num}</span>
            </div>
            <div style={{ padding: '0 16px 16px' }}>
              <p style={{ fontSize: 13, color: textDark, lineHeight: 1.7, margin: 0 }}>{rule.text}</p>
              {i === 4 && (
                <div style={{ marginTop: 16, borderRadius: 10, overflow: 'hidden', border: `1px solid ${cardBorder}` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: redGradient, padding: '10px 0' }}>
                    {['Rebate level', 'Team Number', 'Team Betting', 'Team Deposit'].map(h => (
                      <div key={h} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>{h}</div>
                    ))}
                  </div>
                  {rebateLevels.map((row, ri) => (
                    <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '8px 0', background: ri % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)', borderTop: `1px solid ${cardBorder}` }}>
                      <div style={{ textAlign: 'center', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <span style={{ fontSize: 14 }}>👑</span>
                        <span style={{ color: redPrimary, fontWeight: 600, fontSize: 11 }}>L{row.level}</span>
                      </div>
                      <div style={{ textAlign: 'center', fontSize: 11, color: textDark }}>{row.team}</div>
                      <div style={{ textAlign: 'center', fontSize: 11, color: textDark }}>{row.betting}</div>
                      <div style={{ textAlign: 'center', fontSize: 11, color: textDark }}>{row.deposit}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RebateRatioPage({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [activeCategory, setActiveCategory] = useState('lottery');
  const categories = [
    { key: 'lottery', label: 'Lottery', icon: '🎯' },
    { key: 'casino', label: 'Casino', icon: '🎰' },
    { key: 'sports', label: 'Sports', icon: '⚽' },
  ];
  const rebateData = [
    { level: 'L0', rates: [0.6, 0.18, 0.054, 0.0162, 0.00486, 0.001458] },
    { level: 'L1', rates: [0.7, 0.245, 0.08575, 0.030012, 0.010504, 0.003677] },
    { level: 'L2', rates: [0.75, 0.28125, 0.105469, 0.039551, 0.014832, 0.005562] },
    { level: 'L3', rates: [0.8, 0.32, 0.128, 0.0512, 0.02048, 0.008192] },
    { level: 'L4', rates: [0.85, 0.3612, 0.153512, 0.065243, 0.027728, 0.011784] },
    { level: 'L5', rates: [0.9, 0.405, 0.18225, 0.082012, 0.036906, 0.016607] },
    { level: 'L6', rates: [0.95, 0.45125, 0.214344, 0.101813, 0.048361, 0.022972] },
    { level: 'L7', rates: [1.0, 0.5, 0.25, 0.125, 0.0625, 0.03125] },
    { level: 'L8', rates: [1.05, 0.55125, 0.289406, 0.151938, 0.079768, 0.041878] },
    { level: 'L9', rates: [1.1, 0.605, 0.3327, 0.18299, 0.100645, 0.055355] },
    { level: 'L10', rates: [1.15, 0.66125, 0.380469, 0.218770, 0.125793, 0.072331] },
  ];

  return (
    <div className="fixed inset-0 z-50 max-w-[480px] mx-auto overflow-y-auto" style={{ background: pageBg }}>
      <SubPageHeader title={t('rebate_ratio')} onClose={onClose} />
      <div style={{ padding: '12px' }}>
        <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderRadius: 10, overflow: 'hidden', border: `1px solid ${cardBorder}` }}>
          {categories.map((cat) => (
            <button key={cat.key} onClick={() => setActiveCategory(cat.key)} style={{
              flex: 1, padding: '12px 0', border: 'none', cursor: 'pointer',
              background: activeCategory === cat.key ? redGradient : cardBg,
              color: activeCategory === cat.key ? '#000' : textWhite,
              fontSize: 13, fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
              <span style={{ fontSize: 20 }}>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
        {rebateData.map((level, li) => (
          <div key={li} style={{ background: cardBg, borderRadius: 10, marginBottom: 12, border: `1px solid ${cardBorder}`, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${cardBorder}` }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: textDark }}>
                Rebate level <span style={{ color: redPrimary, fontStyle: 'italic', fontWeight: 800 }}>{level.level}</span>
              </span>
            </div>
            {level.rates.map((rate, ri) => (
              <div key={ri} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 16px',
                borderBottom: ri < level.rates.length - 1 ? `1px solid ${cardBorder}` : 'none',
                background: ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: goldPrimary, opacity: 0.6 }} />
                  <span style={{ fontSize: 12, color: textMuted }}>{ri + 1} level lower level commission rebate</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: redPrimary }}>{rate}%</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════ */
/*  MAIN AGENCY / PROMOTION PAGE               */
/* ═══════════════════════════════════════════ */

export default function PromotionsDetail() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  
  const [activePage, setActivePage] = useState<string | null>(null);

  const copyCode = () => {
    navigator.clipboard.writeText(INVITATION_CODE).then(() => {
      setCopied(true);
      toast.success(t('invitation_code_copied'));
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const stats = { register: 0, depositNumber: 0, depositAmount: 0, firstDeposit: 0 };
  const teamStats = { register: 0, depositNumber: 1, depositAmount: 350, firstDeposit: 0 };
  

  const menuItems = [
    { icon: <Copy size={18} color={goldPrimary} />, label: t('copy_invitation_code'), value: INVITATION_CODE, isCode: true },
    { icon: <Users size={18} color={goldPrimary} />, label: t('subordinate_data'), page: 'subordinate' },
    { icon: <DollarSign size={18} color={goldPrimary} />, label: t('commission_detail'), page: 'commission' },
    { icon: <ScrollText size={18} color={goldPrimary} />, label: t('invitation_rules'), page: 'rules' },
    { icon: <Headphones size={18} color={goldPrimary} />, label: t('agent_customer_service'), page: 'service' },
    { icon: <BadgePercent size={18} color={goldPrimary} />, label: t('rebate_ratio'), page: 'rebate' },
  ];

  return (
    <div className="min-h-screen w-full max-w-[480px] mx-auto pb-24" style={{ background: pageBg }}>
      <Toaster position="top-center" richColors />

      {/* ── Header with commission ── */}
      <div style={{ background: headerGradient, paddingBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', width: 300, height: 180, background: 'radial-gradient(ellipse, rgba(200,16,46,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
          <div style={{ width: 32 }} />
          <span style={{ fontWeight: 700, fontSize: 17, color: '#fff' }}>{t('agency')}</span>
          <button onClick={() => setActivePage('newSub')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(200,16,46,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(200,16,46,0.25)' }}>
              <Users size={16} color="#fff" />
            </div>
          </button>
        </div>
        <div style={{ textAlign: 'center', paddingTop: 8, position: 'relative' }}>
          <div style={{ fontSize: 44, fontWeight: 800, color: '#fff', textShadow: '0 0 40px rgba(255,255,255,0.3)', letterSpacing: '-1px' }}>0.68</div>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '8px 24px', borderRadius: 25, fontSize: 12, color: '#fff', fontWeight: 700, marginTop: 6, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            {t('yesterday_total_commission')}
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 10 }}>{t('upgrade_level')}</p>
        </div>
      </div>

      {/* ── Side-by-side Stats (Direct | Team) ── */}
      <div style={{ margin: '-10px 14px 0', position: 'relative', zIndex: 10 }}>
        <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: `1px solid ${cardBorder}`, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ padding: '14px 8px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderRight: `1px solid ${cardBorder}`, background: 'rgba(200,16,46,0.05)' }}>
              <Users size={15} color={redPrimary} />
              <span style={{ fontSize: 12, fontWeight: 700, color: redPrimary }}>{t('direct_subordinates')}</span>
            </div>
            <div style={{ padding: '14px 8px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'rgba(200,16,46,0.05)' }}>
              <Users size={15} color={redPrimary} />
              <span style={{ fontSize: 12, fontWeight: 700, color: redPrimary }}>{t('team_subordinates')}</span>
            </div>
          </div>
          {[
            { label: t('number_of_register'), direct: stats.register, team: teamStats.register },
            { label: t('deposit_number'), direct: stats.depositNumber, team: teamStats.depositNumber, highlight: true },
            { label: t('deposit_amount'), direct: stats.depositAmount, team: teamStats.depositAmount, highlight: true },
            { label: t('first_deposit_people'), direct: stats.firstDeposit, team: teamStats.firstDeposit },
          ].map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: `1px solid ${cardBorder}` }}>
              <div style={{ textAlign: 'center', padding: '14px 8px', borderRight: `1px solid ${cardBorder}` }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: row.highlight ? redPrimary : textDark }}>{row.direct}</div>
                <div style={{ fontSize: 10, color: textMuted, marginTop: 3, lineHeight: 1.3 }}>{row.label}</div>
              </div>
              <div style={{ textAlign: 'center', padding: '14px 8px' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: row.highlight ? redPrimary : textDark }}>{row.team}</div>
                <div style={{ fontSize: 10, color: textMuted, marginTop: 3, lineHeight: 1.3 }}>{row.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Copy Referral Link Button ── */}
      <div style={{ padding: '18px 14px 0' }}>
        <button onClick={() => {
          navigator.clipboard.writeText(REFERRAL_LINK).then(() => {
            toast.success('Referral link copied!');
          });
        }} style={{
          width: '100%', padding: '15px 0', borderRadius: 50, border: 'none', cursor: 'pointer',
          background: redGradient, color: '#fff',
          fontWeight: 800, fontSize: 15, boxShadow: '0 4px 20px rgba(200,16,46,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Copy size={18} />
          Copy Referral Link
        </button>
      </div>

      {/* ── Menu Items ── */}
      <div style={{ margin: '18px 14px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {menuItems.map((item, i) => (
          <button key={i} onClick={() => {
            if (item.isCode) { copyCode(); return; }
            if (item.page) setActivePage(item.page);
          }} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 16px', background: cardBg, border: `1px solid ${cardBorder}`, cursor: 'pointer',
            borderRadius: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(200,16,46,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(200,16,46,0.12)' }}>
                {item.icon}
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: textDark }}>{item.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {item.value && (
                <span style={{ fontSize: 12, color: textMuted, fontFamily: 'monospace' }}>{item.value}</span>
              )}
              {item.isCode ? (
                copied ? <Check size={16} color={greenAccent} /> : <Copy size={16} color={textMuted} />
              ) : (
                <ChevronRight size={16} color={textMuted} />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* ── Promotion Data ── */}
      <div style={{ margin: '18px 14px 0', borderRadius: 14, overflow: 'hidden', background: cardBg, border: `1px solid ${cardBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: `1px solid ${cardBorder}` }}>
          <span style={{ fontSize: 18 }}>🎮</span>
          <span style={{ fontWeight: 700, fontSize: 14, color: textDark }}>{t('promotion_data')}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          {[
            { label: t('this_week'), value: '0.68' },
            { label: t('total_commission'), value: '2369.7' },
            { label: t('direct_subordinate'), value: '6' },
            { label: t('total_subordinates_team'), value: '31' },
          ].map((s, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '18px 8px',
              borderRight: i % 2 === 0 ? `1px solid ${cardBorder}` : 'none',
              borderBottom: i < 2 ? `1px solid ${cardBorder}` : 'none',
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: textDark }}>{s.value}</div>
              <div style={{ fontSize: 10, color: textMuted, marginTop: 4, lineHeight: 1.3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />

      {/* ── Sub Pages ── */}
      <AnimatePresence>
        {activePage === 'subordinate' && (
          <motion.div key="sub" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}>
            <SubordinateDataPage onClose={() => setActivePage(null)} />
          </motion.div>
        )}
        {activePage === 'commission' && (
          <motion.div key="com" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}>
            <CommissionDetailPage onClose={() => setActivePage(null)} />
          </motion.div>
        )}
        {activePage === 'rules' && (
          <motion.div key="rules" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}>
            <InvitationRulesPage onClose={() => setActivePage(null)} />
          </motion.div>
        )}
        {activePage === 'service' && (
          <motion.div key="invite" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}>
            <InvitePage onClose={() => setActivePage(null)} />
          </motion.div>
        )}
        {activePage === 'rebate' && (
          <motion.div key="rebate" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}>
            <RebateRatioPage onClose={() => setActivePage(null)} />
          </motion.div>
        )}
        {activePage === 'newSub' && (
          <motion.div key="newSub" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}>
            <NewSubordinatesPage onClose={() => setActivePage(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
