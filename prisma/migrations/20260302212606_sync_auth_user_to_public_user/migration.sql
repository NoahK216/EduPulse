-- Optional but recommended: enforce linkage
ALTER TABLE public.users
  ADD CONSTRAINT users_auth_user_id_fkey
  FOREIGN KEY (auth_user_id) REFERENCES neon_auth."user"(id)
  ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION public.sync_public_user_from_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.name, ''), split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (auth_user_id) DO UPDATE
    SET email = EXCLUDED.email,
        name = EXCLUDED.name,
        updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_public_user_from_auth_user ON neon_auth."user";
CREATE TRIGGER trg_sync_public_user_from_auth_user
AFTER INSERT OR UPDATE OF email, name ON neon_auth."user"
FOR EACH ROW
EXECUTE FUNCTION public.sync_public_user_from_auth_user();
