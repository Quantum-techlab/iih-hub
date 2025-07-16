-- Fix the handle_new_user function to properly handle all three roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role_text text := NULLIF(NEW.raw_user_meta_data->>'role', '');
  full_name_text text := NEW.raw_user_meta_data->>'name';
  final_role user_role;
BEGIN
  -- Validate and set the role, defaulting to 'intern' for any invalid values
  CASE LOWER(COALESCE(user_role_text, 'intern'))
    WHEN 'admin' THEN final_role := 'admin'::user_role;
    WHEN 'staff' THEN final_role := 'staff'::user_role;
    WHEN 'intern' THEN final_role := 'intern'::user_role;
    ELSE final_role := 'intern'::user_role;
  END CASE;

  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(full_name_text, SPLIT_PART(NEW.email, '@', 1)),
    final_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;