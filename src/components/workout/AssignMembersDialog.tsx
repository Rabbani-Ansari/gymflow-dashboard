import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Users,
  Calendar,
  Bell,
  Check,
  UserPlus,
} from 'lucide-react';
import { Workout } from '@/types';
import { useMembers, Member } from '@/hooks/useMembers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface AssignMembersDialogProps {
  workout: Workout | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (workoutId: string, memberIds: string[], options: AssignmentOptions) => void;
}

interface AssignmentOptions {
  startDate: string;
  endDate: string;
  activeDays: string[];
  notify: boolean;
  notes: string;
}

type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

const DAYS_OF_WEEK: { value: DayOfWeek; label: string; short: string }[] = [
  { value: 'sunday', label: 'Sunday', short: 'S' },
  { value: 'monday', label: 'Monday', short: 'M' },
  { value: 'tuesday', label: 'Tuesday', short: 'T' },
  { value: 'wednesday', label: 'Wednesday', short: 'W' },
  { value: 'thursday', label: 'Thursday', short: 'T' },
  { value: 'friday', label: 'Friday', short: 'F' },
  { value: 'saturday', label: 'Saturday', short: 'S' },
];

const DAY_PRESETS = [
  { label: 'Weekdays', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as DayOfWeek[] },
  { label: 'Weekends', days: ['saturday', 'sunday'] as DayOfWeek[] },
  { label: 'All Days', days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as DayOfWeek[] },
  { label: 'MWF', days: ['monday', 'wednesday', 'friday'] as DayOfWeek[] },
  { label: 'TTS', days: ['tuesday', 'thursday', 'saturday'] as DayOfWeek[] },
];

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'trial', label: 'Trial' },
  { value: 'expired', label: 'Expired' },
];

export const AssignMembersDialog = ({
  workout,
  open,
  onOpenChange,
  onAssign,
}: AssignMembersDialogProps) => {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Assignment options
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeDays, setActiveDays] = useState<DayOfWeek[]>(['monday', 'wednesday', 'friday']);
  const [notify, setNotify] = useState(true);
  const [notes, setNotes] = useState('');

  // Fetch members from database
  const { data: members = [], isLoading: isLoadingMembers } = useMembers();

  useEffect(() => {
    if (workout && open) {
      setSelectedMembers(workout.members || []);
      // Set default dates
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setStartDate(today.toISOString().split('T')[0]);
      setEndDate(nextMonth.toISOString().split('T')[0]);
    }
  }, [workout, open]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.phone.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [members, searchQuery, statusFilter]);

  const handleToggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredMembers.map((m) => m.id);
    const allSelected = allFilteredIds.every((id) => selectedMembers.includes(id));
    if (allSelected) {
      setSelectedMembers((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      setSelectedMembers((prev) => [...new Set([...prev, ...allFilteredIds])]);
    }
  };

  const handleAssign = () => {
    if (selectedMembers.length === 0) {
      toast.error('Please select at least one member');
      return;
    }
    if (!startDate || !endDate) {
      toast.error('Please set start and end dates');
      return;
    }

    onAssign(workout!.id, selectedMembers, {
      startDate,
      endDate,
      activeDays,
      notify,
      notes,
    });

    if (notify) {
      toast.success(`Assigned to ${selectedMembers.length} member(s) with notifications.`);
    } else {
      toast.success(`Assigned to ${selectedMembers.length} member(s) without notifications.`);
    }

    onOpenChange(false);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'expired':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'trial':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return '';
    }
  };

  if (!workout) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[950px] h-[90vh] max-h-[800px] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">Assign Members to Workout</DialogTitle>
              <DialogDescription className="text-sm">
                {workout.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5 h-full">
            {/* Left: Member Selection (3/5) */}
            <div className="lg:col-span-3 border-r flex flex-col h-full">
              {/* Search & Filter Bar */}
              <div className="p-4 border-b bg-background flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[100px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_FILTERS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-normal">
                      {selectedMembers.length} selected
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      of {filteredMembers.length} members
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-7 text-xs"
                  >
                    {filteredMembers.every((m) => selectedMembers.includes(m.id))
                      ? 'Deselect All'
                      : 'Select All'}
                  </Button>
                </div>
              </div>

              {/* Member List */}
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {isLoadingMembers ? (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">
                      <div className="text-center">
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                        <p className="text-sm">Loading members...</p>
                      </div>
                    </div>
                  ) : filteredMembers.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">
                      <div className="text-center">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No members found</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredMembers.map((member) => {
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
                              <AvatarImage src={member.photo || undefined} alt={member.name} />
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
                              className={`text-xs capitalize ${getStatusBadgeVariant(member.status)}`}
                            >
                              {member.status}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Right: Assignment Options (2/5) */}
            <div className="lg:col-span-2 bg-muted/20 flex flex-col h-full">
              <ScrollArea className="flex-1">
                <div className="p-5 space-y-5">
                  {/* Schedule Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-sm">Schedule</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Start Date</Label>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">End Date</Label>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Active Days Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm">Active Days</h4>
                      <span className="text-xs text-muted-foreground">
                        {activeDays.length}/7 days
                      </span>
                    </div>

                    {/* Preset Buttons */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {DAY_PRESETS.map((preset) => {
                        const isActive = preset.days.length === activeDays.length &&
                          preset.days.every(d => activeDays.includes(d));
                        return (
                          <Button
                            key={preset.label}
                            type="button"
                            variant={isActive ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 px-2.5 text-xs font-medium"
                            onClick={() => setActiveDays(preset.days)}
                          >
                            {preset.label}
                          </Button>
                        );
                      })}
                    </div>

                    {/* Day Toggle Buttons */}
                    <div className="flex gap-1">
                      {DAYS_OF_WEEK.map((day, index) => (
                        <button
                          key={day.value}
                          type="button"
                          className={`flex-1 h-9 rounded-md text-xs font-semibold transition-all ${activeDays.includes(day.value)
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                            }`}
                          onClick={() => {
                            setActiveDays((prev) =>
                              prev.includes(day.value)
                                ? prev.filter((d) => d !== day.value)
                                : [...prev, day.value]
                            );
                          }}
                          title={day.label}
                        >
                          {day.short}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notification Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-background border">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bell className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Notification</p>
                        <p className="text-xs text-muted-foreground">Send in-app notification</p>
                      </div>
                    </div>
                    <Switch checked={notify} onCheckedChange={setNotify} />
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Notes (optional)</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any notes for this assignment..."
                      rows={2}
                      className="resize-none text-sm"
                    />
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Footer - Always visible */}
        <DialogFooter className="px-6 py-4 border-t bg-background flex-shrink-0 gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={selectedMembers.length === 0}
            className="min-w-[160px] gap-2"
          >
            <Check className="h-4 w-4" />
            Assign to {selectedMembers.length} Member{selectedMembers.length !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
