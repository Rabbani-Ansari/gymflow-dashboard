import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  photo: string | null;
  plan: string;
  start_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'trial';
  payment_due: number;
  address: string | null;
  emergency_contact: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberWithRelations extends Member {
  measurements: MemberMeasurement[];
  attendance: MemberAttendance[];
  payments: MemberPayment[];
  diet_assignments: DietAssignment[];
  workout_assignments: WorkoutAssignment[];
}

export interface MemberMeasurement {
  id: string;
  member_id: string;
  date: string;
  weight: number;
  height: number;
  bmi: number;
  body_fat: number | null;
}

export interface MemberAttendance {
  id: string;
  member_id: string;
  date: string;
  check_in_time: string;
  check_out_time: string | null;
}

export interface MemberPayment {
  id: string;
  member_id: string;
  date: string;
  amount: number;
  type: 'membership' | 'pt' | 'product';
  status: 'paid' | 'pending' | 'failed';
  description: string;
}

export interface DietAssignment {
  id: string;
  diet_plan_id: string;
  member_id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface WorkoutAssignment {
  id: string;
  workout_id: string;
  member_id: string;
  assigned_at: string;
  status: 'active' | 'completed' | 'cancelled';
}

export const useMembers = () => {
  return useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Member[];
    },
  });
};

export const useMember = (id: string) => {
  return useQuery({
    queryKey: ['members', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Member;
    },
    enabled: !!id,
  });
};

export const useCreateMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (member: Omit<Member, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('members')
        .insert(member)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({ title: 'Success', description: 'Member created successfully' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Member> & { id: string }) => {
      const { data, error } = await supabase
        .from('members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({ title: 'Success', description: 'Member updated successfully' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({ title: 'Success', description: 'Member deleted successfully' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
};
