import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import splashHero from '@/assets/splash-hero.png';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 300);
          return 100;
        }
        return prev + Math.random() * 8 + 2;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(180deg, #C8102E 0%, #8B0000 40%, #5a0000 100%)',
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-2 mb-8"
      >
        <Crown size={28} className="text-yellow-400" />
        <span
          className="text-yellow-400 font-black text-3xl tracking-wider"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          𝐓𝐞𝐜𝐡𝐢𝐞⁴⁰⁴
        </span>
      </motion.div>

      {/* Hero Image with glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative mb-8"
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(200,16,46,0.2) 50%, transparent 70%)',
            filter: 'blur(20px)',
            transform: 'scale(1.5)',
          }}
        />
        <img
          src={splashHero}
          alt="Techie404"
          width={220}
          height={220}
          className="relative z-10 drop-shadow-2xl"
        />
      </motion.div>

      {/* Welcome Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mb-10"
      >
        <h2 className="text-white font-bold text-xl mb-1">Welcome to</h2>
        <h1 className="text-yellow-400 font-black text-2xl tracking-wide">𝐓𝐞𝐜𝐡𝐢𝐞⁴⁰⁴</h1>
        <p className="text-white/50 text-sm mt-2">Start your adventure now</p>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-48"
      >
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #FFD700, #FFA500)',
              width: `${Math.min(progress, 100)}%`,
            }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <p className="text-white/40 text-xs text-center mt-2 font-semibold">
          {Math.min(Math.floor(progress), 100)}%
        </p>
      </motion.div>
    </div>
  );
}
