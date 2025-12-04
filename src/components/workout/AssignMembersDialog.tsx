import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Users,
  Calendar,
  Bell,
  Mail,
  Phone,
  MessageSquare,
  Check,
  X,
} from 'lucide-react';
import { Workout, Member } from '@/types';
import { members } from '@/data/mockData';
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
import { Card, CardContent } from '@/components/ui/card';
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
  frequency: string;
  notifyEmail: boolean;
  notifySms: boolean;
  notifyWhatsapp: boolean;
  notes: string;
}

const FREQUENCY_OPTIONS = [
  { value: '3x-week', label: '3 times per week' },
  { value: '4x-week', label: '4 times per week' },
  { value: '5x-week', label: '5 times per week' },
  { value: 'daily', label: 'Daily' },
  { value: 'alternate', label: 'Alternate days' },
  { value: 'custom', label: 'Custom schedule' },
];

const STATUS_FILTERS = [
  { value: 'all', label: 'All Members' },
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
  const [frequency, setFrequency] = useState('3x-week');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(false);
  const [notes, setNotes] = useState('');

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
  }, [searchQuery, statusFilter]);

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
      frequency,
      notifyEmail,
      notifySms,
      notifyWhatsapp,
      notes,
    });

    const notificationChannels = [];
    if (notifyEmail) notificationChannels.push('email');
    if (notifySms) notificationChannels.push('SMS');
    if (notifyWhatsapp) notificationChannels.push('WhatsApp');

    if (notificationChannels.length > 0) {
      toast.success(
        `Assigned to ${selectedMembers.length} member(s). Notifications sent via ${notificationChannels.join(', ')}.`
      );
    } else {
      toast.success(`Assigned to ${selectedMembers.length} member(s) without notifications.`);
    }

    onOpenChange(false);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'badge-active';
      case 'expired':
        return 'badge-expired';
      case 'trial':
        return 'badge-trial';
      default:
        return '';
    }
  };

  if (!workout) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-xl flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assign Members to Workout
          </DialogTitle>
          <DialogDescription>
            Assign "{workout.name}" to members with scheduling and notification options
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-border">
          {/* Member Selection */}
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
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

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedMembers.length} selected
                </span>
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  {filteredMembers.every((m) => selectedMembers.includes(m.id))
                    ? 'Deselect All'
                    : 'Select All'}
                </Button>
              </div>

              <ScrollArea className="h-[300px] border rounded-lg">
                <div className="p-2 space-y-1">
                  {filteredMembers.map((member) => {
                    const isSelected = selectedMembers.includes(member.id);
                    return (
                      <div
                        key={member.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleToggleMember(member.id)}
                      >
                        <Checkbox checked={isSelected} />
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.photo} alt={member.name} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{member.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                        </div>
                        <Badge variant="outline" className={getStatusBadgeClass(member.status)}>
                          {member.status}
                        </Badge>
                      </div>
                    );
                  })}
                  {filteredMembers.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      No members found
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Assignment Options */}
          <div className="p-6 bg-muted/30">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-4">
                  <Calendar className="h-4 w-4" />
                  Schedule
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <Label>Frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCY_OPTIONS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-4">
                  <Bell className="h-4 w-4" />
                  Notifications
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Email</span>
                    </div>
                    <Switch checked={notifyEmail} onCheckedChange={setNotifyEmail} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">SMS</span>
                    </div>
                    <Switch checked={notifySms} onCheckedChange={setNotifySms} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">WhatsApp</span>
                    </div>
                    <Switch checked={notifyWhatsapp} onCheckedChange={setNotifyWhatsapp} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Assignment Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes for this assignment..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={selectedMembers.length === 0}>
            <Check className="h-4 w-4 mr-2" />
            Assign to {selectedMembers.length} Member{selectedMembers.length !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
