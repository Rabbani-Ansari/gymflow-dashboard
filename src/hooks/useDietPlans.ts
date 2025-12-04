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
      return data as DietPlan[];
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
      return data as DietPlan;
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
      const { data, error } = await supabase
        .from('diet_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-plans'] });
      toast({ title: 'Success', description: 'Diet plan updated successfully' });
    },
    onError: (error) => {
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
