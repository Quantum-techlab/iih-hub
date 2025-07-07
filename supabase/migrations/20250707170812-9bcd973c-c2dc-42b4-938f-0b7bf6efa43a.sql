
-- Ensure the user_role enum type exists
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('intern', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ensure the attendance_status enum type exists  
DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('signed_in', 'signed_out', 'absent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ensure the sign_in_status enum type exists
DO $$ BEGIN
    CREATE TYPE sign_in_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Recreate the handle_new_user function to ensure it works with the enum
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'intern'::user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
