
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { Building2, CalendarDays, LayoutDashboard, Settings, Users, Clock, FileText, ChevronDown, UserCog } from 'lucide-react';
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { isMobile } = useIsMobile();
  const { user, logout } = useAuth();
  
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground dark:bg-gray-950">
      {!isMobile && (
        <header className="border-b border-border bg-card dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex h-16 items-center px-4 md:px-6">
            <div className="flex items-center gap-3">
              <Link 
                to="/dashboard"
                className="flex items-center gap-2 font-semibold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500"
              >
                <LayoutDashboard className="h-5 w-5 text-blue-500" />
                PatientHub
              </Link>
            </div>
            <nav className="ml-auto flex items-center gap-4 md:gap-6 lg:gap-8">
              <Link 
                to="/dashboard" 
                className={cn(
                  "text-sm font-medium flex items-center gap-1.5 transition-colors hover:text-primary",
                  location.pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                Tableau de bord
              </Link>
              <Link 
                to="/patients" 
                className={cn(
                  "text-sm font-medium flex items-center gap-1.5 transition-colors hover:text-primary",
                  location.pathname.includes("/patients") ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Users className="h-4 w-4" />
                Patients
              </Link>
              <Link 
                to="/appointments" 
                className={cn(
                  "text-sm font-medium flex items-center gap-1.5 transition-colors hover:text-primary",
                  location.pathname.includes("/appointments") ? "text-primary" : "text-muted-foreground"
                )}
              >
                <CalendarDays className="h-4 w-4" />
                Rendez-vous
              </Link>
              <Link 
                to="/cabinets" 
                className={cn(
                  "text-sm font-medium flex items-center gap-1.5 transition-colors hover:text-primary",
                  location.pathname.includes("/cabinets") ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Building2 className="h-4 w-4" />
                Cabinets
              </Link>
              <Link 
                to="/invoices" 
                className={cn(
                  "text-sm font-medium flex items-center gap-1.5 transition-colors hover:text-primary",
                  location.pathname.includes("/invoices") ? "text-primary" : "text-muted-foreground"
                )}
              >
                <FileText className="h-4 w-4" />
                Factures
              </Link>
              <Link 
                to="/schedule" 
                className={cn(
                  "text-sm font-medium flex items-center gap-1.5 transition-colors hover:text-primary",
                  location.pathname === "/schedule" ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Clock className="h-4 w-4" />
                Agenda
              </Link>
              
              <div className="flex items-center gap-4">
                <ThemeToggle />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          {user?.first_name?.charAt(0) || user?.email?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">
                        {user?.first_name || user?.email || "Utilisateur"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.role === "ADMIN" ? "Administrateur" : "Ostéopathe"}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="h-4 w-4" />
                        <span>Paramètres</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/cabinets" className="flex items-center gap-2 cursor-pointer">
                        <Building2 className="h-4 w-4" />
                        <span>Gestion des cabinets</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                        <UserCog className="h-4 w-4" />
                        <span>Mon compte</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-500 dark:text-red-400 cursor-pointer"
                      onClick={logout}
                    >
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </nav>
          </div>
        </header>
      )}
      <div className="flex flex-1">
        {isMobile && <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />}
        <main className={cn(
          "flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto bg-background dark:bg-gray-950 w-full",
          isMobile && (isCollapsed ? "md:ml-[70px]" : "md:ml-[240px]")
        )}>
          <div className={cn("mx-auto max-w-6xl", className)}>{children}</div>
        </main>
      </div>
    </div>
  );
}
