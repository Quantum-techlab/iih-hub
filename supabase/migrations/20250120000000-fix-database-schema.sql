-- Comprehensive database schema fix for Ilorin Innovation Hub
-- This migration fixes all database issues and ensures proper functionality

-- First, let's ensure all enum types exist and are properly configured
DO $$ BEGIN
    -- Create user_role enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('intern', 'admin', 'staff');
    ELSE
        -- Add 'staff' value if it doesn't exist
        BEGIN
            ALTER TYPE user_role ADD VALUE 'staff';
        EXCEPTION
            WHEN duplicate_object THEN null;
        END;
    END IF;
END $$;

DO $$ BEGIN
    -- Create attendance_status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
        CREATE TYPE attendance_status AS ENUM ('signed_in', 'signed_out', 'absent');
    END IF;
END $$;

DO $$ BEGIN
    -- Create sign_in_status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sign_in_status') THEN
        CREATE TYPE sign_in_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END $$;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'intern',
  intern_id TEXT UNIQUE,
  department TEXT,
  supervisor TEXT,
  join_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance_records table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  sign_in_time TIMESTAMP WITH TIME ZONE,
  sign_out_time TIMESTAMP WITH TIME ZONE,
  sign_in_location JSONB,
  sign_out_location JSONB,
  status attendance_status DEFAULT 'absent',
  total_hours DECIMAL(4,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create pending_sign_ins table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.pending_sign_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  attendance_record_id UUID REFERENCES public.attendance_records(id) ON DELETE CASCADE,
  sign_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
  sign_out_time TIMESTAMP WITH TIME ZONE,
  sign_in_location JSONB NOT NULL,
  sign_out_location JSONB,
  status sign_in_status DEFAULT 'pending',
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create error_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.error_logs (
  id SERIAL PRIMARY KEY,
  error_message TEXT NOT NULL,
  error_detail TEXT,
  error_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_sign_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Staff can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff can update their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Users can insert their own attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Users can update their own attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Admins can view all attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Staff can view their own attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Staff can insert their own attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Staff can update their own attendance" ON public.attendance_records;

DROP POLICY IF EXISTS "Users can view their own pending sign ins" ON public.pending_sign_ins;
DROP POLICY IF EXISTS "Users can insert their own pending sign ins" ON public.pending_sign_ins;
DROP POLICY IF EXISTS "Admins can view all pending sign ins" ON public.pending_sign_ins;
DROP POLICY IF EXISTS "Admins can update pending sign ins" ON public.pending_sign_ins;
DROP POLICY IF EXISTS "Staff can view their own pending sign ins" ON public.pending_sign_ins;
DROP POLICY IF EXISTS "Staff can insert their own pending sign ins" ON public.pending_sign_ins;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Staff can view their own profile" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id AND role = 'staff'
  );

CREATE POLICY "Staff can update their own profile" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id AND role = 'staff'
  );

-- RLS Policies for attendance_records
CREATE POLICY "Users can view their own attendance" ON public.attendance_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attendance" ON public.attendance_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attendance" ON public.attendance_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all attendance" ON public.attendance_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Staff can view their own attendance" ON public.attendance_records
  FOR SELECT USING (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'staff'
    )
  );

CREATE POLICY "Staff can insert their own attendance" ON public.attendance_records
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'staff'
    )
  );

CREATE POLICY "Staff can update their own attendance" ON public.attendance_records
  FOR UPDATE USING (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'staff'
    )
  );

-- RLS Policies for pending_sign_ins
CREATE POLICY "Users can view their own pending sign ins" ON public.pending_sign_ins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pending sign ins" ON public.pending_sign_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all pending sign ins" ON public.pending_sign_ins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update pending sign ins" ON public.pending_sign_ins
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Staff can view their own pending sign ins" ON public.pending_sign_ins
  FOR SELECT USING (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'staff'
    )
  );

CREATE POLICY "Staff can insert their own pending sign ins" ON public.pending_sign_ins
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'staff'
    )
  );

-- RLS Policies for error_logs (only admins can view)
CREATE POLICY "Admins can view error logs" ON public.error_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create or replace the handle_new_user function with proper error handling
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

  -- Insert into profiles table with proper error handling
  BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(full_name_text, SPLIT_PART(NEW.email, '@', 1)),
      final_role
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error
      INSERT INTO public.error_logs (error_message, error_detail, error_context)
      VALUES (
        'Failed to create user profile: ' || SQLERRM,
        SQLSTATE,
        'handle_new_user function'
      );
      -- Re-raise the exception
      RAISE;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create or replace the calculate_attendance_hours function
CREATE OR REPLACE FUNCTION public.calculate_attendance_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sign_in_time IS NOT NULL AND NEW.sign_out_time IS NOT NULL THEN
    NEW.total_hours := EXTRACT(EPOCH FROM (NEW.sign_out_time - NEW.sign_in_time)) / 3600;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS calculate_hours_trigger ON public.attendance_records;
CREATE TRIGGER calculate_hours_trigger
  BEFORE UPDATE ON public.attendance_records
  FOR EACH ROW EXECUTE FUNCTION public.calculate_attendance_hours();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_records_user_date ON public.attendance_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_date ON public.attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_pending_sign_ins_status ON public.pending_sign_ins(status);
CREATE INDEX IF NOT EXISTS idx_pending_sign_ins_user ON public.pending_sign_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Create a function to log errors
CREATE OR REPLACE FUNCTION public.log_error(
  error_msg TEXT,
  error_detail TEXT DEFAULT NULL,
  error_context TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.error_logs (error_message, error_detail, error_context)
  VALUES (error_msg, error_detail, error_context);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
