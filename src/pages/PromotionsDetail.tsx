import React, { useState, useEffect, useMemo } from 'react';
import { toast, Toaster } from 'sonner';
import { ChevronRight, Copy, Check, Search, ChevronDown, ArrowLeft, Users, DollarSign, ScrollText, Headphones, BadgePercent, Gift, QrCode, Download, MessageCircle, Shield, Clock, Star, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';
import { db } from '@/lib/db';

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

/* ─── Hook: load all referral / commission data for current user ─── */
function useReferralData() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [directs, setDirects] = useState<any[]>([]);     // L1 profiles
  const [team, setTeam] = useState<any[]>([]);            // L2..L6 user_ids
  const [todayCommission, setTodayCommission] = useState(0);
  const [yesterdayCommission, setYesterdayCommission] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    // Profile
    const { data: prof } = await db.from('profiles').select('*').eq('user_id', user.id).single();
    setProfile(prof);

    // Direct subordinates (L1)
    const { data: l1 } = await db.from('profiles').select('user_id, username, invitation_code, first_deposit_at, created_at').eq('referrer_id', user.id);
    const l1Arr = l1 ?? [];
    setDirects(l1Arr);

    // Walk down for L2..L6
    let frontier: string[] = l1Arr.map((p: any) => p.user_id);
    const all: any[] = [...l1Arr.map((p: any) => ({ ...p, level: 1 }))];
    for (let lvl = 2; lvl <= 6 && frontier.length > 0; lvl++) {
      const { data: next } = await db.from('profiles').select('user_id, username, invitation_code, first_deposit_at, created_at, referrer_id').in('referrer_id', frontier);
      const arr = next ?? [];
      arr.forEach((p: any) => all.push({ ...p, level: lvl }));
      frontier = arr.map((p: any) => p.user_id);
    }
    setTeam(all);

    // Commissions: today / yesterday / total
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const startOfYesterday = new Date(startOfDay); startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const { data: comms } = await db.from('commissions').select('commission_amount, created_at').eq('beneficiary_id', user.id);
    const cs = comms ?? [];
    let today = 0, yest = 0, tot = 0;
    cs.forEach((c: any) => {
      const t = new Date(c.created_at).getTime();
      tot += Number(c.commission_amount);
      if (t >= startOfDay.getTime()) today += Number(c.commission_amount);
      else if (t >= startOfYesterday.getTime()) yest += Number(c.commission_amount);
    });
    setTodayCommission(today);
    setYesterdayCommission(yest);
    setTotalCommission(tot);

    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id]);

  return { profile, directs, team, todayCommission, yesterdayCommission, totalCommission, loading, reload: load };
}

/* ═══════════════════════════════════════════ */
/*  SUB-PAGES                                  */
/* ═══════════════════════════════════════════ */

