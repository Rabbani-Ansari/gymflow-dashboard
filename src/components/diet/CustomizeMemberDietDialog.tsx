import { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Flame, 
  Utensils, 
  AlertTriangle, 
  Scale,
  RotateCcw,
  Save,
  Copy,
  X,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Percent
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { DietPlan, FoodItem, DietType } from '@/types';
import { 
  AssignedMember, 
  DayOfWeek, 
  CyclePattern, 
  Allergy, 
  MedicalTag,
  MemberDietSchedule,
  MemberMacroOverrides,
  MemberDietRestrictions,
} from '@/types/memberDiet';

interface CustomizeMemberDietDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: AssignedMember | null;
  basePlan: DietPlan;
  onSave: (customization: any) => void;
}

const DAYS_OF_WEEK: { key: DayOfWeek; label: string; short: string }[] = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

const ALLERGIES: { key: Allergy; label: string }[] = [
  { key: 'nuts', label: 'Nuts' },
  { key: 'dairy', label: 'Dairy' },
  { key: 'gluten', label: 'Gluten' },
  { key: 'soy', label: 'Soy' },
  { key: 'eggs', label: 'Eggs' },
  { key: 'shellfish', label: 'Shellfish' },
  { key: 'fish', label: 'Fish' },
];

const MEDICAL_TAGS: { key: MedicalTag; label: string }[] = [
  { key: 'diabetic-safe', label: 'Diabetic Safe' },
  { key: 'low-sodium', label: 'Low Sodium' },
  { key: 'heart-healthy', label: 'Heart Healthy' },
  { key: 'kidney-friendly', label: 'Kidney Friendly' },
  { key: 'low-cholesterol', label: 'Low Cholesterol' },
];

const DIET_TYPES: { key: DietType; label: string }[] = [
  { key: 'vegetarian', label: 'Vegetarian' },
  { key: 'non-vegetarian', label: 'Non-Vegetarian' },
  { key: 'vegan', label: 'Vegan' },
  { key: 'keto', label: 'Keto' },
  { key: 'diabetic', label: 'Diabetic' },
  { key: 'gluten-free', label: 'Gluten Free' },
];

const defaultSchedule: MemberDietSchedule = {
  activeDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  restDays: [],
  cheatDays: [],
  startDate: new Date().toISOString().split('T')[0],
  cyclePattern: 'weekly',
};

const defaultMacroOverrides: MemberMacroOverrides = {
  scalePercentage: 100,
  progressiveChange: {
    enabled: false,
    changePerWeek: 5,
    direction: 'decrease',
  },
};

const defaultRestrictions: MemberDietRestrictions = {
  dietType: 'non-vegetarian',
  allergies: [],
  medicalTags: [],
  excludedIngredients: [],
};

