
-- First, let's update the user_role enum to include all three roles
ALTER TYPE user_role ADD VALUE 'staff';

-- Update the profiles table to ensure it can handle all three roles
-- The table structure is already good, but let's make sure the role column is properly set up
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'intern'::user_role;

-- Update the handle_new_user function to handle all three roles safely
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

-- Update RLS policies to handle staff role as well
-- Add policy for staff to view their own attendance
CREATE POLICY "Staff can view their own attendance" 
ON attendance_records 
FOR SELECT 
USING (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'staff'::user_role
  )
);

-- Add policy for staff to insert their own attendance
CREATE POLICY "Staff can insert their own attendance" 
ON attendance_records 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'staff'::user_role
  )
);

-- Add policy for staff to update their own attendance
CREATE POLICY "Staff can update their own attendance" 
ON attendance_records 
FOR UPDATE 
USING (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'staff'::user_role
  )
);

-- Add policy for staff to view their own profile
CREATE POLICY "Staff can view their own profile" 
ON profiles 
FOR SELECT 
USING (
  auth.uid() = id AND role = 'staff'::user_role
);

-- Add policy for staff to update their own profile
CREATE POLICY "Staff can update their own profile" 
ON profiles 
FOR UPDATE 
USING (
  auth.uid() = id AND role = 'staff'::user_role
);

-- Add policy for staff to view their own pending sign ins
CREATE POLICY "Staff can view their own pending sign ins" 
ON pending_sign_ins 
FOR SELECT 
USING (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'staff'::user_role
  )
);

-- Add policy for staff to insert their own pending sign ins
CREATE POLICY "Staff can insert their own pending sign ins" 
ON pending_sign_ins 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'staff'::user_role
  )
);
