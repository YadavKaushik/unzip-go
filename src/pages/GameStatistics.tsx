import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Toaster } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';

const themeRed = '#b42525';
const themeRedLight = '#e8443a';
const themeBg = '#FAF5E9';

const GAME_STATS = [
  { gameType: 0, gameTypeName: 'lottery', icon: '🎰', betAmount: 0, betCount: 0, betWinLossAmount: 0 },
  { gameType: 1, gameTypeName: 'video', icon: '🎬', betAmount: 0, betCount: 0, betWinLossAmount: 0 },
  { gameType: 2, gameTypeName: 'Slot', icon: '🎰', betAmount: 0, betCount: 0, betWinLossAmount: 0 },
  { gameType: 3, gameTypeName: 'Fish', icon: '🐟', betAmount: 0, betCount: 0, betWinLossAmount: 0 },
  { gameType: 4, gameTypeName: 'sport', icon: '⚽', betAmount: 0, betCount: 0, betWinLossAmount: 0 },
  { gameType: 5, gameTypeName: 'ChessCard', icon: '♟️', betAmount: 0, betCount: 0, betWinLossAmount: 0 },
];

export default function GameStatistics() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('today');

  if (!user) { navigate('/sign-up-login-screen'); return null; }

  const TIME_TABS = [
    { key: 'today', label: t('today') },
    { key: 'yesterday', label: t('yesterday') },
    { key: 'this_week', label: t('this_week') },
    { key: 'this_month', label: t('this_month') },
  ];

  const totalBet = GAME_STATS.reduce((sum, g) => sum + g.betAmount, 0);

  return (
    <div style={{ minHeight: '100vh', width: '100%', maxWidth: 480, margin: '0 auto', background: themeBg, fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      <Toaster position="top-center" richColors />

      {/* Header */}
      <div style={{ background: '#fff', padding: '0 16px', height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid #eee' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
          <ArrowLeft size={22} color="#333" />
        </button>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#333' }}>{t('game_statistics')}</span>
        <div style={{ width: 28 }} />
      </div>

      {/* Time Tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 12px' }}>
        {TIME_TABS.map(tab => {
          const sel = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1, padding: '8px 4px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: sel ? themeRed : '#fff',
                color: sel ? '#fff' : '#666',
                fontSize: 12, fontWeight: 600,
                boxShadow: sel ? `0 2px 8px ${themeRed}40` : '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.2s',
              }}>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Total Bet */}
      <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: themeRed }}>₹{totalBet.toFixed(2)}</div>
        <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{t('total_bet')}</div>
      </div>

      {/* Game Categories */}
      <div style={{ padding: '0 12px', paddingBottom: 30 }}>
        {GAME_STATS.map((game) => (
          <div key={game.gameType} style={{
            background: '#fff', borderRadius: 10, padding: '14px 16px', marginBottom: 10,
            border: '1px solid #eee',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>{game.icon}</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#333' }}>{game.gameTypeName}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <StatRow label={t('total_bets')} value={`₹${game.betAmount.toFixed(2)}`} />
              <StatRow label={t('number_of_bets')} value={String(game.betCount)} />
              <StatRow label={t('winning_amount')} value={`₹${game.betWinLossAmount.toFixed(2)}`} valueColor={game.betWinLossAmount >= 0 ? '#22a06b' : themeRed} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 26 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#e8443a', flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: '#888' }}>{label}</span>
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: valueColor || '#333' }}>{value}</span>
    </div>
  );
}