export const CustomizeMemberDietDialog = ({
  open,
  onOpenChange,
  member,
  basePlan,
  onSave,
}: CustomizeMemberDietDialogProps) => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [schedule, setSchedule] = useState<MemberDietSchedule>(defaultSchedule);
  const [macroOverrides, setMacroOverrides] = useState<MemberMacroOverrides>(defaultMacroOverrides);
  const [restrictions, setRestrictions] = useState<MemberDietRestrictions>({
    ...defaultRestrictions,
    dietType: basePlan.dietType,
  });
  const [excludeInput, setExcludeInput] = useState('');
  const [mealSectionsOpen, setMealSectionsOpen] = useState<Record<string, boolean>>({
    Breakfast: true,
    Lunch: false,
    Dinner: false,
    Snacks: false,
  });

  // Calculate scaled macros
  const scaledMacros = useMemo(() => {
    const scale = macroOverrides.scalePercentage / 100;
    return {
      calories: Math.round((macroOverrides.targetCalories || basePlan.macros.calories) * scale),
      protein: Math.round((macroOverrides.targetProtein || basePlan.macros.protein) * scale),
      carbs: Math.round((macroOverrides.targetCarbs || basePlan.macros.carbs) * scale),
      fat: Math.round((macroOverrides.targetFat || basePlan.macros.fat) * scale),
    };
  }, [macroOverrides, basePlan.macros]);

  const handleDayToggle = (day: DayOfWeek, type: 'active' | 'rest' | 'cheat') => {
    setSchedule((prev) => {
      const newSchedule = { ...prev };
      
      // Remove from all arrays first
      newSchedule.activeDays = prev.activeDays.filter((d) => d !== day);
      newSchedule.restDays = prev.restDays.filter((d) => d !== day);
      newSchedule.cheatDays = prev.cheatDays.filter((d) => d !== day);
      
      // Add to the selected type
      if (type === 'active') {
        newSchedule.activeDays = [...newSchedule.activeDays, day];
      } else if (type === 'rest') {
        newSchedule.restDays = [...newSchedule.restDays, day];
      } else {
        newSchedule.cheatDays = [...newSchedule.cheatDays, day];
      }
      
      return newSchedule;
    });
  };

  const getDayType = (day: DayOfWeek): 'active' | 'rest' | 'cheat' => {
    if (schedule.restDays.includes(day)) return 'rest';
    if (schedule.cheatDays.includes(day)) return 'cheat';
    return 'active';
  };

  const handleAllergyToggle = (allergy: Allergy) => {
    setRestrictions((prev) => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter((a) => a !== allergy)
        : [...prev.allergies, allergy],
    }));
  };

  const handleMedicalTagToggle = (tag: MedicalTag) => {
    setRestrictions((prev) => ({
      ...prev,
      medicalTags: prev.medicalTags.includes(tag)
        ? prev.medicalTags.filter((t) => t !== tag)
        : [...prev.medicalTags, tag],
    }));
  };

  const handleAddExcludedIngredient = () => {
    if (excludeInput.trim()) {
      setRestrictions((prev) => ({
        ...prev,
        excludedIngredients: [...prev.excludedIngredients, excludeInput.trim()],
      }));
      setExcludeInput('');
    }
  };

  const handleRemoveExcludedIngredient = (ingredient: string) => {
    setRestrictions((prev) => ({
      ...prev,
      excludedIngredients: prev.excludedIngredients.filter((i) => i !== ingredient),
    }));
  };

  const handleReset = () => {
    setSchedule(defaultSchedule);
    setMacroOverrides(defaultMacroOverrides);
    setRestrictions({
      ...defaultRestrictions,
      dietType: basePlan.dietType,
    });
    toast.info('Reset to base plan template');
  };

  const handleSaveAsTemplate = () => {
    toast.success('Custom configuration saved as new template');
  };

  const handleSave = () => {
    onSave({
      memberId: member?.id,
      basePlanId: basePlan.id,
      schedule,
      macroOverrides,
      restrictions,
      scaledMacros,
    });
    toast.success(`Customizations saved for ${member?.name}`);
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={member.photo} alt={member.name} />
              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle>Customize Diet for {member.name}</DialogTitle>
              <DialogDescription>
                Base template: {basePlan.name} • All changes apply to this member only
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="meals" className="gap-2">
              <Utensils className="h-4 w-4" />
              <span className="hidden sm:inline">Meals</span>
            </TabsTrigger>
            <TabsTrigger value="macros" className="gap-2">
              <Flame className="h-4 w-4" />
              <span className="hidden sm:inline">Macros</span>
            </TabsTrigger>
            <TabsTrigger value="restrictions" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Restrictions</span>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            {/* Schedule Tab */}
            <TabsContent value="schedule" className="m-0 space-y-4">
              {/* Active Days Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Weekly Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-7 gap-2">
                    {DAYS_OF_WEEK.map((day) => {
                      const type = getDayType(day.key);
                      return (
                        <div key={day.key} className="text-center">
                          <p className="text-xs text-muted-foreground mb-2">{day.short}</p>
                          <div className="space-y-1">
                            <Button
                              variant={type === 'active' ? 'default' : 'outline'}
                              size="sm"
                              className="w-full text-xs h-7"
                              onClick={() => handleDayToggle(day.key, 'active')}
                            >
                              Active
                            </Button>
                            <Button
                              variant={type === 'rest' ? 'secondary' : 'outline'}
                              size="sm"
                              className="w-full text-xs h-7"
                              onClick={() => handleDayToggle(day.key, 'rest')}
                            >
                              Rest
                            </Button>
                            <Button
                              variant={type === 'cheat' ? 'destructive' : 'outline'}
                              size="sm"
                              className="w-full text-xs h-7"
                              onClick={() => handleDayToggle(day.key, 'cheat')}
                            >
                              Cheat
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Dates & Cycle */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Duration & Cycle</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={schedule.startDate}
                        onChange={(e) => setSchedule((prev) => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date (Optional)</Label>
                      <Input
                        type="date"
                        value={schedule.endDate || ''}
                        onChange={(e) => setSchedule((prev) => ({ ...prev, endDate: e.target.value || undefined }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Cycle Pattern</Label>
                    <Select
                      value={schedule.cyclePattern}
                      onValueChange={(value: CyclePattern) => setSchedule((prev) => ({ ...prev, cyclePattern: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {schedule.cyclePattern === 'custom' && (
                    <div className="space-y-2">
                      <Label>Custom Cycle Days</Label>
                      <Input
                        type="number"
                        min={1}
                        max={30}
                        value={schedule.customCycleDays || 7}
                        onChange={(e) => setSchedule((prev) => ({ ...prev, customCycleDays: parseInt(e.target.value) }))}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Meals Tab */}
            <TabsContent value="meals" className="m-0 space-y-4">
              <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground mb-4">
                Click on any meal section to view and customize items. Changes here only affect this member's plan.
              </div>
              
              {basePlan.meals.map((meal) => (
                <Collapsible
                  key={meal.time}
                  open={mealSectionsOpen[meal.time]}
                  onOpenChange={(open) => setMealSectionsOpen((prev) => ({ ...prev, [meal.time]: open }))}
                >
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            {meal.time}
                            <Badge variant="outline" className="text-xs">
                              {meal.items.reduce((sum, item) => sum + item.calories, 0)} cal
                            </Badge>
                          </CardTitle>
                          {mealSectionsOpen[meal.time] ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-3 pt-0">
                        {meal.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.quantity}</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                              <span>{item.calories} cal</span>
                              <span className="text-blue-500">{item.protein}g P</span>
                              <span className="text-amber-500">{item.carbs}g C</span>
                              <span className="text-red-500">{item.fat}g F</span>
                            </div>
                            <div className="flex items-center gap-1 ml-4">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}

              {/* Add Extra Meal */}
              <Button variant="outline" className="w-full border-dashed">
                <Plus className="h-4 w-4 mr-2" />
                Add Extra Meal (Pre/Post Workout)
              </Button>
            </TabsContent>

            {/* Macros Tab */}
            <TabsContent value="macros" className="m-0 space-y-4">
              {/* Current Macros Display */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-4 bg-primary/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">{scaledMacros.calories}</p>
                  <p className="text-xs text-muted-foreground">Calories</p>
                </div>
                <div className="p-4 bg-blue-500/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-500">{scaledMacros.protein}g</p>
                  <p className="text-xs text-muted-foreground">Protein</p>
                </div>
                <div className="p-4 bg-amber-500/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-500">{scaledMacros.carbs}g</p>
                  <p className="text-xs text-muted-foreground">Carbs</p>
                </div>
                <div className="p-4 bg-red-500/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-500">{scaledMacros.fat}g</p>
                  <p className="text-xs text-muted-foreground">Fat</p>
                </div>
              </div>

              {/* Scale Percentage */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    Auto-Scale All Portions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[macroOverrides.scalePercentage]}
                      onValueChange={([value]) => setMacroOverrides((prev) => ({ ...prev, scalePercentage: value }))}
                      min={50}
                      max={150}
                      step={5}
                      className="flex-1"
                    />
                    <div className="flex items-center gap-1 min-w-[80px]">
                      <Input
                        type="number"
                        value={macroOverrides.scalePercentage}
                        onChange={(e) => setMacroOverrides((prev) => ({ ...prev, scalePercentage: parseInt(e.target.value) || 100 }))}
                        className="w-16 h-8 text-center"
                      />
                      <Percent className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Manual Overrides */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Manual Target Overrides</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Target Calories</Label>
                      <Input
                        type="number"
                        placeholder={basePlan.macros.calories.toString()}
                        value={macroOverrides.targetCalories || ''}
                        onChange={(e) => setMacroOverrides((prev) => ({ ...prev, targetCalories: parseInt(e.target.value) || undefined }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Target Protein (g)</Label>
                      <Input
                        type="number"
                        placeholder={basePlan.macros.protein.toString()}
                        value={macroOverrides.targetProtein || ''}
                        onChange={(e) => setMacroOverrides((prev) => ({ ...prev, targetProtein: parseInt(e.target.value) || undefined }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Target Carbs (g)</Label>
                      <Input
                        type="number"
                        placeholder={basePlan.macros.carbs.toString()}
                        value={macroOverrides.targetCarbs || ''}
                        onChange={(e) => setMacroOverrides((prev) => ({ ...prev, targetCarbs: parseInt(e.target.value) || undefined }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Target Fat (g)</Label>
                      <Input
                        type="number"
                        placeholder={basePlan.macros.fat.toString()}
                        value={macroOverrides.targetFat || ''}
                        onChange={(e) => setMacroOverrides((prev) => ({ ...prev, targetFat: parseInt(e.target.value) || undefined }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progressive Change */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Progressive Weekly Change</CardTitle>
                    <Switch
                      checked={macroOverrides.progressiveChange?.enabled || false}
                      onCheckedChange={(checked) => 
                        setMacroOverrides((prev) => ({
                          ...prev,
                          progressiveChange: { ...prev.progressiveChange!, enabled: checked },
                        }))
                      }
                    />
                  </div>
                </CardHeader>
                {macroOverrides.progressiveChange?.enabled && (
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Change Per Week (%)</Label>
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          value={macroOverrides.progressiveChange.changePerWeek}
                          onChange={(e) => 
                            setMacroOverrides((prev) => ({
                              ...prev,
                              progressiveChange: { ...prev.progressiveChange!, changePerWeek: parseInt(e.target.value) || 5 },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Direction</Label>
                        <Select
                          value={macroOverrides.progressiveChange.direction}
                          onValueChange={(value: 'increase' | 'decrease') =>
                            setMacroOverrides((prev) => ({
                              ...prev,
                              progressiveChange: { ...prev.progressiveChange!, direction: value },
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="increase">Increase</SelectItem>
                            <SelectItem value="decrease">Decrease</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </TabsContent>

            {/* Restrictions Tab */}
            <TabsContent value="restrictions" className="m-0 space-y-4">
              {/* Diet Type */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Diet Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={restrictions.dietType}
                    onValueChange={(value: DietType) => setRestrictions((prev) => ({ ...prev, dietType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIET_TYPES.map((type) => (
                        <SelectItem key={type.key} value={type.key}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Allergies */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Allergies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {ALLERGIES.map((allergy) => (
                      <Badge
                        key={allergy.key}
                        variant={restrictions.allergies.includes(allergy.key) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => handleAllergyToggle(allergy.key)}
                      >
                        {allergy.label}
                        {restrictions.allergies.includes(allergy.key) && (
                          <X className="h-3 w-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Medical Tags */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Medical Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {MEDICAL_TAGS.map((tag) => (
                      <Badge
                        key={tag.key}
                        variant={restrictions.medicalTags.includes(tag.key) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => handleMedicalTagToggle(tag.key)}
                      >
                        {tag.label}
                        {restrictions.medicalTags.includes(tag.key) && (
                          <X className="h-3 w-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Excluded Ingredients */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Excluded Ingredients</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., mushrooms, tofu"
                      value={excludeInput}
                      onChange={(e) => setExcludeInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddExcludedIngredient()}
                    />
                    <Button variant="outline" onClick={handleAddExcludedIngredient}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {restrictions.excludedIngredients.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {restrictions.excludedIngredients.map((ingredient) => (
                        <Badge key={ingredient} variant="secondary">
                          {ingredient}
                          <button
                            onClick={() => handleRemoveExcludedIngredient(ingredient)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="flex-wrap gap-2 sm:gap-0">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={handleReset} className="flex-1 sm:flex-none">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline" onClick={handleSaveAsTemplate} className="flex-1 sm:flex-none">
              <Copy className="h-4 w-4 mr-2" />
              Save as Template
            </Button>
          </div>
          <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 sm:flex-none">
              <Save className="h-4 w-4 mr-2" />
              Save Customizations
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
