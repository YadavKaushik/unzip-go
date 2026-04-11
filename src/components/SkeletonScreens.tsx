import React from 'react';
import { motion } from 'framer-motion';

const shimmer = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent";

function SkeletonBox({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`bg-gray-200 rounded-lg ${shimmer} ${className}`} style={style} />;
}

// ── Dashboard Skeleton ──
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen w-full max-w-[420px] mx-auto pb-20 bg-gray-50 animate-pulse">
      {/* Header */}
      <div style={{ background: 'linear-gradient(180deg, #8B0000, #C8102E)' }} className="px-4 py-3">
        <div className="flex items-center justify-between">
          <SkeletonBox className="h-7 w-28 !bg-white/20 rounded-lg" />
          <div className="flex gap-2">
            <SkeletonBox className="h-9 w-9 !bg-white/20 rounded-full" />
            <SkeletonBox className="h-9 w-9 !bg-white/20 rounded-full" />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Banner */}
        <SkeletonBox className="h-40 w-full rounded-2xl" />

        {/* Marquee */}
        <SkeletonBox className="h-8 w-full rounded-full" />

        {/* Categories */}
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <SkeletonBox className="h-12 w-12 rounded-xl" />
              <SkeletonBox className="h-3 w-10 rounded" />
            </div>
          ))}
        </div>

        {/* Game Cards */}
        <SkeletonBox className="h-5 w-32 rounded" />
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map(i => (
            <SkeletonBox key={i} className="h-28 rounded-xl" />
          ))}
        </div>

        {/* More rows */}
        <SkeletonBox className="h-5 w-28 rounded mt-4" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <SkeletonBox key={i} className="h-24 rounded-xl" />
          ))}
        </div>

        <SkeletonBox className="h-5 w-36 rounded mt-4" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <SkeletonBox key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Wallet Skeleton ──
export function WalletSkeleton() {
  return (
    <div className="min-h-screen w-full max-w-[420px] mx-auto pb-20 bg-gray-50 animate-pulse">
      <div style={{ background: 'linear-gradient(180deg, #8B0000, #C8102E)' }} className="px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <SkeletonBox className="h-6 w-6 !bg-white/20 rounded" />
          <SkeletonBox className="h-6 w-24 !bg-white/20 rounded" />
        </div>
        <SkeletonBox className="h-10 w-48 !bg-white/20 rounded-lg mb-2" />
        <SkeletonBox className="h-4 w-32 !bg-white/20 rounded" />
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <SkeletonBox className="h-14 rounded-xl" />
          <SkeletonBox className="h-14 rounded-xl" />
        </div>
        <div className="flex justify-around">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex flex-col items-center gap-2">
              <SkeletonBox className="h-24 w-24 rounded-full" />
              <SkeletonBox className="h-4 w-16 rounded" />
            </div>
          ))}
        </div>
        <SkeletonBox className="h-5 w-36 rounded" />
        {[1, 2, 3].map(i => (
          <SkeletonBox key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ── Profile Skeleton ──
export function ProfileSkeleton() {
  return (
    <div className="min-h-screen w-full max-w-[420px] mx-auto pb-20 bg-gray-50 animate-pulse">
      <div style={{ background: 'linear-gradient(180deg, #8B0000, #C8102E)' }} className="px-4 py-6 flex flex-col items-center">
        <SkeletonBox className="h-20 w-20 !bg-white/20 rounded-full mb-3" />
        <SkeletonBox className="h-5 w-28 !bg-white/20 rounded mb-2" />
        <SkeletonBox className="h-4 w-40 !bg-white/20 rounded" />
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <SkeletonBox key={i} className="h-16 rounded-xl" />
          ))}
        </div>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <SkeletonBox key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ── Game Screen Skeleton ──
export function GameSkeleton() {
  return (
    <div className="min-h-screen w-full max-w-[420px] mx-auto pb-20 bg-gray-50 animate-pulse">
      <div style={{ background: 'linear-gradient(180deg, #8B0000, #C8102E)' }} className="px-4 py-3 flex items-center gap-3">
        <SkeletonBox className="h-8 w-8 !bg-white/20 rounded-full" />
        <SkeletonBox className="h-6 w-28 !bg-white/20 rounded" />
      </div>
      <div className="p-4 space-y-4">
        <SkeletonBox className="h-20 rounded-2xl" />
        <div className="flex gap-2 justify-center">
          {[1, 2, 3].map(i => (
            <SkeletonBox key={i} className="h-12 w-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[...Array(10)].map((_, i) => (
            <SkeletonBox key={i} className="h-12 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map(i => (
            <SkeletonBox key={i} className="h-10 rounded-lg" />
          ))}
        </div>
        <SkeletonBox className="h-12 rounded-xl" />
        <SkeletonBox className="h-5 w-28 rounded" />
        {[1, 2, 3, 4].map(i => (
          <SkeletonBox key={i} className="h-10 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// ── Spin Wheel Skeleton ──
export function SpinSkeleton() {
  return (
    <div className="min-h-screen w-full max-w-[420px] mx-auto pb-20 bg-gray-50 animate-pulse flex flex-col items-center">
      <div style={{ background: 'linear-gradient(180deg, #8B0000, #C8102E)' }} className="w-full px-4 py-3 flex items-center gap-3">
        <SkeletonBox className="h-8 w-8 !bg-white/20 rounded-full" />
        <SkeletonBox className="h-6 w-28 !bg-white/20 rounded" />
      </div>
      <div className="p-4 space-y-6 w-full flex flex-col items-center">
        <SkeletonBox className="h-16 w-40 rounded-xl" />
        <SkeletonBox className="h-64 w-64 rounded-full" />
        <SkeletonBox className="h-14 w-48 rounded-full" />
        <SkeletonBox className="h-5 w-32 rounded" />
        {[1, 2, 3].map(i => (
          <SkeletonBox key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ── Activity / Promotions Skeleton ──
export function ActivitySkeleton() {
  return (
    <div className="min-h-screen w-full max-w-[420px] mx-auto pb-20 bg-gray-50 animate-pulse">
      <div style={{ background: 'linear-gradient(180deg, #8B0000, #C8102E)' }} className="px-4 py-3 flex items-center gap-3">
        <SkeletonBox className="h-8 w-8 !bg-white/20 rounded-full" />
        <SkeletonBox className="h-6 w-36 !bg-white/20 rounded" />
      </div>
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <SkeletonBox key={i} className="h-10 flex-1 rounded-full" />
          ))}
        </div>
        <SkeletonBox className="h-24 rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <SkeletonBox key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <SkeletonBox key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default SkeletonBox;
