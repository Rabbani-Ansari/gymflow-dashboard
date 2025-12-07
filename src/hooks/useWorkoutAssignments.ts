import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type WorkoutAssignmentRow = Database['public']['Tables']['workout_assignments']['Row'];
type WorkoutAssignmentInsert = Database['public']['Tables']['workout_assignments']['Insert'];
type WorkoutAssignmentUpdate = Database['public']['Tables']['workout_assignments']['Update'];

export interface WorkoutAssignment {
    id: string;
    member_id: string;
    workout_id: string;
    status: 'active' | 'completed' | 'cancelled';
    start_date: string | null;
    end_date: string | null;
    active_days: string[] | null;
    notify: boolean | null;
    notes: string | null;
    assigned_at: string;
    // Joined data
    member?: {
        id: string;
        name: string;
        email: string;
        photo: string | null;
    };
    workout?: {
        id: string;
        name: string;
    };
}

// Fetch all workout assignments with joined member and workout data
export function useWorkoutAssignments() {
    return useQuery({
        queryKey: ['workout-assignments'],
        queryFn: async (): Promise<WorkoutAssignment[]> => {
            const { data, error } = await supabase
                .from('workout_assignments')
                .select(`
          *,
          member:members(id, name, email, photo),
          workout:workouts(id, name)
        `)
                .order('assigned_at', { ascending: false });

            if (error) {
                console.error('Error fetching workout assignments:', error);
                throw error;
            }

            return (data || []).map((row: any) => ({
                id: row.id,
                member_id: row.member_id,
                workout_id: row.workout_id,
                status: row.status,
                start_date: row.start_date,
                end_date: row.end_date,
                active_days: row.active_days || ['monday', 'wednesday', 'friday'],
                notify: row.notify ?? true,
                notes: row.notes,
                assigned_at: row.assigned_at,
                member: row.member,
                workout: row.workout,
            }));
        },
    });
}

// Create a new workout assignment
export function useCreateWorkoutAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (assignment: WorkoutAssignmentInsert) => {
            const { data, error } = await supabase
                .from('workout_assignments')
                .insert(assignment)
                .select()
                .single();

            if (error) {
                console.error('Error creating workout assignment:', error);
                throw error;
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workout-assignments'] });
        },
    });
}

// Update an existing workout assignment
export function useUpdateWorkoutAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: WorkoutAssignmentUpdate & { id: string }) => {
            const { data, error } = await supabase
                .from('workout_assignments')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating workout assignment:', error);
                throw error;
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workout-assignments'] });
        },
    });
}

// Delete a workout assignment
export function useDeleteWorkoutAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('workout_assignments')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting workout assignment:', error);
                throw error;
            }

            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workout-assignments'] });
        },
    });
}
