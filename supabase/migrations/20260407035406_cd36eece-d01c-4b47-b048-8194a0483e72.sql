
-- Add uid column
ALTER TABLE public.profiles ADD COLUMN uid BIGINT;

-- Create sequence starting at 3967371
CREATE SEQUENCE public.profiles_uid_seq START WITH 3967371;

-- Set default
ALTER TABLE public.profiles ALTER COLUMN uid SET DEFAULT nextval('public.profiles_uid_seq');

-- Update existing users
UPDATE public.profiles SET uid = nextval('public.profiles_uid_seq') WHERE uid IS NULL;

-- Make unique
ALTER TABLE public.profiles ADD CONSTRAINT profiles_uid_unique UNIQUE (uid);

-- Update trigger to generate random Member username and default avatar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  random_suffix TEXT;
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  i INT;
BEGIN
  random_suffix := '';
  FOR i IN 1..8 LOOP
    random_suffix := random_suffix || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;

  INSERT INTO public.profiles (user_id, email, phone, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    'Member' || random_suffix,
    '/avatars/avatar-1.jpg'
  );
  INSERT INTO public.wallets (user_id, balance, bonus)
  VALUES (NEW.id, 0, 0);
  RETURN NEW;
END;
$$;
