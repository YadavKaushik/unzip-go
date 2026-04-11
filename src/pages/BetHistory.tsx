import React, { useState } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Toaster } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const themeGold = '#b42525';
const themeBg = '#FAF5E9';

const CATEGORIES = [
  {
    id: 'lottery',
    label: 'Lottery',
    icon: '🎰',
    games: [
      { typeName: 'Win Go', gameCode: 'WinGo' },
      { typeName: '30 second', gameCode: 'WinGo_30S' },
      { typeName: 'Win 1 minute', gameCode: 'WinGo_1M' },
      { typeName: 'Win 3 minute', gameCode: 'WinGo_3M' },
      { typeName: 'Win 5 minute', gameCode: 'WinGo_5M' },
    ],
  },
  {
    id: 'casino',
    label: 'Casino',
    icon: '🎲',
    games: [
      { typeName: 'All Casino', gameCode: 'casino_all' },
    ],
  },
  {
    id: 'fishing',
    label: 'Fishing',
    icon: '🎣',
    games: [
      { typeName: 'All Fishing', gameCode: 'fishing_all' },
    ],
  },
  {
    id: 'rummy',
    label: 'Rummy',
    icon: '🃏',
    games: [
      { typeName: 'All Rummy', gameCode: 'rummy_all' },
    ],
  },
  {
    id: 'original',
    label: 'Original',
    icon: '🎮',
    games: [
      { typeName: 'All Original', gameCode: 'original_all' },
    ],
  },
  {
    id: 'slots',
    label: 'Slots',
    icon: '🎰',
    games: [
      { typeName: 'All Slots', gameCode: 'slots_all' },
    ],
  },
];

export default function BetHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('lottery');
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showGameDropdown, setShowGameDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  if (!user) { navigate('/sign-up-login-screen'); return null; }

  const category = CATEGORIES.find(c => c.id === activeCategory)!;
  const games = category.games;
  const currentGame = selectedGame ? games.find(g => g.gameCode === selectedGame) : games[0];
  const selectedGameName = currentGame?.typeName || 'Select';

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
        <span style={{ fontWeight: 700, fontSize: 17, color: '#333' }}>Bet history</span>
        <div style={{ width: 28 }} />
      </div>

      {/* Category Tabs — horizontally scrollable */}
      <div style={{
        display: 'flex', gap: 0, padding: '10px 8px 6px',
        overflowX: 'auto', WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
      }}>
        {CATEGORIES.map(cat => {
          const sel = activeCategory === cat.id;
          return (
            <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setSelectedGame(''); }}
              style={{
                flex: '0 0 auto', minWidth: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '10px 10px', border: 'none', cursor: 'pointer', borderRadius: 10,
                background: sel ? themeGold : '#fff',
                color: sel ? '#fff' : '#888',
                transition: 'all 0.2s',
                marginRight: 6,
                boxShadow: sel ? `0 3px 10px ${themeGold}40` : '0 1px 3px rgba(0,0,0,0.06)',
              }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: sel ? 'rgba(255,255,255,0.2)' : '#f3f4f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>
                {cat.icon}
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: 8, padding: '6px 12px 10px' }}>
        {/* Game dropdown */}
        <div style={{ flex: 1, position: 'relative' }}>
          <button onClick={() => { setShowGameDropdown(!showGameDropdown); setShowDatePicker(false); }}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd',
              background: '#fff', fontSize: 13, color: '#333', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedGameName}</span>
            <ChevronDown size={14} color="#999" />
          </button>

          {showGameDropdown && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 60,
              background: '#fff', borderRadius: 8, border: '1px solid #eee',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxHeight: 250, overflowY: 'auto',
              marginTop: 4,
            }}>
              {games.map(g => {
                const isSel = selectedGame === g.gameCode || (!selectedGame && g === games[0]);
                return (
                  <button key={g.gameCode} onClick={() => { setSelectedGame(g.gameCode); setShowGameDropdown(false); }}
                    style={{
                      width: '100%', padding: '10px 14px', border: 'none', cursor: 'pointer',
                      background: isSel ? '#fef9e7' : '#fff',
                      color: isSel ? themeGold : '#333',
                      fontSize: 12, textAlign: 'left', fontWeight: isSel ? 700 : 400,
                      borderBottom: '1px solid #f5f5f5',
                    }}>
                    {g.typeName}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Date picker */}
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{
            width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd',
            background: '#fff', fontSize: 13, color: selectedDate ? '#333' : '#999', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }} onClick={() => { setShowDatePicker(!showDatePicker); setShowGameDropdown(false); }}>
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

      {/* Close dropdowns overlay */}
      {(showGameDropdown || showDatePicker) && (
        <div onClick={() => { setShowGameDropdown(false); setShowDatePicker(false); }}
          style={{ position: 'fixed', inset: 0, zIndex: 55 }} />
      )}

      {/* No Data */}
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ opacity: 0.15, marginBottom: 12 }}>
          <svg width="100" height="80" viewBox="0 0 100 80" fill="none">
            <path d="M10 70 L30 40 L45 55 L65 25 L90 70Z" fill="#999" opacity="0.3"/>
            <rect x="35" y="20" width="20" height="30" rx="2" fill="#999" opacity="0.4"/>
            <circle cx="75" cy="20" r="8" fill="#999" opacity="0.2"/>
            <path d="M5 72 H95" stroke="#999" strokeWidth="1.5" opacity="0.3"/>
          </svg>
        </div>
        <p style={{ fontSize: 13, color: '#bbb' }}>No data</p>
      </div>
    </div>
  );
}
