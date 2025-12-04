-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'trainer');
CREATE TYPE public.member_status AS ENUM ('active', 'expired', 'trial');
CREATE TYPE public.payment_status AS ENUM ('paid', 'pending', 'failed');
CREATE TYPE public.payment_type AS ENUM ('membership', 'pt', 'product');
CREATE TYPE public.diet_category AS ENUM ('weight-loss', 'muscle-gain', 'maintenance', 'general');
CREATE TYPE public.diet_goal AS ENUM ('weight-loss', 'muscle-gain', 'maintenance', 'fat-loss', 'general-fitness');
CREATE TYPE public.diet_type AS ENUM ('vegetarian', 'non-vegetarian', 'vegan', 'keto', 'diabetic', 'gluten-free');
CREATE TYPE public.body_part AS ENUM ('chest', 'back', 'legs', 'arms', 'shoulders', 'core', 'full-body');
CREATE TYPE public.difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE public.equipment_type AS ENUM ('free-weights', 'machines', 'bodyweight', 'mixed');
CREATE TYPE public.meal_time AS ENUM ('Breakfast', 'Lunch', 'Dinner', 'Snacks');
CREATE TYPE public.assignment_status AS ENUM ('active', 'completed', 'cancelled');

-- Create user_roles table (for admin authentication)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create profiles table for admin users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trainers table
CREATE TABLE public.trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create members table
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  photo TEXT,
  plan TEXT NOT NULL,
  start_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status member_status NOT NULL DEFAULT 'active',
  payment_due DECIMAL(10,2) NOT NULL DEFAULT 0,
  address TEXT,
  emergency_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create member_measurements table
CREATE TABLE public.member_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  height DECIMAL(5,2) NOT NULL,
  bmi DECIMAL(4,2) NOT NULL,
  body_fat DECIMAL(4,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create member_attendance table
CREATE TABLE public.member_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  check_in_time TEXT NOT NULL,
  check_out_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create member_payments table
CREATE TABLE public.member_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type payment_type NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create diet_plans table
CREATE TABLE public.diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trainer_id UUID REFERENCES public.trainers(id) ON DELETE SET NULL,
  category diet_category NOT NULL,
  diet_goal diet_goal NOT NULL,
  diet_type diet_type NOT NULL,
  target_calories INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  description TEXT,
  thumbnail TEXT,
  water_intake DECIMAL(3,1),
  supplements TEXT[],
  special_instructions TEXT,
  macros_calories INTEGER NOT NULL DEFAULT 0,
  macros_protein INTEGER NOT NULL DEFAULT 0,
  macros_carbs INTEGER NOT NULL DEFAULT 0,
  macros_fat INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create diet_meals table
CREATE TABLE public.diet_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diet_plan_id UUID REFERENCES public.diet_plans(id) ON DELETE CASCADE NOT NULL,
  meal_time meal_time NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create diet_assignments table
CREATE TABLE public.diet_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diet_plan_id UUID REFERENCES public.diet_plans(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status assignment_status NOT NULL DEFAULT 'active',
  notify_email BOOLEAN NOT NULL DEFAULT false,
  notify_sms BOOLEAN NOT NULL DEFAULT false,
  notify_whatsapp BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(diet_plan_id, member_id)
);

-- Create workouts table
CREATE TABLE public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trainer_id UUID REFERENCES public.trainers(id) ON DELETE SET NULL,
  body_part body_part NOT NULL,
  difficulty difficulty_level NOT NULL,
  equipment equipment_type NOT NULL,
  duration INTEGER NOT NULL,
  thumbnail TEXT,
  video_url TEXT,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout_exercises table
CREATE TABLE public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sets INTEGER NOT NULL,
  reps TEXT NOT NULL,
  rest TEXT NOT NULL,
  notes TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout_assignments table
CREATE TABLE public.workout_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status assignment_status NOT NULL DEFAULT 'active',
  UNIQUE(workout_id, member_id)
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_assignments ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_diet_plans_updated_at BEFORE UPDATE ON public.diet_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON public.workouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for user_roles (admins can manage)
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for trainers (admins only)
CREATE POLICY "Admins can manage trainers" ON public.trainers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users can view trainers" ON public.trainers FOR SELECT TO authenticated USING (true);

-- RLS Policies for members (admins only)
CREATE POLICY "Admins can manage members" ON public.members FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for member_measurements (admins only)
CREATE POLICY "Admins can manage measurements" ON public.member_measurements FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for member_attendance (admins only)
CREATE POLICY "Admins can manage attendance" ON public.member_attendance FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for member_payments (admins only)
CREATE POLICY "Admins can manage payments" ON public.member_payments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for diet_plans (admins only)
CREATE POLICY "Admins can manage diet plans" ON public.diet_plans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for diet_meals (admins only)
CREATE POLICY "Admins can manage diet meals" ON public.diet_meals FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for diet_assignments (admins only)
CREATE POLICY "Admins can manage diet assignments" ON public.diet_assignments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for workouts (admins only)
CREATE POLICY "Admins can manage workouts" ON public.workouts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for workout_exercises (admins only)
CREATE POLICY "Admins can manage exercises" ON public.workout_exercises FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for workout_assignments (admins only)
CREATE POLICY "Admins can manage workout assignments" ON public.workout_assignments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));