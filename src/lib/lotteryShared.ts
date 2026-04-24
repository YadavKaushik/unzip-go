// Shared utilities for K3 / 5D / TRX lottery pages
export type Duration = 60 | 180 | 300 | 600;

export const DURATIONS: { d: Duration; label: string; short: string }[] = [
  { d: 60, label: '1Min', short: '1Min' },
  { d: 180, label: '3Min', short: '3Min' },
  { d: 300, label: '5Min', short: '5Min' },
  { d: 600, label: '10Min', short: '10Min' },
];

export const MULTIPLIERS = [1, 5, 10, 20, 50, 100];

export const pad = (n: number, w: number) => String(n).padStart(w, '0');

const DUR_CODE: Record<Duration, string> = { 60: '01', 180: '03', 300: '05', 600: '10' };

export function buildPeriodId(now: Date, d: Duration, prefix = '') {
  const y = now.getUTCFullYear();
  const m = pad(now.getUTCMonth() + 1, 2);
  const day = pad(now.getUTCDate(), 2);
  const secs = now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds();
  const slot = Math.floor(secs / d);
  return `${prefix}${y}${m}${day}${DUR_CODE[d]}${pad(slot + 1, 4)}`;
}

export function getRoundState(d: Duration, prefix = '') {
  const now = new Date();
  const epochSec = Math.floor(now.getTime() / 1000);
  const elapsed = epochSec % d;
  const remaining = d - elapsed;
  return { remaining, periodId: buildPeriodId(now, d, prefix) };
}

// Deterministic pseudo-random per period (FNV-1a)
export function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

// PRNG seeded by string — returns 0..n-1
export function seededRand(seed: string, idx: number, n: number) {
  return hashStr(seed + ':' + idx) % n;
}
