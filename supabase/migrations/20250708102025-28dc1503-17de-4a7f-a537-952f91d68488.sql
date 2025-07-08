
-- Ensure the user_role enum exists with correct values
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('intern', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create or replace the handle_new_user function with safe defaults
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role_text text := NEW.raw_user_meta_data->>'role';
  full_name_text text := NEW.raw_user_meta_data->>'name';
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(full_name_text, SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(user_role_text, 'intern')::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
