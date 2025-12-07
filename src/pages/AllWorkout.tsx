import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Grid,
  List,
  Users,
  Clock,
  Dumbbell,
  Play,
  Eye,
  Edit,
  UserPlus,
  Zap,
  Trash2,
  ArrowUpDown,
  Filter,
  Calendar,
  Star,
  ChevronDown,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { trainers, members, getStats } from '@/data/mockData';
import { useWorkouts, Workout as DbWorkout } from '@/hooks/useWorkouts';
import { Workout } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

// Import workout components
import { EditWorkoutDialog } from '@/components/workout/EditWorkoutDialog';
import { AssignMembersDialog } from '@/components/workout/AssignMembersDialog';
import { WorkoutBulkActions } from '@/components/workout/WorkoutBulkActions';
import { WorkoutPagination } from '@/components/workout/WorkoutPagination';
import { WorkoutGridSkeleton } from '@/components/workout/WorkoutCardSkeleton';
import { EmptyWorkoutState } from '@/components/workout/EmptyWorkoutState';
import { MiniExerciseSimulation } from '@/components/workout/ExerciseSimulation';
import { ExerciseAnimationPlayer } from '@/components/animations/ExerciseAnimationPlayer';
import { WorkoutAssignmentsTab } from '@/components/workout/WorkoutAssignmentsTab';
import { useCreateWorkoutAssignment } from '@/hooks/useWorkoutAssignments';

const bodyPartColors: Record<string, string> = {
  'chest': 'hsl(0, 84%, 60%)',
  'back': 'hsl(217, 91%, 60%)',
  'legs': 'hsl(142, 76%, 36%)',
  'arms': 'hsl(38, 92%, 50%)',
  'shoulders': 'hsl(280, 65%, 60%)',
  'core': 'hsl(180, 70%, 45%)',
  'full-body': 'hsl(330, 80%, 60%)',
};

const bodyPartLabels: Record<string, string> = {
  'chest': 'Chest',
  'back': 'Back',
  'legs': 'Legs',
  'arms': 'Arms',
  'shoulders': 'Shoulders',
  'core': 'Core',
  'full-body': 'Full Body',
};

const difficultyLabels: Record<string, string> = {
  'beginner': 'Beginner',
  'intermediate': 'Intermediate',
  'advanced': 'Advanced',
};

const difficultyColors: Record<string, string> = {
  'beginner': 'hsl(var(--success))',
  'intermediate': 'hsl(var(--warning))',
  'advanced': 'hsl(var(--destructive))',
};

type SortOption = 'popularity' | 'recent' | 'alphabetical' | 'duration';
type StatusFilter = 'all' | 'active' | 'archived' | 'draft';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'popularity', label: 'Most Popular' },
  { value: 'recent', label: 'Most Recent' },
  { value: 'alphabetical', label: 'Alphabetical' },
  { value: 'duration', label: 'Duration' },
];

const QUICK_FILTERS = [
  { id: 'my-workouts', label: 'My Workouts', icon: Star },
  { id: 'most-used', label: 'Most Used', icon: Zap },
  { id: 'beginner', label: 'Beginner Only', icon: Users },
];

