import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ExerciseTemplate {
    id: string;
    name: string;
    category: string;
    body_part: string | null;
    equipment: string | null;
    difficulty: string | null;
    description: string | null;
    animation_url: string | null;
}

export const useExerciseCatalog = () => {
    return useQuery({
        queryKey: ['exercise-catalog'],
        queryFn: async () => {
            // Fetch from the dedicated exercise catalog table
            const { data, error } = await supabase
                .from('exercise_catalog')
                .select('*')
                .order('name');

            if (error) {
                console.error('Error fetching exercise catalog:', error);
                // Fallback to fetching unique exercises from workout_exercises if catalog table doesn't exist
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from('workout_exercises')
                    .select('name, animation_url')
                    .order('name');

                if (fallbackError) throw fallbackError;

                // Deduplicate by name
                const uniqueExercises = new Map<string, ExerciseTemplate>();
                fallbackData.forEach((exercise) => {
                    if (!uniqueExercises.has(exercise.name)) {
                        let category = 'strength';
                        const lowerName = exercise.name.toLowerCase();

                        if (lowerName.includes('cardio') || lowerName.includes('running') || lowerName.includes('jump')) {
                            category = 'cardio';
                        } else if (lowerName.includes('stretch') || lowerName.includes('yoga')) {
                            category = 'flexibility';
                        } else if (lowerName.includes('core') || lowerName.includes('plank') || lowerName.includes('crunch')) {
                            category = 'core';
                        }

                        uniqueExercises.set(exercise.name, {
                            id: exercise.name, // Use name as ID for fallback
                            name: exercise.name,
                            category,
                            body_part: null,
                            equipment: null,
                            difficulty: null,
                            description: null,
                            animation_url: exercise.animation_url,
                        });
                    }
                });

                return Array.from(uniqueExercises.values());
            }

            return data as ExerciseTemplate[];
        },
    });
};
