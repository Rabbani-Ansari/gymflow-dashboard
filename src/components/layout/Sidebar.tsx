import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Apple,
  UtensilsCrossed,
  Dumbbell,
  Calendar,
  DollarSign,
  UserCog,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  QrCode,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Membership', path: '/membership', icon: Users },
  { name: 'QR Registration', path: '/admin/qr', icon: QrCode },
  { name: 'New Customers', path: '/admin/customers', icon: UserPlus },
  { name: 'All Diet Plans', path: '/all-diet-plan', icon: Apple },
  { name: 'Diet Management', path: '/diet', icon: UtensilsCrossed },
  { name: 'All Workout', path: '/all-workout', icon: Dumbbell },
  { name: 'Attendance', path: '/attendance', icon: Calendar, disabled: true },
  { name: 'Finance', path: '/finance', icon: DollarSign, disabled: true },
  { name: 'HR', path: '/hr', icon: UserCog, disabled: true },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const NavItem = ({ item, showLabel = true }: { item: typeof navItems[0]; showLabel?: boolean }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    if (item.disabled) {
      return (
        <div
          className={cn(
            'sidebar-item opacity-50 cursor-not-allowed',
            !showLabel && 'justify-center px-2'
          )}
        >
          <Icon className="h-5 w-5 flex-shrink-0" />
          {showLabel && <span className="truncate">{item.name}</span>}
        </div>
      );
    }

    return (
      <NavLink
        to={item.path}
        className={cn(
          'sidebar-item',
          isActive && 'sidebar-item-active',
          !showLabel && 'justify-center px-2'
        )}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        {showLabel && <span className="truncate">{item.name}</span>}
      </NavLink>
    );
  };

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-screen bg-sidebar sticky top-0 transition-all duration-300',
        collapsed ? 'w-[70px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center h-16 border-b border-sidebar-border px-4', collapsed && 'justify-center')}>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Dumbbell className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg text-sidebar-foreground">GymERP</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <NavItem key={item.path} item={item} showLabel={!collapsed} />
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-3 space-y-1 border-t border-sidebar-border">
        <div
          className={cn(
            'sidebar-item opacity-50 cursor-not-allowed',
            !collapsed ? '' : 'justify-center px-2'
          )}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="truncate">Settings</span>}
        </div>
        <button
          onClick={handleLogout}
          className={cn(
            'sidebar-item w-full text-left hover:bg-destructive/20 hover:text-destructive',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="truncate">Logout</span>}
        </button>
      </div>

      {/* Collapse Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
};

export const MobileSidebar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    setOpen(false);
    navigate('/auth');
  };

  const NavItem = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    if (item.disabled) {
      return (
        <div className="sidebar-item opacity-50 cursor-not-allowed">
          <Icon className="h-5 w-5 flex-shrink-0" />
          <span className="truncate">{item.name}</span>
        </div>
      );
    }

    return (
      <SheetClose asChild>
        <NavLink
          to={item.path}
          className={cn('sidebar-item', isActive && 'sidebar-item-active')}
        >
          <Icon className="h-5 w-5 flex-shrink-0" />
          <span className="truncate">{item.name}</span>
        </NavLink>
      </SheetClose>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0 bg-sidebar border-sidebar-border">
        {/* Logo */}
        <div className="flex items-center h-16 border-b border-sidebar-border px-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-sidebar-foreground">GymERP</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>

        {/* Bottom Navigation */}
        <div className="p-3 space-y-1 border-t border-sidebar-border">
          <div className="sidebar-item opacity-50 cursor-not-allowed">
            <Settings className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Settings</span>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-item w-full text-left hover:bg-destructive/20 hover:text-destructive"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Logout</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
