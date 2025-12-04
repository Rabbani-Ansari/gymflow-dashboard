import { Member, DietPlan, Workout, Trainer, PaymentRecord } from '@/types';

export const trainers: Trainer[] = [
  { id: 'tr_001', name: 'Mike Johnson', specialization: 'Strength Training', photo: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=100&h=100&fit=crop' },
  { id: 'tr_002', name: 'Sarah Williams', specialization: 'Nutrition & Diet', photo: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=100&h=100&fit=crop' },
  { id: 'tr_003', name: 'David Chen', specialization: 'CrossFit', photo: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=100&h=100&fit=crop' },
  { id: 'tr_004', name: 'Emma Davis', specialization: 'Yoga & Flexibility', photo: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=100&h=100&fit=crop' },
];

export const members: Member[] = [
  {
    id: 'mem_001',
    name: 'John Doe',
    phone: '+91-9876543210',
    email: 'john.doe@email.com',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    plan: '12 Month Premium',
    startDate: '2025-01-15',
    expiryDate: '2026-01-15',
    status: 'active',
    paymentDue: 0,
    address: '123 Main St, Mumbai',
    emergencyContact: '+91-9876543211',
    measurements: [
      { date: '2025-01-15', weight: 80, height: 175, bmi: 26.1 },
      { date: '2025-02-15', weight: 78, height: 175, bmi: 25.5 },
      { date: '2025-03-15', weight: 76, height: 175, bmi: 24.8 },
    ],
    assignedDietPlan: 'diet_001',
    assignedWorkout: 'workout_001',
    attendance: [
      { date: '2025-12-01', checkInTime: '07:00 AM', checkOutTime: '08:30 AM' },
      { date: '2025-12-02', checkInTime: '07:15 AM', checkOutTime: '08:45 AM' },
      { date: '2025-12-04', checkInTime: '06:50 AM', checkOutTime: '08:10 AM' },
    ],
    paymentHistory: [
      { id: 'pay_001', date: '2025-01-15', amount: 15000, type: 'membership', status: 'paid', description: '12 Month Premium Membership' },
    ],
  },
  {
    id: 'mem_002',
    name: 'Emily Smith',
    phone: '+91-9876543220',
    email: 'emily.smith@email.com',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    plan: '6 Month Standard',
    startDate: '2025-06-01',
    expiryDate: '2025-12-01',
    status: 'active',
    paymentDue: 500,
    measurements: [
      { date: '2025-06-01', weight: 62, height: 165, bmi: 22.8 },
    ],
    assignedDietPlan: 'diet_002',
    attendance: [
      { date: '2025-12-03', checkInTime: '06:00 PM', checkOutTime: '07:30 PM' },
    ],
    paymentHistory: [
      { id: 'pay_002', date: '2025-06-01', amount: 8000, type: 'membership', status: 'paid', description: '6 Month Standard Membership' },
      { id: 'pay_006', date: '2025-09-01', amount: 2000, type: 'pt', status: 'pending', description: 'Personal Training - 5 Sessions' },
    ],
  },
  {
    id: 'mem_003',
    name: 'Robert Wilson',
    phone: '+91-9876543230',
    email: 'robert.w@email.com',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    plan: '3 Month Basic',
    startDate: '2025-08-01',
    expiryDate: '2025-11-01',
    status: 'expired',
    paymentDue: 2000,
    measurements: [
      { date: '2025-08-01', weight: 90, height: 180, bmi: 27.8 },
    ],
    attendance: [],
    paymentHistory: [
      { id: 'pay_003', date: '2025-08-01', amount: 3500, type: 'membership', status: 'paid', description: '3 Month Basic Membership' },
    ],
  },
  {
    id: 'mem_004',
    name: 'Lisa Anderson',
    phone: '+91-9876543240',
    email: 'lisa.a@email.com',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    plan: '1 Month Trial',
    startDate: '2025-11-15',
    expiryDate: '2025-12-15',
    status: 'trial',
    paymentDue: 0,
    measurements: [
      { date: '2025-11-15', weight: 58, height: 160, bmi: 22.7 },
    ],
    assignedWorkout: 'workout_003',
    attendance: [
      { date: '2025-12-01', checkInTime: '05:00 PM', checkOutTime: '06:00 PM' },
      { date: '2025-12-03', checkInTime: '05:15 PM', checkOutTime: '06:15 PM' },
    ],
    paymentHistory: [],
  },
  {
    id: 'mem_005',
    name: 'Michael Brown',
    phone: '+91-9876543250',
    email: 'michael.b@email.com',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    plan: '12 Month Premium',
    startDate: '2025-02-01',
    expiryDate: '2026-02-01',
    status: 'active',
    paymentDue: 0,
    measurements: [
      { date: '2025-02-01', weight: 85, height: 182, bmi: 25.7 },
      { date: '2025-05-01', weight: 82, height: 182, bmi: 24.8 },
    ],
    assignedDietPlan: 'diet_001',
    assignedWorkout: 'workout_002',
    attendance: [
      { date: '2025-12-02', checkInTime: '06:30 AM', checkOutTime: '08:00 AM' },
    ],
    paymentHistory: [
      { id: 'pay_004', date: '2025-02-01', amount: 15000, type: 'membership', status: 'paid', description: '12 Month Premium Membership' },
    ],
  },
  {
    id: 'mem_006',
    name: 'Jennifer Taylor',
    phone: '+91-9876543260',
    email: 'jennifer.t@email.com',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    plan: '6 Month Standard',
    startDate: '2025-04-01',
    expiryDate: '2025-10-01',
    status: 'expired',
    paymentDue: 3500,
    measurements: [
      { date: '2025-04-01', weight: 68, height: 168, bmi: 24.1 },
    ],
    attendance: [],
    paymentHistory: [],
  },
  {
    id: 'mem_007',
    name: 'David Martinez',
    phone: '+91-9876543270',
    email: 'david.m@email.com',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    plan: '12 Month Premium',
    startDate: '2025-03-15',
    expiryDate: '2026-03-15',
    status: 'active',
    paymentDue: 0,
    measurements: [
      { date: '2025-03-15', weight: 95, height: 185, bmi: 27.8 },
      { date: '2025-06-15', weight: 90, height: 185, bmi: 26.3 },
      { date: '2025-09-15', weight: 87, height: 185, bmi: 25.4 },
    ],
    assignedDietPlan: 'diet_003',
    assignedWorkout: 'workout_001',
    attendance: [
      { date: '2025-12-01', checkInTime: '08:00 PM', checkOutTime: '09:30 PM' },
      { date: '2025-12-04', checkInTime: '08:15 PM', checkOutTime: '09:45 PM' },
    ],
    paymentHistory: [
      { id: 'pay_005', date: '2025-03-15', amount: 15000, type: 'membership', status: 'paid', description: '12 Month Premium Membership' },
    ],
  },
  {
    id: 'mem_008',
    name: 'Amanda Garcia',
    phone: '+91-9876543280',
    email: 'amanda.g@email.com',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    plan: '3 Month Basic',
    startDate: '2025-10-01',
    expiryDate: '2026-01-01',
    status: 'active',
    paymentDue: 1000,
    measurements: [
      { date: '2025-10-01', weight: 55, height: 158, bmi: 22.0 },
    ],
    assignedDietPlan: 'diet_002',
    attendance: [],
    paymentHistory: [],
  },
];

export const dietPlans: DietPlan[] = [
  {
    id: 'diet_001',
    name: 'Weight Loss Basic',
    trainer: 'Sarah Williams',
    trainerId: 'tr_002',
    category: 'weight-loss',
    dietGoal: 'weight-loss',
    dietType: 'non-vegetarian',
    duration: 30,
    targetCalories: 1800,
    members: ['mem_001', 'mem_005'],
    thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop',
    createdAt: '2025-01-01',
    meals: [
      {
        time: 'Breakfast',
        items: [
          { name: 'Oatmeal', quantity: '1 cup', calories: 300, protein: 12, carbs: 54, fat: 6 },
          { name: 'Banana', quantity: '1 medium', calories: 105, protein: 1, carbs: 27, fat: 0 },
          { name: 'Almonds', quantity: '10 pieces', calories: 70, protein: 3, carbs: 2, fat: 6 },
        ],
      },
      {
        time: 'Lunch',
        items: [
          { name: 'Grilled Chicken Breast', quantity: '150g', calories: 250, protein: 47, carbs: 0, fat: 5 },
          { name: 'Brown Rice', quantity: '1 cup', calories: 220, protein: 5, carbs: 46, fat: 2 },
          { name: 'Mixed Vegetables', quantity: '200g', calories: 80, protein: 4, carbs: 16, fat: 0 },
        ],
      },
      {
        time: 'Dinner',
        items: [
          { name: 'Salmon Fillet', quantity: '120g', calories: 280, protein: 25, carbs: 0, fat: 20 },
          { name: 'Quinoa', quantity: '1 cup', calories: 220, protein: 8, carbs: 39, fat: 4 },
          { name: 'Steamed Broccoli', quantity: '150g', calories: 50, protein: 4, carbs: 10, fat: 0 },
        ],
      },
      {
        time: 'Snacks',
        items: [
          { name: 'Greek Yogurt', quantity: '150g', calories: 130, protein: 15, carbs: 8, fat: 4 },
          { name: 'Apple', quantity: '1 medium', calories: 95, protein: 0, carbs: 25, fat: 0 },
        ],
      },
    ],
    macros: { calories: 1800, protein: 124, carbs: 227, fat: 47 },
  },
  {
    id: 'diet_002',
    name: 'Muscle Gain Pro',
    trainer: 'Mike Johnson',
    trainerId: 'tr_001',
    category: 'muscle-gain',
    dietGoal: 'muscle-gain',
    dietType: 'non-vegetarian',
    duration: 60,
    targetCalories: 2800,
    members: ['mem_002', 'mem_008'],
    thumbnail: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop',
    createdAt: '2025-02-15',
    meals: [
      {
        time: 'Breakfast',
        items: [
          { name: 'Eggs', quantity: '4 whole', calories: 320, protein: 24, carbs: 2, fat: 24 },
          { name: 'Whole Wheat Toast', quantity: '3 slices', calories: 240, protein: 9, carbs: 45, fat: 3 },
          { name: 'Peanut Butter', quantity: '2 tbsp', calories: 190, protein: 8, carbs: 6, fat: 16 },
        ],
      },
      {
        time: 'Lunch',
        items: [
          { name: 'Beef Steak', quantity: '200g', calories: 500, protein: 50, carbs: 0, fat: 32 },
          { name: 'Sweet Potato', quantity: '2 medium', calories: 200, protein: 4, carbs: 46, fat: 0 },
          { name: 'Green Beans', quantity: '150g', calories: 50, protein: 3, carbs: 10, fat: 0 },
        ],
      },
      {
        time: 'Dinner',
        items: [
          { name: 'Chicken Thighs', quantity: '250g', calories: 400, protein: 40, carbs: 0, fat: 26 },
          { name: 'Pasta', quantity: '2 cups', calories: 440, protein: 16, carbs: 86, fat: 2 },
          { name: 'Olive Oil', quantity: '2 tbsp', calories: 240, protein: 0, carbs: 0, fat: 28 },
        ],
      },
      {
        time: 'Snacks',
        items: [
          { name: 'Protein Shake', quantity: '1 scoop + milk', calories: 280, protein: 35, carbs: 12, fat: 8 },
          { name: 'Mixed Nuts', quantity: '50g', calories: 320, protein: 8, carbs: 12, fat: 28 },
        ],
      },
    ],
    macros: { calories: 3180, protein: 197, carbs: 219, fat: 167 },
  },
  {
    id: 'diet_003',
    name: 'Vegetarian Balanced',
    trainer: 'Sarah Williams',
    trainerId: 'tr_002',
    category: 'general',
    dietGoal: 'general-fitness',
    dietType: 'vegetarian',
    duration: 30,
    targetCalories: 2000,
    members: ['mem_007'],
    thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    createdAt: '2025-03-01',
    meals: [
      {
        time: 'Breakfast',
        items: [
          { name: 'Paneer Bhurji', quantity: '100g', calories: 250, protein: 18, carbs: 4, fat: 18 },
          { name: 'Multigrain Roti', quantity: '2 pieces', calories: 200, protein: 6, carbs: 38, fat: 4 },
          { name: 'Fresh Fruit Bowl', quantity: '200g', calories: 100, protein: 1, carbs: 25, fat: 0 },
        ],
      },
      {
        time: 'Lunch',
        items: [
          { name: 'Dal Tadka', quantity: '1 bowl', calories: 200, protein: 12, carbs: 30, fat: 6 },
          { name: 'Jeera Rice', quantity: '1.5 cups', calories: 300, protein: 6, carbs: 60, fat: 4 },
          { name: 'Mixed Vegetable Curry', quantity: '1 bowl', calories: 150, protein: 5, carbs: 20, fat: 6 },
        ],
      },
      {
        time: 'Dinner',
        items: [
          { name: 'Palak Paneer', quantity: '150g', calories: 280, protein: 15, carbs: 10, fat: 20 },
          { name: 'Brown Rice', quantity: '1 cup', calories: 220, protein: 5, carbs: 46, fat: 2 },
          { name: 'Cucumber Raita', quantity: '100g', calories: 80, protein: 4, carbs: 6, fat: 4 },
        ],
      },
      {
        time: 'Snacks',
        items: [
          { name: 'Roasted Chickpeas', quantity: '50g', calories: 120, protein: 6, carbs: 20, fat: 2 },
          { name: 'Masala Chai', quantity: '1 cup', calories: 100, protein: 3, carbs: 12, fat: 4 },
        ],
      },
    ],
    macros: { calories: 2000, protein: 81, carbs: 271, fat: 70 },
  },
];

export const workouts: Workout[] = [
  {
    id: 'workout_001',
    name: 'Chest Day Advanced',
    trainer: 'Mike Johnson',
    trainerId: 'tr_001',
    bodyPart: 'chest',
    difficulty: 'advanced',
    equipment: 'mixed',
    duration: 60,
    thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    usageCount: 145,
    members: ['mem_001', 'mem_007'],
    exercises: [
      { name: 'Flat Bench Press', sets: 4, reps: '8-10', rest: '90s', notes: 'Focus on controlled movement' },
      { name: 'Incline Dumbbell Press', sets: 4, reps: '10-12', rest: '75s' },
      { name: 'Cable Flyes', sets: 3, reps: '12-15', rest: '60s', notes: 'Squeeze at the top' },
      { name: 'Decline Press', sets: 3, reps: '10-12', rest: '75s' },
      { name: 'Push-ups', sets: 3, reps: 'To failure', rest: '60s', notes: 'Finisher exercise' },
    ],
  },
  {
    id: 'workout_002',
    name: 'Leg Day Power',
    trainer: 'David Chen',
    trainerId: 'tr_003',
    bodyPart: 'legs',
    difficulty: 'intermediate',
    equipment: 'mixed',
    duration: 75,
    thumbnail: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400&h=300&fit=crop',
    usageCount: 98,
    members: ['mem_005'],
    exercises: [
      { name: 'Barbell Squats', sets: 5, reps: '5', rest: '120s', notes: 'Warm up properly' },
      { name: 'Romanian Deadlifts', sets: 4, reps: '8-10', rest: '90s' },
      { name: 'Leg Press', sets: 4, reps: '12-15', rest: '75s' },
      { name: 'Walking Lunges', sets: 3, reps: '20 steps', rest: '60s' },
      { name: 'Leg Curls', sets: 3, reps: '12-15', rest: '60s' },
      { name: 'Calf Raises', sets: 4, reps: '15-20', rest: '45s' },
    ],
  },
  {
    id: 'workout_003',
    name: 'Full Body Beginner',
    trainer: 'Emma Davis',
    trainerId: 'tr_004',
    bodyPart: 'full-body',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    duration: 45,
    thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop',
    usageCount: 234,
    members: ['mem_004'],
    exercises: [
      { name: 'Bodyweight Squats', sets: 3, reps: '15', rest: '60s' },
      { name: 'Push-ups (or Knee Push-ups)', sets: 3, reps: '10-12', rest: '60s' },
      { name: 'Plank', sets: 3, reps: '30-45s hold', rest: '45s' },
      { name: 'Lunges', sets: 3, reps: '10 each leg', rest: '60s' },
      { name: 'Glute Bridges', sets: 3, reps: '15', rest: '45s' },
      { name: 'Mountain Climbers', sets: 3, reps: '20', rest: '45s' },
    ],
  },
  {
    id: 'workout_004',
    name: 'Back & Biceps',
    trainer: 'Mike Johnson',
    trainerId: 'tr_001',
    bodyPart: 'back',
    difficulty: 'intermediate',
    equipment: 'free-weights',
    duration: 55,
    thumbnail: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=400&h=300&fit=crop',
    usageCount: 167,
    members: [],
    exercises: [
      { name: 'Deadlifts', sets: 4, reps: '6-8', rest: '120s', notes: 'Maintain neutral spine' },
      { name: 'Pull-ups', sets: 4, reps: '8-10', rest: '90s' },
      { name: 'Bent Over Rows', sets: 4, reps: '10-12', rest: '75s' },
      { name: 'Lat Pulldowns', sets: 3, reps: '12-15', rest: '60s' },
      { name: 'Barbell Curls', sets: 3, reps: '10-12', rest: '60s' },
      { name: 'Hammer Curls', sets: 3, reps: '12-15', rest: '45s' },
    ],
  },
  {
    id: 'workout_005',
    name: 'Core Crusher',
    trainer: 'Emma Davis',
    trainerId: 'tr_004',
    bodyPart: 'core',
    difficulty: 'intermediate',
    equipment: 'bodyweight',
    duration: 30,
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    usageCount: 289,
    members: [],
    exercises: [
      { name: 'Plank', sets: 3, reps: '60s hold', rest: '30s' },
      { name: 'Russian Twists', sets: 3, reps: '20 each side', rest: '45s' },
      { name: 'Bicycle Crunches', sets: 3, reps: '20 each side', rest: '45s' },
      { name: 'Leg Raises', sets: 3, reps: '15', rest: '45s' },
      { name: 'Dead Bug', sets: 3, reps: '10 each side', rest: '30s' },
      { name: 'Side Plank', sets: 2, reps: '30s each side', rest: '30s' },
    ],
  },
];

export const payments: PaymentRecord[] = [
  { id: 'pay_001', date: '2025-01-15', amount: 15000, type: 'membership', status: 'paid', description: '12 Month Premium Membership' },
  { id: 'pay_002', date: '2025-06-01', amount: 8000, type: 'membership', status: 'paid', description: '6 Month Standard Membership' },
  { id: 'pay_003', date: '2025-08-01', amount: 3500, type: 'membership', status: 'paid', description: '3 Month Basic Membership' },
  { id: 'pay_004', date: '2025-02-01', amount: 15000, type: 'membership', status: 'paid', description: '12 Month Premium Membership' },
  { id: 'pay_005', date: '2025-03-15', amount: 15000, type: 'membership', status: 'paid', description: '12 Month Premium Membership' },
];

// Stats calculations
export const getStats = () => {
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  const expiredMembers = members.filter(m => m.status === 'expired').length;
  const trialMembers = members.filter(m => m.status === 'trial').length;
  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalDietPlans = dietPlans.length;
  const assignedDietPlans = dietPlans.filter(d => d.members.length > 0).length;
  const totalWorkouts = workouts.length;
  const avgWorkoutDuration = Math.round(workouts.reduce((acc, w) => acc + w.duration, 0) / workouts.length);

  return {
    totalMembers,
    activeMembers,
    expiredMembers,
    trialMembers,
    totalRevenue,
    totalDietPlans,
    assignedDietPlans,
    totalWorkouts,
    avgWorkoutDuration,
  };
};
