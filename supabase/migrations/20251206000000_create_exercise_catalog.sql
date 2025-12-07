-- Create a dedicated exercise catalog table for the exercise library
CREATE TABLE IF NOT EXISTS public.exercise_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'strength',
    body_part TEXT,
    equipment TEXT,
    difficulty TEXT DEFAULT 'intermediate',
    description TEXT,
    animation_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exercise_catalog ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read exercises
CREATE POLICY "Anyone can read exercise catalog" ON public.exercise_catalog
    FOR SELECT TO authenticated USING (true);

-- Only admins can manage exercises
CREATE POLICY "Admins can manage exercise catalog" ON public.exercise_catalog
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed with common gym exercises
INSERT INTO public.exercise_catalog (name, category, body_part, equipment, difficulty) VALUES
-- Chest Exercises
('Bench Press', 'strength', 'chest', 'barbell', 'intermediate'),
('Incline Bench Press', 'strength', 'chest', 'barbell', 'intermediate'),
('Decline Bench Press', 'strength', 'chest', 'barbell', 'intermediate'),
('Dumbbell Flyes', 'strength', 'chest', 'dumbbells', 'beginner'),
('Push-ups', 'strength', 'chest', 'bodyweight', 'beginner'),
('Cable Crossover', 'strength', 'chest', 'cable', 'intermediate'),
('Chest Dips', 'strength', 'chest', 'bodyweight', 'intermediate'),

-- Back Exercises
('Pull-ups', 'strength', 'back', 'bodyweight', 'intermediate'),
('Lat Pulldown', 'strength', 'back', 'cable', 'beginner'),
('Barbell Rows', 'strength', 'back', 'barbell', 'intermediate'),
('Dumbbell Rows', 'strength', 'back', 'dumbbells', 'beginner'),
('Seated Cable Row', 'strength', 'back', 'cable', 'beginner'),
('Deadlifts', 'strength', 'back', 'barbell', 'advanced'),
('T-Bar Row', 'strength', 'back', 'barbell', 'intermediate'),

-- Leg Exercises
('Squats', 'strength', 'legs', 'barbell', 'intermediate'),
('Leg Press', 'strength', 'legs', 'machine', 'beginner'),
('Lunges', 'strength', 'legs', 'dumbbells', 'beginner'),
('Leg Curls', 'strength', 'legs', 'machine', 'beginner'),
('Leg Extensions', 'strength', 'legs', 'machine', 'beginner'),
('Calf Raises', 'strength', 'legs', 'machine', 'beginner'),
('Romanian Deadlifts', 'strength', 'legs', 'barbell', 'intermediate'),

-- Shoulder Exercises
('Shoulder Press', 'strength', 'shoulders', 'barbell', 'intermediate'),
('Dumbbell Lateral Raises', 'strength', 'shoulders', 'dumbbells', 'beginner'),
('Front Raises', 'strength', 'shoulders', 'dumbbells', 'beginner'),
('Rear Delt Flyes', 'strength', 'shoulders', 'dumbbells', 'beginner'),
('Arnold Press', 'strength', 'shoulders', 'dumbbells', 'intermediate'),
('Face Pulls', 'strength', 'shoulders', 'cable', 'beginner'),

-- Arm Exercises
('Bicep Curls', 'strength', 'arms', 'dumbbells', 'beginner'),
('Hammer Curls', 'strength', 'arms', 'dumbbells', 'beginner'),
('Tricep Dips', 'strength', 'arms', 'bodyweight', 'intermediate'),
('Tricep Pushdowns', 'strength', 'arms', 'cable', 'beginner'),
('Skull Crushers', 'strength', 'arms', 'barbell', 'intermediate'),
('Preacher Curls', 'strength', 'arms', 'barbell', 'beginner'),
('Cable Curls', 'strength', 'arms', 'cable', 'beginner'),

-- Core Exercises
('Plank', 'core', 'core', 'bodyweight', 'beginner'),
('Crunches', 'core', 'core', 'bodyweight', 'beginner'),
('Russian Twists', 'core', 'core', 'bodyweight', 'beginner'),
('Leg Raises', 'core', 'core', 'bodyweight', 'intermediate'),
('Mountain Climbers', 'cardio', 'core', 'bodyweight', 'beginner'),
('Dead Bug', 'core', 'core', 'bodyweight', 'beginner'),
('Ab Wheel Rollout', 'core', 'core', 'equipment', 'advanced'),

-- Cardio Exercises
('Treadmill Running', 'cardio', 'full-body', 'machine', 'beginner'),
('Jumping Jacks', 'cardio', 'full-body', 'bodyweight', 'beginner'),
('Burpees', 'cardio', 'full-body', 'bodyweight', 'intermediate'),
('Box Jumps', 'cardio', 'legs', 'equipment', 'intermediate'),
('Rowing Machine', 'cardio', 'full-body', 'machine', 'beginner'),
('Battle Ropes', 'cardio', 'full-body', 'equipment', 'intermediate'),

-- Flexibility
('Stretching', 'flexibility', 'full-body', 'bodyweight', 'beginner'),
('Yoga Flow', 'flexibility', 'full-body', 'bodyweight', 'beginner')

ON CONFLICT (name) DO NOTHING;
