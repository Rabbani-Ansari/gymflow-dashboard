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
  gym_id: string | null; // Reference to gym_branding.id
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

// Payment Management Hooks

export const useMemberPayments = (memberId: string) => {
  return useQuery({
    queryKey: ['member-payments', memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('member_payments')
        .select('*')
        .eq('member_id', memberId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as MemberPayment[];
    },
    enabled: !!memberId,
  });
};

export const useAddPayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payment: Omit<MemberPayment, 'id'>) => {
      const { data, error } = await supabase
        .from('member_payments')
        .insert(payment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['member-payments', variables.member_id] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({ title: 'Success', description: 'Payment recorded successfully' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MemberPayment> & { id: string; member_id: string }) => {
      const { data, error } = await supabase
        .from('member_payments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['member-payments', variables.member_id] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({ title: 'Success', description: 'Payment updated successfully' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, member_id }: { id: string; member_id: string }) => {
      const { error } = await supabase
        .from('member_payments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return member_id;
    },
    onSuccess: (member_id) => {
      queryClient.invalidateQueries({ queryKey: ['member-payments', member_id] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({ title: 'Success', description: 'Payment deleted successfully' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
};

// Update member's payment_due
export const useUpdatePaymentDue = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, payment_due }: { id: string; payment_due: number }) => {
      const { error } = await supabase
        .from('members')
        .update({ payment_due })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({ title: 'Success', description: 'Payment due updated' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
};
