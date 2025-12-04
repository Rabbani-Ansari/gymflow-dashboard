import { FoodItem, DietType, DietGoal, Macros, DayMeals } from './index';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type CyclePattern = 'weekly' | 'bi-weekly' | 'custom';

export type MedicalTag = 'diabetic-safe' | 'low-sodium' | 'heart-healthy' | 'kidney-friendly' | 'low-cholesterol';

export type Allergy = 'nuts' | 'dairy' | 'gluten' | 'soy' | 'eggs' | 'shellfish' | 'fish';

export interface MemberDietSchedule {
  activeDays: DayOfWeek[];
  restDays: DayOfWeek[];
  cheatDays: DayOfWeek[];
  startDate: string;
  endDate?: string;
  cyclePattern: CyclePattern;
  customCycleDays?: number;
}

export interface MemberMacroOverrides {
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
  scalePercentage: number;
  progressiveChange?: {
    enabled: boolean;
    changePerWeek: number; // percentage
    direction: 'increase' | 'decrease';
  };
}

export interface MemberDietRestrictions {
  dietType: DietType;
  allergies: Allergy[];
  medicalTags: MedicalTag[];
  excludedIngredients: string[];
}

export interface MemberMealOverride {
  dayOfWeek: DayOfWeek;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'pre-workout' | 'post-workout';
  items: FoodItem[];
  isRemoved?: boolean;
  isAdded?: boolean;
}

export interface MemberDietCustomization {
  id: string;
  memberId: string;
  basePlanId: string;
  schedule: MemberDietSchedule;
  macroOverrides: MemberMacroOverrides;
  restrictions: MemberDietRestrictions;
  mealOverrides: MemberMealOverride[];
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface AssignedMember {
  id: string;
  name: string;
  photo: string;
  goal: DietGoal;
  membershipStatus: 'active' | 'expired' | 'trial';
  planStatus: 'active' | 'paused' | 'completed';
  customization?: MemberDietCustomization;
  currentMacros?: Macros;
  adherenceRate?: number;
  startDate?: string;
}
