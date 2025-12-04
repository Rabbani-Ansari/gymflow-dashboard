import { useLocation } from 'react-router-dom';
import { Bell, Search, ChevronRight, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MobileSidebar } from './Sidebar';

const routeNames: Record<string, string> = {
  '/': 'Dashboard',
  '/membership': 'Membership',
  '/all-diet-plan': 'All Diet Plans',
  '/all-workout': 'All Workout',
  '/attendance': 'Attendance',
  '/finance': 'Finance',
  '/hr': 'HR',
  '/settings': 'Settings',
};

export const TopNav = () => {
  const location = useLocation();
  const currentRoute = routeNames[location.pathname] || 'Page';

  return (
    <header className="sticky top-0 z-40 h-16 bg-card border-b border-border flex items-center px-4 lg:px-6 gap-4">
      {/* Mobile Menu */}
      <MobileSidebar />

      {/* Breadcrumbs */}
      <nav className="hidden sm:flex items-center text-sm">
        <span className="text-muted-foreground">Home</span>
        <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
        <span className="font-medium text-foreground">{currentRoute}</span>
      </nav>

      {/* Search */}
      <div className="flex-1 max-w-md ml-auto lg:ml-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members, plans..."
            className="pl-9 bg-background border-border"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground border-0">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium text-sm">Membership Expiring</span>
              <span className="text-xs text-muted-foreground">5 members have memberships expiring this week</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium text-sm">Payment Due</span>
              <span className="text-xs text-muted-foreground">3 members have pending payments</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium text-sm">New Sign-ups</span>
              <span className="text-xs text-muted-foreground">2 new trial members joined today</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium">Admin</span>
                <span className="text-xs text-muted-foreground">Main Branch</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">Switch Branch</DropdownMenuLabel>
            <DropdownMenuItem>Main Branch</DropdownMenuItem>
            <DropdownMenuItem>Downtown Branch</DropdownMenuItem>
            <DropdownMenuItem>West Side Branch</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
