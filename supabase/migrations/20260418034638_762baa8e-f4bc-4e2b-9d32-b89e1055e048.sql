
-- Rounds table (server-deterministic results, public readable)
CREATE TABLE IF NOT EXISTS public.wingo_rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  period_id TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  number INTEGER NOT NULL CHECK (number BETWEEN 0 AND 9),
  color TEXT NOT NULL,
  size TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (period_id, duration_seconds)
);

ALTER TABLE public.wingo_rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wingo_rounds readable" ON public.wingo_rounds FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_wingo_rounds_dur_created ON public.wingo_rounds (duration_seconds, created_at DESC);

-- Bets table
CREATE TABLE IF NOT EXISTS public.wingo_bets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  period_id TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  selection_type TEXT NOT NULL,    -- 'color' | 'number' | 'size'
  selection_value TEXT NOT NULL,   -- 'green'|'red'|'violet' | '0'..'9' | 'big'|'small'
  multiplier INTEGER NOT NULL DEFAULT 1,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending', -- pending|won|lost
  payout NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wingo_bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wingo_bets select own" ON public.wingo_bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wingo_bets insert own" ON public.wingo_bets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wingo_bets update own" ON public.wingo_bets FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_wingo_bets_user_created ON public.wingo_bets (user_id, created_at DESC);
