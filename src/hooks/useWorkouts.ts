import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trainer } from './useDietPlans';

export interface Workout {
  id: string;
  name: string;
  trainer_id: string | null;
  body_part: 'chest' | 'back' | 'legs' | 'arms' | 'shoulders' | 'core' | 'full-body';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: 'free-weights' | 'machines' | 'bodyweight' | 'mixed';
  duration: number;
  thumbnail: string | null;
  video_url: string | null;
  usage_count: number;
  created_at: string;
  updated_at: string;
  trainer?: Trainer;
  exercises?: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes: string | null;
  order_index: number;
}

export const useWorkouts = () => {
  return useQuery({
    queryKey: ['workouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          trainer:trainers(*),
          exercises:workout_exercises(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Workout[];
    },
  });
};

export const useWorkout = (id: string) => {
  return useQuery({
    queryKey: ['workouts', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          trainer:trainers(*),
          exercises:workout_exercises(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Workout;
    },
    enabled: !!id,
  });
};

export const useCreateWorkout = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (workout: Omit<Workout, 'id' | 'created_at' | 'updated_at' | 'trainer' | 'exercises'>) => {
      const { data, error } = await supabase
        .from('workouts')
        .insert(workout)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast({ title: 'Success', description: 'Workout created successfully' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
};

export const useUpdateWorkout = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Workout> & { id: string }) => {
      const { data, error } = await supabase
        .from('workouts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast({ title: 'Success', description: 'Workout updated successfully' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
};

export const useDeleteWorkout = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('workouts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast({ title: 'Success', description: 'Workout deleted successfully' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
};
