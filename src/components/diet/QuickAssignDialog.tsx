import { useState, useMemo } from 'react';
import { QrCode, Search, User, Check, ChefHat } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useMembers, Member } from '@/hooks/useMembers';
import { useDietPlans, DietPlan } from '@/hooks/useDietPlans';

interface QuickAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (memberId: string, planId: string, notify: boolean) => void;
}

type Step = 'scan' | 'select-plan' | 'confirm';

export const QuickAssignDialog = ({
  open,
  onOpenChange,
  onAssign,
}: QuickAssignDialogProps) => {
  const { data: members = [] } = useMembers();
  const { data: dbDietPlans = [] } = useDietPlans();

  // Map to UI-friendly format
  const dietPlans = dbDietPlans.map(p => ({
    ...p,
    trainer: p.trainer?.name || 'Unknown',
    targetCalories: p.target_calories,
  }));

  const [step, setStep] = useState<Step>('scan');
  const [memberSearch, setMemberSearch] = useState('');
  const [planSearch, setPlanSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  const filteredMembers = useMemo(() => {
    if (!memberSearch) return [];
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.phone.includes(memberSearch) ||
        m.email.toLowerCase().includes(memberSearch.toLowerCase())
    ).slice(0, 5);
  }, [memberSearch, members]);

  const filteredPlans = useMemo(() => {
    return dietPlans.filter((p) =>
      p.name.toLowerCase().includes(planSearch.toLowerCase())
    );
  }, [planSearch, dietPlans]);

  const handleScan = () => {
    setIsScanning(true);
    // Simulate QR scan
    setTimeout(() => {
      const randomMember = members[Math.floor(Math.random() * members.length)];
      setSelectedMember(randomMember);
      setIsScanning(false);
      setStep('select-plan');
      toast.success(`Member found: ${randomMember.name}`);
    }, 2000);
  };

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setStep('select-plan');
  };

  const handleSelectPlan = (plan: DietPlan) => {
    setSelectedPlan(plan);
    setStep('confirm');
  };

  const handleAssign = () => {
    if (selectedMember && selectedPlan) {
      onAssign(selectedMember.id, selectedPlan.id, notifyWhatsApp);
      toast.success(
        `${selectedPlan.name} assigned to ${selectedMember.name}${notifyWhatsApp ? ' (WhatsApp notification sent)' : ''
        }`
      );
      handleClose();
    }
  };

  const handleClose = () => {
    setStep('scan');
    setMemberSearch('');
    setPlanSearch('');
    setSelectedMember(null);
    setSelectedPlan(null);
    setNotifyWhatsApp(true);
    setIsScanning(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Quick Assign Diet Plan
          </DialogTitle>
          <DialogDescription>
            {step === 'scan' && 'Scan member QR code or search manually'}
            {step === 'select-plan' && `Select a diet plan for ${selectedMember?.name}`}
            {step === 'confirm' && 'Review and confirm assignment'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'scan' && (
            <>
              {/* QR Scanner Placeholder */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isScanning ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                  }`}
              >
                <QrCode className={`h-16 w-16 mx-auto mb-4 text-muted-foreground ${isScanning ? 'animate-pulse' : ''}`} />
                <p className="text-sm text-muted-foreground mb-4">
                  {isScanning ? 'Scanning...' : 'Position QR code in frame'}
                </p>
                <Button onClick={handleScan} disabled={isScanning}>
                  {isScanning ? 'Scanning...' : 'Start Scan'}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or search manually</span>
                </div>
              </div>

              {/* Manual Search */}
              <div className="space-y-2">
                <Label>Member ID / Phone / Name</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search member..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {filteredMembers.length > 0 && (
                <ScrollArea className="h-[200px] border rounded-lg p-2">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSelectMember(member)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.photo} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.phone}</p>
                      </div>
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                        {member.status}
                      </Badge>
                    </div>
                  ))}
                </ScrollArea>
              )}
            </>
          )}

          {step === 'select-plan' && selectedMember && (
            <>
              {/* Selected Member */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedMember.photo} />
                  <AvatarFallback>{selectedMember.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedMember.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedMember.plan}</p>
                </div>
                <Badge className="ml-auto">{selectedMember.status}</Badge>
              </div>

              {/* Plan Search */}
              <div className="space-y-2">
                <Label>Select Diet Plan</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search plans..."
                    value={planSearch}
                    onChange={(e) => setPlanSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <ScrollArea className="h-[250px] border rounded-lg p-2">
                {filteredPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSelectPlan(plan)}
                  >
                    <div className="h-12 w-12 rounded-md overflow-hidden">
                      <img
                        src={plan.thumbnail}
                        alt={plan.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {plan.targetCalories} cal • {plan.trainer}
                      </p>
                    </div>
                    <Badge variant="outline">{plan.category}</Badge>
                  </div>
                ))}
              </ScrollArea>
            </>
          )}

          {step === 'confirm' && selectedMember && selectedPlan && (
            <div className="space-y-4">
              {/* Confirm Assignment */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Member</p>
                    <p className="font-medium">{selectedMember.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ChefHat className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Diet Plan</p>
                    <p className="font-medium">{selectedPlan.name}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <span className="text-sm">Notify via WhatsApp?</span>
                <Switch checked={notifyWhatsApp} onCheckedChange={setNotifyWhatsApp} />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === 'scan' && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}
          {step === 'select-plan' && (
            <Button variant="outline" onClick={() => setStep('scan')}>
              Back
            </Button>
          )}
          {step === 'confirm' && (
            <>
              <Button variant="outline" onClick={() => setStep('select-plan')}>
                Back
              </Button>
              <Button onClick={handleAssign}>
                <Check className="h-4 w-4 mr-2" />
                Confirm Assignment
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
