import React, { useState, useEffect, Suspense } from 'react';
import { GameSkeleton } from '@/components/SkeletonScreens';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { ArrowLeft, Crown, Loader2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { db as supabase } from '@/lib/db';

const RESULT_COLORS = ['Red', 'Green', 'Violet'];
const RESULT_NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const HISTORY_DATA = [
  { id: 'hist-001', round: 20241, result: 'Red', number: 3, time: '14:20:30', amount: 0 },
  { id: 'hist-002', round: 20240, result: 'Green', number: 6, time: '14:19:00', amount: 0 },
  { id: 'hist-003', round: 20239, result: 'Violet', number: 0, time: '14:17:30', amount: 0 },
  { id: 'hist-004', round: 20238, result: 'Red', number: 5, time: '14:16:00', amount: 0 },
  { id: 'hist-005', round: 20237, result: 'Green', number: 8, time: '14:14:30', amount: 0 },
  { id: 'hist-006', round: 20236, result: 'Red', number: 2, time: '14:13:00', amount: 0 },
  { id: 'hist-007', round: 20235, result: 'Green', number: 7, time: '14:11:30', amount: 0 },
  { id: 'hist-008', round: 20234, result: 'Violet', number: 0, time: '14:10:00', amount: 0 },
];

const BET_AMOUNTS = [10, 50, 100, 500, 1000];

function GameScreenInner() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, wallet, refreshWallet } = useAuth();
  const gameName = searchParams.get('game') || 'Win Go';
  const gameCode = searchParams.get('gameCode') || '';
  const providerCode = searchParams.get('provider') || '';
  const mode = searchParams.get('mode') || 'lottery';

  const [timer, setTimer] = useState(47);
  const balance = wallet ? Number(wallet.balance) + Number(wallet.bonus_balance) : 0;
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastResult, setLastResult] = useState<{ color: string; number: number } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'mybets'>('history');
  const [currentRound] = useState(20242);
  const [myBets, setMyBets] = useState<any[]>([]);
  const [isLaunching, setIsLaunching] = useState(false);

  // If mode is 'api', launch game via edge function
  useEffect(() => {
    if (mode === 'api' && user && gameCode) {
      launchExternalGame();
    }
  }, [mode, user, gameCode]);

  const launchExternalGame = async () => {
    if (!user) {
      toast.error('Please login first');
      navigate('/sign-up-login-screen');
      return;
    }

    setIsLaunching(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      if (!accessToken) {
        toast.error('Session expired. Please login again.');
        navigate('/sign-up-login-screen');
        return;
      }

      const { data, error } = await supabase.functions.invoke('launch-game', {
        body: {
          gameCode,
          gameName,
          providerCode,
        },
      });

      if (error) {
        toast.error('Failed to launch game');
        console.error('Launch error:', error);
        setIsLaunching(false);
        return;
      }

      if (data?.code === 0 && data?.data?.url) {
        // Open game in new tab or redirect
        window.open(data.data.url, '_blank');
        toast.success('Game launched! Check your new tab.');
        setIsLaunching(false);
      } else if (data?.code === 403) {
        toast.error(data?.msg || 'Insufficient balance or play locked');
        setIsLaunching(false);
      } else {
        toast.error(data?.msg || 'Failed to launch game');
        setIsLaunching(false);
      }
    } catch (err) {
      console.error('Launch error:', err);
      toast.error('Connection error. Try again.');
      setIsLaunching(false);
    }
  };

  useEffect(() => {
    if (user && mode !== 'api') {
      supabase.from('bets').select('*').eq('user_id', user.id).eq('game_name', gameName).order('created_at', { ascending: false }).limit(20)
        .then(({ data }) => { if (data) setMyBets(data); });
    }
  }, [user, gameName, mode]);

  useEffect(() => {
    if (mode === 'api') return;
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          const color = RESULT_COLORS[Math.floor(RESULT_COLORS.length * 0.5)];
          const number = RESULT_NUMBERS[3];
          setLastResult({ color, number });
          setShowResult(true);
          setTimeout(() => setShowResult(false), 3000);
          return 90;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [mode]);

  const handleBet = async () => {
    if (!user) { toast.error('Please login first'); return; }
    if (!selectedColor && selectedNumber === null) {
      toast.error('Please select a color or number to bet on');
      return;
    }
    const amount = customAmount ? parseFloat(customAmount) : betAmount;
    if (amount > balance) {
      toast.error('Insufficient balance. Please deposit funds.');
      return;
    }
    if (timer < 5) {
      toast.error('Betting closed for this round. Wait for next round.');
      return;
    }
    const { error } = await supabase.from('bets').insert({
      user_id: user.id,
      game_name: gameName,
      round_number: currentRound,
      bet_type: selectedColor ? 'color' : 'number',
      bet_value: selectedColor || String(selectedNumber),
      bet_amount: amount,
      status: 'pending',
    });
    if (error) { toast.error('Failed to place bet'); return; }
    await refreshWallet();
    setIsPlaying(true);
    const { data } = await supabase.from('bets').select('*').eq('user_id', user.id).eq('game_name', gameName).order('created_at', { ascending: false }).limit(20);
    if (data) setMyBets(data);
    toast.success(`Bet placed: ${selectedColor || `Number ${selectedNumber}`} — ₹${amount}`);
  };

  const colorMap: Record<string, string> = {
    Red: 'bg-red-500',
    Green: 'bg-green-500',
    Violet: 'bg-purple-500',
  };

  const colorTextMap: Record<string, string> = {
    Red: 'text-red-500',
    Green: 'text-green-500',
    Violet: 'text-purple-500',
  };

  const mins = Math.floor(timer / 60);
  const secs = timer % 60;

  // API mode - show launching screen
  if (mode === 'api') {
    return (
      <div className="min-h-screen w-full max-w-[420px] mx-auto pb-24" style={{ background: '#f5f5f5' }}>
        <Toaster position="top-center" richColors />
        <div style={{ background: 'linear-gradient(180deg, #8B0000 0%, #C8102E 100%)' }} className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate('/main-dashboard')} className="w-9 h-9 rounded-full bg-black/20 flex items-center justify-center">
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div className="flex items-center gap-2">
              <Crown size={16} className="text-yellow-300" />
              <span className="text-white font-700 text-base">{gameName}</span>
            </div>
            <div className="flex items-center gap-1 bg-black/20 rounded-full px-3 py-1.5">
              <span className="text-yellow-300 text-xs font-700 tabular-nums">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center mt-20 px-6">
          {isLaunching ? (
            <div className="text-center">
              <Loader2 size={48} className="text-red-600 animate-spin mx-auto mb-4" />
              <h2 className="text-lg font-700 text-gray-900 mb-2">Launching {gameName}...</h2>
              <p className="text-sm text-gray-500">Game will open in a new tab</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)' }}>
                <span className="text-3xl font-900 text-white">{gameName.split(' ').map(w => w[0]).join('').slice(0,2)}</span>
              </div>
              <h2 className="text-lg font-700 text-gray-900 mb-2">{gameName}</h2>
              <p className="text-sm text-gray-500 mb-1">Provider: {providerCode || 'Unknown'}</p>
              <p className="text-sm text-gray-500 mb-6">Balance: ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              
              {!user ? (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/sign-up-login-screen')}
                  className="px-8 py-3 rounded-xl font-700 text-white text-base"
                  style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)' }}
                >
                  Login to Play
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={launchExternalGame}
                  className="px-8 py-3 rounded-xl font-700 text-white text-base"
                  style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)' }}
                >
                  🎮 Launch Game
                </motion.button>
              )}

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/main-dashboard')}
                className="mt-3 px-8 py-3 rounded-xl font-600 text-gray-600 text-sm border border-gray-200"
              >
                ← Back to Games
              </motion.button>
            </div>
          )}
        </div>
        <BottomNav />
      </div>
    );
  }

  // Lottery mode - original game screen
  return (
    <div className="min-h-screen w-full max-w-[420px] sm:max-w-[480px] md:max-w-[540px] lg:max-w-[600px] mx-auto pb-24" style={{ background: '#f5f5f5' }}>
      <Toaster position="top-center" richColors />

      {/* Header */}
      <div style={{ background: 'linear-gradient(180deg, #8B0000 0%, #C8102E 100%)' }} className="px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/main-dashboard')} className="w-9 h-9 rounded-full bg-black/20 flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex items-center gap-2">
            <Crown size={16} className="text-yellow-300" />
            <span className="text-white font-700 text-base">{gameName}</span>
          </div>
          <div className="flex items-center gap-1 bg-black/20 rounded-full px-3 py-1.5">
            <span className="text-yellow-300 text-xs font-700 tabular-nums">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Round + Timer */}
      <div style={{ background: 'linear-gradient(180deg, #C8102E, #8B0000)' }} className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-red-200 text-xs font-500">Round #{currentRound}</div>
            <div className="text-white font-700 text-lg">Time Remaining</div>
          </div>
          <div className="flex items-center gap-1">
            <div className="bg-black/30 rounded-lg px-3 py-2 text-yellow-300 font-800 text-2xl tabular-nums">
              {String(mins).padStart(2, '0')}
            </div>
            <span className="text-yellow-300 font-800 text-2xl">:</span>
            <div className="bg-black/30 rounded-lg px-3 py-2 text-yellow-300 font-800 text-2xl tabular-nums">
              {String(secs).padStart(2, '0')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto scrollbar-hide">
          {HISTORY_DATA.slice(0, 8).map((h) => (
            <div key={h.id} className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-700 ${colorMap[h.result]}`}>
              {h.number}
            </div>
          ))}
        </div>
      </div>

      {/* Result Overlay */}
      <AnimatePresence>
        {showResult && lastResult && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
            <div className="bg-white rounded-3xl p-8 text-center shadow-2xl mx-8">
              <div className="text-5xl mb-3">🎯</div>
              <div className="text-gray-900 font-700 text-lg mb-2">Round Result</div>
              <div className={`text-3xl font-900 ${colorTextMap[lastResult.color]}`}>{lastResult.color}</div>
              <div className="text-gray-600 text-sm mt-1">Number: {lastResult.number}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bet Controls */}
      <div className="px-3 mt-3">
        <motion.div whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-sm font-700 text-gray-700 mb-3">Select Color</div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { color: 'Red', label: 'Red', payout: '2x', bg: 'from-red-500 to-red-700' },
              { color: 'Violet', label: 'Violet', payout: '4.5x', bg: 'from-purple-500 to-purple-700' },
              { color: 'Green', label: 'Green', payout: '2x', bg: 'from-green-500 to-green-700' },
            ].map((c) => (
              <motion.button key={`color-${c.color}`} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.94 }}
                onClick={() => { setSelectedColor(c.color === selectedColor ? null : c.color); setSelectedNumber(null); }}
                className={`py-3 rounded-xl text-white font-700 text-sm bg-gradient-to-b ${c.bg} ${selectedColor === c.color ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}`}>
                <div>{c.label}</div>
                <div className="text-white/70 text-[10px]">{c.payout}</div>
              </motion.button>
            ))}
          </div>

          <div className="text-sm font-700 text-gray-700 mb-3">Select Number</div>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {RESULT_NUMBERS.map((n) => (
              <motion.button key={`num-${n}`} whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.94 }}
                onClick={() => { setSelectedNumber(n === selectedNumber ? null : n); setSelectedColor(null); }}
                className={`py-2.5 rounded-xl font-700 text-sm transition-all ${selectedNumber === n ? 'text-white ring-2 ring-yellow-400' : 'bg-gray-100 text-gray-700'}`}
                style={selectedNumber === n ? { background: 'linear-gradient(135deg, #C8102E, #8B0000)' } : {}}>
                {n}
              </motion.button>
            ))}
          </div>

          <div className="text-sm font-700 text-gray-700 mb-2">Bet Amount</div>
          <div className="flex gap-2 flex-wrap mb-3">
            {BET_AMOUNTS.map((amt) => (
              <motion.button key={`amt-${amt}`} whileHover={{ scale: 1.06, y: -1 }} whileTap={{ scale: 0.94 }}
                onClick={() => { setBetAmount(amt); setCustomAmount(''); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-600 transition-all ${betAmount === amt && !customAmount ? 'text-white' : 'bg-gray-100 text-gray-700'}`}
                style={betAmount === amt && !customAmount ? { background: 'linear-gradient(135deg, #C8102E, #8B0000)' } : {}}>
                ₹{amt}
              </motion.button>
            ))}
          </div>

          <div className="flex gap-2 mb-4">
            <input type="number" placeholder="Custom amount" value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setBetAmount(0); }}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm font-500 focus:outline-none focus:border-red-400" />
          </div>

          {(selectedColor || selectedNumber !== null) && (
            <div className="bg-red-50 rounded-xl p-3 mb-3 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 font-500">Your bet</div>
                <div className="text-sm font-700 text-red-700">{selectedColor || `Number ${selectedNumber}`} — ₹{customAmount || betAmount}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-500">Potential win</div>
                <div className="text-sm font-700 text-green-600">₹{((customAmount ? parseFloat(customAmount) : betAmount) * (selectedColor === 'Violet' ? 4.5 : 2)).toFixed(2)}</div>
              </div>
            </div>
          )}

          <motion.button whileTap={{ scale: 0.97 }} onClick={handleBet} disabled={timer < 5}
            className="w-full py-3.5 rounded-xl font-700 text-white text-base disabled:opacity-50 transition-all"
            style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)' }}>
            {timer < 5 ? '⏳ Betting Closed' : `Place Bet — ₹${customAmount || betAmount}`}
          </motion.button>
        </motion.div>
      </div>

      {/* History Tabs */}
      <div className="px-3 mt-4">
        <div className="flex bg-white rounded-xl overflow-hidden shadow-sm">
          {(['history', 'mybets'] as const).map((t) => (
            <button key={`game-tab-${t}`} onClick={() => setActiveTab(t)}
              className={`flex-1 py-3 text-sm font-700 transition-all ${activeTab === t ? 'text-white' : 'text-gray-500'}`}
              style={activeTab === t ? { background: 'linear-gradient(135deg, #C8102E, #8B0000)' } : {}}>
              {t === 'history' ? '📊 Round History' : '🎯 My Bets'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-b-2xl shadow-sm mt-0.5 overflow-hidden">
          {activeTab === 'history' ? (
            <div>
              <div className="grid grid-cols-4 px-4 py-2 bg-gray-50 border-b border-gray-100">
                {['Round', 'Number', 'Color', 'Time'].map((h) => (
                  <div key={`th-${h}`} className="text-xs font-700 text-gray-500">{h}</div>
                ))}
              </div>
              {HISTORY_DATA.map((row) => (
                <div key={row.id} className="grid grid-cols-4 px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <div className="text-xs font-600 text-gray-700 tabular-nums">{row.round}</div>
                  <div className="text-xs font-700 text-gray-900">{row.number}</div>
                  <div>
                    <span className={`text-xs font-700 px-2 py-0.5 rounded-full text-white ${colorMap[row.result]}`}>{row.result}</span>
                  </div>
                  <div className="text-xs text-gray-400 tabular-nums">{row.time}</div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-4 px-4 py-2 bg-gray-50 border-b border-gray-100">
                {['Round', 'Bet', '₹', 'Result'].map((h) => (
                  <div key={`mybets-th-${h}`} className="text-xs font-700 text-gray-500">{h}</div>
                ))}
              </div>
              {myBets.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-400">No bets yet — place one!</div>
              ) : myBets.map((row) => (
                <div key={row.id} className="grid grid-cols-4 px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <div className="text-xs font-600 text-gray-700 tabular-nums">{row.round_number}</div>
                  <div className="text-xs font-600 text-gray-700">{row.bet_value}</div>
                  <div className={`text-xs font-700 tabular-nums ${row.status === 'win' ? 'text-green-600' : row.status === 'lose' ? 'text-red-500' : 'text-gray-500'}`}>
                    {row.status === 'win' ? '+' : row.status === 'lose' ? '-' : ''}₹{Number(row.bet_amount).toLocaleString('en-IN')}
                  </div>
                  <div>
                    <span className={`text-[10px] font-700 px-1.5 py-0.5 rounded-full ${
                      row.status === 'win' ? 'bg-green-100 text-green-700' : row.status === 'lose' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {row.status === 'win' ? 'WIN' : row.status === 'lose' ? 'LOSE' : 'PENDING'}
                    </span>
                  </div>
                </div>
              ))}
              {!isPlaying && (
                <div className="text-center py-4 text-sm text-gray-400">Place a bet to see it here</div>
              )}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default function GameScreen() {
  return (
    <Suspense fallback={<GameSkeleton />}>
      <GameScreenInner />
    </Suspense>
  );
}
