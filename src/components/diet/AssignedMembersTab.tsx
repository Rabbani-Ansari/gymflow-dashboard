import { useState } from 'react';
import { Search, Settings2, Eye, MoreVertical, UserCheck, Pause, XCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DietPlan, Member } from '@/types';
import { AssignedMember } from '@/types/memberDiet';
import { members as allMembers } from '@/data/mockData';
import { CustomizeMemberDietDialog } from './CustomizeMemberDietDialog';

interface AssignedMembersTabProps {
  plan: DietPlan;
  onPlanUpdate?: (plan: DietPlan) => void;
}

const goalLabels: Record<string, string> = {
  'weight-loss': 'Weight Loss',
  'muscle-gain': 'Muscle Gain',
  'maintenance': 'Maintenance',
  'fat-loss': 'Fat Loss',
  'general-fitness': 'General Fitness',
};

const statusColors = {
  active: 'bg-success/10 text-success border-success/20',
  paused: 'bg-warning/10 text-warning border-warning/20',
  completed: 'bg-primary/10 text-primary border-primary/20',
  expired: 'bg-destructive/10 text-destructive border-destructive/20',
  trial: 'bg-muted text-muted-foreground border-muted-foreground/20',
};

export const AssignedMembersTab = ({ plan, onPlanUpdate }: AssignedMembersTabProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<AssignedMember | null>(null);
  const [customizeDialogOpen, setCustomizeDialogOpen] = useState(false);

  // Get assigned members with their details
  const assignedMembers: AssignedMember[] = plan.members.map((memberId) => {
    const member = allMembers.find((m) => m.id === memberId);
    if (!member) return null;
    
    return {
      id: member.id,
      name: member.name,
      photo: member.photo,
      goal: plan.dietGoal,
      membershipStatus: member.status,
      planStatus: 'active' as const,
      currentMacros: plan.macros,
      adherenceRate: Math.floor(Math.random() * 30) + 70, // Mock data
      startDate: member.startDate,
    };
  }).filter(Boolean) as AssignedMember[];

  const filteredMembers = assignedMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCustomizeMember = (member: AssignedMember) => {
    setSelectedMember(member);
    setCustomizeDialogOpen(true);
  };

  const handleSaveCustomization = (customization: any) => {
    console.log('Saving customization:', customization);
    setCustomizeDialogOpen(false);
    setSelectedMember(null);
  };

  if (assignedMembers.length === 0) {
    return (
      <div className="text-center py-12">
        <UserCheck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Members Assigned</h3>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          This diet plan hasn't been assigned to any members yet. Use the "Assign Members" button to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search assigned members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-success/10 rounded-lg text-center">
          <p className="text-lg font-bold text-success">
            {assignedMembers.filter((m) => m.planStatus === 'active').length}
          </p>
          <p className="text-xs text-muted-foreground">Active</p>
        </div>
        <div className="p-3 bg-warning/10 rounded-lg text-center">
          <p className="text-lg font-bold text-warning">
            {assignedMembers.filter((m) => m.planStatus === 'paused').length}
          </p>
          <p className="text-xs text-muted-foreground">Paused</p>
        </div>
        <div className="p-3 bg-primary/10 rounded-lg text-center">
          <p className="text-lg font-bold text-primary">
            {Math.round(assignedMembers.reduce((sum, m) => sum + (m.adherenceRate || 0), 0) / assignedMembers.length)}%
          </p>
          <p className="text-xs text-muted-foreground">Avg Adherence</p>
        </div>
      </div>

      {/* Members List */}
      <div className="space-y-2">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.photo} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>

                {/* Member Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold truncate">{member.name}</h4>
                    <Badge variant="outline" className={statusColors[member.planStatus]}>
                      {member.planStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{goalLabels[member.goal] || member.goal}</span>
                    <span>•</span>
                    <Badge variant="outline" className={statusColors[member.membershipStatus]}>
                      {member.membershipStatus}
                    </Badge>
                  </div>
                </div>

                {/* Adherence Rate */}
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium">{member.adherenceRate}%</p>
                  <p className="text-xs text-muted-foreground">Adherence</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCustomizeMember(member)}
                  >
                    <Settings2 className="h-4 w-4 mr-1" />
                    Customize
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause Plan
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <XCircle className="h-4 w-4 mr-2" />
                        Remove from Plan
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Quick Stats */}
              {member.currentMacros && (
                <div className="mt-3 pt-3 border-t border-border grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Calories</p>
                    <p className="text-sm font-medium">{member.currentMacros.calories}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Protein</p>
                    <p className="text-sm font-medium text-blue-500">{member.currentMacros.protein}g</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Carbs</p>
                    <p className="text-sm font-medium text-amber-500">{member.currentMacros.carbs}g</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fat</p>
                    <p className="text-sm font-medium text-red-500">{member.currentMacros.fat}g</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && searchQuery && (
        <div className="text-center py-8 text-muted-foreground">
          No members found matching "{searchQuery}"
        </div>
      )}

      {/* Customize Member Diet Dialog */}
      <CustomizeMemberDietDialog
        open={customizeDialogOpen}
        onOpenChange={setCustomizeDialogOpen}
        member={selectedMember}
        basePlan={plan}
        onSave={handleSaveCustomization}
      />
    </div>
  );
};
