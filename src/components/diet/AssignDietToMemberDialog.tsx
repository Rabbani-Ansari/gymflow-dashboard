import { useState, useMemo } from 'react';
import { Search, Calendar, Check, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DietPlan, Member } from '@/types';
import { members as allMembers } from '@/data/mockData';
import { DayOfWeek } from '@/types/memberDiet';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AssignDietToMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: DietPlan | null;
  onAssign: (memberId: string, days: DayOfWeek[], startDate: Date, endDate?: Date) => void;
}

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

export const AssignDietToMemberDialog = ({
  open,
  onOpenChange,
  plan,
  onAssign,
}: AssignDietToMemberDialogProps) => {
  const [step, setStep] = useState<'select-member' | 'configure'>('select-member');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(['monday', 'wednesday', 'friday']);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [hasEndDate, setHasEndDate] = useState(false);

  // Filter out already assigned members
  const availableMembers = useMemo(() => {
    return allMembers.filter((member) => {
      const isAssigned = plan?.members.includes(member.id);
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase());
      return !isAssigned && matchesSearch;
    });
  }, [plan, searchQuery]);

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const applyPreset = (preset: DayOfWeek[]) => {
    setSelectedDays(preset);
  };

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setStep('configure');
  };

  const handleBack = () => {
    setStep('select-member');
  };

  const handleAssign = () => {
    if (!selectedMember || selectedDays.length === 0) {
      toast.error('Please select at least one day');
      return;
    }
    onAssign(selectedMember.id, selectedDays, startDate, hasEndDate ? endDate : undefined);
    toast.success(`Diet plan assigned to ${selectedMember.name}`);
    handleClose();
  };

  const handleClose = () => {
    setStep('select-member');
    setSearchQuery('');
    setSelectedMember(null);
    setSelectedDays(['monday', 'wednesday', 'friday']);
    setStartDate(new Date());
    setEndDate(undefined);
    setHasEndDate(false);
    onOpenChange(false);
  };

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {step === 'select-member' ? 'Select Member' : `Configure Diet for ${selectedMember?.name}`}
          </DialogTitle>
          <DialogDescription>
            {step === 'select-member'
              ? `Assign "${plan.name}" to a member`
              : 'Choose which days and duration for this diet plan'}
          </DialogDescription>
        </DialogHeader>

        {step === 'select-member' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Members List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {availableMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'No members found' : 'All members are already assigned to this plan'}
                </div>
              ) : (
                availableMembers.map((member) => (
                  <Card
                    key={member.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleSelectMember(member)}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.photo} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          member.status === 'active' && 'bg-success/10 text-success border-success/20',
                          member.status === 'expired' && 'bg-destructive/10 text-destructive border-destructive/20',
                          member.status === 'trial' && 'bg-warning/10 text-warning border-warning/20'
                        )}
                      >
                        {member.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {step === 'configure' && selectedMember && (
          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            {/* Selected Member Summary */}
            <Card className="bg-muted/50">
              <CardContent className="p-3 flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedMember.photo} alt={selectedMember.name} />
                  <AvatarFallback>{selectedMember.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{selectedMember.name}</p>
                  <p className="text-xs text-muted-foreground">Assigning: {plan.name}</p>
                </div>
                <Check className="h-5 w-5 text-success" />
              </CardContent>
            </Card>

            {/* Day Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Select Active Days</Label>
              
              {/* Presets */}
              <div className="flex flex-wrap gap-2">
                {DAY_PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    variant={
                      JSON.stringify(selectedDays.sort()) === JSON.stringify(preset.days.sort())
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() => applyPreset(preset.days)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>

              {/* Day Checkboxes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DAYS_OF_WEEK.map((day) => (
                  <label
                    key={day.value}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all',
                      selectedDays.includes(day.value)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <Checkbox
                      checked={selectedDays.includes(day.value)}
                      onCheckedChange={() => toggleDay(day.value)}
                    />
                    <span className="text-sm font-medium">{day.label}</span>
                  </label>
                ))}
              </div>

              {selectedDays.length === 0 && (
                <p className="text-sm text-destructive">Please select at least one day</p>
              )}
            </div>

            {/* Date Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Schedule</Label>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-2">
                  <Label className="text-sm">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(startDate, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">End Date</Label>
                    <label className="flex items-center gap-2 text-xs">
                      <Checkbox
                        checked={hasEndDate}
                        onCheckedChange={(checked) => setHasEndDate(!!checked)}
                      />
                      Set end date
                    </label>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        disabled={!hasEndDate}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {hasEndDate && endDate ? format(endDate, 'PPP') : 'No end date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={(date) => date < startDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Summary */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Assignment Summary</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Member:</span> {selectedMember.name}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Plan:</span> {plan.name}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Active Days:</span>{' '}
                    {selectedDays.length > 0
                      ? selectedDays.map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ')
                      : 'None selected'}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Duration:</span>{' '}
                    {format(startDate, 'MMM d, yyyy')} - {hasEndDate && endDate ? format(endDate, 'MMM d, yyyy') : 'Ongoing'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter className="mt-4">
          {step === 'select-member' ? (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleAssign} disabled={selectedDays.length === 0}>
                Assign Diet Plan
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
