import { useState, useEffect, useMemo } from 'react';
import {
  Save,
  X,
  Copy,
  Trash2,
  FileDown,
  Target,
  Droplets,
  Pill,
  AlertTriangle,
  Coffee,
  Utensils,
  Moon,
  Cookie,
  Plus,
} from 'lucide-react';
import { DietPlan, DietGoal, DietType, DayMeals, Macros, FoodItem, Meal } from '@/types';
import { trainers, members } from '@/data/mockData';
import { supplementsList } from '@/data/foodCatalog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { toast } from 'sonner';
import { MealSection } from './MealSection';
import { MacroPieChart } from './MacroPieChart';



interface EditDietPlanDialogProps {
  plan: DietPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (plan: DietPlan) => void;
  onDelete: (planId: string) => void;
  onDuplicate: (plan: DietPlan) => void;
}

const DIET_GOALS: { value: DietGoal; label: string }[] = [
  { value: 'weight-loss', label: 'Weight Loss' },
  { value: 'muscle-gain', label: 'Muscle Gain' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'fat-loss', label: 'Fat Loss' },
  { value: 'general-fitness', label: 'General Fitness' },
];

const DIET_TYPES: { value: DietType; label: string }[] = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'non-vegetarian', label: 'Non-Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'keto', label: 'Keto' },
  { value: 'diabetic', label: 'Diabetic' },
  { value: 'gluten-free', label: 'Gluten-Free' },
];

const emptyDayMeals: DayMeals = {
  breakfast: [],
  lunch: [],
  dinner: [],
  snacks: [],
};



