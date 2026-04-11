CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0);
  RETURN NEW;
END;
$function$;