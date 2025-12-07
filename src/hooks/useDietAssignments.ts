import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DietAssignmentWithDetails {
    id: string;
    member_id: string;
    diet_plan_id: string;
    status: 'active' | 'completed' | 'cancelled';
    start_date: string;
    end_date: string;
    notify_email: boolean;
    notify_sms: boolean;
    notify_whatsapp: boolean;
    created_at: string;
    member: {
        id: string;
        name: string;
        email: string;
        phone: string;
        photo: string | null;
        status: 'active' | 'expired' | 'trial';
    };
    diet_plan: {
        id: string;
        name: string;
        category: string;
        target_calories: number;
        thumbnail: string | null;
    };
}

export interface CreateDietAssignmentInput {
    member_id: string;
    diet_plan_id: string;
    start_date: string;
    end_date: string;
    notify_email?: boolean;
    notify_sms?: boolean;
    notify_whatsapp?: boolean;
}

// Fetch all diet assignments with member and plan details
export const useDietAssignments = () => {
    return useQuery({
        queryKey: ['diet-assignments'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('diet_assignments')
                .select(`
          *,
          member:members(id, name, email, phone, photo, status),
          diet_plan:diet_plans(id, name, category, target_calories, thumbnail)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as DietAssignmentWithDetails[];
        },
    });
};

// Fetch a single diet assignment
export const useDietAssignment = (id: string) => {
    return useQuery({
        queryKey: ['diet-assignments', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('diet_assignments')
                .select(`
          *,
          member:members(id, name, email, phone, photo, status),
          diet_plan:diet_plans(id, name, category, target_calories, thumbnail)
        `)
                .eq('id', id)
                .single();

            if (error) throw error;
            return data as DietAssignmentWithDetails;
        },
        enabled: !!id,
    });
};

// Create a new diet assignment
export const useCreateDietAssignment = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (input: CreateDietAssignmentInput) => {
            const { data, error } = await supabase
                .from('diet_assignments')
                .insert(input)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diet-assignments'] });
            toast({ title: 'Success', description: 'Diet plan assigned successfully' });
        },
        onError: (error) => {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        },
    });
};

// Create multiple diet assignments at once (for bulk assignment)
export const useCreateBulkDietAssignments = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (inputs: CreateDietAssignmentInput[]) => {
            const { data, error } = await supabase
                .from('diet_assignments')
                .insert(inputs)
                .select();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['diet-assignments'] });
            toast({
                title: 'Success',
                description: `Diet plan assigned to ${data.length} member${data.length !== 1 ? 's' : ''} successfully`
            });
        },
        onError: (error) => {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        },
    });
};

// Update an existing diet assignment
export const useUpdateDietAssignment = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<DietAssignmentWithDetails> & { id: string }) => {
            const { data, error } = await supabase
                .from('diet_assignments')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diet-assignments'] });
            toast({ title: 'Success', description: 'Diet assignment updated successfully' });
        },
        onError: (error) => {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        },
    });
};

// Delete a diet assignment
export const useDeleteDietAssignment = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('diet_assignments')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diet-assignments'] });
            toast({ title: 'Success', description: 'Diet assignment removed successfully' });
        },
        onError: (error) => {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        },
    });
};
