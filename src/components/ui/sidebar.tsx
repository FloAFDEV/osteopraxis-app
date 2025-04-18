
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { UserNav } from './user-nav';
import { Button } from './button';
import { Sheet, SheetContent } from '@/components/ui/sheet';

// Fixed lucide icon importing - replacing dynamic imports that were causing issues
import { 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  Building,
  FileBarChart,
  Bell,
  Database,
  UserCog,
  LifeBuoy,
  Search,
  ShieldCheck,
  LogOut,
  Presentation
} from 'lucide-react';

const getIcon = (name: string) => {
  const icons: Record<string, React.ReactNode> = {
    Home: <Home className="h-5 w-5" />,
    Users: <Users className="h-5 w-5" />,
    Calendar: <Calendar className="h-5 w-5" />,
    FileText: <FileText className="h-5 w-5" />,
    Settings: <Settings className="h-5 w-5" />,
    Building: <Building className="h-5 w-5" />,
    FileBarChart: <FileBarChart className="h-5 w-5" />,
    Bell: <Bell className="h-5 w-5" />,
    Database: <Database className="h-5 w-5" />,
    UserCog: <UserCog className="h-5 w-5" />,
    LifeBuoy: <LifeBuoy className="h-5 w-5" />,
    Search: <Search className="h-5 w-5" />,
    ShieldCheck: <ShieldCheck className="h-5 w-5" />,
    LogOut: <LogOut className="h-5 w-5" />,
    Presentation: <Presentation className="h-5 w-5" />,
  };
  
  return icons[name] || <div className="h-5 w-5 bg-muted rounded-md" />;
};

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  submenu?: boolean;
  subItems?: NavItem[];
  badge?: React.ReactNode;
}

interface SidebarProps {
  navItems: NavItem[];
}

export function Sidebar({ navItems }: SidebarProps) {
  const { pathname } = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleSubmenuClick = (title: string) => {
    setOpenSubmenu(prev => (prev === title ? null : title));
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    // Close mobile sidebar when route changes
    setMobileOpen(false);
    
    // Open/close submenus based on active route
    navItems.forEach(item => {
      if (item.submenu && item.subItems) {
        const hasActiveChild = item.subItems.some(subItem => isActive(subItem.href));
        if (hasActiveChild) {
          setOpenSubmenu(item.title);
        }
      }
    });
  }, [pathname, navItems]);
  
  // Desktop sidebar
  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center px-4 py-4">
        <div className="font-semibold text-lg tracking-tight text-primary">OstéoDashboard</div>
      </div>
      <div className="flex-1 overflow-y-auto pt-2 pb-4">
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item, index) => {
            const isSubmenuOpen = openSubmenu === item.title;
            const isItemActive = isActive(item.href);
            
            // Is this item or any of its children active
            const isActiveRoute = item.submenu
              ? (item.subItems || []).some(subItem => isActive(subItem.href))
              : isItemActive;
            
            // For items with submenu
            if (item.submenu && item.subItems) {
              return (
                <div key={index}>
                  <button
                    onClick={() => handleSubmenuClick(item.title)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActiveRoute
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {getIcon(item.icon)}
                      <span>{item.title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {item.badge && <span>{item.badge}</span>}
                      <ChevronDown
                        className={cn("h-4 w-4 transition-transform", isSubmenuOpen && "rotate-180")}
                      />
                    </div>
                  </button>
                  
                  {isSubmenuOpen && (
                    <div className="mt-1 ml-4 pl-3 border-l border-border">
                      {item.subItems.map((subItem, subIndex) => (
                        <NavLink
                          key={subIndex}
                          to={subItem.href}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )
                          }
                        >
                          {getIcon(subItem.icon)}
                          <span>{subItem.title}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            
            // For regular menu items
            return (
              <NavLink
                key={index}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )
                }
              >
                <div className="flex items-center gap-3">
                  {getIcon(item.icon)}
                  <span>{item.title}</span>
                </div>
                {item.badge && <span>{item.badge}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>
      
      {/* User profile section */}
      <div className="mt-auto border-t pt-4 px-4">
        <UserNav />
        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => logout()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Se déconnecter
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden flex items-center px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-10">
        <div className="flex flex-col flex-grow bg-background border-r">
          <SidebarContent />
        </div>
      </div>
    </>
  );
}
