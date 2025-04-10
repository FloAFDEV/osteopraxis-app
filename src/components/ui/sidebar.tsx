
import React, { useState, useEffect } from 'react';
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
  UserCog,
  UserPlus,
  Activity,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { logout, user } = useAuth();
  const { isMobile } = useIsMobile();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Effect to handle closing mobile menu when route changes
  useEffect(() => {
    if (isMobile && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Définir les couleurs des icônes
  const iconColors = {
    dashboard: "text-blue-600 dark:text-blue-400",
    patients: "text-emerald-600 dark:text-emerald-400", 
    addPatient: "text-cyan-600 dark:text-cyan-400",
    settings: "text-amber-600 dark:text-amber-400",
    appointments: "text-purple-600 dark:text-purple-400",
    invoices: "text-rose-600 dark:text-rose-400", 
    schedule: "text-indigo-600 dark:text-indigo-400"
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Rendre l'élément NavLink avec l'état active géré correctement
  const renderNavLink = ({ href, icon: Icon, label, colorClass }: { href: string; icon: React.ElementType; label: string; colorClass?: string }) => {
    const isActive = location.pathname === href || location.pathname.startsWith(`${href}/`);
    
    return (
      <NavLink
        key={href}
        to={href}
        onClick={() => isMobile && setMobileMenuOpen(false)}
        className={cn(
          "flex items-center gap-x-3 text-slate-700 dark:text-slate-300 py-3.5 px-4 rounded-xl text-sm font-medium transition-all duration-200",
          "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50",
          isActive && "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-50"
        )}
      >
        <Icon size={20} className={colorClass} />
        {!isCollapsed && <span>{label}</span>}
      </NavLink>
    );
  };

  // Mobile menu toggle button
  const mobileMenuToggle = (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm"
      onClick={toggleMobileMenu}
      aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
    >
      {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </Button>
  );

  return (
    <>
      {/* Mobile Menu Toggle */}
      {isMobile && mobileMenuToggle}
      
      {/* Sidebar for desktop and mobile */}
      <aside className={cn(
        "flex flex-col h-screen bg-white dark:bg-gray-950 border-r dark:border-gray-800 transition-all duration-300 shadow-lg",
        isCollapsed ? "md:w-[70px]" : "md:w-[240px]",
        isMobile ? (
          mobileMenuOpen ? "fixed inset-0 z-40 w-[240px]" : "hidden"
        ) : "relative"
      )}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-center gap-2 mt-2">
            <Activity className={cn(
              "h-6 w-6 text-blue-500 dark:text-blue-400 transition-all",
              !isCollapsed && "mb-1"
            )} />
            <h2 className={cn(
              "font-bold text-lg text-slate-900 dark:text-blue-400 transition-all",
              isCollapsed ? "opacity-0 h-0 mt-0 absolute" : "opacity-100 h-auto"
            )}>
              PatientHub
            </h2>
          </div>
          {!isCollapsed && (
            <p className="text-xs text-center text-muted-foreground mb-2">
              Gestion de cabinet
            </p>
          )}
        </div>
        
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1 py-2">
            {renderNavLink({ 
              href: "/dashboard", 
              icon: LayoutDashboard, 
              label: "Tableau de bord",
              colorClass: iconColors.dashboard
            })}
            
            {renderNavLink({ 
              href: "/patients", 
              icon: Users, 
              label: "Patients",
              colorClass: iconColors.patients
            })}

            {renderNavLink({
              href: "/patients/new",
              icon: UserPlus,
              label: "Ajouter un patient",
              colorClass: iconColors.addPatient
            })}
            
            {renderNavLink({ 
              href: "/appointments", 
              icon: CalendarDays, 
              label: "Rendez-vous",
              colorClass: iconColors.appointments
            })}
            
            {renderNavLink({ 
              href: "/invoices", 
              icon: FileText, 
              label: "Factures",
              colorClass: iconColors.invoices
            })}
            
            {renderNavLink({ 
              href: "/schedule", 
              icon: Clock, 
              label: "Agenda",
              colorClass: iconColors.schedule
            })}
            
            {renderNavLink({ 
              href: "/settings", 
              icon: Settings, 
              label: "Paramètres",
              colorClass: iconColors.settings
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
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
                <Button size="sm" variant="outline" className="w-full justify-start rounded-xl" asChild>
                  <NavLink to="/settings">
                    <UserCog size={16} className="mr-2" /> Compte
                  </NavLink>
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start rounded-xl" onClick={logout}>
                  <LogOut size={16} className="mr-2" /> Déconnexion
                </Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="outline" className="w-full p-2 h-auto rounded-xl" onClick={logout}>
              <LogOut size={16} />
            </Button>
          )}
        </div>

        {/* Desktop sidebar toggle button */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-3 -right-3 h-6 w-6 rounded-full bg-white dark:bg-gray-800 shadow border border-gray-100 dark:border-gray-700 p-0"
            onClick={onToggle}
            aria-label={isCollapsed ? "Élargir" : "Réduire"}
          >
            <ChevronDown size={12} className={cn("transition-transform", isCollapsed ? "-rotate-90" : "rotate-90")} />
          </Button>
        )}
      </aside>
      
      {/* Overlay for mobile */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30" 
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
