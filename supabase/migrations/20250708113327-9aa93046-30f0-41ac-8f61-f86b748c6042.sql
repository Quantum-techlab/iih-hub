
-- Update the handle_new_user function to safely handle empty role values
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role_text text := NULLIF(NEW.raw_user_meta_data->>'role', '');
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
