-- Create food catalog table for diet meal planning
CREATE TABLE IF NOT EXISTS public.food_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'general', -- protein, carbs, vegetables, fruits, dairy, grains, beverages
    serving_size TEXT NOT NULL DEFAULT '100g',
    calories INTEGER NOT NULL DEFAULT 0,
    protein NUMERIC(5,1) NOT NULL DEFAULT 0,
    carbs NUMERIC(5,1) NOT NULL DEFAULT 0,
    fat NUMERIC(5,1) NOT NULL DEFAULT 0,
    fiber NUMERIC(5,1) DEFAULT 0,
    image_url TEXT,
    diet_types TEXT[] DEFAULT '{}'::TEXT[], -- vegetarian, vegan, keto, etc.
    allergens TEXT[] DEFAULT '{}'::TEXT[], -- nuts, dairy, gluten, eggs, soy, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.food_catalog ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read
CREATE POLICY "Anyone can read food catalog" ON public.food_catalog
    FOR SELECT TO authenticated USING (true);

-- Admins can manage
CREATE POLICY "Admins can manage food catalog" ON public.food_catalog
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed with common food items
INSERT INTO public.food_catalog (name, category, serving_size, calories, protein, carbs, fat, fiber, diet_types, allergens) VALUES
-- Proteins
('Chicken Breast', 'protein', '150g', 248, 46.0, 0, 5.4, 0, ARRAY['non-vegetarian', 'keto'], ARRAY[]::TEXT[]),
('Salmon Fillet', 'protein', '150g', 280, 40.0, 0, 13.0, 0, ARRAY['non-vegetarian', 'keto'], ARRAY['fish']),
('Eggs', 'protein', '2 whole', 156, 13.0, 1.1, 11.0, 0, ARRAY['vegetarian', 'keto'], ARRAY['eggs']),
('Egg Whites', 'protein', '4 whites', 68, 14.0, 0.7, 0.2, 0, ARRAY['vegetarian', 'keto'], ARRAY['eggs']),
('Greek Yogurt', 'protein', '200g', 130, 20.0, 8.0, 2.0, 0, ARRAY['vegetarian'], ARRAY['dairy']),
('Cottage Cheese', 'protein', '150g', 120, 18.0, 5.0, 2.0, 0, ARRAY['vegetarian', 'keto'], ARRAY['dairy']),
('Paneer', 'protein', '100g', 265, 18.0, 3.0, 20.0, 0, ARRAY['vegetarian', 'keto'], ARRAY['dairy']),
('Tofu', 'protein', '150g', 120, 15.0, 3.0, 6.0, 1, ARRAY['vegetarian', 'vegan'], ARRAY['soy']),
('Beef Steak', 'protein', '200g', 500, 50.0, 0, 32.0, 0, ARRAY['non-vegetarian', 'keto'], ARRAY[]::TEXT[]),
('Whey Protein', 'protein', '1 scoop', 120, 24.0, 3.0, 1.5, 0, ARRAY['vegetarian'], ARRAY['dairy']),

-- Carbs/Grains
('Brown Rice', 'grains', '1 cup cooked', 220, 5.0, 46.0, 2.0, 3.5, ARRAY['vegetarian', 'vegan', 'gluten-free'], ARRAY[]::TEXT[]),
('Oatmeal', 'grains', '1 cup cooked', 160, 6.0, 28.0, 3.0, 4.0, ARRAY['vegetarian', 'vegan'], ARRAY['gluten']),
('Quinoa', 'grains', '1 cup cooked', 220, 8.0, 39.0, 4.0, 5.0, ARRAY['vegetarian', 'vegan', 'gluten-free'], ARRAY[]::TEXT[]),
('Whole Wheat Bread', 'grains', '2 slices', 180, 8.0, 34.0, 2.0, 4.0, ARRAY['vegetarian', 'vegan'], ARRAY['gluten']),
('Sweet Potato', 'grains', '1 medium', 112, 2.0, 26.0, 0.1, 4.0, ARRAY['vegetarian', 'vegan', 'gluten-free'], ARRAY[]::TEXT[]),
('Pasta', 'grains', '1 cup cooked', 220, 8.0, 43.0, 1.3, 2.5, ARRAY['vegetarian', 'vegan'], ARRAY['gluten']),
('Multigrain Roti', 'grains', '2 pieces', 200, 6.0, 38.0, 4.0, 4.0, ARRAY['vegetarian', 'vegan'], ARRAY['gluten']),

