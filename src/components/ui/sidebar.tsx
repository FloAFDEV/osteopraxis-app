
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CalendarDays,
  LayoutDashboard,
  Settings,
  Users,
  Clock,
  FileText,
  ChevronDown,
  LogOut,
  UserCog
} from 'lucide-react';
import { useAuth } from "@/contexts/auth-context";
import { useMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { logout, user } = useAuth();
  const { isMobile } = useMobile();
  const location = useLocation();

  // Rendre l'élément NavLink avec l'état active géré correctement
  const renderNavLink = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => {
    const isActive = location.pathname === href || location.pathname.startsWith(`${href}/`);
    
    return (
      <NavLink
        key={href}
        to={href}
        onClick={() => isMobile && onToggle?.()}
        className={cn(
          "flex items-center gap-x-2 text-slate-700 dark:text-slate-300 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors",
          "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50",
          isActive && "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
        )}
      >
        <Icon size={18} />
        {!isCollapsed && <span>{label}</span>}
      </NavLink>
    );
  };

  return (
    <aside className={cn(
      "flex flex-col h-full bg-white dark:bg-gray-950 border-r dark:border-gray-800",
      isCollapsed ? "w-[60px]" : "w-[240px]"
    )}>
      <div className="px-3 py-2">
        <h2 className={cn(
          "font-bold text-lg mt-2 text-slate-900 dark:text-white text-center transition-all",
          isCollapsed ? "opacity-0 h-0 mt-0" : "opacity-100 h-auto"
        )}>
          PatientHub
        </h2>
        {!isCollapsed && (
          <p className="text-xs text-center text-muted-foreground mb-2">
            Gestion de cabinet
          </p>
        )}
      </div>
      
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-2">
          {renderNavLink({ 
            href: "/", 
            icon: LayoutDashboard, 
            label: "Tableau de bord"
          })}
          
          {renderNavLink({ 
            href: "/patients", 
            icon: Users, 
            label: "Patients"
          })}
          
          {renderNavLink({ 
            href: "/appointments", 
            icon: CalendarDays, 
            label: "Rendez-vous"
          })}
          
          {renderNavLink({ 
            href: "/invoices", 
            icon: FileText, 
            label: "Factures"
          })}
          
          {renderNavLink({ 
            href: "/schedule", 
            icon: Clock, 
            label: "Agenda"
          })}
          
          {renderNavLink({ 
            href: "/cabinet", 
            icon: Settings, 
            label: "Paramètres"
          })}
        </div>
      </ScrollArea>

      <div className={cn(
        "p-3 mt-auto border-t dark:border-gray-800",
        isCollapsed ? "flex justify-center" : ""
      )}>
        {!isCollapsed ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                {user?.first_name?.charAt(0) || user?.email?.charAt(0) || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.first_name || user?.email || "Utilisateur"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.role === "ADMIN" ? "Administrateur" : "Ostéopathe"}
                </p>
              </div>
              <ChevronDown size={16} className="text-muted-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" className="w-full justify-start" asChild>
                <NavLink to="/admin">
                  <UserCog size={16} className="mr-2" /> Compte
                </NavLink>
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start" onClick={logout}>
                <LogOut size={16} className="mr-2" /> Déconnexion
              </Button>
            </div>
          </div>
        ) : (
          <Button size="sm" variant="outline" className="w-full p-2 h-auto" onClick={logout}>
            <LogOut size={16} />
          </Button>
        )}
      </div>
    </aside>
  );
}
