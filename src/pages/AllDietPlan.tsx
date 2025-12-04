import { useState, useMemo } from 'react';
import { Plus, Search, Filter, Grid, List, Users, Flame, ChefHat, Eye, Edit, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { dietPlans as initialDietPlans, trainers, members, getStats } from '@/data/mockData';
import { DietPlan } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { EditDietPlanDialog } from '@/components/diet/EditDietPlanDialog';

const categoryColors = {
  'weight-loss': 'hsl(var(--destructive))',
  'muscle-gain': 'hsl(var(--success))',
  'maintenance': 'hsl(var(--warning))',
  'general': 'hsl(var(--primary))',
};

const categoryLabels = {
  'weight-loss': 'Weight Loss',
  'muscle-gain': 'Muscle Gain',
  'maintenance': 'Maintenance',
  'general': 'General',
};

const AllDietPlan = () => {
  const stats = getStats();
  const [dietPlans, setDietPlans] = useState<DietPlan[]>(initialDietPlans);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [trainerFilter, setTrainerFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [viewingPlan, setViewingPlan] = useState<DietPlan | null>(null);
  const [editingPlan, setEditingPlan] = useState<DietPlan | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [caloriesRange, setCaloriesRange] = useState([1500, 3000]);

  const filteredPlans = useMemo(() => {
    return dietPlans.filter((plan) => {
      const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || plan.category === categoryFilter;
      const matchesTrainer = trainerFilter === 'all' || plan.trainerId === trainerFilter;
      const matchesCalories = plan.targetCalories >= caloriesRange[0] && plan.targetCalories <= caloriesRange[1];

      return matchesSearch && matchesCategory && matchesTrainer && matchesCalories;
    });
  }, [searchQuery, categoryFilter, trainerFilter, caloriesRange, dietPlans]);

  const avgCalories = Math.round(dietPlans.reduce((acc, p) => acc + p.targetCalories, 0) / dietPlans.length);


  const categoryDistribution = [
    { name: 'Weight Loss', value: dietPlans.filter(p => p.category === 'weight-loss').length, color: categoryColors['weight-loss'] },
    { name: 'Muscle Gain', value: dietPlans.filter(p => p.category === 'muscle-gain').length, color: categoryColors['muscle-gain'] },
    { name: 'General', value: dietPlans.filter(p => p.category === 'general').length, color: categoryColors['general'] },
  ].filter(c => c.value > 0);

  const getMemberNames = (memberIds: string[]) => {
    return memberIds.map(id => members.find(m => m.id === id)?.name || 'Unknown').join(', ');
  };

  const handleSavePlan = (updatedPlan: DietPlan) => {
    setDietPlans((prev) =>
      prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p))
    );
  };

  const handleDeletePlan = (planId: string) => {
    setDietPlans((prev) => prev.filter((p) => p.id !== planId));
  };

  const handleDuplicatePlan = (newPlan: DietPlan) => {
    setDietPlans((prev) => [...prev, newPlan]);
  };



  const DietPlanCard = ({ plan }: { plan: DietPlan }) => {
    const macrosData = [
      { name: 'Protein', value: plan.macros.protein, color: 'hsl(217, 91%, 60%)' },
      { name: 'Carbs', value: plan.macros.carbs, color: 'hsl(38, 92%, 50%)' },
      { name: 'Fat', value: plan.macros.fat, color: 'hsl(0, 84%, 60%)' },
    ];

    return (
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="relative h-40 overflow-hidden rounded-t-xl">
          <img
            src={plan.thumbnail}
            alt={plan.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <Badge
            className="absolute top-3 left-3 text-xs"
            style={{ backgroundColor: categoryColors[plan.category] }}
          >
            {categoryLabels[plan.category]}
          </Badge>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="text-white font-medium text-sm truncate">{plan.name}</span>
            <span className="text-white/80 text-xs">{plan.targetCalories} cal</span>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src={trainers.find(t => t.id === plan.trainerId)?.photo} />
              <AvatarFallback>{plan.trainer.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{plan.trainer}</span>
          </div>

          {/* Mini Macros Chart */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macrosData}
                    cx="50%"
                    cy="50%"
                    innerRadius={15}
                    outerRadius={28}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {macrosData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Protein</span>
                <span className="font-medium">{plan.macros.protein}g</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Carbs</span>
                <span className="font-medium">{plan.macros.carbs}g</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Fat</span>
                <span className="font-medium">{plan.macros.fat}g</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Used by {plan.members.length} member{plan.members.length !== 1 ? 's' : ''}
            </span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => setViewingPlan(plan)}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditingPlan(plan)}>
            <Edit className="h-4 w-4" />
          </Button>

        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="All Diet Plans"
        description="Manage diet plans and nutritional programs for your members."
        actions={
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Diet Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Diet Plan</DialogTitle>
                <DialogDescription>
                  Design a new nutritional plan for your members.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="planName">Plan Name</Label>
                  <Input id="planName" placeholder="e.g., Weight Loss Basic" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weight-loss">Weight Loss</SelectItem>
                        <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trainer">Trainer</Label>
                    <Select>
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
                </div>
                <div className="space-y-2">
                  <Label>Target Calories: 2000</Label>
                  <Slider defaultValue={[2000]} min={1200} max={4000} step={100} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast.success('Diet plan created successfully!');
                  setIsAddDialogOpen(false);
                }}>
                  Create Plan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Plans"
          value={stats.totalDietPlans}
          icon={ChefHat}
          variant="primary"
        />

        <StatCard
          title="Avg Calories"
          value={avgCalories.toLocaleString()}
          icon={Flame}
        />
        <Card className="p-4">
          <p className="text-sm font-medium text-muted-foreground mb-2">Category Split</p>
          <div className="h-[60px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={15}
                  outerRadius={28}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>



      {/* Filters */}
      <div className="filter-bar">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search diet plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="weight-loss">Weight Loss</SelectItem>
            <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>
        <Select value={trainerFilter} onValueChange={setTrainerFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Trainer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Trainers</SelectItem>
            {trainers.map((trainer) => (
              <SelectItem key={trainer.id} value={trainer.id}>
                {trainer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Diet Plans Grid */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-4'}>
        {filteredPlans.map((plan) => (
          <DietPlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No diet plans found matching your criteria.
        </div>
      )}

      {/* View Plan Dialog with Tabs */}
      <Dialog open={!!viewingPlan} onOpenChange={() => setViewingPlan(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          {viewingPlan && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {viewingPlan.name}
                  <Badge style={{ backgroundColor: categoryColors[viewingPlan.category] }}>
                    {categoryLabels[viewingPlan.category]}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Created by {viewingPlan.trainer} • {viewingPlan.targetCalories} calories/day
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto mt-4 space-y-6">
                {/* Macros Summary */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-primary/10 rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary">{viewingPlan.macros.calories}</p>
                    <p className="text-xs text-muted-foreground">Calories</p>
                  </div>
                  <div className="p-4 bg-chart-1/10 rounded-lg text-center">
                    <p className="text-2xl font-bold" style={{ color: 'hsl(217, 91%, 60%)' }}>{viewingPlan.macros.protein}g</p>
                    <p className="text-xs text-muted-foreground">Protein</p>
                  </div>
                  <div className="p-4 bg-warning/10 rounded-lg text-center">
                    <p className="text-2xl font-bold text-warning">{viewingPlan.macros.carbs}g</p>
                    <p className="text-xs text-muted-foreground">Carbs</p>
                  </div>
                  <div className="p-4 bg-destructive/10 rounded-lg text-center">
                    <p className="text-2xl font-bold text-destructive">{viewingPlan.macros.fat}g</p>
                    <p className="text-xs text-muted-foreground">Fat</p>
                  </div>
                </div>

                {/* Meals */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Daily Meals</h4>
                  {viewingPlan.meals.map((meal) => (
                    <div key={meal.time} className="p-4 bg-muted/50 rounded-lg">
                      <h5 className="font-medium mb-2">{meal.time}</h5>
                      <div className="space-y-2">
                        {meal.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <div>
                              <span className="font-medium">{item.name}</span>
                              <span className="text-muted-foreground ml-2">({item.quantity})</span>
                            </div>
                            <span className="text-muted-foreground">{item.calories} cal</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setViewingPlan(null)}>
                  Close
                </Button>

                <Button onClick={() => { setViewingPlan(null); setEditingPlan(viewingPlan); }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Plan
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Diet Plan Dialog */}
      <EditDietPlanDialog
        plan={editingPlan}
        open={!!editingPlan}
        onOpenChange={(open) => !open && setEditingPlan(null)}
        onSave={handleSavePlan}
        onDelete={handleDeletePlan}
        onDuplicate={handleDuplicatePlan}
      />


    </div>
  );
};

export default AllDietPlan;
