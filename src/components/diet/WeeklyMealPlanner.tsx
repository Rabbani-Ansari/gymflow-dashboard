import { useState } from 'react';
import { Coffee, Utensils, Moon, Cookie, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { DayMeals, FoodItem, Macros } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MealSection } from './MealSection';
import { MacroPieChart } from './MacroPieChart';
import { toast } from 'sonner';

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface WeeklyMealPlannerProps {
  weeklyMeals: Record<DayKey, DayMeals>;
  onWeeklyMealsChange: (meals: Record<DayKey, DayMeals>) => void;
  dietType?: string;
}

const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

const emptyDayMeals: DayMeals = {
  breakfast: [],
  lunch: [],
  dinner: [],
  snacks: [],
};

const calculateDayMacros = (dayMeals: DayMeals): Macros => {
  const allItems = [
    ...dayMeals.breakfast,
    ...dayMeals.lunch,
    ...dayMeals.dinner,
    ...dayMeals.snacks,
  ];

  return {
    calories: allItems.reduce((sum, item) => sum + item.calories, 0),
    protein: allItems.reduce((sum, item) => sum + item.protein, 0),
    carbs: allItems.reduce((sum, item) => sum + item.carbs, 0),
    fat: allItems.reduce((sum, item) => sum + item.fat, 0),
  };
};

export const WeeklyMealPlanner = ({
  weeklyMeals,
  onWeeklyMealsChange,
  dietType,
}: WeeklyMealPlannerProps) => {
  const [activeDay, setActiveDay] = useState<DayKey>('monday');
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const handleMealChange = (mealType: keyof DayMeals, items: FoodItem[]) => {
    const newWeeklyMeals = {
      ...weeklyMeals,
      [activeDay]: {
        ...weeklyMeals[activeDay],
        [mealType]: items,
      },
    };
    onWeeklyMealsChange(newWeeklyMeals);
  };

  const handleCopyToAllDays = () => {
    const currentDayMeals = weeklyMeals[activeDay];
    const newWeeklyMeals = { ...weeklyMeals };
    
    DAYS.forEach((day) => {
      if (day.key !== activeDay) {
        newWeeklyMeals[day.key] = JSON.parse(JSON.stringify(currentDayMeals));
      }
    });

    onWeeklyMealsChange(newWeeklyMeals);
    toast.success(`Copied ${DAYS.find(d => d.key === activeDay)?.label}'s meals to all days`);
  };

  const handlePrevDay = () => {
    const newIndex = activeDayIndex === 0 ? DAYS.length - 1 : activeDayIndex - 1;
    setActiveDayIndex(newIndex);
    setActiveDay(DAYS[newIndex].key);
  };

  const handleNextDay = () => {
    const newIndex = activeDayIndex === DAYS.length - 1 ? 0 : activeDayIndex + 1;
    setActiveDayIndex(newIndex);
    setActiveDay(DAYS[newIndex].key);
  };

  const currentDayMeals = weeklyMeals[activeDay] || emptyDayMeals;
  const dayMacros = calculateDayMacros(currentDayMeals);

  return (
    <div className="space-y-4">
      {/* Day Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Tabs
            value={activeDay}
            onValueChange={(value) => {
              setActiveDay(value as DayKey);
              setActiveDayIndex(DAYS.findIndex((d) => d.key === value));
            }}
          >
            <TabsList className="hidden sm:flex">
              {DAYS.map((day) => (
                <TabsTrigger key={day.key} value={day.key} className="px-3">
                  {day.short}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="sm:hidden text-lg font-semibold">
              {DAYS.find((d) => d.key === activeDay)?.label}
            </div>
          </Tabs>
          <Button variant="outline" size="icon" onClick={handleNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={handleCopyToAllDays}>
          <Copy className="h-4 w-4 mr-2" />
          Copy to All Days
        </Button>
      </div>

      {/* Day Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 grid grid-cols-4 gap-4">
          <div className="p-3 bg-primary/10 rounded-lg text-center">
            <p className="text-xl font-bold text-primary">{dayMacros.calories}</p>
            <p className="text-xs text-muted-foreground">Calories</p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg text-center">
            <p className="text-xl font-bold text-blue-500">{dayMacros.protein}g</p>
            <p className="text-xs text-muted-foreground">Protein</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg text-center">
            <p className="text-xl font-bold text-amber-500">{dayMacros.carbs}g</p>
            <p className="text-xs text-muted-foreground">Carbs</p>
          </div>
          <div className="p-3 bg-red-500/10 rounded-lg text-center">
            <p className="text-xl font-bold text-red-500">{dayMacros.fat}g</p>
            <p className="text-xs text-muted-foreground">Fat</p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <MacroPieChart macros={dayMacros} size="sm" showLegend={false} />
        </div>
      </div>

      {/* Meal Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MealSection
          title="Breakfast"
          icon={<Coffee className="h-4 w-4 text-amber-500" />}
          items={currentDayMeals.breakfast}
          onItemsChange={(items) => handleMealChange('breakfast', items)}
          dietType={dietType}
        />
        <MealSection
          title="Lunch"
          icon={<Utensils className="h-4 w-4 text-green-500" />}
          items={currentDayMeals.lunch}
          onItemsChange={(items) => handleMealChange('lunch', items)}
          dietType={dietType}
        />
        <MealSection
          title="Dinner"
          icon={<Moon className="h-4 w-4 text-purple-500" />}
          items={currentDayMeals.dinner}
          onItemsChange={(items) => handleMealChange('dinner', items)}
          dietType={dietType}
        />
        <MealSection
          title="Snacks"
          icon={<Cookie className="h-4 w-4 text-orange-500" />}
          items={currentDayMeals.snacks}
          onItemsChange={(items) => handleMealChange('snacks', items)}
          dietType={dietType}
        />
      </div>
    </div>
  );
};
