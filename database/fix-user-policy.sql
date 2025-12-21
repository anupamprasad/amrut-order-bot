-- Migration script to fix the foreign key constraint issue
-- Run this in Supabase SQL Editor

-- Drop existing policy if it exists, then create new one
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- Add INSERT policy for users table to allow auto-creation
CREATE POLICY "Users can insert own data"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Make mobile_number nullable since we auto-create users
ALTER TABLE users ALTER COLUMN mobile_number DROP NOT NULL;
ALTER TABLE users ALTER COLUMN mobile_number SET DEFAULT 'Not provided';

-- Make company_name nullable or have default
ALTER TABLE users ALTER COLUMN company_name DROP NOT NULL;
ALTER TABLE users ALTER COLUMN company_name SET DEFAULT 'Not provided';

-- Make contact_name nullable or have default
ALTER TABLE users ALTER COLUMN contact_name DROP NOT NULL;
ALTER TABLE users ALTER COLUMN contact_name SET DEFAULT 'Not provided';

-- Optionally: Create a trigger to auto-create user on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, company_name, contact_name, mobile_number)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'Not provided'),
    COALESCE(NEW.raw_user_meta_data->>'contact_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'mobile_number', 'Not provided')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
