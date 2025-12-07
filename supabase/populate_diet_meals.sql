-- ========================================
-- POPULATE DIET MEALS TABLE
-- Run this in Supabase SQL Editor to add meals to diet plans
-- ========================================

-- Diet Meals for "Muscle Gain Pro" (850e8400-e29b-41d4-a716-446655440001)
INSERT INTO public.diet_meals (diet_plan_id, meal_time, items) VALUES
-- Breakfast
('850e8400-e29b-41d4-a716-446655440001', 'Breakfast', '[
  {"name": "Eggs", "quantity": "4 whole", "calories": 320, "protein": 24, "carbs": 2, "fat": 24},
  {"name": "Oatmeal", "quantity": "1 cup", "calories": 300, "protein": 10, "carbs": 54, "fat": 6},
  {"name": "Banana", "quantity": "1 medium", "calories": 105, "protein": 1, "carbs": 27, "fat": 0},
  {"name": "Peanut Butter", "quantity": "2 tbsp", "calories": 190, "protein": 8, "carbs": 6, "fat": 16}
]'::jsonb),

-- Lunch
('850e8400-e29b-41d4-a716-446655440001', 'Lunch', '[
  {"name": "Grilled Chicken Breast", "quantity": "250g", "calories": 400, "protein": 75, "carbs": 0, "fat": 9},
  {"name": "Brown Rice", "quantity": "1.5 cups", "calories": 330, "protein": 7, "carbs": 69, "fat": 3},
  {"name": "Steamed Broccoli", "quantity": "200g", "calories": 70, "protein": 6, "carbs": 14, "fat": 0},
  {"name": "Olive Oil", "quantity": "1 tbsp", "calories": 120, "protein": 0, "carbs": 0, "fat": 14}
]'::jsonb),

-- Dinner
('850e8400-e29b-41d4-a716-446655440001', 'Dinner', '[
  {"name": "Salmon Fillet", "quantity": "200g", "calories": 400, "protein": 40, "carbs": 0, "fat": 26},
  {"name": "Sweet Potato", "quantity": "2 medium", "calories": 230, "protein": 4, "carbs": 52, "fat": 0},
  {"name": "Mixed Salad", "quantity": "100g", "calories": 20, "protein": 1, "carbs": 4, "fat": 0},
  {"name": "Avocado", "quantity": "1/2", "calories": 160, "protein": 2, "carbs": 9, "fat": 15}
]'::jsonb),

-- Snacks
('850e8400-e29b-41d4-a716-446655440001', 'Snacks', '[
  {"name": "Protein Shake", "quantity": "1 scoop + milk", "calories": 280, "protein": 35, "carbs": 12, "fat": 8},
  {"name": "Greek Yogurt", "quantity": "200g", "calories": 130, "protein": 20, "carbs": 8, "fat": 2},
  {"name": "Mixed Nuts", "quantity": "50g", "calories": 320, "protein": 8, "carbs": 12, "fat": 28}
]'::jsonb);


-- Diet Meals for "Fat Loss Express" (850e8400-e29b-41d4-a716-446655440002)
INSERT INTO public.diet_meals (diet_plan_id, meal_time, items) VALUES
-- Breakfast
('850e8400-e29b-41d4-a716-446655440002', 'Breakfast', '[
  {"name": "Egg Whites", "quantity": "6 whites", "calories": 100, "protein": 22, "carbs": 0, "fat": 0},
  {"name": "Oatmeal", "quantity": "1/2 cup", "calories": 150, "protein": 5, "carbs": 27, "fat": 3},
  {"name": "Berries", "quantity": "100g", "calories": 45, "protein": 1, "carbs": 11, "fat": 0},
  {"name": "Green Tea", "quantity": "1 cup", "calories": 0, "protein": 0, "carbs": 0, "fat": 0}
]'::jsonb),

-- Lunch
('850e8400-e29b-41d4-a716-446655440002', 'Lunch', '[
  {"name": "Grilled Chicken Salad", "quantity": "300g", "calories": 350, "protein": 45, "carbs": 15, "fat": 12},
  {"name": "Quinoa", "quantity": "1/2 cup", "calories": 110, "protein": 4, "carbs": 20, "fat": 2},
  {"name": "Lemon Vinaigrette", "quantity": "2 tbsp", "calories": 60, "protein": 0, "carbs": 2, "fat": 6}
]'::jsonb),

-- Dinner
('850e8400-e29b-41d4-a716-446655440002', 'Dinner', '[
  {"name": "Baked Fish", "quantity": "180g", "calories": 200, "protein": 40, "carbs": 0, "fat": 4},
  {"name": "Steamed Vegetables", "quantity": "250g", "calories": 80, "protein": 4, "carbs": 16, "fat": 0},
  {"name": "Brown Rice", "quantity": "1/2 cup", "calories": 110, "protein": 2, "carbs": 23, "fat": 1}
]'::jsonb),

-- Snacks
('850e8400-e29b-41d4-a716-446655440002', 'Snacks', '[
  {"name": "Apple", "quantity": "1 medium", "calories": 95, "protein": 0, "carbs": 25, "fat": 0},
  {"name": "Almonds", "quantity": "20g", "calories": 120, "protein": 4, "carbs": 4, "fat": 10},
  {"name": "Cottage Cheese", "quantity": "100g", "calories": 80, "protein": 14, "carbs": 3, "fat": 1}
]'::jsonb);

-- ========================================
-- VERIFICATION
-- ========================================
-- SELECT 
--   dp.name as diet_plan,
--   dm.meal_time,
--   jsonb_array_length(dm.items) as food_items_count
-- FROM public.diet_meals dm
-- JOIN public.diet_plans dp ON dm.diet_plan_id = dp.id
-- ORDER BY dp.name, dm.meal_time;
