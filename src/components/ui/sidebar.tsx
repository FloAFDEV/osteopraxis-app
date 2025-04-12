
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  Building,
  Activity
} from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { api } from "@/services/api";
import { Cabinet } from "@/types";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { logout, user } = useAuth();
  const { isMobile } = useIsMobile();
  const location = useLocation();
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);

  useEffect(() => {
    // Récupérer les informations du cabinet si l'utilisateur est connecté
    if (user?.osteopathId) {
      const fetchCabinet = async () => {
        try {
          const cabinets = await api.getCabinetsByOsteopathId(user.osteopathId);
          if (cabinets && cabinets.length > 0) {
            setCabinet(cabinets[0]);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération du cabinet:", error);
        }
      };
      
      fetchCabinet();
    }
  }, [user]);

  // Définir les couleurs des icônes
  const iconColors = {
    dashboard: "text-indigo-600 dark:text-indigo-400",
    patients: "text-green-600 dark:text-green-400", 
    addPatient: "text-blue-600 dark:text-blue-400",
    settings: "text-amber-600 dark:text-amber-400",
    appointments: "text-red-600 dark:text-red-400",
    invoices: "text-amber-600 dark:text-amber-400", // Changé en amber pour les factures
    schedule: "text-cyan-600 dark:text-cyan-400"
  };

  // Rendre l'élément NavLink avec l'état active géré correctement
  const renderNavLink = ({ href, icon: Icon, label, colorClass }: { href: string; icon: React.ElementType; label: string; colorClass?: string }) => {
    const isActive = location.pathname === href || location.pathname.startsWith(`${href}/`);
    
    return (
      <NavLink
        key={href}
        to={href}
        onClick={() => isMobile && onToggle?.()}
        className={cn(
          "flex items-center gap-x-2 text-slate-700 dark:text-slate-300 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors",
          "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50",
          isActive && "bg-slate-100 text-slate-900 dark:bg-amber-900/30 dark:text-amber-50" // Changé en amber pour le focus
        )}
      >
        {/* Icône toujours colorée, indépendamment de l'état de survol */}
        <Icon size={18} className={colorClass} />
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
        <div className="flex items-center justify-center gap-2 mt-2">
          <Activity className={cn(
            "h-5 w-5 text-amber-500 dark:text-amber-400 transition-all",
            !isCollapsed && "mb-1"
          )} />
          <h2 className={cn(
            "font-bold text-lg text-slate-900 dark:text-amber-400 transition-all", // Changé en amber
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
            href: "/", 
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
            href: "/cabinet", 
            icon: Building, 
            label: "Cabinet",
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
              <Avatar className="w-8 h-8">
                {cabinet && cabinet.logoUrl ? (
                  <AvatarImage src={cabinet.logoUrl} alt={cabinet.name} />
                ) : null}
                <AvatarFallback className="bg-amber-600 dark:bg-amber-600 text-primary-foreground font-medium">
                  {user?.first_name?.charAt(0) || user?.email?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
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
                  <UserCog size={16} className="mr-2 text-amber-600 dark:text-amber-400" /> Compte
                </NavLink>
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start" onClick={logout}>
                <LogOut size={16} className="mr-2 text-red-600 dark:text-red-400" /> Déconnexion
              </Button>
            </div>
          </div>
        ) : (
          <Button size="sm" variant="outline" className="w-full p-2 h-auto" onClick={logout}>
            <LogOut size={16} className="text-red-600 dark:text-red-400" />
          </Button>
        )}
      </div>
    </aside>
  );
}
