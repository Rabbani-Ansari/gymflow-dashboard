import { useState, useMemo } from 'react';
import { Search, Mail, MessageSquare, Phone, Calendar, Users } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { members as allMembers, trainers } from '@/data/mockData';
import { DietPlan } from '@/types';

interface BulkAssignMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlans: DietPlan[];
  onAssign: (memberIds: string[], planIds: string[], options: AssignOptions) => void;
}

interface AssignOptions {
  startDate: string;
  endDate: string;
  notifyEmail: boolean;
  notifySMS: boolean;
  notifyWhatsApp: boolean;
  notes: string;
}

export const BulkAssignMembersDialog = ({
  open,
  onOpenChange,
  selectedPlans,
  onAssign,
}: BulkAssignMembersDialogProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [goalFilter, setGoalFilter] = useState<string>('all');
  const [trainerFilter, setTrainerFilter] = useState<string>('all');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySMS, setNotifySMS] = useState(false);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(false);
  const [notes, setNotes] = useState('');

  const filteredMembers = useMemo(() => {
    return allMembers.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.phone.includes(searchQuery) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlan = goalFilter === 'all' || member.plan === goalFilter;
      const matchesStatus = trainerFilter === 'all' || member.status === trainerFilter;
      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [searchQuery, goalFilter, trainerFilter]);

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleAssign = (notify: boolean) => {
    if (selectedMembers.length === 0) {
      toast.error('Please select at least one member');
      return;
    }

    onAssign(
      selectedMembers,
      selectedPlans.map((p) => p.id),
      {
        startDate,
        endDate,
        notifyEmail: notify && notifyEmail,
        notifySMS: notify && notifySMS,
        notifyWhatsApp: notify && notifyWhatsApp,
        notes,
      }
    );

    toast.success(
      `${selectedPlans.length} plan(s) assigned to ${selectedMembers.length} member(s)${
        notify ? ' with notifications' : ''
      }`
    );

    setSelectedMembers([]);
    setNotes('');
    onOpenChange(false);
  };

  const uniquePlans = [...new Set(allMembers.map((m) => m.plan))];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Assign Members
          </DialogTitle>
          <DialogDescription>
            Assign {selectedPlans.length} diet plan(s) to multiple members at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Plans Preview */}
          <div className="flex flex-wrap gap-2">
            {selectedPlans.slice(0, 3).map((plan) => (
              <Badge key={plan.id} variant="secondary">
                {plan.name}
              </Badge>
            ))}
            {selectedPlans.length > 3 && (
              <Badge variant="outline">+{selectedPlans.length - 3} more</Badge>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={goalFilter} onValueChange={setGoalFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                {uniquePlans.map((plan) => (
                  <SelectItem key={plan} value={plan}>
                    {plan}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={trainerFilter} onValueChange={setTrainerFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Members List */}
          <div className="border rounded-lg">
            <div className="p-2 bg-muted/50 border-b flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {filteredMembers.length} members found
              </span>
              <Badge variant="secondary">{selectedMembers.length} selected</Badge>
            </div>
            <ScrollArea className="h-[200px]">
              <div className="p-2 space-y-1">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedMembers.includes(member.id) ? 'bg-primary/10' : ''
                    }`}
                    onClick={() => toggleMember(member.id)}
                  >
                    <Checkbox checked={selectedMembers.includes(member.id)} />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.photo} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {member.plan}
                    </Badge>
                  </div>
                ))}
                {filteredMembers.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    No members found matching your criteria
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Scheduling */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date *
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-3">
            <Label>Notification Methods</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={notifyEmail} onCheckedChange={setNotifyEmail} />
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Email</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={notifySMS} onCheckedChange={setNotifySMS} />
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">SMS</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={notifyWhatsApp} onCheckedChange={setNotifyWhatsApp} />
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">WhatsApp</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Assignment Notes (optional)</Label>
            <Textarea
              placeholder="Add notes for this assignment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={() => handleAssign(false)}>
            Assign Only
          </Button>
          <Button onClick={() => handleAssign(true)}>Assign & Notify</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
