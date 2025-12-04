import { ExerciseCatalogItem } from '@/types';

export const exerciseCatalog: ExerciseCatalogItem[] = [
    // --- Chest ---
    { id: 'ex_001', name: 'Barbell Bench Press', category: 'chest', difficulty: 'intermediate', mechanics: 'compound' },
    { id: 'ex_002', name: 'Incline Dumbbell Press', category: 'chest', difficulty: 'intermediate', mechanics: 'compound' },
    { id: 'ex_003', name: 'Push-ups', category: 'chest', difficulty: 'beginner', mechanics: 'compound' },
    { id: 'ex_004', name: 'Cable Flyes', category: 'chest', difficulty: 'intermediate', mechanics: 'isolation' },
    { id: 'ex_005', name: 'Dumbbell Pullover', category: 'chest', difficulty: 'intermediate', mechanics: 'isolation' },
    { id: 'ex_006', name: 'Decline Bench Press', category: 'chest', difficulty: 'intermediate', mechanics: 'compound' },
    { id: 'ex_007', name: 'Chest Dips', category: 'chest', difficulty: 'advanced', mechanics: 'compound' },
    { id: 'ex_008', name: 'Pec Deck Machine', category: 'chest', difficulty: 'beginner', mechanics: 'isolation' },

    // --- Back ---
    { id: 'ex_010', name: 'Deadlift', category: 'back', difficulty: 'advanced', mechanics: 'compound' },
    { id: 'ex_011', name: 'Pull-ups', category: 'back', difficulty: 'advanced', mechanics: 'compound' },
    { id: 'ex_012', name: 'Lat Pulldown', category: 'back', difficulty: 'beginner', mechanics: 'compound' },
    { id: 'ex_013', name: 'Bent Over Barbell Row', category: 'back', difficulty: 'intermediate', mechanics: 'compound' },
    { id: 'ex_014', name: 'Seated Cable Row', category: 'back', difficulty: 'beginner', mechanics: 'compound' },
    { id: 'ex_015', name: 'Single Arm Dumbbell Row', category: 'back', difficulty: 'intermediate', mechanics: 'compound' },
    { id: 'ex_016', name: 'Face Pulls', category: 'back', difficulty: 'intermediate', mechanics: 'isolation' },
    { id: 'ex_017', name: 'T-Bar Row', category: 'back', difficulty: 'intermediate', mechanics: 'compound' },
    { id: 'ex_018', name: 'Hyperextensions', category: 'back', difficulty: 'beginner', mechanics: 'isolation' },

    // --- Legs ---
    { id: 'ex_020', name: 'Barbell Squat', category: 'legs', difficulty: 'advanced', mechanics: 'compound' },
    { id: 'ex_021', name: 'Leg Press', category: 'legs', difficulty: 'beginner', mechanics: 'compound' },
    { id: 'ex_022', name: 'Romanian Deadlift', category: 'legs', difficulty: 'intermediate', mechanics: 'compound' },
    { id: 'ex_023', name: 'Lunges', category: 'legs', difficulty: 'beginner', mechanics: 'compound' },
    { id: 'ex_024', name: 'Leg Extensions', category: 'legs', difficulty: 'beginner', mechanics: 'isolation' },
    { id: 'ex_025', name: 'Leg Curls', category: 'legs', difficulty: 'beginner', mechanics: 'isolation' },
    { id: 'ex_026', name: 'Calf Raises', category: 'legs', difficulty: 'beginner', mechanics: 'isolation' },
    { id: 'ex_027', name: 'Bulgarian Split Squat', category: 'legs', difficulty: 'advanced', mechanics: 'compound' },
    { id: 'ex_028', name: 'Goblet Squat', category: 'legs', difficulty: 'beginner', mechanics: 'compound' },

    // --- Shoulders ---
    { id: 'ex_030', name: 'Overhead Press (Military Press)', category: 'shoulders', difficulty: 'intermediate', mechanics: 'compound' },
    { id: 'ex_031', name: 'Dumbbell Shoulder Press', category: 'shoulders', difficulty: 'beginner', mechanics: 'compound' },
    { id: 'ex_032', name: 'Lateral Raises', category: 'shoulders', difficulty: 'beginner', mechanics: 'isolation' },
    { id: 'ex_033', name: 'Front Raises', category: 'shoulders', difficulty: 'beginner', mechanics: 'isolation' },
    { id: 'ex_034', name: 'Reverse Flyes', category: 'shoulders', difficulty: 'intermediate', mechanics: 'isolation' },
    { id: 'ex_035', name: 'Arnold Press', category: 'shoulders', difficulty: 'intermediate', mechanics: 'compound' },
    { id: 'ex_036', name: 'Upright Row', category: 'shoulders', difficulty: 'intermediate', mechanics: 'compound' },

    // --- Arms ---
    { id: 'ex_040', name: 'Barbell Bicep Curl', category: 'arms', difficulty: 'beginner', mechanics: 'isolation' },
    { id: 'ex_041', name: 'Hammer Curl', category: 'arms', difficulty: 'beginner', mechanics: 'isolation' },
    { id: 'ex_042', name: 'Preacher Curl', category: 'arms', difficulty: 'intermediate', mechanics: 'isolation' },
    { id: 'ex_043', name: 'Tricep Dips', category: 'arms', difficulty: 'intermediate', mechanics: 'compound' },
    { id: 'ex_044', name: 'Skull Crushers', category: 'arms', difficulty: 'intermediate', mechanics: 'isolation' },
    { id: 'ex_045', name: 'Tricep Pushdown', category: 'arms', difficulty: 'beginner', mechanics: 'isolation' },
    { id: 'ex_046', name: 'Close Grip Bench Press', category: 'arms', difficulty: 'intermediate', mechanics: 'compound' },

    // --- Core ---
    { id: 'ex_050', name: 'Plank', category: 'core', difficulty: 'beginner', mechanics: 'isolation' },
    { id: 'ex_051', name: 'Crunches', category: 'core', difficulty: 'beginner', mechanics: 'isolation' },
    { id: 'ex_052', name: 'Leg Raises', category: 'core', difficulty: 'intermediate', mechanics: 'isolation' },
    { id: 'ex_053', name: 'Russian Twists', category: 'core', difficulty: 'intermediate', mechanics: 'isolation' },
    { id: 'ex_054', name: 'Bicycle Crunches', category: 'core', difficulty: 'beginner', mechanics: 'isolation' },
    { id: 'ex_055', name: 'Mountain Climbers', category: 'core', difficulty: 'intermediate', mechanics: 'compound' },
    { id: 'ex_056', name: 'Ab Wheel Rollout', category: 'core', difficulty: 'advanced', mechanics: 'compound' },

    // --- Full Body / Cardio ---
    { id: 'ex_060', name: 'Burpees', category: 'full-body', difficulty: 'advanced', mechanics: 'compound' },
    { id: 'ex_061', name: 'Kettlebell Swing', category: 'full-body', difficulty: 'intermediate', mechanics: 'compound' },
    { id: 'ex_062', name: 'Clean and Press', category: 'full-body', difficulty: 'advanced', mechanics: 'compound' },
    { id: 'ex_063', name: 'Box Jumps', category: 'full-body', difficulty: 'intermediate', mechanics: 'compound' },
    { id: 'ex_064', name: 'Jumping Jacks', category: 'full-body', difficulty: 'beginner', mechanics: 'compound' },
    { id: 'ex_065', name: 'Battle Ropes', category: 'full-body', difficulty: 'intermediate', mechanics: 'compound' },
];