function SubordinateDataPage({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { directs, team } = useReferralData();
  const [searchUID, setSearchUID] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [stats, setStats] = useState<Record<string, { dep: number; bet: number; comm: number; firstDep?: string }>>({});

  const allMembers = useMemo(() => {
    const map = new Map<string, any>();
    directs.forEach((d: any) => map.set(d.user_id, { ...d, level: 1 }));
    team.forEach((d: any) => { if (!map.has(d.user_id)) map.set(d.user_id, d); });
    return Array.from(map.values());
  }, [directs, team]);

  useEffect(() => {
    if (allMembers.length === 0 || !user) return;
    const ids = allMembers.map(m => m.user_id);
    (async () => {
      const { data: txs } = await db.from('referral_transactions').select('user_id, type, amount, created_at').in('user_id', ids);
      const { data: comms } = await db.from('commissions').select('source_user_id, commission_amount').eq('beneficiary_id', user.id).in('source_user_id', ids);
      const m: Record<string, { dep: number; bet: number; comm: number; firstDep?: string }> = {};
      ids.forEach(id => { m[id] = { dep: 0, bet: 0, comm: 0 }; });
      (txs ?? []).forEach((tx: any) => {
        const r = m[tx.user_id]; if (!r) return;
        if (tx.type === 'deposit') {
          r.dep += Number(tx.amount);
          if (!r.firstDep || tx.created_at < r.firstDep) r.firstDep = tx.created_at;
        } else if (tx.type === 'bet') r.bet += Number(tx.amount);
      });
      (comms ?? []).forEach((c: any) => { const r = m[c.source_user_id]; if (r) r.comm += Number(c.commission_amount); });
      setStats(m);
    })();
  }, [allMembers, user]);

  const filtered = allMembers.filter((m: any) => {
    if (searchUID && !String(m.user_id).includes(searchUID) && !String(m.username || '').includes(searchUID)) return false;
    if (filterLevel !== 'all' && String(m.level) !== filterLevel) return false;
    return true;
  });

  const totalDeposit = allMembers.reduce((a, m) => a + (stats[m.user_id]?.dep ?? 0), 0);
  const totalBet = allMembers.reduce((a, m) => a + (stats[m.user_id]?.bet ?? 0), 0);
  const depositCount = allMembers.filter(m => (stats[m.user_id]?.dep ?? 0) > 0).length;
  const bettorsCount = allMembers.filter(m => (stats[m.user_id]?.bet ?? 0) > 0).length;
  const firstDepositPeople = allMembers.filter(m => stats[m.user_id]?.firstDep).length;

  return (
    <div className="fixed inset-0 z-50 max-w-[480px] mx-auto overflow-y-auto" style={{ background: pageBg }}>
      <SubPageHeader title={t('subordinate_data')} onClose={onClose} />
      <div style={{ padding: '12px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input type="text" placeholder="Search UID / name" value={searchUID} onChange={e => setSearchUID(e.target.value)}
            style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: cardBg, fontSize: 14, outline: 'none', color: textDark }} />
          <button style={{ width: 42, height: 42, borderRadius: 8, background: redGradient, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Search size={18} color="#fff" />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
            style={{ flex: 1, padding: '10px 12px', borderRadius: 8, background: cardBg, border: `1px solid ${cardBorder}`, fontSize: 13, color: textDark, outline: 'none', cursor: 'pointer' }}>
            <option value="all">All Levels</option>
            {[1,2,3,4,5,6].map(l => <option key={l} value={String(l)}>Level {l}</option>)}
          </select>
        </div>

        <div style={{ background: cardBg, borderRadius: 12, overflow: 'hidden', marginBottom: 16, border: `1px solid ${cardBorder}`, boxShadow: '0 2px 10px rgba(200,16,46,0.08)' }}>
          {[[{ label: t('deposit_number'), value: depositCount.toString() }, { label: t('deposit_amount'), value: totalDeposit.toFixed(2) }],
            [{ label: t('number_of_bettors'), value: bettorsCount.toString() }, { label: 'Total bet', value: totalBet.toFixed(2) }],
            [{ label: t('first_deposit_people'), value: firstDepositPeople.toString() }, { label: 'Team size', value: allMembers.length.toString() }],
          ].map((row, ri) => (
            <div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              {row.map((s, ci) => (
                <div key={ci} style={{
                  padding: '14px 8px', textAlign: 'center',
                  borderRight: ci === 0 ? `1px solid ${cardBorder}` : 'none',
                  borderBottom: ri < 2 ? `1px solid ${cardBorder}` : 'none',
                  background: ri === 0 ? 'rgba(200,16,46,0.04)' : 'transparent',
                }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: redPrimary }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: textMuted, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontSize: 13, color: textMuted }}>No subordinates yet — invite friends to grow your team!</p>
          </div>
        )}
        {filtered.map((sub: any, i: number) => {
          const s = stats[sub.user_id] ?? { dep: 0, bet: 0, comm: 0 };
          return (
            <div key={i} style={{ background: cardBg, borderRadius: 10, padding: '14px 16px', marginBottom: 10, border: `1px solid ${cardBorder}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${cardBorder}` }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: textDark }}>{sub.username || `UID:${String(sub.user_id).slice(0, 8)}`}</span>
                <button onClick={() => { navigator.clipboard.writeText(sub.user_id); toast.success('UID copied'); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                  <Copy size={14} color={redPrimary} />
                </button>
              </div>
              {[
                { label: 'Level', value: `L${sub.level}`, color: textDark },
                { label: 'Deposit', value: s.dep.toFixed(2), color: redPrimary },
                { label: 'Bet', value: s.bet.toFixed(2), color: redPrimary },
                { label: 'My commission', value: s.comm.toFixed(4), color: redPrimary },
                { label: 'Joined', value: new Date(sub.created_at).toLocaleDateString(), color: textMuted },
              ].map((row, ri) => (
                <div key={ri} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                  <span style={{ color: textMuted }}>{row.label}</span>
                  <span style={{ color: row.color, fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CommissionDetailPage({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const start = new Date(date + 'T00:00:00');
    const end = new Date(date + 'T23:59:59');
    (async () => {
      const { data } = await db.from('commissions').select('*').eq('beneficiary_id', user.id)
        .gte('created_at', start.toISOString()).lte('created_at', end.toISOString())
        .order('created_at', { ascending: false });
      setRows(data ?? []);
    })();
  }, [user, date]);

  const total = rows.reduce((a, r) => a + Number(r.commission_amount), 0);

  return (
    <div className="fixed inset-0 z-50 max-w-[480px] mx-auto overflow-y-auto" style={{ background: pageBg }}>
      <SubPageHeader title={t('commission_detail')} onClose={onClose} />
      <div style={{ padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: cardBg, borderRadius: 8, border: `1px solid ${cardBorder}`, marginBottom: 12 }}>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: textDark, flex: 1 }} />
          <ChevronDown size={16} color={textMuted} />
        </div>
        <div style={{ background: redGradient, borderRadius: 12, padding: '16px', marginBottom: 14, color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: 12, opacity: 0.9 }}>Total commission on {date}</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>₹{total.toFixed(4)}</div>
        </div>
        {rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: 13, color: textMuted }}>No commission for this date</p>
          </div>
        ) : rows.map((r) => (
          <div key={r.id} style={{ background: cardBg, borderRadius: 10, padding: '12px 14px', marginBottom: 8, border: `1px solid ${cardBorder}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: textDark }}>L{r.level} commission</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: redPrimary }}>+₹{Number(r.commission_amount).toFixed(4)}</span>
            </div>
            <div style={{ fontSize: 11, color: textMuted, display: 'flex', justifyContent: 'space-between' }}>
              <span>Bet ₹{Number(r.bet_amount).toFixed(2)} × {(Number(r.rate) * 100).toFixed(2)}%</span>
              <span>{new Date(r.created_at).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentCustomerServicePage({ onClose }: { onClose: () => void }) {
  const TELEGRAM_ID = '@techie_404';
  const TELEGRAM_LINK = 'https://t.me/techie_404';
  const conditions = [
    { icon: <Shield size={18} color={redPrimary} />, title: 'Official Channel Only', desc: 'Only contact through our official Telegram channel. We will never DM you first.' },
    { icon: <AlertCircle size={18} color={redPrimary} />, title: 'Never Share Password', desc: 'Our support team will never ask for your password, OTP, or bank details.' },
    { icon: <Clock size={18} color={redPrimary} />, title: 'Response Time', desc: 'Our agent support team is available 24/7. Typical response time is within 5-10 minutes.' },
    { icon: <Star size={18} color={redPrimary} />, title: 'Agent Level Required', desc: 'You must be a registered agent to access agent-level support services.' },
    { icon: <MessageCircle size={18} color={redPrimary} />, title: 'Be Respectful', desc: 'Please communicate politely. Abusive language may result in support being denied.' },
  ];
  return (
    <div className="fixed inset-0 z-50 max-w-[480px] mx-auto overflow-y-auto" style={{ background: pageBg }}>
      <SubPageHeader title="Agent Customer Service" onClose={onClose} />
      <div style={{ padding: '16px' }}>
        <div style={{ background: cardBg, borderRadius: 14, padding: '20px', marginBottom: 20, border: `1px solid ${cardBorder}`, boxShadow: '0 2px 12px rgba(200,16,46,0.08)', textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: redGradient, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Headphones size={28} color="#fff" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: textDark, margin: '0 0 4px' }}>Agent Support</h3>
          <p style={{ fontSize: 14, color: redPrimary, fontWeight: 700, margin: '0 0 4px' }}>{TELEGRAM_ID}</p>
          <p style={{ fontSize: 12, color: textMuted, margin: 0 }}>Available 24/7 on Telegram</p>
        </div>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: textDark, marginBottom: 12, paddingLeft: 4 }}>📋 Terms & Conditions</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {conditions.map((c, i) => (
            <div key={i} style={{ background: cardBg, borderRadius: 12, padding: '14px 16px', border: `1px solid ${cardBorder}`, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(200,16,46,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c.icon}</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: textDark, margin: '0 0 3px' }}>{c.title}</p>
                <p style={{ fontSize: 12, color: textMuted, margin: 0, lineHeight: 1.5 }}>{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <a href={TELEGRAM_LINK} target="_blank" rel="noopener noreferrer" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          width: '100%', padding: '15px 0', borderRadius: 50, textDecoration: 'none',
          background: redGradient, color: '#fff', fontWeight: 800, fontSize: 15, boxShadow: '0 4px 20px rgba(200,16,46,0.3)',
        }}>
          <MessageCircle size={20} /> Chat on Telegram
        </a>
      </div>
    </div>
  );
}

function NewSubordinatesPage({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { directs, team } = useReferralData();
  const [activeTab, setActiveTab] = useState<'today' | 'yesterday' | 'this_month'>('today');
  const tabs = [
    { key: 'today' as const, label: 'Today' },
    { key: 'yesterday' as const, label: 'Yesterday' },
    { key: 'this_month' as const, label: 'This month' },
  ];

  const all = useMemo(() => {
    const map = new Map<string, any>();
    directs.forEach((d: any) => map.set(d.user_id, { ...d, level: 1 }));
    team.forEach((d: any) => { if (!map.has(d.user_id)) map.set(d.user_id, d); });
    return Array.from(map.values());
  }, [directs, team]);

  const now = new Date();
  const startToday = new Date(now); startToday.setHours(0, 0, 0, 0);
  const startYest = new Date(startToday); startYest.setDate(startYest.getDate() - 1);
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const filtered = all.filter((m: any) => {
    const c = new Date(m.created_at);
    if (activeTab === 'today') return c >= startToday;
    if (activeTab === 'yesterday') return c >= startYest && c < startToday;
    return c >= startMonth;
  });

  return (
    <div className="fixed inset-0 z-50 max-w-[480px] mx-auto overflow-y-auto" style={{ background: pageBg }}>
      <SubPageHeader title="New subordinates" onClose={onClose} />
      <div style={{ display: 'flex', gap: 8, padding: '12px 12px 0' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: activeTab === tab.key ? redGradient : cardBg,
            color: activeTab === tab.key ? '#fff' : textMuted,
            fontSize: 13, fontWeight: 600,
          }}>{tab.label}</button>
        ))}
      </div>
      <div style={{ padding: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}><p style={{ fontSize: 13, color: textMuted }}>No new subordinates</p></div>
        ) : filtered.map((m: any) => (
          <div key={m.user_id} style={{ background: cardBg, borderRadius: 10, padding: '12px 14px', marginBottom: 8, border: `1px solid ${cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: textDark }}>{m.username || String(m.user_id).slice(0, 8)}</div>
              <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>L{m.level} • {new Date(m.created_at).toLocaleString()}</div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: redPrimary, background: 'rgba(200,16,46,0.08)', padding: '4px 10px', borderRadius: 12 }}>L{m.level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InvitationRulesPage({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [config, setConfig] = useState<any[]>([]);
  useEffect(() => { db.from('agency_level_config').select('*').order('level').then(({ data }: any) => setConfig(data ?? [])); }, []);
  const fmt = (n: number) => n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M' : n >= 1_000 ? (n / 1_000).toFixed(0) + 'K' : String(n);

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
              {i === 4 && config.length > 0 && (
                <div style={{ marginTop: 16, borderRadius: 10, overflow: 'hidden', border: `1px solid ${cardBorder}` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: redGradient, padding: '10px 0' }}>
                    {['Rebate level', 'Team Number', 'Team Betting', 'Team Deposit'].map(h => (
                      <div key={h} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>{h}</div>
                    ))}
                  </div>
                  {config.map((row: any, ri: number) => (
                    <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '8px 0', background: ri % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'transparent', borderTop: `1px solid ${cardBorder}` }}>
                      <div style={{ textAlign: 'center', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <span style={{ fontSize: 14 }}>👑</span>
                        <span style={{ color: redPrimary, fontWeight: 600, fontSize: 11 }}>L{row.level}</span>
                      </div>
                      <div style={{ textAlign: 'center', fontSize: 11, color: textDark }}>{row.required_members}</div>
                      <div style={{ textAlign: 'center', fontSize: 11, color: textDark }}>{fmt(Number(row.required_betting))}</div>
                      <div style={{ textAlign: 'center', fontSize: 11, color: textDark }}>{fmt(Number(row.required_deposit))}</div>
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
  const [rates, setRates] = useState<any[]>([]);
  useEffect(() => { db.from('commission_rates').select('*').order('level').then(({ data }: any) => setRates(data ?? [])); }, []);

  return (
    <div className="fixed inset-0 z-50 max-w-[480px] mx-auto overflow-y-auto" style={{ background: pageBg }}>
      <SubPageHeader title={t('rebate_ratio')} onClose={onClose} />
      <div style={{ padding: '12px' }}>
        <div style={{ background: redGradient, borderRadius: 12, padding: 16, color: '#fff', textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 13, opacity: 0.9 }}>Commission distributed across</div>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>6 Referral Levels</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>On every bet placed by your team</div>
        </div>
        {rates.map((r: any) => (
          <div key={r.level} style={{ background: cardBg, borderRadius: 10, padding: '14px 16px', marginBottom: 10, border: `1px solid ${cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(200,16,46,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: redPrimary }}>L{r.level}</span>
              </div>
              <span style={{ fontSize: 14, color: textDark }}>Level {r.level} commission</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: redPrimary }}>{(Number(r.rate) * 100).toFixed(2)}%</span>
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
  const { profile, directs, team, todayCommission, yesterdayCommission, totalCommission, loading } = useReferralData();

  const invitationCode = profile?.invitation_code ?? '------------';
  const referralLink = `${window.location.origin}/signup-login?ref=${invitationCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(invitationCode).then(() => {
      setCopied(true);
      toast.success('Invitation code copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => toast.success('Referral link copied!'));
  };

  // Stats: count direct vs team for register / first deposit
  const directRegister = directs.length;
  const teamRegister = team.filter((m: any) => m.level >= 2 && m.level <= 6).length;
  const directFirstDep = directs.filter((d: any) => d.first_deposit_at).length;
  const teamFirstDep = team.filter((m: any) => m.first_deposit_at && m.level >= 2).length;

  const menuItems = [
    { icon: <Copy size={18} color={redPrimary} />, label: 'Copy invitation code', value: invitationCode, isCode: true },
    { icon: <Users size={18} color={redPrimary} />, label: t('subordinate_data'), page: 'subordinate' },
    { icon: <DollarSign size={18} color={redPrimary} />, label: t('commission_detail'), page: 'commission' },
    { icon: <ScrollText size={18} color={redPrimary} />, label: t('invitation_rules'), page: 'rules' },
    { icon: <Headphones size={18} color={redPrimary} />, label: t('agent_customer_service'), page: 'service' },
    { icon: <BadgePercent size={18} color={redPrimary} />, label: t('rebate_ratio'), page: 'rebate' },
  ];

  return (
    <div className="min-h-screen w-full max-w-[480px] mx-auto pb-24" style={{ background: pageBg }}>
      <Toaster position="top-center" richColors />

      <div style={{ background: headerGradient, paddingBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', width: 300, height: 180, background: 'radial-gradient(ellipse, rgba(200,16,46,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
          <div style={{ width: 32 }} />
          <span style={{ fontWeight: 700, fontSize: 17, color: '#fff' }}>{t('agency')}</span>
          <button onClick={() => setActivePage('newSub')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.25)' }}>
              <Users size={16} color="#fff" />
            </div>
          </button>
        </div>
        <div style={{ textAlign: 'center', paddingTop: 8, position: 'relative' }}>
          <div style={{ fontSize: 44, fontWeight: 800, color: '#fff', textShadow: '0 0 40px rgba(255,255,255,0.3)', letterSpacing: '-1px' }}>{yesterdayCommission.toFixed(2)}</div>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '8px 24px', borderRadius: 25, fontSize: 12, color: '#fff', fontWeight: 700, marginTop: 6 }}>
            Yesterday's total commission
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 10 }}>
            Agency level: <span style={{ color: '#FFD700', fontWeight: 800 }}>L{profile?.agency_level ?? 0}</span> · Wallet: ₹{Number(profile?.commission_wallet ?? 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div style={{ margin: '-10px 14px 0', position: 'relative', zIndex: 10 }}>
        <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: `1px solid ${cardBorder}`, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ padding: '14px 8px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderRight: `1px solid ${cardBorder}`, background: 'rgba(200,16,46,0.05)' }}>
              <Users size={15} color={redPrimary} />
              <span style={{ fontSize: 12, fontWeight: 700, color: redPrimary }}>Direct (L1)</span>
            </div>
            <div style={{ padding: '14px 8px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'rgba(200,16,46,0.05)' }}>
              <Users size={15} color={redPrimary} />
              <span style={{ fontSize: 12, fontWeight: 700, color: redPrimary }}>Team (L2-L6)</span>
            </div>
          </div>
          {[
            { label: 'Number of register', direct: directRegister, team: teamRegister },
            { label: 'Team betting', direct: '—', team: Number(profile?.team_betting ?? 0).toFixed(0), highlight: true },
            { label: 'Team deposit', direct: '—', team: Number(profile?.team_deposit ?? 0).toFixed(0), highlight: true },
            { label: 'First deposit people', direct: directFirstDep, team: teamFirstDep },
          ].map((row: any, i: number) => (
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

      <div style={{ padding: '18px 14px 0' }}>
        <button onClick={copyLink} style={{
          width: '100%', padding: '15px 0', borderRadius: 50, border: 'none', cursor: 'pointer',
          background: redGradient, color: '#fff',
          fontWeight: 800, fontSize: 15, boxShadow: '0 4px 20px rgba(200,16,46,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Copy size={18} /> Copy Referral Link
        </button>
      </div>

      <div style={{ margin: '18px 14px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {menuItems.map((item, i) => (
          <button key={i} onClick={() => {
            if (item.isCode) { copyCode(); return; }
            if (item.page) setActivePage(item.page);
          }} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 16px', background: '#fff', border: `1px solid ${cardBorder}`, cursor: 'pointer',
            borderRadius: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(200,16,46,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(200,16,46,0.12)' }}>
                {item.icon}
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: textDark }}>{item.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {item.value && <span style={{ fontSize: 12, color: textMuted, fontFamily: 'monospace' }}>{item.value}</span>}
              {item.isCode ? (copied ? <Check size={16} color={greenAccent} /> : <Copy size={16} color={textMuted} />) : <ChevronRight size={16} color={textMuted} />}
            </div>
          </button>
        ))}
      </div>

      <div style={{ margin: '18px 14px 0', borderRadius: 14, overflow: 'hidden', background: cardBg, border: `1px solid ${cardBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: `1px solid ${cardBorder}` }}>
          <span style={{ fontSize: 18 }}>📊</span>
          <span style={{ fontWeight: 700, fontSize: 14, color: textDark }}>Promotion data</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          {[
            { label: 'Today commission', value: todayCommission.toFixed(2) },
            { label: 'Total commission', value: totalCommission.toFixed(2) },
            { label: 'Direct subordinates', value: String(directRegister) },
            { label: 'Total team', value: String(directRegister + teamRegister) },
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
          <motion.div key="service" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}>
            <AgentCustomerServicePage onClose={() => setActivePage(null)} />
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
