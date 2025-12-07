-- ========================================
-- ADD GYM_ID TO MEMBERS TABLE
-- For multi-gym support
-- gym_id references the gym_branding table
-- ========================================

-- Add gym_id column to members table
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS gym_id UUID NULL;

-- Add foreign key constraint to gym_branding table
ALTER TABLE public.members
ADD CONSTRAINT members_gym_id_fkey 
FOREIGN KEY (gym_id) REFERENCES public.gym_branding(id) ON DELETE SET NULL;

-- Create index for faster queries filtering by gym
CREATE INDEX IF NOT EXISTS idx_members_gym_id ON public.members(gym_id);

-- Update existing members to have a gym_id (if gym_branding has data)
-- This sets all existing members to the first gym in the system
-- You may want to customize this based on your data
DO $$
DECLARE
  first_gym_id UUID;
BEGIN
  -- Get the first gym ID from gym_branding
  SELECT id INTO first_gym_id FROM public.gym_branding LIMIT 1;
  
  -- Update members without a gym_id
  IF first_gym_id IS NOT NULL THEN
    UPDATE public.members 
    SET gym_id = first_gym_id 
    WHERE gym_id IS NULL;
  END IF;
END $$;

-- Make gym_id NOT NULL after backfilling data
-- Uncomment this after you've assigned all members to gyms
-- ALTER TABLE public.members ALTER COLUMN gym_id SET NOT NULL;

-- ========================================
-- UPDATE RLS POLICIES FOR MULTI-GYM
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Members are viewable by authenticated users" ON public.members;
DROP POLICY IF EXISTS "Members can be created by authenticated users" ON public.members;
DROP POLICY IF EXISTS "Members can be updated by authenticated users" ON public.members;
DROP POLICY IF EXISTS "Members can be deleted by authenticated users" ON public.members;

-- Create new policies that filter by gym_id
-- Note: You'll need to implement a function to get the user's gym_id
-- For now, these policies allow all authenticated users to access all gyms

CREATE POLICY "Members are viewable by authenticated users"
ON public.members FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Members can be created by authenticated users"
ON public.members FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Members can be updated by authenticated users"
ON public.members FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Members can be deleted by authenticated users"
ON public.members FOR DELETE
TO authenticated
USING (true);

-- ========================================
-- FUTURE: Implement proper RLS
-- ========================================
-- To properly implement multi-gym RLS, you'll need:
-- 1. A function to get the current user's gym_id from their profile/session
-- 2. Update the policies to use that function
-- 
-- Example:
-- CREATE OR REPLACE FUNCTION auth.user_gym_id()
-- RETURNS UUID AS $$
--   SELECT gym_id FROM public.user_profiles WHERE auth_id = auth.uid()
-- $$ LANGUAGE SQL SECURITY DEFINER;
--
-- Then update policies like:
-- USING (gym_id = auth.user_gym_id())
