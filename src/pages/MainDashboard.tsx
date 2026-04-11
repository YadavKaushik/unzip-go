import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ChevronRight, Heart, Flame, Crown, Plus, X, Gamepad2, Grid3x3, Volume2, Trophy, Tv, Ticket, Home, Fish, ArrowLeft, Search } from 'lucide-react';
import { PROVIDER_GAMES, type ProviderGame } from '@/data/providerGames';
import BottomNav from '@/components/BottomNav';
import { Toaster, toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { db as supabase } from '@/lib/db';
import { useAuth } from '@/hooks/useAuth';
import { DashboardSkeleton } from '@/components/SkeletonScreens';


// ── Mock Data ──────────────────────────────────────────────────────────────────
const BANNERS = [
  { id: 'b1', url: '/promotions-detail', img: 'https://img1.rajaluckcdn.com/banner/Banner_20231201191823x5uj.png' },
  { id: 'b2', url: '/promotions-detail', img: 'https://img1.rajaluckcdn.com/banner/Banner_202311302338523vpv.png' },
  { id: 'b3', url: '/promotions-detail', img: 'https://img1.rajaluckcdn.com/banner/Banner_202311302341004kwv.png' },
  { id: 'b4', url: '/promotions-detail', img: 'https://img1.rajaluckcdn.com/banner/Banner_20231130234042rnai.png' },
  { id: 'b5', url: '/promotions-detail', img: 'https://img1.rajaluckcdn.com/banner/Banner_202311302340217ul2.png' },
  { id: 'b6', url: '/promotions-detail', img: 'https://img1.rajaluckcdn.com/banner/Banner_20231130233820k3m3.png' },
  { id: 'b7', url: '/promotions-detail', img: 'https://img1.rajaluckcdn.com/banner/Banner_202404111904167usj.png' },
  { id: 'b8', url: '/promotions-detail', img: 'https://img1.rajaluckcdn.com/banner/Banner_20240409192800g1dn.png' },
  { id: 'b9', url: '/promotions-detail', img: 'https://img1.rajaluckcdn.com/banner/Banner_202406071326127ds2.png' },
];


const CATEGORIES = [
{ key: 'cat-lobby', label: 'Lobby', icon: Home },
{ key: 'cat-lottery', label: 'Lottery', icon: Ticket },
{ key: 'cat-mini', label: 'Mini Games', icon: Gamepad2 },
{ key: 'cat-popular', label: 'Popular', icon: Flame },
{ key: 'cat-slot', label: 'Slots', icon: Grid3x3 },
{ key: 'cat-video', label: 'Video', icon: Tv },
{ key: 'cat-sport', label: 'Sports', icon: Trophy },
{ key: 'cat-fishing', label: 'Fish', icon: Fish }];


const LOTTERY_GAMES = [
{ id: 'lottery-001', name: 'Win Go', subtitle: 'Guess the number', hot: true, gradient: 'linear-gradient(160deg, #f472b6 0%, #ec4899 50%, #db2777 100%)', timer: 47 },
{ id: 'lottery-002', name: 'K3', subtitle: 'Guess the number', hot: false, gradient: 'linear-gradient(160deg, #f9a8d4 0%, #f472b6 50%, #ec4899 100%)', timer: 112 },
{ id: 'lottery-003', name: '5D', subtitle: 'Guess the number', hot: false, gradient: 'linear-gradient(160deg, #c084fc 0%, #a855f7 50%, #9333ea 100%)', timer: 203 },
{ id: 'lottery-004', name: 'Trx Win', subtitle: 'Guess the number', hot: false, gradient: 'linear-gradient(160deg, #f9a8d4 0%, #f472b6 50%, #e879a8 100%)', timer: 85 }];

// Lottery icon components
function WinGoIcon() {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <div className="absolute w-7 h-7 rounded-full bg-green-400 flex items-center justify-center text-white font-800 text-xs shadow-md" style={{ top: 0, left: '50%', transform: 'translateX(-50%)' }}>5</div>
      <div className="absolute w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white font-800 text-[10px] shadow-md" style={{ top: 2, left: 2 }}>9</div>
      <div className="absolute w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white font-800 text-[10px] shadow-md" style={{ bottom: 4, left: 6 }}>7</div>
      <div className="absolute w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-800 text-[10px] shadow-md" style={{ bottom: 2, right: 6 }}>2</div>
    </div>
  );
}

function K3Icon() {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <div className="w-10 h-10 bg-white rounded-lg shadow-md flex flex-wrap items-center justify-center gap-0.5 p-1.5 transform -rotate-6">
        <div className="w-2 h-2 rounded-full bg-red-500" />
        <div className="w-2 h-2 rounded-full bg-red-500" />
        <div className="w-2 h-2 rounded-full bg-red-500" />
        <div className="w-2 h-2 rounded-full bg-red-500" />
      </div>
      <div className="absolute bottom-1 right-1 w-8 h-8 bg-white rounded-lg shadow-md flex flex-wrap items-center justify-center gap-0.5 p-1 transform rotate-12">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
      </div>
    </div>
  );
}

function FiveDIcon() {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center text-white font-900 text-xs shadow-md z-10">5D</div>
      <div className="absolute w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white font-800 text-[9px] shadow-md" style={{ top: 2, left: 8 }}>1</div>
      <div className="absolute w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-white font-800 text-[9px] shadow-md" style={{ top: 2, right: 8 }}>3</div>
      <div className="absolute w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center text-white font-800 text-[9px] shadow-md" style={{ bottom: 4, left: '50%', transform: 'translateX(-50%)' }}>8</div>
    </div>
  );
}

function TrxIcon() {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-b-[24px] border-l-transparent border-r-transparent border-b-red-400" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
      <div className="absolute w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-white font-800 text-[9px] shadow-md" style={{ top: 2, right: 6 }}>1</div>
      <div className="absolute w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white font-800 text-[9px] shadow-md" style={{ bottom: 6, left: 4 }}>T</div>
      <div className="absolute w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white font-800 text-[9px] shadow-md" style={{ bottom: 6, right: 4 }}>X</div>
    </div>
  );
}

const LOTTERY_ICONS: Record<string, React.FC> = {
  'Win Go': WinGoIcon,
  'K3': K3Icon,
  '5D': FiveDIcon,
  'Trx Win': TrxIcon,
};


