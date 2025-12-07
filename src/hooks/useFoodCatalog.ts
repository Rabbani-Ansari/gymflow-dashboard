import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FoodItem {
    id: string;
    name: string;
    category: string;
    serving_size: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number | null;
    image_url: string | null;
    diet_types: string[];
    allergens: string[];
    created_at: string;
}

// Fetch all food items from catalog
export const useFoodCatalog = () => {
    return useQuery({
        queryKey: ['food-catalog'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('food_catalog')
                .select('*')
                .order('name');

            if (error) {
                console.error('Error fetching food catalog:', error);
                throw error;
            }

            return data as FoodItem[];
        },
    });
};

// Search food items with filters
export const useSearchFoodCatalog = (
    searchQuery: string,
    category?: string,
    dietType?: string
) => {
    return useQuery({
        queryKey: ['food-catalog', 'search', searchQuery, category, dietType],
        queryFn: async () => {
            let query = supabase
                .from('food_catalog')
                .select('*')
                .order('name');

            if (searchQuery) {
                query = query.ilike('name', `%${searchQuery}%`);
            }

            if (category && category !== 'all') {
                query = query.eq('category', category);
            }

            if (dietType && dietType !== 'all') {
                query = query.contains('diet_types', [dietType]);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data as FoodItem[];
        },
        enabled: true,
    });
};

// Create a new food item
export const useCreateFoodItem = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (item: Omit<FoodItem, 'id' | 'created_at'>) => {
            const { data, error } = await supabase
                .from('food_catalog')
                .insert(item)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['food-catalog'] });
            toast({
                title: 'Food item added',
                description: 'The food item has been added to the catalog.',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
};

// Update a food item
export const useUpdateFoodItem = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<FoodItem> & { id: string }) => {
            const { data, error } = await supabase
                .from('food_catalog')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['food-catalog'] });
            toast({
                title: 'Food item updated',
                description: 'The food item has been updated.',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
};

// Delete a food item
export const useDeleteFoodItem = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('food_catalog')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['food-catalog'] });
            toast({
                title: 'Food item deleted',
                description: 'The food item has been removed from the catalog.',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
};
