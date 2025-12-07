import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Trainer {
  id: string;
  name: string;
  specialization: string;
  photo: string | null;
  created_at: string;
}

export interface DietPlan {
  id: string;
  name: string;
  trainer_id: string | null;
  category: 'weight-loss' | 'muscle-gain' | 'maintenance' | 'general';
  diet_goal: 'weight-loss' | 'muscle-gain' | 'maintenance' | 'fat-loss' | 'general-fitness';
  diet_type: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'keto' | 'diabetic' | 'gluten-free';
  target_calories: number;
  duration: number;
  description: string | null;
  thumbnail: string | null;
  water_intake: number | null;
  supplements: string[] | null;
  special_instructions: string | null;
  macros_calories: number;
  macros_protein: number;
  macros_carbs: number;
  macros_fat: number;
  created_at: string;
  updated_at: string;
  trainer?: Trainer;
  meals?: DietMeal[];
}

export interface DietMeal {
  id: string;
  diet_plan_id: string;
  meal_time: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  items: FoodItem[];
}

export interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image?: string;
}

export const useDietPlans = () => {
  return useQuery({
    queryKey: ['diet-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diet_plans')
        .select(`
          *,
          trainer:trainers(*),
          meals:diet_meals(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as DietPlan[];
    },
  });
};

export const useDietPlan = (id: string) => {
  return useQuery({
    queryKey: ['diet-plans', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diet_plans')
        .select(`
          *,
          trainer:trainers(*),
          meals:diet_meals(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as DietPlan;
    },
    enabled: !!id,
  });
};

export const useCreateDietPlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (plan: Omit<DietPlan, 'id' | 'created_at' | 'updated_at' | 'trainer' | 'meals'>) => {
      const { data, error } = await supabase
        .from('diet_plans')
        .insert(plan)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-plans'] });
      toast({ title: 'Success', description: 'Diet plan created successfully' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
};

export const useUpdateDietPlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DietPlan> & { id: string }) => {
      // 1. Separate meals from other updates
      const { meals, ...planUpdates } = updates;

      // 2. Update diet_plans table
      const { data: planData, error: planError } = await supabase
        .from('diet_plans')
        .update(planUpdates)
        .eq('id', id)
        .select()
        .single();

      if (planError) throw planError;

      // 3. If meals are provided, update diet_meals table
      if (meals) {
        // First delete existing meals for this plan
        const { error: deleteError } = await supabase
          .from('diet_meals')
          .delete()
          .eq('diet_plan_id', id);

        if (deleteError) throw deleteError;

        // Then insert new meals
        // Transform the meals array to match the database schema
        // The EditDietPlanDialog sends meals as { time: string, items: any[] }
        // We need to map time -> meal_time and add diet_plan_id
        const mealRows = meals.map((meal: any) => ({
          diet_plan_id: id,
          meal_time: (meal.time || meal.meal_time) as any, // Cast to any to avoid strict casing checks until types generated
          items: meal.items || [],
        })).filter(m => m.items.length > 0); // Only insert meals with items

        if (mealRows.length > 0) {
          console.log('Inserting meals:', mealRows);
          const { error: insertError } = await supabase
            .from('diet_meals')
            .insert(mealRows);

          if (insertError) {
            console.error('Error inserting meals:', insertError);
            throw insertError;
          }
        }
      }

      return planData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-plans'] });
      toast({ title: 'Success', description: 'Diet plan updated successfully' });
    },
    onError: (error) => {
      console.error('Error updating diet plan:', error);
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
};

export const useDeleteDietPlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('diet_plans').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-plans'] });
      toast({ title: 'Success', description: 'Diet plan deleted successfully' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
};

export const useTrainers = () => {
  return useQuery({
    queryKey: ['trainers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainers')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Trainer[];
    },
  });
};
