import React, { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { ArrowLeft, ChevronRight, Copy, Check, Search, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';

/* ── Theme Colors (cream/red/gold) ── */
const creamBg = '#FAF5E9';
const cardBg = '#FFFFFF';
const redPrimary = '#C8102E';
const redDark = '#8B0000';
const goldYellow = '#D4AF37';
const goldLight = '#F5D060';
const redGradient = 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)';
const goldGradient = 'linear-gradient(135deg, #D4AF37 0%, #F5D060 100%)';
const textDark = '#1a1a1a';
const textMuted = '#888888';
const borderLight = '#f0e0c0';

const INVITATION_CODE = '552331597041';
const REFERRAL_LINK = `https://app.example.com/register?code=${INVITATION_CODE}`;

/* ── Sub-page header component ── */
function SubPageHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{ background: redGradient, padding: '0 16px', height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
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
    <div className="fixed inset-0 z-50 max-w-[480px] mx-auto overflow-y-auto" style={{ background: creamBg }}>
      <SubPageHeader title={t('subordinate_data')} onClose={onClose} />
      <div style={{ padding: '12px' }}>
        {/* Search bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input type="text" placeholder={t('search_subordinate_uid')} value={searchUID} onChange={e => setSearchUID(e.target.value)}
            style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: `1px solid ${borderLight}`, background: cardBg, fontSize: 14, outline: 'none', color: textDark }} />
          <button style={{ width: 42, height: 42, borderRadius: 8, background: goldGradient, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Search size={18} color="#fff" />
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, padding: '10px 12px', borderRadius: 8, background: cardBg, border: `1px solid ${borderLight}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: textDark }}>
            {t('all')} <ChevronDown size={14} color={textMuted} />
          </div>
          <div style={{ flex: 1, padding: '10px 12px', borderRadius: 8, background: cardBg, border: `1px solid ${borderLight}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: textDark }}>
            {filterDate} <ChevronDown size={14} color={textMuted} />
          </div>
        </div>

        {/* Stats Grid - Gold/Yellow */}
        <div style={{ background: goldGradient, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
          {[[{ label: t('deposit_number'), value: '0' }, { label: t('deposit_amount'), value: '0' }],
            [{ label: t('number_of_bettors'), value: '0' }, { label: t('total_bet'), value: '0' }],
            [{ label: t('first_deposit_people'), value: '0' }, { label: t('first_deposit_amount'), value: '0' }]
          ].map((row, ri) => (
            <div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              {row.map((s, ci) => (
                <div key={ci} style={{
                  padding: '14px 8px', textAlign: 'center',
                  borderRight: ci === 0 ? '1px solid rgba(255,255,255,0.3)' : 'none',
                  borderBottom: ri < 2 ? '1px solid rgba(255,255,255,0.3)' : 'none',
                }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* UID Cards */}
        {sampleSubordinates.map((sub, i) => (
          <div key={i} style={{
            background: cardBg, borderRadius: 10, padding: '14px 16px', marginBottom: 10,
            border: `1px solid ${borderLight}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${borderLight}` }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: textDark }}>UID:{sub.uid}</span>
              <button onClick={() => { navigator.clipboard.writeText(sub.uid); toast.success('UID copied'); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                <Copy size={14} color={textMuted} />
              </button>
            </div>
            {[
              { label: 'Level', value: sub.level.toString() },
              { label: t('deposit_amount'), value: sub.depositAmount.toString(), isHighlight: true },
              { label: t('commission_detail'), value: sub.commission.toString(), isHighlight: true },
              { label: 'Time', value: sub.time },
            ].map((row, ri) => (
              <div key={ri} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                <span style={{ color: textMuted }}>{row.label}</span>
                <span style={{ color: row.isHighlight ? redPrimary : textDark, fontWeight: row.isHighlight ? 600 : 400 }}>{row.value}</span>
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
    <div className="fixed inset-0 z-50 max-w-[480px] mx-auto overflow-y-auto" style={{ background: creamBg }}>
      <SubPageHeader title={t('commission_detail')} onClose={onClose} />
      <div style={{ padding: '12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 14px', background: cardBg, borderRadius: 8,
          border: `1px solid ${borderLight}`, marginBottom: 16,
        }}>
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
    <div className="fixed inset-0 z-50 max-w-[480px] mx-auto overflow-y-auto" style={{ background: creamBg }}>
      <SubPageHeader title={t('invite')} onClose={onClose} />
      <div style={{ padding: '12px 16px' }}>
        <p style={{ fontSize: 12, color: redPrimary, textAlign: 'center', marginBottom: 16 }}>
          {t('swipe_poster')}
        </p>
        <div style={{
          background: cardBg, borderRadius: 16, padding: '24px 20px', textAlign: 'center', marginBottom: 20,
          border: `2px solid ${goldYellow}`, boxShadow: '0 4px 15px rgba(212, 175, 55, 0.2)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ background: 'rgba(200,16,46,0.08)', color: redPrimary, fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>{t('fair_justice')}</span>
            <span style={{ background: 'rgba(200,16,46,0.08)', color: redPrimary, fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>{t('open_transparent')}</span>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: textDark, marginBottom: 12 }}>{t('full_odds_bonus')}</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ background: 'rgba(212,175,55,0.12)', color: goldYellow, fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>💰 {t('financial_security')}</span>
            <span style={{ background: 'rgba(212,175,55,0.12)', color: goldYellow, fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>⚡ {t('quick_withdrawal')}</span>
          </div>
          <p style={{ fontSize: 14, color: redPrimary, fontWeight: 700, marginBottom: 16 }}>
            {t('permanent_commission')} <span style={{ fontSize: 20 }}>85%</span>
          </p>
          <div style={{ width: 100, height: 100, background: '#f9f3e3', border: `2px solid ${goldYellow}`, borderRadius: 8, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 11, color: textMuted }}>QR Code</span>
          </div>
        </div>
        <button onClick={copyLink} style={{
          width: '100%', padding: '14px 0', borderRadius: 50, cursor: 'pointer',
          background: redGradient, border: 'none', color: '#fff',
          fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
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
    <div className="fixed inset-0 z-50 max-w-[480px] mx-auto overflow-y-auto" style={{ background: creamBg }}>
      <SubPageHeader title={t('new_subordinates')} onClose={onClose} />
      <div style={{ display: 'flex', gap: 8, padding: '12px 12px 0' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: activeTab === tab.key ? redPrimary : cardBg,
            color: activeTab === tab.key ? '#fff' : textMuted,
            fontSize: 13, fontWeight: 600, boxShadow: activeTab !== tab.key ? `0 1px 3px ${borderLight}` : 'none',
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
    { level: 0, icon: '👑', team: '0', betting: '0', deposit: '0' },
    { level: 1, icon: '👑', team: '5', betting: '500K', deposit: '100K' },
    { level: 2, icon: '👑', team: '10', betting: '1,000K', deposit: '200K' },
    { level: 3, icon: '👑', team: '15', betting: '2.50M', deposit: '500K' },
    { level: 4, icon: '👑', team: '20', betting: '3.50M', deposit: '700K' },
    { level: 5, icon: '👑', team: '25', betting: '5M', deposit: '1,000K' },
    { level: 6, icon: '👑', team: '30', betting: '10M', deposit: '2M' },
    { level: 7, icon: '👑', team: '100', betting: '100M', deposit: '20M' },
    { level: 8, icon: '👑', team: '500', betting: '500M', deposit: '100M' },
    { level: 9, icon: '👑', team: '1000', betting: '1,000M', deposit: '200M' },
    { level: 10, icon: '👑', team: '5000', betting: '1,500M', deposit: '300M' },
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

  const numberBadgeStyle: React.CSSProperties = {
    background: redGradient,
    color: '#fff',
    padding: '6px 28px',
    borderRadius: 20,
    fontSize: 16,
    fontWeight: 700,
    display: 'inline-block',
    margin: '0 auto',
    position: 'relative',
    top: -16,
    marginBottom: -8,
  };

  return (
    <div className="fixed inset-0 z-50 max-w-[480px] mx-auto overflow-y-auto" style={{ background: creamBg }}>
      <SubPageHeader title={t('invitation_rules')} onClose={onClose} />
      <div style={{ textAlign: 'center', padding: '20px 16px 8px' }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: redPrimary, margin: 0 }}>
          【Promotion partner】program
        </h2>
        <p style={{ fontSize: 13, color: textMuted, marginTop: 6 }}>
          This activity is valid for a long time
        </p>
      </div>
      <div style={{ padding: '12px 12px 24px' }}>
        {rules.map((rule, i) => (
          <div key={i} style={{
            background: cardBg, borderRadius: 12, marginBottom: 16,
            border: `1px solid ${borderLight}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'visible',
          }}>
            <div style={{ textAlign: 'center' }}>
              <span style={numberBadgeStyle}>{rule.num}</span>
            </div>
            <div style={{ padding: '0 16px 16px' }}>
              <p style={{ fontSize: 13, color: textDark, lineHeight: 1.7, margin: 0 }}>{rule.text}</p>
              {i === 4 && (
                <div style={{ marginTop: 16, borderRadius: 10, overflow: 'hidden', border: `1px solid ${borderLight}` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: goldGradient, padding: '10px 0' }}>
                    {[t('level') || 'Rebate level', t('team_no') || 'Team Number', t('betting') || 'Team Betting', t('deposit') || 'Team Deposit'].map(h => (
                      <div key={h} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>{h}</div>
                    ))}
                  </div>
                  {rebateLevels.map((row, ri) => (
                    <div key={ri} style={{
                      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '8px 0',
                      background: ri % 2 === 0 ? cardBg : '#faf5e9', borderTop: `1px solid ${borderLight}`,
                    }}>
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
              {i === 5 && (
                <p style={{ color: redPrimary, fontSize: 13, marginTop: 8, fontWeight: 600, cursor: 'pointer' }}>
                  View rebate ratio &gt;&gt;
                </p>
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
    <div className="fixed inset-0 z-50 max-w-[480px] mx-auto overflow-y-auto" style={{ background: creamBg }}>
      <SubPageHeader title={t('rebate_ratio')} onClose={onClose} />
      <div style={{ padding: '12px' }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderRadius: 10, overflow: 'hidden', border: `1px solid ${borderLight}` }}>
          {categories.map((cat) => (
            <button key={cat.key} onClick={() => setActiveCategory(cat.key)} style={{
              flex: 1, padding: '12px 0', border: 'none', cursor: 'pointer',
              background: activeCategory === cat.key ? redGradient : cardBg,
              color: activeCategory === cat.key ? '#fff' : textDark,
              fontSize: 13, fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: 20 }}>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Rebate Level Cards */}
        {rebateData.map((level, li) => (
          <div key={li} style={{
            background: cardBg, borderRadius: 10, marginBottom: 12,
            border: `1px solid ${borderLight}`, overflow: 'hidden',
          }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${borderLight}` }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: textDark }}>
                Rebate level <span style={{ color: redPrimary, fontStyle: 'italic', fontWeight: 800 }}>{level.level}</span>
              </span>
            </div>
            {level.rates.map((rate, ri) => (
              <div key={ri} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 16px',
                borderBottom: ri < level.rates.length - 1 ? `1px solid ${borderLight}` : 'none',
                background: ri % 2 === 0 ? cardBg : '#faf5e9',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: redPrimary, opacity: 0.6 }} />
                  <span style={{ fontSize: 12, color: textDark }}>{ri + 1} level lower level commission rebate</span>
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
/*  MAIN AGENCY PAGE                           */
/* ═══════════════════════════════════════════ */

export default function PromotionsDetail() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'direct' | 'team'>('direct');
  const [activePage, setActivePage] = useState<string | null>(null);

  const copyCode = () => {
    navigator.clipboard.writeText(INVITATION_CODE).then(() => {
      setCopied(true);
      toast.success(t('invitation_code_copied'));
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const stats = { register: 0, depositNumber: 0, depositAmount: 0, firstDeposit: 0 };

  const menuItems = [
    { icon: '🤝', label: t('partner_rewards') || 'Partner rewards', page: 'service' },
    { icon: '📋', label: t('copy_invitation_code'), value: INVITATION_CODE, isCode: true },
    { icon: '👥', label: t('subordinate_data'), page: 'subordinate' },
    { icon: '💲', label: t('commission_detail'), page: 'commission' },
    { icon: '📜', label: t('invitation_rules'), page: 'rules' },
    { icon: '🎧', label: t('agent_customer_service'), page: 'service' },
    { icon: '💰', label: t('rebate_ratio'), page: 'rebate' },
  ];

  return (
    <div className="min-h-screen w-full max-w-[480px] mx-auto pb-24" style={{ background: creamBg }}>
      <Toaster position="top-center" richColors />

      {/* ── Header ── */}
      <div style={{
        background: redGradient,
        borderRadius: '0 0 20px 20px', paddingBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
          <span style={{ fontWeight: 700, fontSize: 17, color: '#fff' }}>{t('agency')}</span>
          <button onClick={() => setActivePage('newSub')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 16 }}>👤</span>
            </div>
          </button>
        </div>

        {/* Commission */}
        <div style={{ textAlign: 'center', paddingTop: 4 }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: '#fff' }}>0</div>
          <div style={{
            display: 'inline-block', background: 'rgba(255,255,255,0.2)',
            padding: '6px 20px', borderRadius: 20, fontSize: 12, color: '#fff', fontWeight: 600, marginTop: 4,
          }}>
            {t('yesterday_total_commission')}
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>
            {t('upgrade_level')}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', margin: '16px 12px 0', background: 'rgba(255,255,255,0.15)', borderRadius: 10, overflow: 'hidden' }}>
          {(['direct', 'team'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
              background: activeTab === tab ? '#fff' : 'transparent',
              color: activeTab === tab ? redPrimary : 'rgba(255,255,255,0.8)',
              fontSize: 13, fontWeight: 700, borderRadius: activeTab === tab ? 10 : 0,
              transition: 'all 0.2s',
            }}>
              👥 {tab === 'direct' ? t('direct_subordinates') : t('team_subordinates')}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats Card ── */}
      <div style={{ margin: '-12px 12px 0', position: 'relative', zIndex: 10 }}>
        <div style={{ background: cardBg, borderRadius: 12, padding: '16px', border: `1px solid ${borderLight}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: t('number_of_register'), value: stats.register },
              { label: t('deposit_number'), value: stats.depositNumber },
              { label: t('deposit_amount'), value: stats.depositAmount },
              { label: t('first_deposit_people'), value: stats.firstDeposit },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '8px 0', borderBottom: i < 2 ? `1px solid ${borderLight}` : 'none' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: redPrimary }}>{s.value}</div>
                <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Download QR Code ── */}
      <div style={{ padding: '16px 12px 0' }}>
        <button style={{
          width: '100%', padding: '14px 0', borderRadius: 50, border: 'none', cursor: 'pointer',
          background: goldGradient, color: '#fff',
          fontWeight: 700, fontSize: 15, boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
        }}>
          {t('download_qr')}
        </button>
      </div>

      {/* ── Menu Items ── */}
      <div style={{ margin: '16px 12px 0', background: cardBg, borderRadius: 12, overflow: 'hidden', border: `1px solid ${borderLight}` }}>
        {menuItems.map((item, i) => (
          <button key={i} onClick={() => {
            if (item.isCode) { copyCode(); return; }
            if (item.page) setActivePage(item.page);
          }} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: i < menuItems.length - 1 ? `1px solid ${borderLight}` : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(200,16,46,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: textDark }}>{item.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {item.value && (
                <span style={{ fontSize: 12, color: textMuted }}>{item.value}</span>
              )}
              {item.isCode ? (
                copied ? <Check size={16} color={redPrimary} /> : <Copy size={16} color={textMuted} />
              ) : (
                <ChevronRight size={16} color={textMuted} />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* ── Promotion Data ── */}
      <div style={{ margin: '16px 12px 0', background: cardBg, borderRadius: 12, overflow: 'hidden', border: `1px solid ${borderLight}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px', borderBottom: `1px solid ${borderLight}` }}>
          <span style={{ fontSize: 18 }}>🎮</span>
          <span style={{ fontWeight: 700, fontSize: 14, color: textDark }}>{t('promotion_data')}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          {[
            { label: t('this_week'), value: '0' },
            { label: t('total_commission'), value: '0' },
            { label: t('direct_subordinate'), value: '0' },
            { label: t('total_subordinates_team'), value: '0' },
          ].map((s, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '16px 8px',
              borderRight: i % 2 === 0 ? `1px solid ${borderLight}` : 'none',
              borderBottom: i < 2 ? `1px solid ${borderLight}` : 'none',
            }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: redPrimary }}>{s.value}</div>
              <div style={{ fontSize: 10, color: textMuted, marginTop: 2 }}>{s.label}</div>
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
