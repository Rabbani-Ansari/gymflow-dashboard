export interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  photo: string;
  plan: string;
  startDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'trial';
  paymentDue: number;
  address?: string;
  emergencyContact?: string;
  measurements: Measurement[];
  assignedDietPlan?: string;
  assignedWorkout?: string;
  attendance: AttendanceRecord[];
  paymentHistory: PaymentRecord[];
}

export interface AttendanceRecord {
  date: string;
  checkInTime: string;
  checkOutTime?: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  type: 'membership' | 'pt' | 'product';
  status: 'paid' | 'pending' | 'failed';
  description: string;
}

export interface Measurement {
  date: string;
  weight: number;
  height: number;
  bmi: number;
  bodyFat?: number;
}

export type DietGoal = 'weight-loss' | 'muscle-gain' | 'maintenance' | 'fat-loss' | 'general-fitness';
export type DietType = 'vegetarian' | 'non-vegetarian' | 'vegan' | 'keto' | 'diabetic' | 'gluten-free';

export interface DietPlan {
  id: string;
  name: string;
  trainer: string;
  trainerId: string;
  category: 'weight-loss' | 'muscle-gain' | 'maintenance' | 'general';
  dietGoal: DietGoal;
  dietType: DietType;
  targetCalories: number;
  duration: number; // in days
  description?: string;
  members: string[];
  meals: Meal[];
  weeklyMeals?: WeeklyMeals;
  macros: Macros;
  createdAt: string;
  thumbnail: string;
  // Advanced settings
  waterIntake?: number; // liters per day
  supplements?: string[];
  specialInstructions?: string;
  // Assignment details
  assignments?: DietAssignment[];
}

export interface DietAssignment {
  memberId: string;
  startDate: string;
  endDate: string;
  notifications: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  status: 'active' | 'completed' | 'cancelled';
}

export interface WeeklyMeals {
  monday: DayMeals;
  tuesday: DayMeals;
  wednesday: DayMeals;
  thursday: DayMeals;
  friday: DayMeals;
  saturday: DayMeals;
  sunday: DayMeals;
}

export interface DayMeals {
  breakfast: FoodItem[];
  lunch: FoodItem[];
  dinner: FoodItem[];
  snacks: FoodItem[];
}

export interface Meal {
  time: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  items: FoodItem[];
}

export interface FoodItem {
  id?: string;
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image?: string;
}

export interface FoodCatalogItem {
  id: string;
  name: string;
  category: 'protein' | 'carbs' | 'vegetables' | 'fruits' | 'dairy' | 'fats' | 'beverages' | 'snacks';
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isVegetarian: boolean;
  isVegan: boolean;
  image?: string;
}

export interface ExerciseCatalogItem {
  id: string;
  name: string;
  category: 'chest' | 'back' | 'legs' | 'arms' | 'shoulders' | 'core' | 'full-body';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  mechanics?: 'compound' | 'isolation';
}

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Workout {
  id: string;
  name: string;
  trainer: string;
  trainerId: string;
  bodyPart: 'chest' | 'back' | 'legs' | 'arms' | 'shoulders' | 'core' | 'full-body';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: 'free-weights' | 'machines' | 'bodyweight' | 'mixed';
  duration: number;
  exercises: Exercise[];
  members: string[];
  usageCount: number;
  thumbnail: string;
  videoUrl?: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
}

export interface Trainer {
  id: string;
  name: string;
  specialization: string;
  photo: string;
}


