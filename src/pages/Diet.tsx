import { useState, useMemo } from 'react';
import { Plus, Search, X, Check, ArrowRight, ArrowLeft, Users, Flame, ChefHat, Calendar, Eye, Edit, Trash2, UserPlus, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { useMembers, Member } from '@/hooks/useMembers';
import { useDietPlans, DietPlan } from '@/hooks/useDietPlans';
import { useDietAssignments, useCreateBulkDietAssignments, useUpdateDietAssignment, DietAssignmentWithDetails } from '@/hooks/useDietAssignments';
import { Checkbox } from '@/components/ui/checkbox';
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
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';

// Multi-step dialog state
type DialogStep = 'select-member' | 'select-plan' | 'edit-details';

const Diet = () => {
  // Database hooks
  const { data: members = [], isLoading: membersLoading } = useMembers();
  const { data: dietPlans = [], isLoading: plansLoading } = useDietPlans();
  const { data: dietAssignments = [], isLoading: assignmentsLoading } = useDietAssignments();
  const createBulkAssignments = useCreateBulkDietAssignments();
  const updateAssignment = useUpdateDietAssignment();

  const isLoading = membersLoading || plansLoading || assignmentsLoading;

  const [searchQuery, setSearchQuery] = useState('');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState<DialogStep>('select-member');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<DietPlan | null>(null);
  const [planSearchQuery, setPlanSearchQuery] = useState('');

  // View/Edit existing assignment
  const [viewingAssignment, setViewingAssignment] = useState<DietAssignmentWithDetails | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<DietAssignmentWithDetails | null>(null);

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

  // Filter members for selection
  const filteredMembersForSelection = useMemo(() => {
    return members.filter((member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  // Filter plans for selection
  const filteredPlansForSelection = useMemo(() => {
    return dietPlans.filter((plan) =>
      plan.name.toLowerCase().includes(planSearchQuery.toLowerCase()) ||
      plan.category.toLowerCase().includes(planSearchQuery.toLowerCase())
    );
  }, [dietPlans, planSearchQuery]);

  // Stats calculations
  const membersWithActiveDiet = dietAssignments.filter(a => a.status === 'active').length;
  // Note: adherence tracking would need additional database field, using placeholder for now
  const avgAdherence = 0;

  const handleOpenAssignDialog = () => {
    setIsAssignDialogOpen(true);
    setDialogStep('select-member');
    setSelectedMembers([]);
    setSelectedPlan(null);
    setSearchQuery('');
    setPlanSearchQuery('');
    setSpecialInstructions('');
  };

  const handleToggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAllMembers = () => {
    const allFilteredIds = filteredMembersForSelection.map((m) => m.id);
    const allSelected = allFilteredIds.every((id) => selectedMembers.includes(id));
    if (allSelected) {
      setSelectedMembers((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      setSelectedMembers((prev) => [...new Set([...prev, ...allFilteredIds])]);
    }
  };

  const handleProceedToPlanSelection = () => {
    if (selectedMembers.length === 0) {
      return;
    }
    setDialogStep('select-plan');
  };

  const handleSelectPlan = (plan: DietPlan) => {
    setSelectedPlan(plan);
    setDialogStep('edit-details');
  };

  const handleBackToMemberSelection = () => {
    setDialogStep('select-member');
    setSelectedPlan(null);
  };

  const handleBackToPlanSelection = () => {
    setDialogStep('select-plan');
    setSelectedPlan(null);
  };

  const handleAssignDiet = async () => {
    if (selectedMembers.length > 0 && selectedPlan) {
      const assignments = selectedMembers.map(memberId => ({
        member_id: memberId,
        diet_plan_id: selectedPlan.id,
        start_date: startDate,
        end_date: hasEndDate ? endDate : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }));

      await createBulkAssignments.mutateAsync(assignments);

      setIsAssignDialogOpen(false);
      // Reset state
      setDialogStep('select-member');
      setSelectedMembers([]);
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
          value={isLoading ? '...' : members.length}
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading diet assignments...</p>
                </TableCell>
              </TableRow>
            ) : dietAssignments.slice(0, 10).map((assignment) => (
              <TableRow key={assignment.id} className="data-table-row">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={assignment.member?.photo || ''} alt={assignment.member?.name || ''} />
                      <AvatarFallback>{assignment.member?.name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{assignment.member?.name}</p>
                      <p className="text-xs text-muted-foreground">{assignment.member?.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium">
                  {assignment.diet_plan?.name}
                </TableCell>
                <TableCell className="text-sm">
                  {format(new Date(assignment.start_date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell className="text-sm">
                  {format(new Date(assignment.end_date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`capitalize ${assignment.status === 'active'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : assignment.status === 'completed'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                  >
                    {assignment.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewingAssignment(assignment)}
                      aria-label={`View diet assignment for ${assignment.member?.name}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingAssignment(assignment);
                        setStartDate(assignment.start_date);
                        setEndDate(assignment.end_date);
                        setSelectedDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
                      }}
                      aria-label={`Edit diet assignment for ${assignment.member?.name}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!isLoading && dietAssignments.length === 0 && (
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
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col gap-0 p-0">
          {/* Step 1: Select Members */}
          {dialogStep === 'select-member' && (
            <>
              <DialogHeader className="px-6 py-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg">Select Members</DialogTitle>
                    <DialogDescription className="text-sm">
                      Choose one or more members to assign a diet plan
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-hidden flex flex-col">
                {/* Search Bar */}
                <div className="p-4 border-b bg-background">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, phone, or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9"
                      aria-label="Search members"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-normal">
                        {selectedMembers.length} selected
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        of {filteredMembersForSelection.length} members
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSelectAllMembers}
                      className="h-7 text-xs"
                    >
                      {filteredMembersForSelection.every((m) => selectedMembers.includes(m.id))
                        ? 'Deselect All'
                        : 'Select All'}
                    </Button>
                  </div>
                </div>

                {/* Member List */}
                <div className="flex-1 overflow-y-auto p-2">
                  <div className="space-y-1">
                    {filteredMembersForSelection.map((member) => {
                      const isSelected = selectedMembers.includes(member.id);
                      return (
                        <div
                          key={member.id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${isSelected
                            ? 'bg-primary/5 border-primary/30 shadow-sm'
                            : 'border-transparent hover:bg-muted/50'
                            }`}
                          onClick={() => handleToggleMember(member.id)}
                        >
                          <Checkbox
                            checked={isSelected}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={member.photo} alt={member.name} />
                            <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10">
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{member.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs capitalize ${member.status === 'active'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : member.status === 'expired'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              }`}
                          >
                            {member.status}
                          </Badge>
                        </div>
                      );
                    })}
                    {filteredMembersForSelection.length === 0 && (
                      <div className="flex items-center justify-center py-12 text-muted-foreground">
                        <div className="text-center">
                          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No members found</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="px-6 py-4 border-t bg-background gap-2">
                <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleProceedToPlanSelection}
                  disabled={selectedMembers.length === 0}
                  className="gap-2"
                >
                  Continue with {selectedMembers.length} Member{selectedMembers.length !== 1 ? 's' : ''}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Step 2: Select Diet Plan */}
          {dialogStep === 'select-plan' && selectedMembers.length > 0 && (
            <>
              <DialogHeader className="px-6 py-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <ChefHat className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg">Select Diet Plan</DialogTitle>
                    <DialogDescription className="text-sm">
                      Choose a diet plan for {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="flex-1 overflow-hidden flex flex-col">
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
                          <p className="text-white/80 text-xs">{plan.target_calories} cal/day</p>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>P: {plan.macros_protein}g</span>
                          <span>C: {plan.macros_carbs}g</span>
                          <span>F: {plan.macros_fat}g</span>
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
              <DialogFooter className="px-6 py-4 border-t bg-background gap-2">
                <Button variant="outline" onClick={handleBackToMemberSelection}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Step 3: Configure Diet Assignment */}
          {dialogStep === 'edit-details' && selectedMembers.length > 0 && selectedPlan && (
            <>
              <DialogHeader className="px-6 py-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg">Configure Assignment</DialogTitle>
                    <DialogDescription className="text-sm">
                      Set schedule for {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Member & Plan Summary */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Members</p>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {selectedMembers.slice(0, 3).map((id) => {
                          const member = members.find((m) => m.id === id);
                          return member ? (
                            <Avatar key={id} className="h-7 w-7 border-2 border-background">
                              <AvatarImage src={member.photo} alt={member.name} />
                              <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ) : null;
                        })}
                      </div>
                      <p className="font-medium text-sm">
                        {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Assigning</p>
                    <p className="font-medium text-sm">{selectedPlan.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedPlan.target_calories} cal/day</p>
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
                      <span className="text-muted-foreground">Members:</span>
                      <span className="font-medium">{selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''}</span>
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
              <DialogFooter className="px-6 py-4 border-t bg-background gap-2">
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
                  Assign to {selectedMembers.length} Member{selectedMembers.length !== 1 ? 's' : ''}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* View Assignment Dialog */}
      <Dialog open={!!viewingAssignment} onOpenChange={() => setViewingAssignment(null)}>
        <DialogContent className="sm:max-w-[600px]">
          {viewingAssignment && (
            <>
              <DialogHeader>
                <DialogTitle>Diet Assignment Details</DialogTitle>
                <DialogDescription>
                  View diet plan assignment for {viewingAssignment.member?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Member Info */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={viewingAssignment.member?.photo || ''} alt={viewingAssignment.member?.name || ''} />
                    <AvatarFallback className="text-xl">{viewingAssignment.member?.name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{viewingAssignment.member?.name}</h3>
                    <p className="text-sm text-muted-foreground">{viewingAssignment.member?.email}</p>
                    <p className="text-sm text-muted-foreground">{viewingAssignment.member?.phone}</p>
                  </div>
                </div>

                {/* Assignment Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Diet Plan</p>
                    <p className="font-medium">{viewingAssignment.diet_plan?.name}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <Badge
                      variant="outline"
                      className={`capitalize ${viewingAssignment.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : viewingAssignment.status === 'completed'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-red-100 text-red-700'
                        }`}
                    >
                      {viewingAssignment.status}
                    </Badge>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                    <p className="font-medium">{format(new Date(viewingAssignment.start_date), 'MMM dd, yyyy')}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">End Date</p>
                    <p className="font-medium">{format(new Date(viewingAssignment.end_date), 'MMM dd, yyyy')}</p>
                  </div>
                </div>

                {/* Plan Macros */}
                {viewingAssignment.diet_plan && (
                  <div>
                    <h4 className="font-medium mb-3 text-sm">Nutritional Breakdown</h4>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="p-3 bg-primary/10 rounded-lg text-center">
                        <p className="text-xl font-bold text-primary">{viewingAssignment.diet_plan.target_calories}</p>
                        <p className="text-xs text-muted-foreground">Calories</p>
                      </div>
                      <div className="p-3 bg-blue-500/10 rounded-lg text-center">
                        <p className="text-xl font-bold text-blue-500">-</p>
                        <p className="text-xs text-muted-foreground">Protein</p>
                      </div>
                      <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
                        <p className="text-xl font-bold text-yellow-500">-</p>
                        <p className="text-xs text-muted-foreground">Carbs</p>
                      </div>
                      <div className="p-3 bg-red-500/10 rounded-lg text-center">
                        <p className="text-xl font-bold text-red-500">-</p>
                        <p className="text-xs text-muted-foreground">Fat</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewingAssignment(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setEditingAssignment(viewingAssignment);
                  setViewingAssignment(null);
                  setStartDate(viewingAssignment.start_date);
                  setEndDate(viewingAssignment.end_date);
                  setSelectedDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
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
          {editingAssignment && (
            <>
              <DialogHeader>
                <DialogTitle>Edit Diet Assignment for {editingAssignment.member?.name}</DialogTitle>
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
                        <AvatarImage src={editingAssignment.member?.photo || ''} alt={editingAssignment.member?.name || ''} />
                        <AvatarFallback>{editingAssignment.member?.name?.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                      <p className="font-medium text-sm">{editingAssignment.member?.name}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Current Plan</p>
                    <p className="font-medium text-sm">{editingAssignment.diet_plan?.name}</p>
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
                  onClick={async () => {
                    if (editingAssignment) {
                      await updateAssignment.mutateAsync({
                        id: editingAssignment.id,
                        start_date: startDate,
                        end_date: endDate,
                      });
                      setEditingAssignment(null);
                    }
                  }}
                  className="gap-2"
                  disabled={selectedDays.length === 0 || updateAssignment.isPending}
                >
                  {updateAssignment.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
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