const AllWorkout = () => {
  const navigate = useNavigate();
  const stats = getStats();

  // Fetch workouts from database
  const { data: dbWorkouts = [], isLoading: isLoadingDb } = useWorkouts();
  const createWorkoutAssignment = useCreateWorkoutAssignment();

  // Map database workouts to frontend format
  const mapDbToFrontend = (db: DbWorkout): Workout => ({
    id: db.id,
    name: db.name,
    trainer: db.trainer?.name || 'Unknown',
    trainerId: db.trainer_id || '',
    bodyPart: db.body_part,
    difficulty: db.difficulty,
    equipment: db.equipment,
    duration: db.duration,
    exercises: (db.exercises || []).map(ex => ({
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      rest: ex.rest,
      notes: ex.notes || '',
      animation_url: ex.animation_url || null,
    })),
    members: [],
    usageCount: db.usage_count || 0,
    thumbnail: db.thumbnail || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
    videoUrl: db.video_url || undefined,
  });

  // Convert database workouts to frontend format
  const mappedWorkouts = useMemo(() => dbWorkouts.map(mapDbToFrontend), [dbWorkouts]);

  // State management - initialized empty, updated by database
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  // Sync database workouts to state
  useEffect(() => {
    if (mappedWorkouts.length > 0) {
      setWorkouts(mappedWorkouts);
    }
  }, [mappedWorkouts]);
  const [searchQuery, setSearchQuery] = useState('');
  const [bodyPartFilter, setBodyPartFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quickFilter, setQuickFilter] = useState<string | null>(null);

  // Dialog states
  const [viewingWorkout, setViewingWorkout] = useState<Workout | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [assigningWorkout, setAssigningWorkout] = useState<Workout | null>(null);
  const [deletingWorkout, setDeletingWorkout] = useState<Workout | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Bulk selection
  const [selectedWorkouts, setSelectedWorkouts] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Loading state (simulated)
  const [isLoading, setIsLoading] = useState(false);

  // Page-level tab state
  const [activeTab, setActiveTab] = useState<'workouts' | 'assignments'>('workouts');

  // Filter and sort workouts
  const filteredWorkouts = useMemo(() => {
    let filtered = workouts.filter((workout) => {
      const matchesSearch = workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workout.trainer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBodyPart = bodyPartFilter === 'all' || workout.bodyPart === bodyPartFilter;
      const matchesDifficulty = difficultyFilter === 'all' || workout.difficulty === difficultyFilter;
      const matchesEquipment = equipmentFilter === 'all' || workout.equipment === equipmentFilter;
      return matchesSearch && matchesBodyPart && matchesDifficulty && matchesEquipment;
    });

    // Apply quick filters
    if (quickFilter === 'most-used') {
      filtered = filtered.filter((w) => w.usageCount >= 100);
    } else if (quickFilter === 'beginner') {
      filtered = filtered.filter((w) => w.difficulty === 'beginner');
    }

    // Sort
    switch (sortBy) {
      case 'popularity':
        filtered.sort((a, b) => b.usageCount - a.usageCount);
        break;
      case 'recent':
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'duration':
        filtered.sort((a, b) => a.duration - b.duration);
        break;
    }

    return filtered;
  }, [workouts, searchQuery, bodyPartFilter, difficultyFilter, equipmentFilter, sortBy, quickFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredWorkouts.length / itemsPerPage);
  const paginatedWorkouts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredWorkouts.slice(start, start + itemsPerPage);
  }, [filteredWorkouts, currentPage, itemsPerPage]);

  // Reset page when filters change
  const handleFilterChange = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const mostUsedWorkout = workouts.length > 0
    ? workouts.reduce((prev, curr) => prev.usageCount > curr.usageCount ? prev : curr)
    : null;

  const equipmentDistribution = [
    { name: 'Free Weights', value: workouts.filter(w => w.equipment === 'free-weights').length },
    { name: 'Machines', value: workouts.filter(w => w.equipment === 'machines').length },
    { name: 'Bodyweight', value: workouts.filter(w => w.equipment === 'bodyweight').length },
    { name: 'Mixed', value: workouts.filter(w => w.equipment === 'mixed').length },
  ];

  const getMemberNames = (memberIds: string[]) => {
    return memberIds.map(id => members.find(m => m.id === id)?.name || 'Unknown');
  };

  // CRUD handlers
  const handleSaveWorkout = (workout: Workout) => {
    setWorkouts((prev) => {
      const exists = prev.find((w) => w.id === workout.id);
      if (exists) {
        return prev.map((w) => (w.id === workout.id ? workout : w));
      }
      return [...prev, workout];
    });
  };

  const handleDeleteWorkout = (workoutId: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
    setDeletingWorkout(null);
    toast.success('Workout deleted successfully');
  };

  const handleDuplicateWorkout = (workout: Workout) => {
    setWorkouts((prev) => [...prev, workout]);
  };

  const handleAssignMembers = async (workoutId: string, memberIds: string[], options: any) => {
    // Update local state
    setWorkouts((prev) =>
      prev.map((w) =>
        w.id === workoutId ? { ...w, members: memberIds } : w
      )
    );

    // Save each assignment to the database
    try {
      for (const memberId of memberIds) {
        await createWorkoutAssignment.mutateAsync({
          workout_id: workoutId,
          member_id: memberId,
          start_date: options.startDate,
          end_date: options.endDate,
          active_days: options.activeDays,
          notify: options.notify,
          notes: options.notes || null,
          status: 'active',
        });
      }
    } catch (error) {
      console.error('Error saving workout assignments:', error);
      toast.error('Failed to save some assignments to database');
    }
  };

  // Bulk action handlers
  const handleBulkAssign = (workoutIds: string[]) => {
    const firstWorkout = workouts.find((w) => workoutIds.includes(w.id));
    if (firstWorkout) {
      setAssigningWorkout(firstWorkout);
    }
  };

  const handleBulkDuplicate = (workoutIds: string[]) => {
    const duplicated = workouts
      .filter((w) => workoutIds.includes(w.id))
      .map((w) => ({
        ...w,
        id: `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${w.name} (Copy)`,
        members: [],
        usageCount: 0,
      }));
    setWorkouts((prev) => [...prev, ...duplicated]);
    setSelectedWorkouts([]);
    toast.success(`Duplicated ${duplicated.length} workout(s)`);
  };

  const handleBulkDelete = (workoutIds: string[]) => {
    setWorkouts((prev) => prev.filter((w) => !workoutIds.includes(w.id)));
    setSelectedWorkouts([]);
    toast.success(`Deleted ${workoutIds.length} workout(s)`);
  };

  const handleToggleSelection = (workoutId: string) => {
    setSelectedWorkouts((prev) =>
      prev.includes(workoutId)
        ? prev.filter((id) => id !== workoutId)
        : [...prev, workoutId]
    );
  };

  const handleSelectAll = () => {
    if (selectedWorkouts.length === paginatedWorkouts.length) {
      setSelectedWorkouts([]);
    } else {
      setSelectedWorkouts(paginatedWorkouts.map((w) => w.id));
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setBodyPartFilter('all');
    setDifficultyFilter('all');
    setEquipmentFilter('all');
    setQuickFilter(null);
    setCurrentPage(1);
  };

  const handleMemberClick = (memberId: string) => {
    navigate(`/membership?member=${memberId}`);
  };

  const WorkoutCard = ({ workout }: { workout: Workout }) => {
    const isSelected = selectedWorkouts.includes(workout.id);

    return (
      <Card className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden ${isSelected ? 'ring-2 ring-primary' : ''}`}>
        <div className="relative h-44 overflow-hidden">
          <img
            src={workout.thumbnail}
            alt={workout.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Selection checkbox */}
          <div className="absolute top-3 left-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => handleToggleSelection(workout.id)}
              className="h-5 w-5 bg-black/50 border-white/50 data-[state=checked]:bg-primary"
            />
          </div>

          {/* Top badges */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <Badge style={{ backgroundColor: bodyPartColors[workout.bodyPart] }}>
              {bodyPartLabels[workout.bodyPart]}
            </Badge>
            <Badge variant="outline" className="bg-black/50 text-white border-white/20">
              {workout.duration} min
            </Badge>
          </div>

          {/* Play button overlay */}
          {workout.videoUrl && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30">
                <Play className="h-6 w-6 text-white" fill="white" />
              </Button>
            </div>
          )}

          {/* Bottom info */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-semibold truncate">{workout.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className="text-xs border-white/30"
                style={{ color: difficultyColors[workout.difficulty] }}
              >
                {difficultyLabels[workout.difficulty]}
              </Badge>
              <span className="text-white/70 text-xs">{workout.exercises.length} exercises</span>
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={trainers.find(t => t.id === workout.trainerId)?.photo} />
                <AvatarFallback>{workout.trainer.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">{workout.trainer}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span className="text-xs">{workout.usageCount} uses</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {workout.members.length} member{workout.members.length !== 1 ? 's' : ''} assigned
            </span>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => setViewingWorkout(workout)}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditingWorkout(workout)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAssigningWorkout(workout)}>
            <UserPlus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeletingWorkout(workout)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Workout Management"
        description="Manage workout routines and member assignments."
      />

      {/* Page-level tabs: Workouts vs Assignments */}
      <div className="flex items-center gap-4 border-b pb-4">
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'workouts' ? 'default' : 'outline'}
            onClick={() => setActiveTab('workouts')}
            className="gap-2"
          >
            <Dumbbell className="h-4 w-4" />
            Workouts
          </Button>
          <Button
            variant={activeTab === 'assignments' ? 'default' : 'outline'}
            onClick={() => setActiveTab('assignments')}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Assignments
          </Button>
        </div>
        {activeTab === 'workouts' && (
          <Button className="ml-auto gap-2" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Workout
          </Button>
        )}
      </div>

      {activeTab === 'assignments' ? (
        <WorkoutAssignmentsTab
          onAssignNew={() => {
            // Open the assign dialog with the first workout if available
            // Use mappedWorkouts directly from DB instead of local state
            if (mappedWorkouts.length > 0) {
              setAssigningWorkout(mappedWorkouts[0]);
            } else if (workouts.length > 0) {
              setAssigningWorkout(workouts[0]);
            } else {
              toast.error('No workouts available. Create a workout first.');
            }
          }}
        />
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Routines"
              value={workouts.length}
              icon={Dumbbell}
              variant="primary"
            />
            <StatCard
              title="Most Used"
              value={mostUsedWorkout?.name?.split(' ').slice(0, 2).join(' ') || 'N/A'}
              subtitle={mostUsedWorkout ? `${mostUsedWorkout.usageCount} uses` : 'No data'}
              icon={Zap}
              variant="success"
            />
            <StatCard
              title="Avg Duration"
              value={workouts.length > 0 ? `${Math.round(workouts.reduce((acc, w) => acc + w.duration, 0) / workouts.length)} min` : 'N/A'}
              icon={Clock}
            />
            <Card className="p-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">Equipment Usage</p>
              <div className="h-[60px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={equipmentDistribution} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" hide />
                    <Bar dataKey="value" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Bulk Actions Bar */}
          {selectedWorkouts.length > 0 && (
            <WorkoutBulkActions
              selectedWorkouts={selectedWorkouts}
              workouts={workouts}
              onClearSelection={() => setSelectedWorkouts([])}
              onSelectAll={handleSelectAll}
              onBulkAssign={handleBulkAssign}
              onBulkDuplicate={handleBulkDuplicate}
              onBulkDelete={handleBulkDelete}
              totalCount={paginatedWorkouts.length}
            />
          )}

          {/* Tabs for body parts */}
          <Tabs value={bodyPartFilter} onValueChange={(v) => { setBodyPartFilter(v); handleFilterChange(); }}>
            <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              {Object.entries(bodyPartLabels).map(([value, label]) => (
                <TabsTrigger key={value} value={value} className="text-xs">
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Filters */}
          <div className="filter-bar">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workouts..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); handleFilterChange(); }}
                className="pl-9"
              />
            </div>

            <Select value={difficultyFilter} onValueChange={(v) => { setDifficultyFilter(v); handleFilterChange(); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={equipmentFilter} onValueChange={(v) => { setEquipmentFilter(v); handleFilterChange(); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Equipment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Equipment</SelectItem>
                <SelectItem value="free-weights">Free Weights</SelectItem>
                <SelectItem value="machines">Machines</SelectItem>
                <SelectItem value="bodyweight">Bodyweight</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Sort
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {SORT_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={sortBy === option.value ? 'bg-accent' : ''}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Quick Filter
                  {quickFilter && <Badge variant="secondary" className="ml-1">{quickFilter}</Badge>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setQuickFilter(null)}>
                  Clear Filter
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {QUICK_FILTERS.map((filter) => (
                  <DropdownMenuItem
                    key={filter.id}
                    onClick={() => setQuickFilter(filter.id)}
                    className={quickFilter === filter.id ? 'bg-accent' : ''}
                  >
                    <filter.icon className="h-4 w-4 mr-2" />
                    {filter.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

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

          {/* Loading State */}
          {isLoading ? (
            <WorkoutGridSkeleton count={itemsPerPage} />
          ) : paginatedWorkouts.length === 0 ? (
            workouts.length === 0 ? (
              <EmptyWorkoutState type="no-workouts" onCreateClick={() => setIsCreateDialogOpen(true)} />
            ) : (
              <EmptyWorkoutState type="no-results" onClearFilters={clearAllFilters} />
            )
          ) : (
            <>
              {/* Workouts Grid/List */}
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-4'}>
                {paginatedWorkouts.map((workout) => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
              </div>

              {/* Pagination */}
              <WorkoutPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredWorkouts.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(count) => { setItemsPerPage(count); setCurrentPage(1); }}
              />
            </>
          )}

          {/* View Workout Dialog */}
          <Dialog open={!!viewingWorkout} onOpenChange={() => setViewingWorkout(null)}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              {viewingWorkout && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      {viewingWorkout.name}
                      <Badge style={{ backgroundColor: bodyPartColors[viewingWorkout.bodyPart] }}>
                        {bodyPartLabels[viewingWorkout.bodyPart]}
                      </Badge>
                    </DialogTitle>
                    <DialogDescription>
                      Created by {viewingWorkout.trainer} • {viewingWorkout.duration} minutes • {difficultyLabels[viewingWorkout.difficulty]}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="p-4 bg-primary/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">{viewingWorkout.exercises.length}</p>
                        <p className="text-xs text-muted-foreground">Exercises</p>
                      </div>
                      <div className="p-4 bg-success/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-success">{viewingWorkout.duration}</p>
                        <p className="text-xs text-muted-foreground">Minutes</p>
                      </div>
                      <div className="p-4 bg-warning/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-warning">{viewingWorkout.usageCount}</p>
                        <p className="text-xs text-muted-foreground">Uses</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-2xl font-bold">{viewingWorkout.members.length}</p>
                        <p className="text-xs text-muted-foreground">Assigned</p>
                      </div>
                    </div>

                    {/* Exercises List */}
                    <div className="space-y-3">
                      <h4 className="font-semibold">Exercises</h4>
                      {viewingWorkout.exercises.map((exercise, idx) => (
                        <div key={idx} className="p-4 bg-muted/50 rounded-lg flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            {/* Exercise Animation from Database */}
                            <ExerciseAnimationPlayer
                              animationUrl={exercise.animation_url}
                              className="h-16 w-16"
                            />
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-medium">{exercise.name}</p>
                              {exercise.notes && (
                                <p className="text-xs text-muted-foreground">{exercise.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{exercise.sets} × {exercise.reps}</p>
                            <p className="text-xs text-muted-foreground">Rest: {exercise.rest}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Assigned Members */}
                    {viewingWorkout.members.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Assigned Members ({viewingWorkout.members.length})</h4>
                        <div className="flex flex-wrap gap-2">
                          {getMemberNames(viewingWorkout.members).map((name, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="cursor-pointer hover:bg-secondary/80"
                              onClick={() => handleMemberClick(viewingWorkout.members[idx])}
                            >
                              {name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setViewingWorkout(null)}>
                      Close
                    </Button>
                    <Button onClick={() => {
                      setViewingWorkout(null);
                      setEditingWorkout(viewingWorkout);
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Workout
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit/Create Workout Dialog */}
          <EditWorkoutDialog
            workout={isCreateDialogOpen ? null : editingWorkout}
            open={isCreateDialogOpen || !!editingWorkout}
            onOpenChange={(open) => {
              if (!open) {
                setIsCreateDialogOpen(false);
                setEditingWorkout(null);
              }
            }}
            onSave={handleSaveWorkout}
            onDelete={handleDeleteWorkout}
            onDuplicate={handleDuplicateWorkout}
          />

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={!!deletingWorkout} onOpenChange={(open) => !open && setDeletingWorkout(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Workout?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the workout
                  "{deletingWorkout?.name}"{deletingWorkout?.members.length ? ` and remove it from ${deletingWorkout.members.length} assigned member(s)` : ''}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deletingWorkout && handleDeleteWorkout(deletingWorkout.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Workout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      {/* Assign Members Dialog - Rendered outside tab conditional so it's always available */}
      <AssignMembersDialog
        workout={assigningWorkout}
        open={!!assigningWorkout}
        onOpenChange={(open) => !open && setAssigningWorkout(null)}
        onAssign={handleAssignMembers}
      />
    </div>
  );
};

export default AllWorkout;
