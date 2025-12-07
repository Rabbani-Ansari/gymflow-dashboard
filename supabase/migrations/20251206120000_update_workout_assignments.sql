-- Add new columns to workout_assignments table for enhanced assignment management
-- Run this migration after 20251204220000_create_all_tables.sql

-- Add start_date column
ALTER TABLE public.workout_assignments 
ADD COLUMN IF NOT EXISTS start_date DATE;

-- Add end_date column
ALTER TABLE public.workout_assignments 
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Add active_days column (array of weekday names)
ALTER TABLE public.workout_assignments 
ADD COLUMN IF NOT EXISTS active_days TEXT[] DEFAULT ARRAY['monday', 'wednesday', 'friday'];

-- Add notify column for in-app notifications
ALTER TABLE public.workout_assignments 
ADD COLUMN IF NOT EXISTS notify BOOLEAN DEFAULT true;

-- Add notes column for assignment-specific notes
ALTER TABLE public.workout_assignments 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Backfill existing assignments with default dates
UPDATE public.workout_assignments 
SET 
  start_date = COALESCE(start_date, CURRENT_DATE),
  end_date = COALESCE(end_date, CURRENT_DATE + INTERVAL '1 month')
WHERE start_date IS NULL OR end_date IS NULL;

-- Create index for faster member lookups
CREATE INDEX IF NOT EXISTS idx_workout_assignments_member_id 
ON public.workout_assignments(member_id);

-- Create index for faster workout lookups
CREATE INDEX IF NOT EXISTS idx_workout_assignments_workout_id 
ON public.workout_assignments(workout_id);

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_workout_assignments_status 
ON public.workout_assignments(status);