-- Vegetables
('Broccoli', 'vegetables', '150g', 50, 4.0, 10.0, 0.5, 3.5, ARRAY['vegetarian', 'vegan', 'keto', 'gluten-free'], ARRAY[]::TEXT[]),
('Spinach', 'vegetables', '100g', 23, 3.0, 3.6, 0.4, 2.2, ARRAY['vegetarian', 'vegan', 'keto', 'gluten-free'], ARRAY[]::TEXT[]),
('Mixed Salad', 'vegetables', '150g', 30, 2.0, 6.0, 0.3, 2.0, ARRAY['vegetarian', 'vegan', 'keto', 'gluten-free'], ARRAY[]::TEXT[]),
('Cucumber', 'vegetables', '100g', 16, 0.7, 3.6, 0.1, 0.5, ARRAY['vegetarian', 'vegan', 'keto', 'gluten-free'], ARRAY[]::TEXT[]),
('Tomato', 'vegetables', '100g', 18, 0.9, 3.9, 0.2, 1.2, ARRAY['vegetarian', 'vegan', 'keto', 'gluten-free'], ARRAY[]::TEXT[]),
('Bell Peppers', 'vegetables', '100g', 31, 1.0, 6.0, 0.3, 2.1, ARRAY['vegetarian', 'vegan', 'keto', 'gluten-free'], ARRAY[]::TEXT[]),

-- Fruits
('Banana', 'fruits', '1 medium', 105, 1.3, 27.0, 0.4, 3.1, ARRAY['vegetarian', 'vegan', 'gluten-free'], ARRAY[]::TEXT[]),
('Apple', 'fruits', '1 medium', 95, 0.5, 25.0, 0.3, 4.4, ARRAY['vegetarian', 'vegan', 'gluten-free'], ARRAY[]::TEXT[]),
('Orange', 'fruits', '1 medium', 62, 1.2, 15.0, 0.2, 3.1, ARRAY['vegetarian', 'vegan', 'gluten-free'], ARRAY[]::TEXT[]),
('Mixed Berries', 'fruits', '1 cup', 70, 1.0, 17.0, 0.5, 4.0, ARRAY['vegetarian', 'vegan', 'gluten-free'], ARRAY[]::TEXT[]),
('Avocado', 'fruits', '1/2', 160, 2.0, 9.0, 15.0, 7.0, ARRAY['vegetarian', 'vegan', 'keto', 'gluten-free'], ARRAY[]::TEXT[]),

-- Fats/Nuts
('Almonds', 'fats', '30g', 170, 6.0, 6.0, 15.0, 3.5, ARRAY['vegetarian', 'vegan', 'keto', 'gluten-free'], ARRAY['nuts']),
('Peanut Butter', 'fats', '2 tbsp', 190, 8.0, 6.0, 16.0, 2.0, ARRAY['vegetarian', 'vegan'], ARRAY['nuts']),
('Olive Oil', 'fats', '1 tbsp', 120, 0, 0, 14.0, 0, ARRAY['vegetarian', 'vegan', 'keto', 'gluten-free'], ARRAY[]::TEXT[]),
('Mixed Nuts', 'fats', '50g', 320, 8.0, 12.0, 28.0, 3.0, ARRAY['vegetarian', 'vegan', 'keto', 'gluten-free'], ARRAY['nuts']),
('Walnuts', 'fats', '30g', 185, 4.0, 4.0, 18.0, 2.0, ARRAY['vegetarian', 'vegan', 'keto', 'gluten-free'], ARRAY['nuts']),

-- Dairy
('Milk', 'dairy', '1 cup', 150, 8.0, 12.0, 8.0, 0, ARRAY['vegetarian'], ARRAY['dairy']),
('Curd/Yogurt', 'dairy', '200g', 130, 8.0, 10.0, 7.0, 0, ARRAY['vegetarian'], ARRAY['dairy']),
('Cheese', 'dairy', '30g', 110, 7.0, 0.4, 9.0, 0, ARRAY['vegetarian', 'keto'], ARRAY['dairy']),

-- Legumes
('Lentils (Dal)', 'protein', '1 cup cooked', 230, 18.0, 40.0, 1.0, 16.0, ARRAY['vegetarian', 'vegan', 'gluten-free'], ARRAY[]::TEXT[]),
('Chickpeas', 'protein', '1 cup cooked', 270, 15.0, 45.0, 4.0, 12.0, ARRAY['vegetarian', 'vegan', 'gluten-free'], ARRAY[]::TEXT[]),
('Black Beans', 'protein', '1 cup cooked', 225, 15.0, 40.0, 1.0, 15.0, ARRAY['vegetarian', 'vegan', 'gluten-free'], ARRAY[]::TEXT[]),

-- Beverages
('Green Tea', 'beverages', '1 cup', 2, 0, 0, 0, 0, ARRAY['vegetarian', 'vegan', 'keto', 'gluten-free'], ARRAY[]::TEXT[]),
('Black Coffee', 'beverages', '1 cup', 5, 0.3, 0, 0, 0, ARRAY['vegetarian', 'vegan', 'keto', 'gluten-free'], ARRAY[]::TEXT[]),
('Protein Shake', 'beverages', '1 serving', 280, 35.0, 12.0, 8.0, 0, ARRAY['vegetarian'], ARRAY['dairy'])

ON CONFLICT (name) DO NOTHING;