const POPULAR_GAMES = [
{ id: 'pop-001', name: 'Chicken Road 2', provider: 'TB Chess', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/TB_Chess/121.png', hot: true },
{ id: 'pop-002', name: 'Aviator', provider: 'TB Chess', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/TB_Chess/800.png', hot: true },
{ id: 'pop-003', name: 'Cricket', provider: 'TB Chess', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/TB_Chess/810.png', hot: true },
{ id: 'pop-004', name: 'Mines', provider: 'TB Chess', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/TB_Chess/100.png', hot: false },
{ id: 'pop-005', name: 'Limbo', provider: 'TB Chess', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/TB_Chess/110.png', hot: false },
{ id: 'pop-006', name: 'Money Coming', provider: 'JILI', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/JILI/51.png', hot: true },
{ id: 'pop-007', name: 'Fortune Gems 2', provider: 'JILI', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/JILI/223.png', hot: false },
{ id: 'pop-008', name: 'Fortune Gems', provider: 'JILI', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/JILI/109.png', hot: false },
{ id: 'pop-009', name: 'Super Ace', provider: 'JILI', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/JILI/49.png', hot: true },
{ id: 'pop-010', name: 'Hot Spin', provider: 'CQ9', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/CQ9/19.png', hot: false },
{ id: 'pop-011', name: 'Crazy 777', provider: 'JILI', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/JILI/35.png', hot: false },
{ id: 'pop-012', name: 'Wildfire Wins', provider: 'MG', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/MG/SMG_wildfireWins.png', hot: false },
{ id: 'pop-013', name: 'Charge Buffalo', provider: 'JILI', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/JILI/47.png', hot: true },
{ id: 'pop-014', name: 'Seven Seven Seven', provider: 'JILI', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/JILI/27.png', hot: false },
{ id: 'pop-015', name: 'Galaxy Burst', provider: 'JDB', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/JDB/9013.png', hot: false }];


const MINI_GAMES = [
{ id: 'mini-001', name: 'Aviator', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/TB_Chess/804.png', hot: true, provider: 'TB Chess' },
{ id: 'mini-002', name: 'Cricket', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/TB_Chess/810.png', hot: true, provider: 'TB Chess' },
{ id: 'mini-003', name: 'Chicken Road 2', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/TB_Chess/121.png', hot: true, provider: 'TB Chess' },
{ id: 'mini-004', name: 'Mines', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/TB_Chess/100.png', hot: false, provider: 'TB Chess' },
{ id: 'mini-005', name: 'Plinko', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/TB_Chess/103.png', hot: false, provider: 'TB Chess' },
{ id: 'mini-006', name: 'Limbo', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/TB_Chess/110.png', hot: false, provider: 'TB Chess' },
{ id: 'mini-007', name: 'Bomb Wave', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/TB_Chess/500.png', hot: true, provider: 'TB Chess' },
{ id: 'mini-008', name: 'Snakes', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/TB_Chess/120.png', hot: false, provider: 'TB Chess' },
{ id: 'mini-009', name: 'Dragon Tiger', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/TB_Chess/903.png', hot: false, provider: 'TB Chess' },
{ id: 'mini-010', name: 'Dice', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/TB_Chess/102.png', hot: false, provider: 'TB Chess' },
{ id: 'mini-011', name: 'Teen Patti', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/TB_Chess/115.png', hot: true, provider: 'TB Chess' },
{ id: 'mini-012', name: 'Hi Lo', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/TB_Chess/101.png', hot: false, provider: 'TB Chess' },
{ id: 'mini-013', name: 'Coin Flip', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/TB_Chess/109.png', hot: false, provider: 'TB Chess' },
{ id: 'mini-014', name: 'Wheel', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/JILI/236.png', hot: false, provider: 'JILI' },
{ id: 'mini-015', name: 'Andar Bahar', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/TB_Chess/814.png', hot: true, provider: 'TB Chess' },
{ id: 'mini-016', name: 'Space XY', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/BGAMING/SpaceXY.png', hot: false, provider: 'BGaming' },
{ id: 'mini-017', name: 'Rocket', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/TB_Chess/813.png', hot: false, provider: 'TB Chess' },
{ id: 'mini-018', name: 'Dragons Crash', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/BGAMING/DragonsCrash.png', hot: false, provider: 'BGaming' }];


const SLOT_PROVIDERS = [
{ id: 'slot-001', name: 'JILI', providerKey: 'JILI', img: 'https://ossimg.lottery7lottery7.com/lottery77/vendorlogo/vendorlogo_20250604173521vbl1.jpg', games: 146 },
{ id: 'slot-002', name: 'PG', providerKey: 'PG', img: 'https://ossimg.lottery7lottery7.com/lottery77/vendorlogo/vendorlogo_20250604173558o619.jpg', games: 101 },
{ id: 'slot-003', name: 'MG', providerKey: 'MG', img: 'https://ossimg.lottery7lottery7.com/lottery77/vendorlogo/vendorlogo_20250604173615on5s.jpg', games: 37 },
{ id: 'slot-004', name: 'CQ9', providerKey: 'CQ9', img: 'https://ossimg.lottery7lottery7.com/lottery77/vendorlogo/vendorlogo_20250601074745xciq.jpg', games: 20 },
{ id: 'slot-005', name: 'JDB', providerKey: 'JDB', img: 'https://ossimg.lottery7lottery7.com/lottery77/vendorlogo/vendorlogo_202506041736515ecl.jpg', games: 74 },
{ id: 'slot-006', name: 'InOut', providerKey: 'InOut', img: 'https://ossimg.lottery7lottery7.com/lottery77/vendorlogo/vendorlogo_2025060716303228r6.jpg', games: 54 },
{ id: 'slot-007', name: 'EVO Slots', providerKey: 'EVO', img: 'https://ossimg.lottery7lottery7.com/lottery77/vendorlogo/vendorlogo_20250601221315635u.jpg', games: 127 },
{ id: 'slot-008', name: 'G9', providerKey: 'G9', img: 'https://ossimg.lottery7lottery7.com/lottery77/vendorlogo/vendorlogo_20250604173712le9c.jpg', games: 54 },
{ id: 'slot-009', name: 'BGaming', providerKey: 'BGaming', img: 'https://ossimg.lottery7lottery7.com/lottery77/vendorlogo/vendorlogo_20250830165335mu5l.png', games: 242 }];


const PLATFORM_RECS = [
{ id: 'rec-001', name: 'Olympus 1000', subtitle: 'Gates of Olympus', emoji: '⚡' },
{ id: 'rec-002', name: 'Chicken Road', subtitle: 'Crash Game', emoji: '🐔' },
{ id: 'rec-003', name: 'Super Rich', subtitle: 'Fortune Slots', emoji: '💰' }];


const FISHING_GAMES = [
{ id: 'fish-001', name: 'Jackpot Fishing', gameID: '32', provider: 'JILI', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/JILI/32.png' },
{ id: 'fish-002', name: 'Dinosaur Tycoon', gameID: '42', provider: 'JILI', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/JILI/42.png' },
{ id: 'fish-003', name: 'Dragon Fortune', gameID: '60', provider: 'JILI', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/JILI/60.png' },
{ id: 'fish-004', name: 'Boom Legend', gameID: '71', provider: 'JILI', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/JILI/71.png' },
{ id: 'fish-005', name: 'Mega Fishing', gameID: '74', provider: 'JILI', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/JILI/74.png' },
{ id: 'fish-006', name: 'Happy Fishing', gameID: '82', provider: 'JILI', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/JILI/82.png' },
{ id: 'fish-007', name: 'Fighter Fire', gameID: '7008', provider: 'JDB', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/JDB/7008_20250507162804668.png' },
{ id: 'fish-008', name: 'Dragon of Demons', gameID: '7010', provider: 'JDB', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/JDB/7010.png' },
{ id: 'fish-009', name: 'Paradise', gameID: 'AB3', provider: 'CQ9', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/CQ9/AB3.png' },
{ id: 'fish-010', name: 'One Shot Fishing', gameID: 'AT01', provider: 'CQ9', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/CQ9/AT01.png' },
{ id: 'fish-011', name: 'Lucky Fishing', gameID: 'AT05', provider: 'CQ9', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/CQ9/AT05.png' },
{ id: 'fish-012', name: 'Hero Fishing', gameID: 'GO02', provider: 'CQ9', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/CQ9/GO02.png' },
{ id: 'fish-013', name: 'Dragon Fishing', gameID: '7001', provider: 'JDB', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/JDB/7001.png' },
{ id: 'fish-014', name: 'Dragon Fishing II', gameID: '7002', provider: 'JDB', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/JDB/7002.png' },
{ id: 'fish-015', name: 'Cai Shen Fishing', gameID: '7003', provider: 'JDB', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/JDB/7003.png' },
{ id: 'fish-016', name: 'Royal Fishing', gameID: '1', provider: 'JILI', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/JILI/1.png' },
{ id: 'fish-017', name: 'All Star Fishing', gameID: '119', provider: 'JILI', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/JILI/119.png' },
{ id: 'fish-018', name: 'Bombing Fishing', gameID: '20', provider: 'JILI', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/JILI/20.png' },
{ id: 'fish-019', name: 'Dinosaur Tycoon II', gameID: '212', provider: 'JILI', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/JILI/212.png' },
{ id: 'fish-020', name: 'Fortune Zombie', gameID: '531', provider: 'JILI', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/JILI/531.png' },
{ id: 'fish-021', name: 'One Stick Fishing', gameID: 'GO05', provider: 'CQ9', img: 'https://ossimg.lottery7lottery7.com/lottery77/gamelogo/CQ9/GO05.png' }];


const VIDEO_PROVIDERS = [
{ id: 'vid-001', name: 'EVO Live', vendorCode: 'EVO_Video', img: 'https://ossimg.lottery7lottery7.com/lottery77/vendorlogo/vendorlogo_20250604174217dec4.jpg' },
{ id: 'vid-002', name: 'Sexy Live', vendorCode: 'SEXY_Video', img: 'https://ossimg.lottery7lottery7.com/lottery77/vendorlogo/vendorlogo_20250604174239925m.jpg' },
{ id: 'vid-003', name: 'AG Live', vendorCode: 'AG_Video', img: 'https://ossimg.lottery7lottery7.com/lottery77/vendorlogo/vendorlogo_20250607162950ws3v.jpg' },
{ id: 'vid-004', name: 'WM Live', vendorCode: 'WM_Video', img: 'https://ossimg.lottery7lottery7.com/lottery77/vendorlogo/vendorlogo_20250604174257jyfp.jpg' },
{ id: 'vid-005', name: 'DG Live', vendorCode: 'DG', img: 'https://ossimg.lottery7lottery7.com/lottery77/vendorlogo/vendorlogo_20250503022053lgwc.png' },
{ id: 'vid-006', name: 'MG Live', vendorCode: 'MG_Video', img: 'https://ossimg.lottery7lottery7.com/lottery77/vendorlogo/vendorlogo_20250603231630dwek.jpg' }];


const SPORT_PROVIDERS = [
{ id: 'sport-001', name: 'Wickets9', vendorCode: 'Wickets9', img: 'https://ossimg.lottery7lottery7.com/lottery77/vendorlogo/vendorlogo_202505311515193xae.jpg' },
{ id: 'sport-002', name: 'CMD', vendorCode: 'CMD', img: 'https://ossimg.lottery7lottery7.com/lottery77/vendorlogo/vendorlogo_20250531151654mbaf.jpg' },
{ id: 'sport-003', name: 'SaBa', vendorCode: 'SaBa', img: 'https://ossimg.lottery7lottery7.com/lottery77/vendorlogo/vendorlogo_20250531151638s8ti.jpg' }];


const LIVE_WINNERS = [
{ id: 'win-001', user: 'He***W3', game: 'Win Go', amount: '₹27.63', avatar: '👨', label: 'total winnings' },
{ id: 'win-002', user: 'He***W5', game: 'Aviator', amount: '₹56.45', avatar: '👩', label: 'total winnings' },
{ id: 'win-003', user: 'He***Yi', game: 'Fortune Tiger', amount: '₹10.44', avatar: '🧑', label: 'total winnings' },
{ id: 'win-004', user: 'He***C3', game: 'K3', amount: '₹60.00', avatar: '👩', label: 'total winnings' },
{ id: 'win-005', user: 'He***W6', game: 'Mines', amount: '₹20.06', avatar: '👨', label: 'total winnings' }];


const TOP_EARNERS = [
{ id: 'earn-001', rank: 1, user: 'AZA***RH', amount: 16501785370.00, avatarBg: 'from-yellow-400 to-orange-500', initials: 'AZ' },
{ id: 'earn-002', rank: 2, user: 'Mem***LB2', amount: 672550039.00, avatarBg: 'from-gray-300 to-gray-500', initials: 'LB' },
{ id: 'earn-003', rank: 3, user: 'Mem***MAL', amount: 224813287.72, avatarBg: 'from-orange-400 to-amber-600', initials: 'MA' },
{ id: 'earn-004', rank: 4, user: 'Bo***ss', amount: 130260620.00, avatarBg: 'from-pink-400 to-rose-600', initials: 'Bo' },
{ id: 'earn-005', rank: 5, user: 'Mem***CEZ', amount: 90952883.70, avatarBg: 'from-blue-400 to-indigo-600', initials: 'CE' },
{ id: 'earn-006', rank: 6, user: 'TR***X', amount: 51034676.00, avatarBg: 'from-purple-400 to-violet-600', initials: 'TR' },
{ id: 'earn-007', rank: 7, user: 'GO***OA', amount: 14904036.00, avatarBg: 'from-green-400 to-emerald-600', initials: 'GO' },
{ id: 'earn-008', rank: 8, user: 'San***Raj', amount: 13600636.00, avatarBg: 'from-red-400 to-rose-600', initials: 'SR' },
{ id: 'earn-009', rank: 9, user: 'Mem***KEC', amount: 7408803.92, avatarBg: 'from-cyan-400 to-teal-600', initials: 'KE' },
{ id: 'earn-010', rank: 10, user: 'Mem***LBQ', amount: 6572084.66, avatarBg: 'from-amber-400 to-yellow-600', initials: 'LB' }];


// ── Premium Card Wrapper ───────────────────────────────────────────────────────
function PremiumCard({
  children,
  onClick,
  className = '',
  style = {},
  glowColor = 'rgba(200,16,46,0.55)'






}: {children: React.ReactNode;onClick?: () => void;className?: string;style?: React.CSSProperties;glowColor?: string;}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -5, scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      className={`relative cursor-pointer overflow-hidden ${className}`}
      style={{
        ...style,
        boxShadow: hovered ?
        `0 8px 28px ${glowColor}, 0 2px 8px rgba(0,0,0,0.25)` :
        '0 2px 8px rgba(0,0,0,0.18)',
        transition: 'box-shadow 0.25s ease'
      }}>
      
      {children}
      {/* Shimmer overlay */}
      <motion.div
        initial={{ x: '-120%', opacity: 0 }}
        animate={hovered ? { x: '120%', opacity: 1 } : { x: '-120%', opacity: 0 }}
        transition={{ duration: 0.55, ease: 'easeInOut' }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.28) 50%, transparent 70%)',
          zIndex: 20
        }} />
      
    </motion.div>);

}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function MainDashboard() {
  const navigate = useNavigate();
  const { user, wallet } = useAuth();
  const [activeCategory, setActiveCategory] = useState('cat-lobby');
  const [currentBanner, setCurrentBanner] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const walletBalance = wallet ? Number(wallet.balance) + Number(wallet.bonus_balance) : 0;
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [winnerIndex, setWinnerIndex] = useState(0);
  const [scrollWinnerIndex, setScrollWinnerIndex] = useState(0);
  const [showAllFish, setShowAllFish] = useState(false);
  const [showAllMini, setShowAllMini] = useState(false);
  const [showAllPopular, setShowAllPopular] = useState(false);
  const [showAllSlot, setShowAllSlot] = useState(false);
  const [showAllVideo, setShowAllVideo] = useState(false);
  const [showAllSport, setShowAllSport] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [providerSearch, setProviderSearch] = useState('');
  const isLoggedIn = !!user;
  const bannerRef = useRef<NodeJS.Timeout | null>(null);
  const lotteryRef = useRef<HTMLDivElement>(null);
  const miniGamesRef = useRef<HTMLDivElement>(null);
  const popularRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const fishingRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const sportRef = useRef<HTMLDivElement>(null);

  const sectionRefMap: Record<string, React.RefObject<HTMLDivElement>> = {
    'cat-lobby': lotteryRef,
    'cat-lottery': lotteryRef,
    'cat-mini': miniGamesRef,
    'cat-popular': popularRef,
    'cat-slot': slotRef,
    'cat-fishing': fishingRef,
    'cat-video': videoRef,
    'cat-sport': sportRef
  };

  const handleCategoryClick = (key: string) => {
    setActiveCategory(key);
  };

  const isVisible = (sectionKey: string) => {
    if (activeCategory === 'cat-lobby') return true;
    return activeCategory === sectionKey;
  };

  useEffect(() => {
    const stored = localStorage.getItem('techie404-favorites');
    if (stored) {
      try {setFavorites(new Set(JSON.parse(stored)));} catch {}
    }
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    bannerRef.current = setInterval(() => {
      setCurrentBanner((b) => (b + 1) % BANNERS.length);
    }, 3500);
    return () => {if (bannerRef.current) clearInterval(bannerRef.current);};
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWinnerIndex((i) => (i + 1) % LIVE_WINNERS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setScrollWinnerIndex((i) => (i + 1) % LIVE_WINNERS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {next.delete(id);} else {next.add(id);}
      localStorage.setItem('techie404-favorites', JSON.stringify([...next]));
      return next;
    });
  };

  const handleGameClick = async (gameName: string, gameCode?: string, providerCode?: string) => {
    const isLotteryGame = ['Win Go', 'K3', '5D', 'Trx Win'].includes(gameName);
    
    if (isLotteryGame) {
      if (!isLoggedIn) {
        toast.error('Please login first');
        navigate('/sign-up-login-screen');
        return;
      }
      navigate(`/game-screen?game=${encodeURIComponent(gameName)}`);
      return;
    }

    // Non-lottery: direct API launch
    if (!isLoggedIn) {
      toast.error('Please login to play');
      navigate('/sign-up-login-screen');
      return;
    }

    toast.loading('Launching ' + gameName + '...', { id: 'game-launch' });
    try {
      const { data, error } = await supabase.functions.invoke('launch-game', {
        body: { gameCode: gameCode || gameName, gameName, providerCode: providerCode || '' },
      });

      if (error) {
        toast.error('Failed to launch game', { id: 'game-launch' });
        return;
      }

      if (data?.code === 0 && data?.data?.url) {
        toast.success('Game launched!', { id: 'game-launch' });
        window.open(data.data.url, '_blank');
      } else if (data?.code === 403) {
        toast.error(data?.msg || 'Insufficient balance or play locked', { id: 'game-launch' });
      } else {
        toast.error(data?.msg || 'Failed to launch game', { id: 'game-launch' });
      }
    } catch (err) {
      toast.error('Connection error. Try again.', { id: 'game-launch' });
    }
  };

  const cardBg = 'bg-white';
  const textPrimary = 'text-gray-900';
  const textMuted = 'text-gray-500';

  if (loading) {
    return (
      <>
        <DashboardSkeleton />
        <BottomNav />
      </>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-[420px] mx-auto pb-24 overflow-x-hidden" style={{ background: '#f5f5f5' }}>
      <Toaster position="top-center" richColors />

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(180deg, #8B0000 0%, #C8102E 100%)' }} className="px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Crown size={18} className="text-yellow-300" />
            <span className="text-yellow-300 font-900 text-xl tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              𝐓𝐞𝐜𝐡𝐢𝐞⁴⁰⁴
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowWalletModal(true)}
                className="flex items-center gap-1 bg-black/20 border border-yellow-400/40 rounded-full px-2.5 py-1">
                <span className="text-yellow-300 text-xs font-700 tabular-nums">₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <Plus size={11} className="text-yellow-300" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 4px 14px rgba(212,175,55,0.5)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/sign-up-login-screen')}
                className="bg-yellow-400 text-red-900 text-xs font-700 px-3 py-1.5 rounded-full whitespace-nowrap">
                Login
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* ── Banner Slider ───────────────────────────────────── */}
      <div className="px-3 pt-3">
        <div className="relative rounded-2xl overflow-hidden h-36 cursor-pointer" onClick={() => navigate(BANNERS[currentBanner]?.url || '/promotions-detail')}>
          <AnimatePresence mode="wait">
            {BANNERS.map((banner, idx) =>
            idx === currentBanner ?
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0">
              <img src={banner.img} alt="promo" className="w-full h-full object-cover" />
            </motion.div> :
            null
            )}
          </AnimatePresence>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {BANNERS.map((b, i) =>
            <button
              key={`dot-${b.id}`}
              onClick={(e) => {e.stopPropagation();setCurrentBanner(i);}}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentBanner ? 'w-5 bg-yellow-400' : 'w-1.5 bg-white/40'}`} />
            )}
          </div>
        </div>
      </div>

      {/* ── Notice Bar ─────────────────────────────────────── */}
      <div className="mx-3 mt-2 flex items-center gap-2 bg-white border border-red-100 rounded-full px-3 py-1.5 shadow-sm overflow-hidden" >
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)' }}>
          <Volume2 size={11} className="text-white" />
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="whitespace-nowrap animate-marquee text-xs text-gray-600 font-500">
            To contact our customer service team. &nbsp;&nbsp;&nbsp; Welcome to 𝐓𝐞𝐜𝐡𝐢𝐞⁴⁰⁴! ₹777 FREE on registration! &nbsp;&nbsp;&nbsp; New game: Win Go Dragon — Five draws in a row!
          </div>
        </div>
        <button
          onClick={() => navigate('/activity-history')}
          className="flex-shrink-0 bg-red-600 text-white text-[10px] font-600 px-2.5 py-0.5 rounded-full">
          
          more &gt;
        </button>
      </div>

      {/* ── Category Tabs ───────────────────────────────────── */}
      <div className="px-3 mt-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORIES.map((cat) => {
            const CatIcon = cat.icon;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => handleCategoryClick(cat.key)}
                className={`flex-shrink-0 flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200 min-w-[62px] relative overflow-hidden ${
                isActive ?
                'shadow-lg' :
                'border border-red-100 shadow-sm hover:border-red-700/60'}`
                }
                style={isActive ? {
                   background: 'linear-gradient(145deg, #ff2244 0%, #C8102E 45%, #8B0000 100%)',
                   boxShadow: '0 4px 16px rgba(200,16,46,0.5), 0 1px 4px rgba(0,0,0,0.2)',
                   border: '1px solid rgba(255,100,100,0.3)'
                 } : {}}>
                
                {/* Active shimmer line */}
                {isActive &&
                <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }} />
                }
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-white/15' : 'bg-gray-50'}`}>
                  <CatIcon size={17} className={isActive ? 'text-white drop-shadow-sm' : 'text-gray-400'} />
                </div>
                <span className={`text-[10px] font-700 whitespace-nowrap leading-tight ${isActive ? 'text-white drop-shadow-sm' : 'text-gray-400'}`}>
                  {cat.label}
                </span>
                {/* Active bottom dot indicator */}
                {isActive &&
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-yellow-300 shadow-sm" />
                }
              </button>);

          })}
        </div>
      </div>

      {/* ── Lottery Section ─────────────────────────────────── */}
      {isVisible('cat-lottery') &&
      <div ref={lotteryRef} className="px-3 mt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-red-600" />
            <h3 className={`font-700 text-sm ${textPrimary}`}>Lottery</h3>
          </div>
          <button
            onClick={() => toast.success('Games reloaded!')}
            className="flex items-center gap-1 border border-red-200 text-red-600 text-xs font-600 px-3 py-1 rounded-full hover:bg-red-50 transition-colors">
            
            Reload
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {LOTTERY_GAMES.map((game) => {
            const IconComp = LOTTERY_ICONS[game.name];
            return (
            <div
              key={game.id}
              onClick={() => handleGameClick(game.name)}
              className="relative rounded-2xl overflow-hidden cursor-pointer shadow-md active:scale-95 transition-transform"
              style={{ background: game.gradient, minHeight: '120px' }}>
              
                {/* HOT badge */}
                {game.hot &&
              <div className="absolute top-1 right-1 z-10">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[7px] font-800 px-1.5 py-0.5 rounded-sm leading-none shadow-md">
                      HOT
                    </div>
                  </div>
              }

                {/* Game Icon */}
                <div className="flex justify-center items-center pt-3 pb-1" style={{ minHeight: '70px' }}>
                  {IconComp && <IconComp />}
                </div>

                {/* Game Name & Subtitle */}
                <div className="px-1 pb-2 text-center">
                  <div className="text-white font-800 text-[11px] leading-tight drop-shadow-sm">{game.name}</div>
                  <div className="text-white/80 text-[8px] font-500 leading-tight mt-0.5">{game.subtitle}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      }

      {/* ── Mini Games Section ──────────────────────────────── */}
      {isVisible('cat-mini') &&
      <div ref={miniGamesRef} className="px-3 mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-red-600" />
            <h3 className={`font-700 text-sm ${textPrimary}`}>Mini Games</h3>
          </div>
          <button
            onClick={() => setShowAllMini(prev => !prev)}
            className="flex items-center gap-1 border border-red-200 text-red-600 text-xs font-600 px-2.5 py-1 rounded-full">
            {showAllMini ? 'Show less' : 'view all'} <ChevronRight size={11} className={showAllMini ? 'rotate-90' : ''} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(showAllMini ? MINI_GAMES : MINI_GAMES.slice(0, 9)).map((game) =>
          <div key={game.id} className="relative group cursor-pointer" onClick={() => handleGameClick(game.name, game.id, game.provider)}>
            <div className="rounded-xl overflow-hidden shadow-lg border border-white/10" style={{ background: 'linear-gradient(160deg, #8B0000 0%, #5a0000 100%)' }}>
              {game.hot &&
              <div className="absolute bottom-8 left-1 z-10">
                <div className="bg-gradient-to-r from-red-600 to-red-500 text-white text-[7px] font-800 px-1.5 py-0.5 rounded-sm leading-none shadow-md">HOT</div>
              </div>
              }
              <div className="w-full" style={{ aspectRatio: '4/3' }}>
                <img src={game.img} alt={game.name} className="w-full h-full object-cover"
                  onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = 'none'; if(t.parentElement) t.parentElement.style.background = 'linear-gradient(135deg, #C8102E, #5a0000)'; }} />
              </div>
              <div className="px-1.5 py-1.5 text-center" style={{ background: 'linear-gradient(0deg, rgba(90,0,0,0.95) 0%, rgba(139,0,0,0.7) 100%)' }}>
                <div className="text-white font-700 text-[10px] leading-tight line-clamp-1 drop-shadow">{game.name}</div>
              </div>
            </div>
            <span onClick={(e) => { e.stopPropagation(); toggleFavorite(game.id); }}
              className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/80 flex items-center justify-center shadow z-30">
              <Heart size={9} className={favorites.has(game.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
            </span>
          </div>
          )}
        </div>
      </div>
      }

      {/* ── Popular Section ─────────────────────────────────── */}
      {isVisible('cat-popular') &&
      <div ref={popularRef} className="px-3 mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-5 rounded-full bg-red-600" />
            <h3 className={`font-700 text-sm ${textPrimary}`}>Popular</h3>
            <span className="bg-red-600 text-white text-[9px] font-700 px-1.5 py-0.5 rounded-sm">HOT</span>
          </div>
          <button
            onClick={() => setShowAllPopular(prev => !prev)}
            className="flex items-center gap-1 border border-red-200 text-red-600 text-xs font-600 px-2.5 py-1 rounded-full">
            {showAllPopular ? 'Show less' : 'view all'} <ChevronRight size={11} className={showAllPopular ? 'rotate-90' : ''} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(showAllPopular ? POPULAR_GAMES : POPULAR_GAMES.slice(0, 9)).map((game) =>
          <div key={game.id} className="relative group cursor-pointer" onClick={() => handleGameClick(game.name, game.id, game.provider)}>
            <div className="rounded-xl overflow-hidden shadow-lg border border-white/10" style={{ background: 'linear-gradient(160deg, #8B0000 0%, #5a0000 100%)' }}>
              {game.hot &&
              <div className="absolute bottom-8 left-1 z-10">
                <div className="bg-gradient-to-r from-red-600 to-red-500 text-white text-[7px] font-800 px-1.5 py-0.5 rounded-sm leading-none shadow-md">HOT</div>
              </div>
              }
              <div className="w-full" style={{ aspectRatio: '4/3' }}>
                <img src={game.img} alt={game.name} className="w-full h-full object-cover"
                  onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = 'none'; if(t.parentElement) t.parentElement.style.background = 'linear-gradient(135deg, #C8102E, #5a0000)'; }} />
              </div>
              <div className="px-1.5 py-1.5 text-center" style={{ background: 'linear-gradient(0deg, rgba(90,0,0,0.95) 0%, rgba(139,0,0,0.7) 100%)' }}>
                <div className="text-white font-700 text-[10px] leading-tight line-clamp-1 drop-shadow">{game.name}</div>
              </div>
            </div>
            <span onClick={(e) => { e.stopPropagation(); toggleFavorite(game.id); }}
              className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/80 flex items-center justify-center shadow z-30">
              <Heart size={9} className={favorites.has(game.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
            </span>
          </div>
          )}
        </div>
      </div>
      }

      {/* ── Slot Section ────────────────────────────────────── */}
      {isVisible('cat-slot') &&
      <div ref={slotRef} className="px-3 mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-red-600" />
            <h3 className={`font-700 text-sm ${textPrimary}`}>Slot</h3>
          </div>
          <button
            onClick={() => setShowAllSlot(prev => !prev)}
            className="flex items-center gap-1 border border-red-200 text-red-600 text-xs font-600 px-2.5 py-1 rounded-full">
            {showAllSlot ? 'Show less' : 'view all'} <ChevronRight size={11} className={showAllSlot ? 'rotate-90' : ''} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(showAllSlot ? SLOT_PROVIDERS : SLOT_PROVIDERS.slice(0, 6)).map((provider) =>
          <div key={provider.id} className="cursor-pointer" onClick={() => {
            if (PROVIDER_GAMES[provider.providerKey]) {
              setSelectedProvider(provider.providerKey);
              setProviderSearch('');
            } else {
              handleGameClick(provider.name + ' Slots', provider.id, provider.name);
            }
          }}>
            <div className="rounded-xl overflow-hidden shadow-lg border border-white/10" style={{ background: 'linear-gradient(135deg, #E8735A, #c0392b)' }}>
              <div className="w-full" style={{ aspectRatio: '4/3' }}>
                <img src={provider.img} alt={provider.name} className="w-full h-full object-cover"
                  onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = 'none'; if(t.parentElement) t.parentElement.style.background = 'linear-gradient(135deg, #E8735A, #c0392b)'; }} />
              </div>
              <div className="px-1.5 py-1.5 text-center" style={{ background: 'linear-gradient(0deg, rgba(139,0,0,0.9) 0%, rgba(200,16,46,0.5) 100%)' }}>
                <div className="text-white font-700 text-[10px] leading-tight">{provider.name}</div>
                <div className="text-white/70 text-[8px]">{provider.games} games</div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
      }

      {/* ── Platform Recommendation ─────────────────────────── */}
      {isVisible('cat-lobby') &&
      <div className="px-3 mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-red-600" />
            <h3 className={`font-700 text-sm ${textPrimary}`}>Platform recommendation</h3>
          </div>
          <button
            onClick={() => toast.info('Showing all recommendations')}
            className="flex items-center gap-1 border border-red-200 text-red-600 text-xs font-600 px-2.5 py-1 rounded-full">
            
            view all <ChevronRight size={11} />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {PLATFORM_RECS.map((rec) =>
          <PremiumCard
            key={rec.id}
            onClick={() => handleGameClick(rec.name)}
            className="flex-shrink-0 rounded-xl text-left"
            style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)', width: '110px', height: '110px' }}
            glowColor="rgba(200,16,46,0.55)">
            
              <div className="p-2.5 flex flex-col items-center text-center h-full justify-between">
                <div className="text-3xl">{rec.emoji}</div>
                <div>
                  <div className="text-white font-700 text-xs leading-tight">{rec.name}</div>
                  <div className="text-red-200 text-[9px] mt-0.5">{rec.subtitle}</div>
                </div>
              </div>
            </PremiumCard>
          )}
        </div>
      </div>
      }

      {/* ── Video Section ───────────────────────────────────── */}
      {isVisible('cat-video') &&
      <div ref={videoRef} className="px-3 mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-red-600" />
            <h3 className={`font-700 text-sm ${textPrimary}`}>Video</h3>
          </div>
          <button
            onClick={() => setShowAllVideo(prev => !prev)}
            className="flex items-center gap-1 border border-red-200 text-red-600 text-xs font-600 px-2.5 py-1 rounded-full">
            {showAllVideo ? 'Show less' : 'view all'} <ChevronRight size={11} className={showAllVideo ? 'rotate-90' : ''} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(showAllVideo ? VIDEO_PROVIDERS : VIDEO_PROVIDERS.slice(0, 6)).map((provider) =>
          <div key={provider.id} className="cursor-pointer" onClick={() => handleGameClick(provider.name, provider.id, provider.vendorCode)}>
            <div className="rounded-xl overflow-hidden shadow-lg border border-white/10" style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
              <div className="w-full" style={{ aspectRatio: '4/3' }}>
                <img src={provider.img} alt={provider.name} className="w-full h-full object-cover"
                  onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = 'none'; if(t.parentElement) t.parentElement.style.background = 'linear-gradient(135deg, #1a1a2e, #16213e)'; }} />
              </div>
              <div className="px-1.5 py-1.5 text-center" style={{ background: 'linear-gradient(0deg, rgba(10,10,30,0.95) 0%, rgba(22,33,62,0.5) 100%)' }}>
                <div className="text-white font-700 text-[10px] leading-tight">{provider.name}</div>
                <span className="bg-red-600 text-white text-[7px] font-700 px-1 py-0.5 rounded-sm">● LIVE</span>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
      }

      {/* ── Sport Section ───────────────────────────────────── */}
      {isVisible('cat-sport') &&
      <div ref={sportRef} className="px-3 mt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-red-600" />
            <h3 className={`font-700 text-sm ${textPrimary}`}>Sport</h3>
          </div>
          <button
            onClick={() => setShowAllSport(prev => !prev)}
            className="flex items-center gap-1 border border-red-200 text-red-600 text-xs font-600 px-2.5 py-1 rounded-full">
            {showAllSport ? 'Show less' : 'view all'} <ChevronRight size={11} className={showAllSport ? 'rotate-90' : ''} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(showAllSport ? SPORT_PROVIDERS : SPORT_PROVIDERS.slice(0, 6)).map((provider) =>
          <div key={provider.id} className="cursor-pointer" onClick={() => handleGameClick(provider.name, provider.id, provider.vendorCode)}>
            <div className="rounded-xl overflow-hidden shadow-lg border border-white/10" style={{ background: 'linear-gradient(135deg, #1a3a1a, #2d5a2d)' }}>
              <div className="w-full" style={{ aspectRatio: '4/3' }}>
                <img src={provider.img} alt={provider.name} className="w-full h-full object-cover"
                  onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = 'none'; if(t.parentElement) t.parentElement.style.background = 'linear-gradient(135deg, #1a3a1a, #2d5a2d)'; }} />
              </div>
              <div className="px-1.5 py-1.5 text-center" style={{ background: 'linear-gradient(0deg, rgba(10,30,10,0.95) 0%, rgba(26,58,26,0.5) 100%)' }}>
                <div className="text-white font-700 text-[10px] leading-tight">{provider.name}</div>
                <span className="text-green-300 text-[8px]">Live Betting</span>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
      }

      {/* ── Fish / Fishing Section ──────────────────────────── */}
      {isVisible('cat-fishing') &&
      <div ref={fishingRef} className="px-3 mt-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-red-600" />
            <h3 className={`font-700 text-sm ${textPrimary}`}>Fish</h3>
          </div>
          <button
            onClick={() => setShowAllFish((prev) => !prev)}
            className="flex items-center gap-1 text-red-600 text-xs font-600 border border-red-200 bg-red-50 px-3 py-1 rounded-full hover:bg-red-50 transition-colors">
            {showAllFish ? 'Show less' : 'view all'}
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-3 h-3 transition-transform ${showAllFish ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>

        {/* 3-column grid of fishing game cards */}
        <div className="grid grid-cols-3 gap-2.5">
          {(showAllFish ? FISHING_GAMES : FISHING_GAMES.slice(0, 6)).map((game) =>
          <div key={game.id} className="relative group cursor-pointer" onClick={() => handleGameClick(game.name, game.gameID, game.provider)}>
            <div className="relative rounded-xl overflow-hidden shadow-lg border border-white/10 transition-transform duration-200 group-hover:scale-[1.03]"
            style={{ background: 'linear-gradient(160deg, #0f1b3d 0%, #0a1128 100%)' }}>
              {/* Provider badge */}
              <div className="absolute top-1.5 left-1.5 z-10">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-[#1a0a00] text-[7px] font-800 px-1.5 py-0.5 rounded-sm leading-none shadow-md tracking-wide">
                  {game.provider}
                </div>
              </div>
              {/* Game image */}
              <div className="w-full" style={{ aspectRatio: '1/1' }}>
                <img src={game.img} alt={game.name} className="w-full h-full object-cover"
                  onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = 'none'; if(t.parentElement) t.parentElement.style.background = 'linear-gradient(135deg, #1e3a5f, #0a1128)'; }} />
              </div>
              {/* Game name overlay */}
              <div className="px-1.5 py-1.5 text-center" style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 100%)' }}>
                <div className="text-white font-700 text-[9px] leading-tight line-clamp-1 drop-shadow">{game.name}</div>
              </div>
              {/* Hover glow overlay */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
              style={{ boxShadow: "inset 0 0 0 1.5px rgba(200,16,46,0.6)" }} />
            </div>
          </div>
          )}
        </div>
      </div>
      }

      {/* ── Winning Details ─────────────────────────────────── */}
      <div className="px-3 mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-red-600" />
            <h3 className={`font-700 text-sm ${textPrimary}`}>Winning Details</h3>
          </div>
        </div>
        <div className={`rounded-xl overflow-hidden ${cardBg} border border-red-100 shadow-sm`}>
          {/* Header row */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-red-100" style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)' }}>
            <span className="text-white text-[11px] font-700 flex-1">Player</span>
            <span className="text-white text-[11px] font-700 flex-1 text-center">Game</span>
            <span className="text-white text-[11px] font-700 flex-1 text-right">Winning</span>
          </div>
          {/* Auto-scrolling live feed */}
          <div className="overflow-hidden" style={{ height: `${LIVE_WINNERS.length * 52}px` }}>
            <AnimatePresence mode="popLayout">
              {[...Array(LIVE_WINNERS.length)].map((_, i) => {
                const winner = LIVE_WINNERS[(scrollWinnerIndex + i) % LIVE_WINNERS.length];
                return (
                  <motion.div
                    key={`${winner.id}-${scrollWinnerIndex}-${i}`}
                    initial={{ opacity: 0, y: -52 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 52 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="flex items-center justify-between px-3 py-2.5 border-b border-red-50 last:border-0"
                    style={{ height: '52px', background: i === 0 ? 'rgba(200,16,46,0.04)' : 'transparent' }}>
                    
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-700 text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)' }}>
                        {winner.user.charAt(0)}
                      </div>
                      <div className={`font-600 text-xs ${textPrimary}`}>{winner.user}</div>
                    </div>
                    <div className={`text-[10px] ${textMuted} flex-1 text-center`}>{winner.game}</div>
                    <div className="text-red-600 font-700 text-xs flex-1 text-right">Got {winner.amount}</div>
                  </motion.div>);

              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Today's Earnings Ranking ────────────────────────── */}
      <div className="px-3 mt-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-red-600" />
            <h3 className={`font-700 text-sm ${textPrimary}`}>Today&apos;s Earnings Ranking</h3>
          </div>
        </div>
        <div className={`rounded-xl overflow-hidden ${cardBg} border border-red-100 shadow-sm`}>
          {/* Top 3 Podium */}
          <div className="flex items-end justify-center gap-0 px-2 pt-6 pb-0 relative">
            {/* NO2 - Left */}
            <div className="flex flex-col items-center flex-1 relative z-10">
              <div className="relative mb-1">
                <SilverCrown size={24} />
              </div>
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <CartoonAvatar2 size={64} />
                </div>
              </div>
              <div className="mt-1 bg-white/30 rounded-full px-2 py-0.5">
                <span className="text-white text-[10px] font-700">NO2</span>
              </div>
              <div
                className="w-full mt-2 rounded-t-lg flex flex-col items-center pt-2 pb-3 px-1"
                style={{ background: 'linear-gradient(180deg, #e87070 0%, #d45050 100%)', minHeight: '80px' }}>
                
                <div className="text-white text-[10px] font-700 text-center leading-tight">{TOP_EARNERS[1].user}</div>
                <div className="mt-1 bg-white/20 rounded-full px-2 py-0.5">
                  <span className="text-white text-[10px] font-700">₹{(TOP_EARNERS[1].amount / 1e7).toFixed(2)}Cr</span>
                </div>
              </div>
            </div>

            {/* NO1 - Center (tallest) */}
            <div className="flex flex-col items-center flex-1 relative z-20" style={{ marginBottom: '-2px' }}>
              <div className="relative mb-1">
                <GoldCrown size={32} />
              </div>
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-yellow-300 shadow-lg" style={{ borderWidth: '3px', borderColor: '#FFD700' }}>
                  <CartoonAvatar1 size={80} />
                </div>
              </div>
              <div className="mt-1 bg-yellow-400 rounded-full px-3 py-0.5 shadow">
                <span className="text-red-900 text-[11px] font-800">NO1</span>
              </div>
              <div
                className="w-full mt-2 rounded-t-lg flex flex-col items-center pt-3 pb-4 px-1"
                style={{ background: 'linear-gradient(180deg, #d45050 0%, #c03030 100%)', minHeight: '100px' }}>
                
                <div className="text-white text-[11px] font-700 text-center leading-tight">{TOP_EARNERS[0].user}</div>
                <div className="mt-1.5 bg-white/20 rounded-full px-2 py-0.5">
                  <span className="text-white text-[10px] font-700">₹{(TOP_EARNERS[0].amount / 1e7).toFixed(2)}Cr</span>
                </div>
              </div>
            </div>

            {/* NO3 - Right */}
            <div className="flex flex-col items-center flex-1 relative z-10">
              <div className="relative mb-1">
                <BronzeCrown size={22} />
              </div>
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-300 shadow-md">
                  <CartoonAvatar3 size={64} />
                </div>
              </div>
              <div className="mt-1 bg-orange-400 rounded-full px-2 py-0.5">
                <span className="text-white text-[10px] font-700">NO3</span>
              </div>
              <div
                className="w-full mt-2 rounded-t-lg flex flex-col items-center pt-2 pb-3 px-1"
                style={{ background: 'linear-gradient(180deg, #e87070 0%, #d45050 100%)', minHeight: '70px' }}>
                
                <div className="text-white text-[10px] font-700 text-center leading-tight">{TOP_EARNERS[2].user}</div>
                <div className="mt-1 bg-white/20 rounded-full px-2 py-0.5">
                  <span className="text-white text-[9px] font-700">₹{(TOP_EARNERS[2].amount / 1e7).toFixed(2)}Cr</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rank 4-10 */}
          <div className="px-2 py-2 space-y-2" style={{ background: '#FAF5E9' }}>
            {TOP_EARNERS.slice(3).map((earner, idx) => {
              const avatarComponents = [CartoonAvatar4, CartoonAvatar5, CartoonAvatar1, CartoonAvatar2, CartoonAvatar3, CartoonAvatar4, CartoonAvatar5];
              const AvatarComp = avatarComponents[idx % avatarComponents.length];
              return (
                <div key={earner.id} className="flex items-center gap-3 py-3 px-3 rounded-xl" style={{ background: '#3a2020', border: '1px solid rgba(200,16,46,0.2)' }}>
                  <div className="w-7 text-center">
                    <span className="text-white/60 font-800 text-base">{earner.rank}</span>
                  </div>
                  <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 border-2" style={{ borderColor: '#C8102E' }}>
                    <AvatarComp size={44} />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-600 text-sm">{earner.user}</div>
                  </div>
                  <div className="rounded-full px-3 py-1.5" style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D060)' }}>
                    <span className="font-700 text-xs" style={{ color: '#5a3e00' }}>₹{earner.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Floating Support Button ─────────────────────────── */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => toast.info('Support chat opening soon...')}
        className="fixed right-4 bottom-24 w-12 h-12 rounded-full shadow-lg flex items-center justify-center z-40"
        style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D060)' }}>
        
        <MessageCircle size={22} className="text-red-900" />
      </motion.button>

      {/* ── Provider Games Modal ─────────────────────────── */}
      <AnimatePresence>
        {selectedProvider && (() => {
          const games = PROVIDER_GAMES[selectedProvider] || [];
          const filtered = providerSearch
            ? games.filter(g => g.name.toLowerCase().includes(providerSearch.toLowerCase()))
            : games;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex flex-col"
              style={{ background: '#f5f5f5' }}>
              {/* Header */}
              <div className="flex items-center gap-3 px-3 py-3" style={{ background: 'linear-gradient(180deg, #8B0000 0%, #C8102E 100%)' }}>
                <button onClick={() => setSelectedProvider(null)} className="text-white">
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-white font-700 text-base flex-1">{selectedProvider} Games</h2>
                <span className="text-yellow-300 text-xs font-600">{filtered.length} games</span>
              </div>
              {/* Search */}
              <div className="px-3 py-2 bg-white border-b border-red-100">
                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
                  <Search size={14} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search games..."
                    value={providerSearch}
                    onChange={(e) => setProviderSearch(e.target.value)}
                    className="bg-transparent text-sm text-gray-800 outline-none flex-1 placeholder-gray-400"
                  />
                  {providerSearch && (
                    <button onClick={() => setProviderSearch('')}>
                      <X size={14} className="text-gray-400" />
                    </button>
                  )}
                </div>
              </div>
              {/* Games Grid */}
              <div className="flex-1 overflow-y-auto px-3 py-3">
                <div className="grid grid-cols-3 gap-2">
                  {filtered.map((game, idx) => (
                    <div key={game.gameCode + '-' + idx} className="relative group cursor-pointer"
                      onClick={() => handleGameClick(game.name, game.gameCode, game.provider)}>
                      <div className="rounded-xl overflow-hidden shadow-lg border border-white/10"
                        style={{ background: 'linear-gradient(160deg, #8B0000 0%, #5a0000 100%)' }}>
                        <div className="w-full" style={{ aspectRatio: '4/3' }}>
                          <img src={game.img} alt={game.name} className="w-full h-full object-cover"
                            onError={(e) => {
                              const t = e.target as HTMLImageElement;
                              t.style.display = 'none';
                              if (t.parentElement) t.parentElement.style.background = 'linear-gradient(135deg, #C8102E, #5a0000)';
                            }} />
                        </div>
                        <div className="px-1.5 py-1.5 text-center"
                          style={{ background: 'linear-gradient(0deg, rgba(90,0,0,0.95) 0%, rgba(139,0,0,0.7) 100%)' }}>
                          <div className="text-white font-700 text-[10px] leading-tight line-clamp-1 drop-shadow">{game.name}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-sm">No games found</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ── Wallet Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {showWalletModal &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-end justify-center z-50"
          onClick={() => setShowWalletModal(false)}>
          
            <motion.div
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            exit={{ y: 300 }}
            transition={{ type: 'spring', damping: 25 }}
            className="bg-white rounded-t-3xl w-full max-w-[420px] p-6"
            onClick={(e) => e.stopPropagation()}>
            
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-700 text-lg text-gray-900">My Wallet</h3>
                <button onClick={() => setShowWalletModal(false)}>
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <div className="rounded-2xl p-4 mb-4" style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)' }}>
                <div className="text-red-200 text-sm font-500">Available Balance</div>
                <div className="text-white font-800 text-3xl mt-1 tabular-nums">₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                <div className="text-yellow-300 text-xs mt-1">Bonus: ₹250.00 available</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                onClick={() => {setShowWalletModal(false);navigate('/promotions-detail');}}
                className="py-3 rounded-xl font-700 text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)' }}>
                
                  + Deposit
                </button>
                <button
                onClick={() => {setShowWalletModal(false);navigate('/activity-history');}}
                className="py-3 rounded-xl font-700 text-red-700 text-sm border-2 border-red-600">
                
                  Withdraw
                </button>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>

      <BottomNav />
    </div>);

}

// Cartoon avatar SVG components
function CartoonAvatar1({ size = 64 }: {size?: number;}) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="url(#av1bg)" />
      <defs>
        <radialGradient id="av1bg" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#87CEEB" />
          <stop offset="100%" stopColor="#4682B4" />
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="38" rx="16" ry="14" fill="#DEB887" />
      <circle cx="32" cy="28" r="13" fill="#DEB887" />
      <ellipse cx="32" cy="21" rx="13" ry="7" fill="#4A2C0A" />
      <ellipse cx="32" cy="19" rx="10" ry="5" fill="#6B3A0F" />
      <circle cx="27" cy="29" r="2.5" fill="#3D2B1F" />
      <circle cx="37" cy="29" r="2.5" fill="#3D2B1F" />
      <circle cx="28" cy="28" r="1" fill="white" />
      <circle cx="38" cy="28" r="1" fill="white" />
      <path d="M28 34 Q32 37 36 34" stroke="#A0522D" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <ellipse cx="26" cy="33" rx="3" ry="2" fill="#FFB6C1" opacity="0.6" />
      <ellipse cx="38" cy="33" rx="3" ry="2" fill="#FFB6C1" opacity="0.6" />
    </svg>);

}

function CartoonAvatar2({ size = 64 }: {size?: number;}) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="url(#av2bg)" />
      <defs>
        <radialGradient id="av2bg" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#98FB98" />
          <stop offset="100%" stopColor="#228B22" />
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="38" rx="16" ry="14" fill="#DEB887" />
      <circle cx="32" cy="28" r="13" fill="#DEB887" />
      <ellipse cx="32" cy="21" rx="13" ry="7" fill="#4A2C0A" />
      <ellipse cx="32" cy="19" rx="10" ry="5" fill="#6B3A0F" />
      <circle cx="27" cy="29" r="2.5" fill="#3D2B1F" />
      <circle cx="37" cy="29" r="2.5" fill="#3D2B1F" />
      <circle cx="28" cy="28" r="1" fill="white" />
      <circle cx="38" cy="28" r="1" fill="white" />
      <path d="M29 34 Q32 36 35 34" stroke="#A0522D" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <ellipse cx="26" cy="33" rx="3" ry="2" fill="#FFB6C1" opacity="0.5" />
      <ellipse cx="38" cy="33" rx="3" ry="2" fill="#FFB6C1" opacity="0.5" />
    </svg>);

}

function CartoonAvatar3({ size = 64 }: {size?: number;}) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="url(#av3bg)" />
      <defs>
        <radialGradient id="av3bg" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFB347" />
          <stop offset="100%" stopColor="#CC5500" />
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="38" rx="16" ry="14" fill="#C8956C" />
      <circle cx="32" cy="28" r="13" fill="#C8956C" />
      <ellipse cx="32" cy="21" rx="13" ry="7" fill="#4A2C0A" />
      <ellipse cx="32" cy="19" rx="10" ry="5" fill="#6B3A0F" />
      <circle cx="27" cy="29" r="2.5" fill="#2C1810" />
      <circle cx="37" cy="29" r="2.5" fill="#2C1810" />
      <circle cx="28" cy="28" r="1" fill="white" />
      <circle cx="38" cy="28" r="1" fill="white" />
      <path d="M28 34 Q32 37 36 34" stroke="#8B4513" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <ellipse cx="19" cy="25" rx="2.5" ry="1.5" fill="#FFB6C1" opacity="0.5" />
      <ellipse cx="29" cy="25" rx="2.5" ry="1.5" fill="#FFB6C1" opacity="0.5" />
    </svg>);

}

function CartoonAvatar4({ size = 48 }: {size?: number;}) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="url(#av4bg)" />
      <defs>
        <radialGradient id="av4bg" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#DDA0DD" />
          <stop offset="100%" stopColor="#8B008B" />
        </radialGradient>
      </defs>
      <ellipse cx="24" cy="29" rx="12" ry="10" fill="#F4C2A1" />
      <circle cx="24" cy="21" r="10" fill="#F4C2A1" />
      <ellipse cx="24" cy="15" rx="10" ry="6" fill="#4A2C0A" />
      <circle cx="20" cy="22" r="2" fill="#3D2B1F" />
      <circle cx="28" cy="22" r="2" fill="#3D2B1F" />
      <circle cx="20.8" cy="21.2" r="0.8" fill="white" />
      <circle cx="28.8" cy="21.2" r="0.8" fill="white" />
      <path d="M21 26 Q24 28 27 26" stroke="#8B4513" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <ellipse cx="19" cy="25" rx="2.5" ry="1.5" fill="#FFB6C1" opacity="0.6" />
      <ellipse cx="29" cy="25" rx="2.5" ry="1.5" fill="#FFB6C1" opacity="0.6" />
    </svg>);

}

function CartoonAvatar5({ size = 48 }: {size?: number;}) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="url(#av5bg)" />
      <defs>
        <radialGradient id="av5bg" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#87CEEB" />
          <stop offset="100%" stopColor="#1E90FF" />
        </radialGradient>
      </defs>
      <ellipse cx="24" cy="29" rx="12" ry="10" fill="#DEB887" />
      <circle cx="24" cy="21" r="10" fill="#DEB887" />
      <ellipse cx="24" cy="15" rx="10" ry="6" fill="#4A2C0A" />
      <circle cx="20" cy="22" r="2" fill="#3D2B1F" />
      <circle cx="28" cy="22" r="2" fill="#3D2B1F" />
      <circle cx="20.8" cy="21.2" r="0.8" fill="white" />
      <circle cx="28.8" cy="21.2" r="0.8" fill="white" />
      <path d="M21 26 Q24 28 27 26" stroke="#A0522D" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <ellipse cx="19" cy="25" rx="2.5" ry="1.5" fill="#FFB6C1" opacity="0.5" />
      <ellipse cx="29" cy="25" rx="2.5" ry="1.5" fill="#FFB6C1" opacity="0.5" />
    </svg>);

}

// Crown SVG components
function GoldCrown({ size = 28 }: {size?: number;}) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 18 L4 8 L9 13 L14 2 L19 13 L24 8 L26 18 Z" fill="#FFD700" stroke="#FFA500" strokeWidth="1" strokeLinejoin="round" />
      <circle cx="14" cy="2" r="2" fill="#FF6B00" />
      <circle cx="4" cy="8" r="1.5" fill="#FF6B00" />
      <circle cx="24" cy="8" r="1.5" fill="#FF6B00" />
      <rect x="2" y="17" width="24" height="3" rx="1.5" fill="#FFD700" stroke="#FFA500" strokeWidth="0.5" />
    </svg>);

}

function SilverCrown({ size = 24 }: {size?: number;}) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 18 L4 8 L9 13 L14 2 L19 13 L24 8 L26 18 Z" fill="#C0C0C0" stroke="#A0A0A0" strokeWidth="1" strokeLinejoin="round" />
      <circle cx="14" cy="2" r="2" fill="#8080FF" />
      <circle cx="4" cy="8" r="1.5" fill="#8080FF" />
      <circle cx="24" cy="8" r="1.5" fill="#8080FF" />
      <rect x="2" y="17" width="24" height="3" rx="1.5" fill="#C0C0C0" stroke="#A0A0A0" strokeWidth="0.5" />
    </svg>);

}

function BronzeCrown({ size = 22 }: {size?: number;}) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 18 L4 8 L9 13 L14 2 L19 13 L24 8 L26 18 Z" fill="#CD7F32" stroke="#A0522D" strokeWidth="1" strokeLinejoin="round" />
      <circle cx="14" cy="2" r="2" fill="#228B22" />
      <circle cx="4" cy="8" r="1.5" fill="#228B22" />
      <circle cx="24" cy="8" r="1.5" fill="#228B22" />
      <rect x="2" y="17" width="24" height="3" rx="1.5" fill="#CD7F32" stroke="#A0522D" strokeWidth="0.5" />
    </svg>);

}