export const EditDietPlanDialog = ({
  plan,
  open,
  onOpenChange,
  onSave,
  onDelete,
  onDuplicate,
}: EditDietPlanDialogProps) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [dietGoal, setDietGoal] = useState<DietGoal>('weight-loss');
  const [dietType, setDietType] = useState<DietType>('non-vegetarian');
  const [targetCalories, setTargetCalories] = useState(2000);
  const [duration, setDuration] = useState(30);
  const [trainerId, setTrainerId] = useState('');
  const [description, setDescription] = useState('');

  // Macros
  const [protein, setProtein] = useState(150);
  const [carbs, setCarbs] = useState(200);
  const [fat, setFat] = useState(70);

  // Daily meals
  const [dayMeals, setDayMeals] = useState<DayMeals>(emptyDayMeals);

  // Advanced settings
  const [waterIntake, setWaterIntake] = useState(3);
  const [selectedSupplements, setSelectedSupplements] = useState<string[]>([]);
  const [newSupplement, setNewSupplement] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');



  // Initialize form when plan changes
  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setDietGoal(plan.dietGoal || 'weight-loss');
      setDietType(plan.dietType || 'non-vegetarian');
      setTargetCalories(plan.targetCalories);
      setDuration(plan.duration || 30);
      setTrainerId(plan.trainerId);
      setDescription(plan.description || '');
      setProtein(plan.macros.protein);
      setCarbs(plan.macros.carbs);
      setFat(plan.macros.fat);
      setWaterIntake(plan.waterIntake || 3);
      setSelectedSupplements(plan.supplements || []);
      setSpecialInstructions(plan.specialInstructions || '');


      // Convert existing meals to day format
      if (plan.meals && plan.meals.length > 0) {
        const convertedMeals: DayMeals = {
          breakfast: plan.meals.find((m) => m.time === 'Breakfast')?.items || [],
          lunch: plan.meals.find((m) => m.time === 'Lunch')?.items || [],
          dinner: plan.meals.find((m) => m.time === 'Dinner')?.items || [],
          snacks: plan.meals.find((m) => m.time === 'Snacks')?.items || [],
        };
        setDayMeals(convertedMeals);
      } else if (plan.weeklyMeals) {
        // Fallback to Monday if only weekly exists
        setDayMeals(plan.weeklyMeals.monday);
      }
    }
  }, [plan]);

  // Calculate total macros from day meals
  const calculatedMacros = useMemo(() => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const allItems = [
      ...dayMeals.breakfast,
      ...dayMeals.lunch,
      ...dayMeals.dinner,
      ...dayMeals.snacks,
    ];

    allItems.forEach((item) => {
      totalCalories += item.calories;
      totalProtein += item.protein;
      totalCarbs += item.carbs;
      totalFat += item.fat;
    });

    return {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
    };
  }, [dayMeals]);

  const macros: Macros = {
    calories: calculatedMacros.calories || targetCalories,
    protein: calculatedMacros.protein || protein,
    carbs: calculatedMacros.carbs || carbs,
    fat: calculatedMacros.fat || fat,
  };



  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Plan name is required');
      return;
    }
    if (!trainerId) {
      toast.error('Please select a trainer');
      return;
    }

    const trainer = trainers.find((t) => t.id === trainerId);

    const updatedPlan: DietPlan = {
      ...plan!,
      name,
      dietGoal,
      dietType,
      targetCalories,
      duration,
      trainerId,
      trainer: trainer?.name || '',
      description,
      macros,
      meals: [
        { time: 'Breakfast', items: dayMeals.breakfast },
        { time: 'Lunch', items: dayMeals.lunch },
        { time: 'Dinner', items: dayMeals.dinner },
        { time: 'Snacks', items: dayMeals.snacks },
      ],
      weeklyMeals: undefined, // Clear weekly meals as we use single day model
      waterIntake,
      supplements: selectedSupplements,
      specialInstructions,

      category: dietGoal === 'weight-loss' || dietGoal === 'fat-loss'
        ? 'weight-loss'
        : dietGoal === 'muscle-gain'
          ? 'muscle-gain'
          : dietGoal === 'maintenance'
            ? 'maintenance'
            : 'general',
    };

    onSave(updatedPlan);
    toast.success('Diet plan saved successfully!');
    onOpenChange(false);
  };

  const handleDuplicate = () => {
    if (!plan) return;

    const duplicatedPlan: DietPlan = {
      ...plan,
      id: `diet_${Date.now()}`,
      name: `${name} (Copy)`,
      members: [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    onDuplicate(duplicatedPlan);
    toast.success('Diet plan duplicated!');
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!plan) return;
    onDelete(plan.id);
    setIsDeleteDialogOpen(false);
    onOpenChange(false);
    toast.success('Diet plan deleted');
  };

  const handleExportPDF = () => {
    toast.success('PDF export started - this feature would generate a PDF');
  };



  const handleAddSupplement = () => {
    if (newSupplement.trim()) {
      if (!selectedSupplements.includes(newSupplement.trim())) {
        setSelectedSupplements([...selectedSupplements, newSupplement.trim()]);
        toast.success(`Added ${newSupplement.trim()}`);
      }
      setNewSupplement('');
    }
  };

  if (!plan) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
            <DialogTitle className="text-xl">Edit Diet Plan</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <div className="px-6 border-b border-border">
              <TabsList className="w-full justify-start h-12 bg-transparent p-0 gap-4">
                <TabsTrigger
                  value="basic"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
                >
                  Plan Details
                </TabsTrigger>
                <TabsTrigger
                  value="meals"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
                >
                  Meals
                </TabsTrigger>
                <TabsTrigger
                  value="advanced"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
                >
                  Advanced
                </TabsTrigger>

              </TabsList>
            </div>

            <ScrollArea className="h-[calc(90vh-220px)]">
              <div className="px-6 py-4">
                {/* Basic Details Tab */}
                <TabsContent value="basic" className="mt-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="planName">Plan Name *</Label>
                        <Input
                          id="planName"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g., Weight Loss Basic"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Diet Goal *</Label>
                        <Select value={dietGoal} onValueChange={(v) => setDietGoal(v as DietGoal)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DIET_GOALS.map((goal) => (
                              <SelectItem key={goal.value} value={goal.value}>
                                {goal.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Diet Type *</Label>
                        <Select value={dietType} onValueChange={(v) => setDietType(v as DietType)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DIET_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Assigned Trainer</Label>
                        <Select value={trainerId} onValueChange={setTrainerId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select trainer" />
                          </SelectTrigger>
                          <SelectContent>
                            {trainers.map((trainer) => (
                              <SelectItem key={trainer.id} value={trainer.id}>
                                {trainer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Target Calories: {targetCalories} kcal</Label>
                        <Slider
                          value={[targetCalories]}
                          onValueChange={([v]) => setTargetCalories(v)}
                          min={1200}
                          max={3500}
                          step={50}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>1200 kcal</span>
                          <span>3500 kcal</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration">Plan Duration (days)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                          min={1}
                          max={365}
                        />
                      </div>
                    </div>

                    {/* Right Column - Macros */}
                    <div className="space-y-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Macro Nutrient Targets
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-center py-2">
                            <MacroPieChart macros={macros} size="md" />
                          </div>

                          <div className="grid grid-cols-4 gap-3 text-center">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <p className="text-lg font-bold text-primary">{macros.calories}</p>
                              <p className="text-xs text-muted-foreground">Calories</p>
                            </div>
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                              <p className="text-lg font-bold text-blue-500">{macros.protein}g</p>
                              <p className="text-xs text-muted-foreground">Protein</p>
                            </div>
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                              <p className="text-lg font-bold text-amber-500">{macros.carbs}g</p>
                              <p className="text-xs text-muted-foreground">Carbs</p>
                            </div>
                            <div className="p-2 bg-red-500/10 rounded-lg">
                              <p className="text-lg font-bold text-red-500">{macros.fat}g</p>
                              <p className="text-xs text-muted-foreground">Fat</p>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground text-center">
                            Macros are auto-calculated from meal plans. Manual overrides below:
                          </p>

                          <div className="space-y-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Protein: {protein}g</Label>
                              <Slider
                                value={[protein]}
                                onValueChange={([v]) => setProtein(v)}
                                min={50}
                                max={300}
                                step={5}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Carbohydrates: {carbs}g</Label>
                              <Slider
                                value={[carbs]}
                                onValueChange={([v]) => setCarbs(v)}
                                min={50}
                                max={400}
                                step={5}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Fat: {fat}g</Label>
                              <Slider
                                value={[fat]}
                                onValueChange={([v]) => setFat(v)}
                                min={20}
                                max={150}
                                step={5}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="space-y-2">
                        <Label htmlFor="description">Plan Description / Notes</Label>
                        <Textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Add any notes or special instructions for this plan..."
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Meals Tab */}
                <TabsContent value="meals" className="mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <MealSection
                      title="Breakfast"
                      icon={<Coffee className="h-4 w-4 text-amber-500" />}
                      items={dayMeals.breakfast}
                      onItemsChange={(items) => setDayMeals(prev => ({ ...prev, breakfast: items }))}
                      dietType={dietType}
                    />
                    <MealSection
                      title="Lunch"
                      icon={<Utensils className="h-4 w-4 text-green-500" />}
                      items={dayMeals.lunch}
                      onItemsChange={(items) => setDayMeals(prev => ({ ...prev, lunch: items }))}
                      dietType={dietType}
                    />
                    <MealSection
                      title="Dinner"
                      icon={<Moon className="h-4 w-4 text-purple-500" />}
                      items={dayMeals.dinner}
                      onItemsChange={(items) => setDayMeals(prev => ({ ...prev, dinner: items }))}
                      dietType={dietType}
                    />
                    <MealSection
                      title="Snacks"
                      icon={<Cookie className="h-4 w-4 text-orange-500" />}
                      items={dayMeals.snacks}
                      onItemsChange={(items) => setDayMeals(prev => ({ ...prev, snacks: items }))}
                      dietType={dietType}
                    />
                  </div>
                </TabsContent>

                {/* Advanced Settings Tab */}
                <TabsContent value="advanced" className="mt-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-blue-500" />
                          Water Intake Target
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Label>Daily Target: {waterIntake} liters</Label>
                          <Slider
                            value={[waterIntake]}
                            onValueChange={([v]) => setWaterIntake(v)}
                            min={1}
                            max={5}
                            step={0.5}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>1L</span>
                            <span>5L</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Pill className="h-4 w-4 text-green-500" />
                          Supplements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2 mb-4">
                          <Input
                            placeholder="Add custom supplement..."
                            value={newSupplement}
                            onChange={(e) => setNewSupplement(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddSupplement();
                              }
                            }}
                          />
                          <Button size="icon" variant="outline" onClick={handleAddSupplement}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Array.from(new Set([...supplementsList, ...selectedSupplements])).map((supplement) => (
                            <Badge
                              key={supplement}
                              variant={selectedSupplements.includes(supplement) ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() =>
                                setSelectedSupplements((prev) =>
                                  prev.includes(supplement)
                                    ? prev.filter((s) => s !== supplement)
                                    : [...prev, supplement]
                                )
                              }
                            >
                              {supplement}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Special Instructions or Warnings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        placeholder="Add any allergies, medical conditions, or special dietary requirements..."
                        rows={4}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>


              </div>
            </ScrollArea>
          </Tabs>

          <DialogFooter className="px-6 py-4 border-t border-border gap-2">
            <div className="flex items-center gap-2 mr-auto">
              <Button variant="outline" size="sm" onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <FileDown className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Diet Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the diet plan
              "{plan?.name}" and remove it from all assigned members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
