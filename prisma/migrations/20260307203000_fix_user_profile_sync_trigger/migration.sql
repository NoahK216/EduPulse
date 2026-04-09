CREATE OR REPLACE FUNCTION public.sync_public_user_from_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.user_profile (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

INSERT INTO public.user_profile (id)
SELECT auth_user.id
FROM neon_auth."user" AS auth_user
ON CONFLICT (id) DO NOTHING;
