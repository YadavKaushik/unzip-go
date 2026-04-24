
-- ============ K3 ============
CREATE TABLE public.k3_bets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  period_id TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  selection_type TEXT NOT NULL,
  selection_value TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  multiplier INTEGER NOT NULL DEFAULT 1,
  payout NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.k3_bets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "k3_bets select own" ON public.k3_bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "k3_bets insert own" ON public.k3_bets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "k3_bets update own" ON public.k3_bets FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_k3_bets_period ON public.k3_bets(period_id);
CREATE INDEX idx_k3_bets_user ON public.k3_bets(user_id, created_at DESC);

CREATE TABLE public.k3_rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  period_id TEXT NOT NULL UNIQUE,
  duration_seconds INTEGER NOT NULL,
  d1 INTEGER NOT NULL,
  d2 INTEGER NOT NULL,
  d3 INTEGER NOT NULL,
  sum INTEGER NOT NULL,
  size TEXT NOT NULL,
  parity TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.k3_rounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "k3_rounds readable" ON public.k3_rounds FOR SELECT USING (true);

-- ============ 5D ============
CREATE TABLE public.fived_bets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  period_id TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  position TEXT NOT NULL,
  selection_type TEXT NOT NULL,
  selection_value TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  multiplier INTEGER NOT NULL DEFAULT 1,
  payout NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fived_bets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fived_bets select own" ON public.fived_bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "fived_bets insert own" ON public.fived_bets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fived_bets update own" ON public.fived_bets FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_fived_bets_period ON public.fived_bets(period_id);
CREATE INDEX idx_fived_bets_user ON public.fived_bets(user_id, created_at DESC);

CREATE TABLE public.fived_rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  period_id TEXT NOT NULL UNIQUE,
  duration_seconds INTEGER NOT NULL,
  a INTEGER NOT NULL,
  b INTEGER NOT NULL,
  c INTEGER NOT NULL,
  d INTEGER NOT NULL,
  e INTEGER NOT NULL,
  sum INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fived_rounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fived_rounds readable" ON public.fived_rounds FOR SELECT USING (true);

-- ============ TRX ============
CREATE TABLE public.trx_bets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  period_id TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  selection_type TEXT NOT NULL,
  selection_value TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  multiplier INTEGER NOT NULL DEFAULT 1,
  payout NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trx_bets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trx_bets select own" ON public.trx_bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "trx_bets insert own" ON public.trx_bets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "trx_bets update own" ON public.trx_bets FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_trx_bets_period ON public.trx_bets(period_id);
CREATE INDEX idx_trx_bets_user ON public.trx_bets(user_id, created_at DESC);

CREATE TABLE public.trx_rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  period_id TEXT NOT NULL UNIQUE,
  duration_seconds INTEGER NOT NULL,
  block_id BIGINT NOT NULL,
  block_time TEXT NOT NULL,
  hash TEXT NOT NULL,
  number INTEGER NOT NULL,
  color TEXT NOT NULL,
  size TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trx_rounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trx_rounds readable" ON public.trx_rounds FOR SELECT USING (true);
