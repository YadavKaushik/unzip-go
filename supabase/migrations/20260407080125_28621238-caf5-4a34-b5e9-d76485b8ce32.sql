
-- Bank accounts
CREATE TABLE public.bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bank_name TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  account_number TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  ifsc_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bank" ON public.bank_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bank" ON public.bank_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bank" ON public.bank_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bank" ON public.bank_accounts FOR DELETE USING (auth.uid() = user_id);

-- UPI accounts
CREATE TABLE public.upi_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  upi_name TEXT NOT NULL,
  phone TEXT,
  upi_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.upi_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own upi" ON public.upi_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own upi" ON public.upi_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own upi" ON public.upi_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own upi" ON public.upi_accounts FOR DELETE USING (auth.uid() = user_id);

-- USDT addresses
CREATE TABLE public.usdt_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  network TEXT NOT NULL DEFAULT 'TRC',
  address TEXT NOT NULL,
  alias TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.usdt_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own usdt" ON public.usdt_addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usdt" ON public.usdt_addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own usdt" ON public.usdt_addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own usdt" ON public.usdt_addresses FOR DELETE USING (auth.uid() = user_id);
