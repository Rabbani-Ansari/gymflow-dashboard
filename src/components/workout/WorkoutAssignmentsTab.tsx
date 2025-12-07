import { useState, useMemo } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Calendar, Users, Dumbbell, Bell, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
    useWorkoutAssignments,
    useUpdateWorkoutAssignment,
    useDeleteWorkoutAssignment,
    WorkoutAssignment
} from '@/hooks/useWorkoutAssignments';
import { useWorkouts } from '@/hooks/useWorkouts';

interface WorkoutAssignmentsTabProps {
    onAssignNew: () => void;
}

const STATUS_COLORS = {
    active: 'bg-green-500/10 text-green-600 border-green-500/20',
    completed: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
};

type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

const DAYS_OF_WEEK: { value: DayOfWeek; label: string; short: string }[] = [
    { value: 'sunday', label: 'Sunday', short: 'Sun' },
    { value: 'monday', label: 'Monday', short: 'Mon' },
    { value: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { value: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { value: 'thursday', label: 'Thursday', short: 'Thu' },
    { value: 'friday', label: 'Friday', short: 'Fri' },
    { value: 'saturday', label: 'Saturday', short: 'Sat' },
];

const DAY_PRESETS = [
    { label: 'Weekdays', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as DayOfWeek[] },
    { label: 'Weekends', days: ['saturday', 'sunday'] as DayOfWeek[] },
    { label: 'All Days', days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as DayOfWeek[] },
    { label: 'Mon/Wed/Fri', days: ['monday', 'wednesday', 'friday'] as DayOfWeek[] },
    { label: 'Tue/Thu/Sat', days: ['tuesday', 'thursday', 'saturday'] as DayOfWeek[] },
];

export const WorkoutAssignmentsTab = ({ onAssignNew }: WorkoutAssignmentsTabProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [viewingAssignment, setViewingAssignment] = useState<WorkoutAssignment | null>(null);
    const [editingAssignment, setEditingAssignment] = useState<WorkoutAssignment | null>(null);
    const [deletingAssignment, setDeletingAssignment] = useState<WorkoutAssignment | null>(null);

    // Edit form state
    const [editStartDate, setEditStartDate] = useState('');
    const [editEndDate, setEditEndDate] = useState('');
    const [editActiveDays, setEditActiveDays] = useState<string[]>([]);
    const [editStatus, setEditStatus] = useState<'active' | 'completed' | 'cancelled'>('active');
    const [editNotify, setEditNotify] = useState(true);
    const [editNotes, setEditNotes] = useState('');

    // Fetch data from database
    const { data: assignments = [], isLoading: isLoadingAssignments } = useWorkoutAssignments();
    const { data: dbWorkouts = [] } = useWorkouts();
    const updateAssignment = useUpdateWorkoutAssignment();
    const deleteAssignment = useDeleteWorkoutAssignment();

    // Filter assignments
    const filteredAssignments = useMemo(() => {
        return assignments.filter((assignment) => {
            const matchesSearch =
                assignment.member?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                assignment.workout?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                assignment.member?.email?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [assignments, searchQuery, statusFilter]);

    // Stats
    const activeAssignments = assignments.filter(a => a.status === 'active').length;
    const completedAssignments = assignments.filter(a => a.status === 'completed').length;

    const handleOpenEdit = (assignment: WorkoutAssignment) => {
        setEditingAssignment(assignment);
        setEditStartDate(assignment.start_date || format(new Date(), 'yyyy-MM-dd'));
        setEditEndDate(assignment.end_date || format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
        setEditActiveDays(assignment.active_days || ['monday', 'wednesday', 'friday']);
        setEditStatus(assignment.status);
        setEditNotify(assignment.notify ?? true);
        setEditNotes(assignment.notes || '');
    };

    const handleSaveEdit = async () => {
        if (!editingAssignment) return;

        try {
            await updateAssignment.mutateAsync({
                id: editingAssignment.id,
                start_date: editStartDate,
                end_date: editEndDate,
                active_days: editActiveDays,
                status: editStatus,
                notify: editNotify,
                notes: editNotes || null,
            });
            toast.success('Assignment updated successfully');
            setEditingAssignment(null);
        } catch (error) {
            toast.error('Failed to update assignment');
        }
    };

    const handleDeleteAssignment = async (assignment: WorkoutAssignment) => {
        try {
            await deleteAssignment.mutateAsync(assignment.id);
            toast.success(`Removed workout assignment for ${assignment.member?.name}`);
            setDeletingAssignment(null);
        } catch (error) {
            toast.error('Failed to delete assignment');
        }
    };

    const formatActiveDays = (days: string[] | null) => {
        if (!days || days.length === 0) return 'Not set';
        if (days.length === 7) return 'All Days';
        if (days.length === 5 && !days.includes('saturday') && !days.includes('sunday')) return 'Weekdays';
        if (days.length === 2 && days.includes('saturday') && days.includes('sunday')) return 'Weekends';
        return days.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ');
    };

    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl border p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{assignments.length}</p>
                            <p className="text-xs text-muted-foreground">Total Assignments</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <Dumbbell className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{activeAssignments}</p>
                            <p className="text-xs text-muted-foreground">Active</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{completedAssignments}</p>
                            <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <Bell className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{dbWorkouts.length}</p>
                            <p className="text-xs text-muted-foreground">Workouts Available</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by member or workout name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'active', 'completed', 'cancelled'].map((status) => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setStatusFilter(status)}
                            className="capitalize"
                        >
                            {status === 'all' ? 'All' : status}
                        </Button>
                    ))}
                </div>
                <Button className="ml-auto gap-2" onClick={onAssignNew}>
                    <Plus className="h-4 w-4" />
                    New Assignment
                </Button>
            </div>

            {/* Assignments Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold">Workout Assignments</h3>
                    <p className="text-sm text-muted-foreground">View and manage member workout assignments</p>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Member</TableHead>
                            <TableHead>Workout</TableHead>
                            <TableHead>Active Days</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoadingAssignments ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    Loading assignments...
                                </TableCell>
                            </TableRow>
                        ) : filteredAssignments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    {assignments.length === 0
                                        ? 'No workout assignments yet. Click "New Assignment" to create one.'
                                        : 'No assignments match your search criteria.'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAssignments.map((assignment) => (
                                <TableRow key={assignment.id} className="data-table-row">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={assignment.member?.photo || undefined} alt={assignment.member?.name} />
                                                <AvatarFallback>{assignment.member?.name?.charAt(0) || '?'}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-sm">{assignment.member?.name || 'Unknown'}</p>
                                                <p className="text-xs text-muted-foreground">{assignment.member?.email || ''}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm font-medium">
                                        {assignment.workout?.name || 'Unknown Workout'}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {formatActiveDays(assignment.active_days)}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {assignment.start_date ? format(new Date(assignment.start_date), 'MMM dd, yyyy') : 'Not set'}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {assignment.end_date ? format(new Date(assignment.end_date), 'MMM dd, yyyy') : 'Ongoing'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={STATUS_COLORS[assignment.status]}>
                                            {assignment.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setViewingAssignment(assignment)}
                                                aria-label={`View assignment for ${assignment.member?.name}`}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenEdit(assignment)}
                                                aria-label={`Edit assignment for ${assignment.member?.name}`}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => setDeletingAssignment(assignment)}
                                                aria-label={`Delete assignment for ${assignment.member?.name}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* View Assignment Dialog */}
            <Dialog open={!!viewingAssignment} onOpenChange={() => setViewingAssignment(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    {viewingAssignment && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Workout Assignment Details</DialogTitle>
                                <DialogDescription>
                                    View workout assignment for {viewingAssignment.member?.name}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                {/* Member Info */}
                                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={viewingAssignment.member?.photo || undefined} alt={viewingAssignment.member?.name} />
                                        <AvatarFallback className="text-xl">{viewingAssignment.member?.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold">{viewingAssignment.member?.name}</h3>
                                        <p className="text-sm text-muted-foreground">{viewingAssignment.member?.email}</p>
                                    </div>
                                    <Badge variant="outline" className={STATUS_COLORS[viewingAssignment.status]}>
                                        {viewingAssignment.status}
                                    </Badge>
                                </div>

                                {/* Assignment Details */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <p className="text-xs text-muted-foreground mb-1">Workout</p>
                                        <p className="font-medium">{viewingAssignment.workout?.name}</p>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <p className="text-xs text-muted-foreground mb-1">Active Days</p>
                                        <p className="font-medium">{formatActiveDays(viewingAssignment.active_days)}</p>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                                        <p className="font-medium">
                                            {viewingAssignment.start_date
                                                ? format(new Date(viewingAssignment.start_date), 'MMM dd, yyyy')
                                                : 'Not set'}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <p className="text-xs text-muted-foreground mb-1">End Date</p>
                                        <p className="font-medium">
                                            {viewingAssignment.end_date
                                                ? format(new Date(viewingAssignment.end_date), 'MMM dd, yyyy')
                                                : 'Ongoing'}
                                        </p>
                                    </div>
                                </div>

                                {/* Notifications */}
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-xs text-muted-foreground mb-1">Notifications</p>
                                    <p className="font-medium">{viewingAssignment.notify ? 'Enabled' : 'Disabled'}</p>
                                </div>

                                {viewingAssignment.notes && (
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <p className="text-xs text-muted-foreground mb-1">Notes</p>
                                        <p className="text-sm">{viewingAssignment.notes}</p>
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setViewingAssignment(null)}>
                                    Close
                                </Button>
                                <Button onClick={() => {
                                    handleOpenEdit(viewingAssignment);
                                    setViewingAssignment(null);
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
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    {editingAssignment && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Edit Assignment</DialogTitle>
                                <DialogDescription>
                                    Modify workout assignment for {editingAssignment.member?.name}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                                {/* Member & Workout Summary */}
                                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Member</p>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={editingAssignment.member?.photo || undefined} />
                                                <AvatarFallback>{editingAssignment.member?.name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <p className="font-medium text-sm">{editingAssignment.member?.name}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Workout</p>
                                        <p className="font-medium text-sm">{editingAssignment.workout?.name}</p>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select value={editStatus} onValueChange={(v) => setEditStatus(v as any)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Start Date</Label>
                                        <Input
                                            type="date"
                                            value={editStartDate}
                                            onChange={(e) => setEditStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Date</Label>
                                        <Input
                                            type="date"
                                            value={editEndDate}
                                            onChange={(e) => setEditEndDate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Active Days */}
                                <div className="space-y-3">
                                    <Label>Select Active Days</Label>
                                    <div className="flex flex-wrap gap-1">
                                        {DAY_PRESETS.map((preset) => (
                                            <Button
                                                key={preset.label}
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="text-xs h-7"
                                                onClick={() => setEditActiveDays(preset.days)}
                                            >
                                                {preset.label}
                                            </Button>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {DAYS_OF_WEEK.map((day) => (
                                            <Button
                                                key={day.value}
                                                type="button"
                                                variant={editActiveDays.includes(day.value) ? 'default' : 'outline'}
                                                size="sm"
                                                className="text-xs h-8 w-10"
                                                onClick={() => {
                                                    setEditActiveDays((prev) =>
                                                        prev.includes(day.value)
                                                            ? prev.filter((d) => d !== day.value)
                                                            : [...prev, day.value]
                                                    );
                                                }}
                                            >
                                                {day.short}
                                            </Button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {editActiveDays.length} day{editActiveDays.length !== 1 ? 's' : ''} selected
                                    </p>
                                </div>

                                {/* Notification */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Bell className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Notification</span>
                                        <span className="text-xs text-muted-foreground">(In-app)</span>
                                    </div>
                                    <Switch checked={editNotify} onCheckedChange={setEditNotify} />
                                </div>

                                {/* Notes */}
                                <div className="space-y-2">
                                    <Label>Notes</Label>
                                    <Textarea
                                        value={editNotes}
                                        onChange={(e) => setEditNotes(e.target.value)}
                                        placeholder="Add any notes for this assignment..."
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingAssignment(null)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSaveEdit} disabled={updateAssignment.isPending}>
                                    <Check className="h-4 w-4 mr-2" />
                                    {updateAssignment.isPending ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingAssignment} onOpenChange={() => setDeletingAssignment(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Assignment?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove the workout "{deletingAssignment?.workout?.name}" assignment from {deletingAssignment?.member?.name}.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingAssignment && handleDeleteAssignment(deletingAssignment)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteAssignment.isPending ? 'Removing...' : 'Remove Assignment'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
