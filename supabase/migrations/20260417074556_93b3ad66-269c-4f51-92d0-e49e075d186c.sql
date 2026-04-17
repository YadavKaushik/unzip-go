
-- =========================================================================
-- 0. Common helpers
-- =========================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_invitation_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code TEXT;
  attempts INT := 0;
BEGIN
  LOOP
    code := lpad((floor(random() * 1000000000000))::bigint::text, 12, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE invitation_code = code);
    attempts := attempts + 1;
    IF attempts > 20 THEN RAISE EXCEPTION 'Could not generate unique invitation code'; END IF;
  END LOOP;
  RETURN code;
END;
$$;

-- =========================================================================
-- 1. profiles
-- =========================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  phone TEXT,
  avatar_url TEXT,
  -- referral / agency
  referrer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invitation_code TEXT UNIQUE,
  agency_level INT NOT NULL DEFAULT 0,
  team_count INT NOT NULL DEFAULT 0,
  direct_count INT NOT NULL DEFAULT 0,
  team_betting NUMERIC(14,2) NOT NULL DEFAULT 0,
  team_deposit NUMERIC(14,2) NOT NULL DEFAULT 0,
  commission_wallet NUMERIC(14,2) NOT NULL DEFAULT 0,
  first_deposit_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_profiles_referrer ON public.profiles(referrer_id);
CREATE INDEX idx_profiles_invitation_code ON public.profiles(invitation_code);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles select own" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profiles update own" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "profiles insert own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- 2. wallets
-- =========================================================================
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wallets select own" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wallets update own" ON public.wallets
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "wallets insert own" ON public.wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- 3. notifications
-- =========================================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications select own" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications insert own" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notifications update own" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- =========================================================================
-- 4. handle_new_user — auto-create profile + wallet on signup
--     uses raw_user_meta_data.referral (12-digit invitation code)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref_code TEXT;
  ref_user UUID;
BEGIN
  ref_code := NULLIF(NEW.raw_user_meta_data->>'referral', '');
  IF ref_code IS NOT NULL THEN
    SELECT user_id INTO ref_user FROM public.profiles WHERE invitation_code = ref_code;
    IF ref_user = NEW.id THEN ref_user := NULL; END IF; -- block self-referral
  END IF;

  INSERT INTO public.profiles (user_id, username, phone, referrer_id, invitation_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone),
    ref_user,
    public.generate_invitation_code()
  );

  INSERT INTO public.wallets (user_id, balance) VALUES (NEW.id, 0);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- 5. referral_transactions
-- =========================================================================
CREATE TABLE public.referral_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bet','deposit')),
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  reference_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_rtx_user ON public.referral_transactions(user_id);
CREATE INDEX idx_rtx_created ON public.referral_transactions(created_at);
CREATE INDEX idx_rtx_type ON public.referral_transactions(type);
ALTER TABLE public.referral_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rtx select own" ON public.referral_transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "rtx insert own" ON public.referral_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =========================================================================
-- 6. commissions
-- =========================================================================
CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_tx_id UUID REFERENCES public.referral_transactions(id) ON DELETE SET NULL,
  level INT NOT NULL CHECK (level BETWEEN 1 AND 6),
  rate NUMERIC(6,4) NOT NULL,
  bet_amount NUMERIC(14,2) NOT NULL,
  commission_amount NUMERIC(14,4) NOT NULL,
  credited BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_comm_beneficiary ON public.commissions(beneficiary_id);
CREATE INDEX idx_comm_source ON public.commissions(source_user_id);
CREATE INDEX idx_comm_created ON public.commissions(created_at);
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "commissions select own" ON public.commissions
  FOR SELECT USING (auth.uid() = beneficiary_id);

-- =========================================================================
-- 7. agency_level_config + commission_rates
-- =========================================================================
CREATE TABLE public.agency_level_config (
  level INT PRIMARY KEY CHECK (level BETWEEN 0 AND 10),
  required_members INT NOT NULL DEFAULT 0,
  required_betting NUMERIC(14,2) NOT NULL DEFAULT 0,
  required_deposit NUMERIC(14,2) NOT NULL DEFAULT 0
);
ALTER TABLE public.agency_level_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agency cfg readable" ON public.agency_level_config
  FOR SELECT USING (true);

INSERT INTO public.agency_level_config VALUES
  (0,  0,         0,         0),
  (1,  10,        500000,    100000),
  (2,  15,        1000000,   200000),
  (3,  25,        2000000,   400000),
  (4,  40,        4000000,   800000),
  (5,  60,        8000000,   1500000),
  (6,  100,       16000000,  3000000),
  (7,  160,       32000000,  6000000),
  (8,  250,       64000000,  12000000),
  (9,  400,       128000000, 24000000),
  (10, 700,       256000000, 50000000);

CREATE TABLE public.commission_rates (
  level INT PRIMARY KEY CHECK (level BETWEEN 1 AND 6),
  rate  NUMERIC(6,4) NOT NULL
);
ALTER TABLE public.commission_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rates readable" ON public.commission_rates
  FOR SELECT USING (true);
INSERT INTO public.commission_rates VALUES
  (1, 0.0060), (2, 0.0030), (3, 0.0020), (4, 0.0010), (5, 0.0005), (6, 0.0002);

