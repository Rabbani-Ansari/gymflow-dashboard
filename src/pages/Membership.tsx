import { useState, useMemo, useRef } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Send, RefreshCw, Download } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { members, getStats, dietPlans, workouts } from '@/data/mockData';
import { Member, DietPlan, Workout } from '@/types';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Users, UserCheck, UserX, DollarSign, Calendar, CreditCard, Settings, CheckCircle, Clock, FileText, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


const Membership = () => {
  const stats = getStats();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewingDietPlan, setViewingDietPlan] = useState<DietPlan | null>(null);
  const [viewingWorkout, setViewingWorkout] = useState<Workout | null>(null);


  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.phone.includes(searchQuery) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      const matchesPlan = planFilter === 'all' || member.plan.toLowerCase().includes(planFilter.toLowerCase());
      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [searchQuery, statusFilter, planFilter]);

  const uniquePlans = [...new Set(members.map((m) => m.plan))];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMembers(filteredMembers.map((m) => m.id));
    } else {
      setSelectedMembers([]);
    }
  };

  const handleSelectMember = (memberId: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers([...selectedMembers, memberId]);
    } else {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
    }
  };

  const handleBulkReminder = () => {
    toast.success(`Reminder sent to ${selectedMembers.length} members`);
    setSelectedMembers([]);
  };

  const handleExportCSV = () => {
    toast.success('Exporting members to CSV...');
  };



  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Membership"
        description="Manage your gym members, plans, and payments."
        actions={
          <div className="flex gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Member</DialogTitle>
                  <DialogDescription>
                    Fill in the details to register a new member.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" placeholder="+91-9876543210" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="plan">Membership Plan</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1month">1 Month Trial</SelectItem>
                          <SelectItem value="3month">3 Month Basic</SelectItem>
                          <SelectItem value="6month">6 Month Standard</SelectItem>
                          <SelectItem value="12month">12 Month Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input id="startDate" type="date" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="123 Main St, City" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency">Emergency Contact</Label>
                    <Input id="emergency" placeholder="+91-9876543211" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    toast.success('Member added successfully!');
                    setIsAddDialogOpen(false);
                  }}>
                    Add Member
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Members"
          value={stats.totalMembers}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Active"
          value={stats.activeMembers}
          icon={UserCheck}
          variant="success"
        />
        <StatCard
          title="Expired"
          value={stats.expiredMembers}
          icon={UserX}
          variant="destructive"
        />
        <StatCard
          title="Revenue"
          value={`₹${(stats.totalRevenue / 1000).toFixed(1)}K`}
          icon={DollarSign}
        />
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
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
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            {uniquePlans.map((plan) => (
              <SelectItem key={plan} value={plan.toLowerCase()}>
                {plan}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedMembers.length > 0 && (
          <>
            <Button variant="outline" size="sm" onClick={handleBulkReminder}>
              <Send className="h-4 w-4 mr-2" />
              Send Reminder ({selectedMembers.length})
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.id} className="data-table-row">
                <TableCell>
                  <Checkbox
                    checked={selectedMembers.includes(member.id)}
                    onCheckedChange={(checked) => handleSelectMember(member.id, checked as boolean)}
                  />
                </TableCell>
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
                <TableCell className="text-sm">{member.phone}</TableCell>
                <TableCell className="text-sm">{member.plan}</TableCell>
                <TableCell className="text-sm">
                  {format(new Date(member.expiryDate), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <StatusBadge status={member.status} />
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1"
                      onClick={() => {
                        toast.success(`Checked in ${member.name}`);
                      }}
                    >
                      <CheckCircle className="h-3 w-3" />
                      Check In
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  {member.paymentDue > 0 ? (
                    <span className="text-sm font-medium text-destructive">₹{member.paymentDue}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setViewingMember(member);
                        setActiveTab('overview');
                      }}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setViewingMember(member);
                        setActiveTab('settings');
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.success(`Membership renewed for ${member.name}`)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Renew
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Send className="h-4 w-4 mr-2" />
                        Send Reminder
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredMembers.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No members found matching your criteria.
          </div>
        )}


      </div>

      {/* Member Detail Dialog */}
      <Dialog open={!!viewingMember} onOpenChange={() => setViewingMember(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0">
          {viewingMember && (
            <>
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={viewingMember.photo} alt={viewingMember.name} />
                    <AvatarFallback className="text-xl">{viewingMember.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl">{viewingMember.name}</DialogTitle>
                    <p className="text-sm text-muted-foreground">{viewingMember.email} • {viewingMember.phone}</p>
                  </div>
                  <div className="ml-auto">
                    <StatusBadge status={viewingMember.status} />
                  </div>
                </div>
              </DialogHeader>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <div className="px-6 border-b border-border">
                  <TabsList className="w-full justify-start h-12 bg-transparent p-0 gap-4">
                    <TabsTrigger
                      value="overview"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="attendance"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Attendance
                    </TabsTrigger>
                    <TabsTrigger
                      value="payments"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Payments
                    </TabsTrigger>
                    <TabsTrigger
                      value="settings"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="h-[calc(90vh-250px)]">
                  <div className="p-6">
                    {/* Overview Tab */}
                    <TabsContent value="overview" className="mt-0 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-muted/30">
                          <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground mb-1">Current Plan</p>
                            <p className="font-semibold">{viewingMember.plan}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Expires {format(new Date(viewingMember.expiryDate), 'MMM dd, yyyy')}
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="bg-muted/30">
                          <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground mb-1">Payment Status</p>
                            <p className={`font-semibold ${viewingMember.paymentDue > 0 ? 'text-destructive' : 'text-success'}`}>
                              {viewingMember.paymentDue > 0 ? `Due: ₹${viewingMember.paymentDue}` : 'All Paid'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Last payment: {viewingMember.paymentHistory.length > 0 ? format(new Date(viewingMember.paymentHistory[0].date), 'MMM dd') : 'N/A'}
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      {viewingMember.measurements.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">Latest Measurements</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-primary/10 rounded-lg text-center">
                              <p className="text-2xl font-bold text-primary">
                                {viewingMember.measurements[viewingMember.measurements.length - 1].weight}
                              </p>
                              <p className="text-xs text-muted-foreground">Weight (kg)</p>
                            </div>
                            <div className="p-4 bg-success/10 rounded-lg text-center">
                              <p className="text-2xl font-bold text-success">
                                {viewingMember.measurements[viewingMember.measurements.length - 1].bmi.toFixed(1)}
                              </p>
                              <p className="text-xs text-muted-foreground">BMI</p>
                            </div>
                            <div className="p-4 bg-warning/10 rounded-lg text-center">
                              <p className="text-2xl font-bold text-warning">
                                {viewingMember.measurements[viewingMember.measurements.length - 1].height}
                              </p>
                              <p className="text-xs text-muted-foreground">Height (cm)</p>
                            </div>
                          </div>
                        </div>
                      )}



                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-2">Personal Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between py-2 border-b border-border/50">
                              <span className="text-muted-foreground">Join Date</span>
                              <span>{format(new Date(viewingMember.startDate), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-border/50">
                              <span className="text-muted-foreground">Address</span>
                              <span className="text-right max-w-[200px]">{viewingMember.address || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-border/50">
                              <span className="text-muted-foreground">Emergency</span>
                              <span>{viewingMember.emergencyContact || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Assigned Programs</h4>
                          <div className="space-y-3">
                            <div className="p-3 border border-border rounded-lg flex items-center justify-between">
                              <span className="text-sm">Diet Plan</span>
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0"
                                onClick={() => {
                                  if (viewingMember.assignedDietPlan) {
                                    const plan = dietPlans.find(p => p.id === viewingMember.assignedDietPlan);
                                    if (plan) setViewingDietPlan(plan);
                                  }
                                }}
                              >
                                {viewingMember.assignedDietPlan ? 'View' : 'Assign'}
                              </Button>
                            </div>
                            <div className="p-3 border border-border rounded-lg flex items-center justify-between">
                              <span className="text-sm">Workout</span>
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0"
                                onClick={() => {
                                  if (viewingMember.assignedWorkout) {
                                    const workout = workouts.find(w => w.id === viewingMember.assignedWorkout);
                                    if (workout) setViewingWorkout(workout);
                                  }
                                }}
                              >
                                {viewingMember.assignedWorkout ? 'View' : 'Assign'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Attendance Tab */}
                    <TabsContent value="attendance" className="mt-0 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Recent Check-ins</h4>
                        <span className="text-sm text-muted-foreground">
                          Last 30 days: {viewingMember.attendance?.length || 0} visits
                        </span>
                      </div>

                      {viewingMember.attendance && viewingMember.attendance.length > 0 ? (
                        <div className="space-y-2">
                          {viewingMember.attendance.map((record, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                  <CheckCircle className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{format(new Date(record.date), 'EEEE, MMM dd')}</p>
                                  <p className="text-xs text-muted-foreground">Gym Visit</p>
                                </div>
                              </div>
                              <div className="text-right text-sm">
                                <div className="flex items-center gap-1 text-success">
                                  <Clock className="h-3 w-3" />
                                  <span>{record.checkInTime}</span>
                                </div>
                                {record.checkOutTime && (
                                  <div className="flex items-center gap-1 text-muted-foreground mt-1">
                                    <LogOut className="h-3 w-3" />
                                    <span>{record.checkOutTime}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No attendance records found.
                        </div>
                      )}
                    </TabsContent>

                    {/* Payments Tab */}
                    <TabsContent value="payments" className="mt-0 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Transaction History</h4>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download Invoice
                        </Button>
                      </div>

                      {viewingMember.paymentHistory && viewingMember.paymentHistory.length > 0 ? (
                        <div className="border border-border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {viewingMember.paymentHistory.map((payment) => (
                                <TableRow key={payment.id}>
                                  <TableCell className="font-medium">
                                    {format(new Date(payment.date), 'MMM dd, yyyy')}
                                  </TableCell>
                                  <TableCell>{payment.description}</TableCell>
                                  <TableCell>₹{payment.amount}</TableCell>
                                  <TableCell>
                                    <StatusBadge status={payment.status === 'paid' ? 'active' : payment.status === 'pending' ? 'trial' : 'expired'} />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No payment history found.
                        </div>
                      )}
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="mt-0 space-y-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold">Account Settings</h4>
                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label>Full Name</Label>
                            <Input defaultValue={viewingMember.name} />
                          </div>
                          <div className="grid gap-2">
                            <Label>Email Address</Label>
                            <Input defaultValue={viewingMember.email} />
                          </div>
                          <div className="grid gap-2">
                            <Label>Phone Number</Label>
                            <Input defaultValue={viewingMember.phone} />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          <Button variant="outline">Reset Password</Button>
                          <Button>Save Changes</Button>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-border">
                        <h4 className="font-semibold text-destructive mb-4">Danger Zone</h4>
                        <Button variant="destructive" className="w-full sm:w-auto">
                          Delete Member Account
                        </Button>
                      </div>
                    </TabsContent>
                  </div>
                </ScrollArea>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* View Diet Plan Dialog */}
      <Dialog open={!!viewingDietPlan} onOpenChange={() => setViewingDietPlan(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          {viewingDietPlan && (
            <>
              <DialogHeader>
                <DialogTitle>{viewingDietPlan.name}</DialogTitle>
                <DialogDescription>
                  {viewingDietPlan.dietGoal} • {viewingDietPlan.targetCalories} kcal
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-bold">{viewingDietPlan.macros.calories}</p>
                    <p className="text-xs text-muted-foreground">Calories</p>
                  </div>
                  <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
                    <p className="font-bold">{viewingDietPlan.macros.protein}g</p>
                    <p className="text-xs">Protein</p>
                  </div>
                  <div className="p-3 bg-green-500/10 text-green-500 rounded-lg">
                    <p className="font-bold">{viewingDietPlan.macros.carbs}g</p>
                    <p className="text-xs">Carbs</p>
                  </div>
                  <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-lg">
                    <p className="font-bold">{viewingDietPlan.macros.fat}g</p>
                    <p className="text-xs">Fat</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Daily Meals</h4>
                  {viewingDietPlan.meals.map((meal, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">{meal.time}</h5>
                      <ul className="space-y-2">
                        {meal.items.map((item, i) => (
                          <li key={i} className="text-sm flex justify-between">
                            <span>{item.name}</span>
                            <span className="text-muted-foreground">{item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* View Workout Dialog */}
      <Dialog open={!!viewingWorkout} onOpenChange={() => setViewingWorkout(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          {viewingWorkout && (
            <>
              <DialogHeader>
                <DialogTitle>{viewingWorkout.name}</DialogTitle>
                <DialogDescription>
                  {viewingWorkout.bodyPart} • {viewingWorkout.difficulty} • {viewingWorkout.duration} mins
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <h4 className="font-semibold">Exercises</h4>
                <div className="space-y-3">
                  {viewingWorkout.exercises.map((exercise, idx) => (
                    <div key={idx} className="flex items-start justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{exercise.name}</p>
                        {exercise.notes && <p className="text-xs text-muted-foreground mt-1">{exercise.notes}</p>}
                      </div>
                      <div className="text-right text-sm">
                        <p>{exercise.sets} sets x {exercise.reps}</p>
                        <p className="text-xs text-muted-foreground">{exercise.rest} rest</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Membership;
