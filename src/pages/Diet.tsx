import { useState, useMemo } from 'react';
import { Plus, Search, X, Check, ArrowRight, ArrowLeft, Users, Flame, ChefHat, Calendar, Eye, Edit, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { dietPlans, members, getStats } from '@/data/mockData';
import { DietPlan, Member } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';

// Type for diet assignment status
type DietAssignmentStatus = 'active' | 'paused' | 'expired' | 'trial';

// Extended member interface with diet assignment details
interface MemberWithDiet extends Member {
  dietAssignment?: {
    planId: string;
    planName: string;
    startDate: string;
    endDate: string;
    status: DietAssignmentStatus;
    adherence: number;
    lastUpdated: string;
  };
}

// Multi-step dialog state
type DialogStep = 'select-member' | 'select-plan' | 'edit-details';

const Diet = () => {
  const stats = getStats();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState<DialogStep>('select-member');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<DietPlan | null>(null);
  const [planSearchQuery, setPlanSearchQuery] = useState('');

  // View/Edit existing assignment
  const [viewingAssignment, setViewingAssignment] = useState<MemberWithDiet | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<MemberWithDiet | null>(null);

  // Editable fields
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
  const [hasEndDate, setHasEndDate] = useState(true);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Day selection
  const [selectedDays, setSelectedDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleQuickSelect = (preset: string) => {
    switch (preset) {
      case 'weekdays':
        setSelectedDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
        break;
      case 'weekends':
        setSelectedDays(['Saturday', 'Sunday']);
        break;
      case 'all':
        setSelectedDays(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
        break;
      case 'mwf':
        setSelectedDays(['Monday', 'Wednesday', 'Friday']);
        break;
      case 'tts':
        setSelectedDays(['Tuesday', 'Thursday', 'Saturday']);
        break;
    }
  };

  // Mock data - In production, this would come from API
  const membersWithDiet: MemberWithDiet[] = useMemo(() => {
    return members.map((member) => {
      const hasDiet = Math.random() > 0.3;
      if (hasDiet && member.assignedDietPlan) {
        const plan = dietPlans.find(p => p.id === member.assignedDietPlan);
        const statuses: DietAssignmentStatus[] = ['active', 'paused', 'expired', 'trial'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        return {
          ...member,
          dietAssignment: {
            planId: member.assignedDietPlan,
            planName: plan?.name || 'Unknown Plan',
            startDate: member.startDate,
            endDate: member.expiryDate,
            status: randomStatus,
            adherence: Math.floor(Math.random() * 40) + 60,
            lastUpdated: new Date().toISOString(),
          },
        };
      }
      return member;
    });
  }, []);

  // Filter members for selection
  const filteredMembersForSelection = useMemo(() => {
    return members.filter((member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Filter plans for selection
  const filteredPlansForSelection = useMemo(() => {
    return dietPlans.filter((plan) =>
      plan.name.toLowerCase().includes(planSearchQuery.toLowerCase()) ||
      plan.category.toLowerCase().includes(planSearchQuery.toLowerCase())
    );
  }, [planSearchQuery]);

  // Stats calculations
  const membersWithActiveDiet = membersWithDiet.filter(m => m.dietAssignment?.status === 'active').length;
  const avgAdherence = Math.round(
    membersWithDiet
      .filter(m => m.dietAssignment)
      .reduce((acc, m) => acc + (m.dietAssignment?.adherence || 0), 0) /
    membersWithDiet.filter(m => m.dietAssignment).length
  ) || 0;

  const handleOpenAssignDialog = () => {
    setIsAssignDialogOpen(true);
    setDialogStep('select-member');
    setSelectedMember(null);
    setSelectedPlan(null);
    setSearchQuery('');
    setPlanSearchQuery('');
    setSpecialInstructions('');
  };

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setDialogStep('select-plan');
  };

  const handleSelectPlan = (plan: DietPlan) => {
    setSelectedPlan(plan);
    setDialogStep('edit-details');
  };

  const handleBackToMemberSelection = () => {
    setDialogStep('select-member');
    setSelectedMember(null);
    setSelectedPlan(null);
  };

  const handleBackToPlanSelection = () => {
    setDialogStep('select-plan');
    setSelectedPlan(null);
  };

  const handleAssignDiet = () => {
    if (selectedMember && selectedPlan) {
      toast.success(`Diet plan "${selectedPlan.name}" assigned to ${selectedMember.name}!`);
      setIsAssignDialogOpen(false);
      // Reset state
      setDialogStep('select-member');
      setSelectedMember(null);
      setSelectedPlan(null);
      setSearchQuery('');
      setPlanSearchQuery('');
      setSpecialInstructions('');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'weight-loss': 'bg-red-500',
      'muscle-gain': 'bg-green-500',
      'maintenance': 'bg-yellow-500',
      'general': 'bg-blue-500',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      'weight-loss': 'Weight Loss',
      'muscle-gain': 'Muscle Gain',
      'maintenance': 'Maintenance',
      'general': 'General',
    };
    return labels[category as keyof typeof labels] || category;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <PageHeader
        title="Diet Management"
        description="Manage member diet plans, track adherence, and monitor nutrition goals."
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Members"
          value={membersWithDiet.length}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Active Diets"
          value={membersWithActiveDiet}
          icon={ChefHat}
          variant="success"
        />
        <StatCard
          title="Avg Adherence"
          value={`${avgAdherence}%`}
          icon={Flame}
        />
        <StatCard
          title="Diet Plans"
          value={dietPlans.length}
          icon={Calendar}
        />
      </div>

      {/* Current Assignments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">Current Diet Assignments</h3>
          <p className="text-sm text-muted-foreground">View and manage member diet assignments</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Member</TableHead>
              <TableHead>Diet Plan</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Adherence</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {membersWithDiet.filter(m => m.dietAssignment).slice(0, 10).map((member) => (
              <TableRow key={member.id} className="data-table-row">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.photo} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium">
                  {member.dietAssignment?.planName}
                </TableCell>
                <TableCell className="text-sm">
                  {member.dietAssignment && format(new Date(member.dietAssignment.startDate), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell className="text-sm">
                  {member.dietAssignment && format(new Date(member.dietAssignment.endDate), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  {member.dietAssignment && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden w-24">
                        <div
                          className={`h-full transition-all ${member.dietAssignment.adherence >= 80
                            ? 'bg-green-500'
                            : member.dietAssignment.adherence >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                            }`}
                          style={{ width: `${member.dietAssignment.adherence}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium min-w-[3ch]">
                        {member.dietAssignment.adherence}%
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewingAssignment(member)}
                      aria-label={`View diet assignment for ${member.name}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingAssignment(member);
                        if (member.dietAssignment) {
                          setStartDate(member.dietAssignment.startDate);
                          setEndDate(member.dietAssignment.endDate);
                          setSelectedDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
                        }
                      }}
                      aria-label={`Edit diet assignment for ${member.name}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {membersWithDiet.filter(m => m.dietAssignment).length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No diet assignments yet. Click the + button to assign a diet plan.
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={handleOpenAssignDialog}
        className="fab-button flex items-center justify-center"
        aria-label="Assign diet plan to member"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>

      {/* Multi-Step Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
          {/* Step 1: Select Member */}
          {dialogStep === 'select-member' && (
            <>
              <DialogHeader>
                <DialogTitle>Step 1: Select Member</DialogTitle>
                <DialogDescription>
                  Choose a member to assign a diet plan
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search members by name, phone, or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                      aria-label="Search members"
                    />
                  </div>
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {filteredMembersForSelection.map((member) => (
                    <Card
                      key={member.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSelectMember(member)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.photo} alt={member.name} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                            <p className="text-sm text-muted-foreground">{member.phone}</p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredMembersForSelection.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No members found matching your search.
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Step 2: Select Diet Plan */}
          {dialogStep === 'select-plan' && selectedMember && (
            <>
              <DialogHeader>
                <DialogTitle>Step 2: Select Diet Plan</DialogTitle>
                <DialogDescription>
                  Choose a diet plan for {selectedMember.name}
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search diet plans..."
                      value={planSearchQuery}
                      onChange={(e) => setPlanSearchQuery(e.target.value)}
                      className="pl-9"
                      aria-label="Search diet plans"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                  {filteredPlansForSelection.map((plan) => (
                    <Card
                      key={plan.id}
                      className="cursor-pointer hover:shadow-lg transition-all"
                      onClick={() => handleSelectPlan(plan)}
                    >
                      <div className="relative h-32 overflow-hidden rounded-t-xl">
                        <img
                          src={plan.thumbnail}
                          alt={plan.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <Badge
                          className={`absolute top-2 left-2 ${getCategoryColor(plan.category)} text-white border-0`}
                        >
                          {getCategoryLabel(plan.category)}
                        </Badge>
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-white font-medium text-sm">{plan.name}</p>
                          <p className="text-white/80 text-xs">{plan.targetCalories} cal/day</p>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>P: {plan.macros.protein}g</span>
                          <span>C: {plan.macros.carbs}g</span>
                          <span>F: {plan.macros.fat}g</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredPlansForSelection.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-muted-foreground">
                      No diet plans found matching your search.
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleBackToMemberSelection}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Step 3: Configure Diet Assignment */}
          {dialogStep === 'edit-details' && selectedMember && selectedPlan && (
            <>
              <DialogHeader>
                <DialogTitle>Configure Diet for {selectedMember.name}</DialogTitle>
                <DialogDescription>
                  Choose which days and duration for this diet plan
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {/* Member & Plan Summary */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Member</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedMember.photo} alt={selectedMember.name} />
                        <AvatarFallback>{selectedMember.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="font-medium text-sm">{selectedMember.name}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Assigning</p>
                    <p className="font-medium text-sm">{selectedPlan.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedPlan.targetCalories} cal/day</p>
                  </div>
                </div>

                {/* Select Active Days */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Select Active Days</h4>

                  {/* Quick Select Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickSelect('weekdays')}
                      className="text-xs"
                    >
                      Weekdays
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickSelect('weekends')}
                      className="text-xs"
                    >
                      Weekends
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickSelect('all')}
                      className="text-xs"
                    >
                      All Days
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickSelect('mwf')}
                      className="text-xs"
                    >
                      Mon/Wed/Fri
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickSelect('tts')}
                      className="text-xs"
                    >
                      Tue/Thu/Sat
                    </Button>
                  </div>

                  {/* Individual Day Toggles */}
                  <div className="grid grid-cols-4 gap-2">
                    {daysOfWeek.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${selectedDays.includes(day)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Schedule */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Schedule</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        aria-label="Start date"
                      />
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(startDate), 'MMMM do, yyyy')}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={hasEndDate ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setHasEndDate(true)}
                            className="flex-1 text-xs"
                          >
                            Set end date
                          </Button>
                          <Button
                            type="button"
                            variant={!hasEndDate ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setHasEndDate(false)}
                            className="flex-1 text-xs"
                          >
                            No end date
                          </Button>
                        </div>
                        {hasEndDate && (
                          <>
                            <Input
                              id="endDate"
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              aria-label="End date"
                            />
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(endDate), 'MMMM do, yyyy')}
                            </p>
                          </>
                        )}
                        {!hasEndDate && (
                          <p className="text-xs text-muted-foreground py-2">
                            This diet plan will continue indefinitely
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assignment Summary */}
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm text-primary">Assignment Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Member:</span>
                      <span className="font-medium">{selectedMember.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plan:</span>
                      <span className="font-medium">{selectedPlan.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Days:</span>
                      <span className="font-medium">
                        {selectedDays.length === 7
                          ? 'All Days'
                          : selectedDays.map(d => d.slice(0, 3)).join(', ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">
                        {format(new Date(startDate), 'MMM d, yyyy')} - {hasEndDate ? format(new Date(endDate), 'MMM d, yyyy') : 'Ongoing'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={handleBackToPlanSelection}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleAssignDiet}
                  className="gap-2"
                  disabled={selectedDays.length === 0}
                >
                  <Check className="h-4 w-4" />
                  Assign Diet Plan
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* View Assignment Dialog */}
      <Dialog open={!!viewingAssignment} onOpenChange={() => setViewingAssignment(null)}>
        <DialogContent className="sm:max-w-[600px]">
          {viewingAssignment && viewingAssignment.dietAssignment && (
            <>
              <DialogHeader>
                <DialogTitle>Diet Assignment Details</DialogTitle>
                <DialogDescription>
                  View diet plan assignment for {viewingAssignment.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Member Info */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={viewingAssignment.photo} alt={viewingAssignment.name} />
                    <AvatarFallback className="text-xl">{viewingAssignment.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{viewingAssignment.name}</h3>
                    <p className="text-sm text-muted-foreground">{viewingAssignment.email}</p>
                    <p className="text-sm text-muted-foreground">{viewingAssignment.phone}</p>
                  </div>
                </div>

                {/* Assignment Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Diet Plan</p>
                    <p className="font-medium">{viewingAssignment.dietAssignment.planName}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Adherence</p>
                    <p className="font-medium">{viewingAssignment.dietAssignment.adherence}%</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                    <p className="font-medium">{format(new Date(viewingAssignment.dietAssignment.startDate), 'MMM dd, yyyy')}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">End Date</p>
                    <p className="font-medium">{format(new Date(viewingAssignment.dietAssignment.endDate), 'MMM dd, yyyy')}</p>
                  </div>
                </div>

                {/* Plan Macros */}
                {(() => {
                  const plan = dietPlans.find(p => p.id === viewingAssignment.dietAssignment?.planId);
                  if (plan) {
                    return (
                      <div>
                        <h4 className="font-medium mb-3 text-sm">Nutritional Breakdown</h4>
                        <div className="grid grid-cols-4 gap-3">
                          <div className="p-3 bg-primary/10 rounded-lg text-center">
                            <p className="text-xl font-bold text-primary">{plan.targetCalories}</p>
                            <p className="text-xs text-muted-foreground">Calories</p>
                          </div>
                          <div className="p-3 bg-blue-500/10 rounded-lg text-center">
                            <p className="text-xl font-bold text-blue-500">{plan.macros.protein}g</p>
                            <p className="text-xs text-muted-foreground">Protein</p>
                          </div>
                          <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
                            <p className="text-xl font-bold text-yellow-500">{plan.macros.carbs}g</p>
                            <p className="text-xs text-muted-foreground">Carbs</p>
                          </div>
                          <div className="p-3 bg-red-500/10 rounded-lg text-center">
                            <p className="text-xl font-bold text-red-500">{plan.macros.fat}g</p>
                            <p className="text-xs text-muted-foreground">Fat</p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewingAssignment(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setEditingAssignment(viewingAssignment);
                  setViewingAssignment(null);
                  if (viewingAssignment.dietAssignment) {
                    setStartDate(viewingAssignment.dietAssignment.startDate);
                    setEndDate(viewingAssignment.dietAssignment.endDate);
                    setSelectedDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
                  }
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Assignment
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Assignment Dialog */}
      <Dialog open={!!editingAssignment} onOpenChange={() => setEditingAssignment(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
          {editingAssignment && editingAssignment.dietAssignment && (
            <>
              <DialogHeader>
                <DialogTitle>Edit Diet Assignment for {editingAssignment.name}</DialogTitle>
                <DialogDescription>
                  Modify the diet plan configuration
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {/* Member & Plan Summary */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Member</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={editingAssignment.photo} alt={editingAssignment.name} />
                        <AvatarFallback>{editingAssignment.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="font-medium text-sm">{editingAssignment.name}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Current Plan</p>
                    <p className="font-medium text-sm">{editingAssignment.dietAssignment.planName}</p>
                  </div>
                </div>

                {/* Select Active Days */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Select Active Days</h4>

                  {/* Quick Select Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickSelect('weekdays')}
                      className="text-xs"
                    >
                      Weekdays
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickSelect('weekends')}
                      className="text-xs"
                    >
                      Weekends
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickSelect('all')}
                      className="text-xs"
                    >
                      All Days
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickSelect('mwf')}
                      className="text-xs"
                    >
                      Mon/Wed/Fri
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickSelect('tts')}
                      className="text-xs"
                    >
                      Tue/Thu/Sat
                    </Button>
                  </div>

                  {/* Individual Day Toggles */}
                  <div className="grid grid-cols-4 gap-2">
                    {daysOfWeek.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${selectedDays.includes(day)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Schedule */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Schedule</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editStartDate">Start Date</Label>
                      <Input
                        id="editStartDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        aria-label="Start date"
                      />
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(startDate), 'MMMM do, yyyy')}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editEndDate">End Date</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={hasEndDate ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setHasEndDate(true)}
                            className="flex-1 text-xs"
                          >
                            Set end date
                          </Button>
                          <Button
                            type="button"
                            variant={!hasEndDate ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setHasEndDate(false)}
                            className="flex-1 text-xs"
                          >
                            No end date
                          </Button>
                        </div>
                        {hasEndDate && (
                          <>
                            <Input
                              id="editEndDate"
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              aria-label="End date"
                            />
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(endDate), 'MMMM do, yyyy')}
                            </p>
                          </>
                        )}
                        {!hasEndDate && (
                          <p className="text-xs text-muted-foreground py-2">
                            This diet plan will continue indefinitely
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setEditingAssignment(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    toast.success(`Diet assignment updated for ${editingAssignment.name}!`);
                    setEditingAssignment(null);
                  }}
                  className="gap-2"
                  disabled={selectedDays.length === 0}
                >
                  <Check className="h-4 w-4" />
                  Save Changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Diet;