-- =========================================================================
-- 8. Anti-cycle trigger on profiles.referrer_id
-- =========================================================================
CREATE OR REPLACE FUNCTION public.check_referral_no_cycle()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE cur UUID; hops INT := 0;
BEGIN
  IF NEW.referrer_id IS NULL THEN RETURN NEW; END IF;
  IF NEW.referrer_id = NEW.user_id THEN
    RAISE EXCEPTION 'A user cannot refer themselves';
  END IF;
  cur := NEW.referrer_id;
  WHILE cur IS NOT NULL LOOP
    hops := hops + 1;
    IF hops > 50 THEN EXIT; END IF;
    IF cur = NEW.user_id THEN
      RAISE EXCEPTION 'Circular referral detected';
    END IF;
    SELECT referrer_id INTO cur FROM public.profiles WHERE user_id = cur;
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_referral_cycle ON public.profiles;
CREATE TRIGGER trg_check_referral_cycle
  BEFORE INSERT OR UPDATE OF referrer_id ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_referral_no_cycle();

-- =========================================================================
-- 9. Distribute commission for a single bet across 6 upline levels
-- =========================================================================
CREATE OR REPLACE FUNCTION public.distribute_bet_commission(
  _user_id UUID,
  _bet_amount NUMERIC,
  _tx_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE cur_referrer UUID; lvl INT := 1; lvl_rate NUMERIC; comm NUMERIC;
BEGIN
  SELECT referrer_id INTO cur_referrer FROM public.profiles WHERE user_id = _user_id;
  WHILE cur_referrer IS NOT NULL AND lvl <= 6 LOOP
    SELECT rate INTO lvl_rate FROM public.commission_rates WHERE level = lvl;
    IF lvl_rate IS NOT NULL THEN
      comm := round(_bet_amount * lvl_rate, 4);
      INSERT INTO public.commissions(beneficiary_id, source_user_id, source_tx_id, level, rate, bet_amount, commission_amount)
      VALUES (cur_referrer, _user_id, _tx_id, lvl, lvl_rate, _bet_amount, comm);
    END IF;
    SELECT referrer_id INTO cur_referrer FROM public.profiles WHERE user_id = cur_referrer;
    lvl := lvl + 1;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.on_referral_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.type = 'bet' AND NEW.amount > 0 THEN
    PERFORM public.distribute_bet_commission(NEW.user_id, NEW.amount, NEW.id);
  END IF;
  IF NEW.type = 'deposit' AND NEW.amount > 0 THEN
    UPDATE public.profiles
       SET first_deposit_at = COALESCE(first_deposit_at, NEW.created_at)
     WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_referral_tx ON public.referral_transactions;
CREATE TRIGGER trg_referral_tx
  AFTER INSERT ON public.referral_transactions
  FOR EACH ROW EXECUTE FUNCTION public.on_referral_transaction();

-- =========================================================================
-- 10. Daily job: credit yesterday's commission, recompute team stats, upgrade agency_level
-- =========================================================================
CREATE OR REPLACE FUNCTION public.run_daily_agency_job()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  WITH y AS (
    SELECT beneficiary_id, SUM(commission_amount) AS total
    FROM public.commissions
    WHERE credited = FALSE AND created_at < date_trunc('day', now())
    GROUP BY beneficiary_id
  )
  UPDATE public.profiles p
     SET commission_wallet = p.commission_wallet + y.total
    FROM y
   WHERE p.user_id = y.beneficiary_id;

  UPDATE public.commissions
     SET credited = TRUE
   WHERE credited = FALSE AND created_at < date_trunc('day', now());

  WITH RECURSIVE tree AS (
    SELECT user_id AS root_id, user_id AS member_id, 0 AS lvl
      FROM public.profiles
    UNION ALL
    SELECT t.root_id, p.user_id, t.lvl + 1
      FROM tree t
      JOIN public.profiles p ON p.referrer_id = t.member_id
     WHERE t.lvl < 6
  ),
  agg AS (
    SELECT t.root_id,
           COUNT(*) FILTER (WHERE t.lvl BETWEEN 1 AND 6)               AS team_cnt,
           COUNT(*) FILTER (WHERE t.lvl = 1)                           AS direct_cnt,
           COALESCE(SUM(rt_bet.amount),0)                              AS team_bet,
           COALESCE(SUM(rt_dep.amount),0)                              AS team_dep
      FROM tree t
      LEFT JOIN public.referral_transactions rt_bet
             ON rt_bet.user_id = t.member_id AND rt_bet.type='bet' AND t.lvl BETWEEN 1 AND 6
      LEFT JOIN public.referral_transactions rt_dep
             ON rt_dep.user_id = t.member_id AND rt_dep.type='deposit' AND t.lvl BETWEEN 1 AND 6
     GROUP BY t.root_id
  )
  UPDATE public.profiles p
     SET team_count   = COALESCE(a.team_cnt,0),
         direct_count = COALESCE(a.direct_cnt,0),
         team_betting = COALESCE(a.team_bet,0),
         team_deposit = COALESCE(a.team_dep,0)
    FROM agg a
   WHERE p.user_id = a.root_id;

  UPDATE public.profiles p
     SET agency_level = sub.new_level
    FROM (
      SELECT p2.user_id, COALESCE(MAX(c.level), 0) AS new_level
        FROM public.profiles p2
        LEFT JOIN public.agency_level_config c
               ON p2.team_count   >= c.required_members
              AND p2.team_betting >= c.required_betting
              AND p2.team_deposit >= c.required_deposit
       GROUP BY p2.user_id
    ) sub
   WHERE p.user_id = sub.user_id
     AND p.agency_level <> sub.new_level;
END;
$$;

CREATE EXTENSION IF NOT EXISTS pg_cron;
DO $$
BEGIN
  PERFORM cron.unschedule('agency-daily-job');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
SELECT cron.schedule('agency-daily-job','30 19 * * *',$$ SELECT public.run_daily_agency_job(); $$);
