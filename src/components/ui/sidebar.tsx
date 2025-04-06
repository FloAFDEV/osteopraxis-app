
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, Home, Settings, LogOut, ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import { useState } from 'react';
import { useMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/auth-context';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const mainItems = [
  { name: 'Tableau de bord', icon: Home, href: '/', requiredAdmin: false },
  { name: 'Patients', icon: Users, href: '/patients', requiredAdmin: false },
  { name: 'Rendez-vous', icon: Calendar, href: '/appointments', requiredAdmin: false },
  { name: 'Planning', icon: Clock, href: '/schedule', requiredAdmin: false },
  { name: 'Administration', icon: Shield, href: '/admin', requiredAdmin: true },
];

const settingsItems = [
  { name: 'Paramètres', icon: Settings, href: '/cabinet', requiredAdmin: false },
];

interface SidebarProps {
  className?: string;
  isCompact?: boolean;
  onToggleCompact?: () => void;
}

const NavItems = ({ isCompact = false }: { isCompact?: boolean }) => {
  const { pathname } = useLocation();
  const { isAdmin } = useAuth();
  
  return (
    <div className="flex flex-col gap-2 px-2">
      {mainItems
        .filter(item => !item.requiredAdmin || (item.requiredAdmin && isAdmin))
        .map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCompact && <span>{item.name}</span>}
            </Link>
          );
        })}
    </div>
  );
};

export function Sidebar({
  className,
  isCompact = false,
  onToggleCompact,
}: SidebarProps) {
  const { logout } = useAuth();
  const { isMobile } = useMobile();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const sidebarContent = (
    <div
      className={cn(
        'flex h-full flex-col gap-4 border-r bg-background',
        isCompact ? 'w-[70px]' : 'w-[240px]',
        className
      )}
    >
      <div className={cn('flex h-[53px] items-center px-4 py-2', isCompact ? 'justify-center' : '')}>
        {!isCompact ? (
          <h1 className="text-xl font-bold">
            PatientHub
            <span className="text-pink-500">.</span>
          </h1>
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-lg font-semibold text-primary-foreground">
            P
          </span>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <nav className="grid gap-4 px-2">
          <div className="flex flex-col gap-1">
            <h2
              className={cn(
                'mb-1 mt-1 font-semibold',
                isCompact ? 'px-2 text-center text-xs' : 'px-4 text-sm'
              )}
            >
              {!isCompact ? 'Menu' : ''}
            </h2>

            <NavItems isCompact={isCompact} />
          </div>

          <div className="flex flex-col gap-1">
            <h2
              className={cn(
                'mb-1 mt-4 font-semibold',
                isCompact ? 'px-2 text-center text-xs' : 'px-4 text-sm'
              )}
            >
              {!isCompact ? 'Configuration' : ''}
            </h2>

            <div className="flex flex-col gap-2 px-2">
              {settingsItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!isCompact && <span>{item.name}</span>}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>

      <div className="mt-auto p-2">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start',
            isCompact && 'justify-center px-0'
          )}
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5 shrink-0" />
          {!isCompact && <span>Déconnexion</span>}
        </Button>
      </div>

      {!isMobile && (
        <div
          className="flex items-center justify-center border-t p-2 cursor-pointer hover:bg-accent"
          onClick={onToggleCompact}
        >
          {isCompact ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <div className="flex w-full items-center justify-between px-2">
              <span className="text-xs">Réduire</span>
              <ChevronLeft className="h-5 w-5" />
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Home className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  return sidebarContent;
}
