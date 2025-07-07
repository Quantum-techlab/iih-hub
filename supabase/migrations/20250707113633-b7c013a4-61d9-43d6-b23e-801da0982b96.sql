
-- Create the user_role enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('intern', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the attendance_status enum type if it doesn't exist  
DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('signed_in', 'signed_out', 'absent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the sign_in_status enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE sign_in_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
