
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { Building2, CalendarDays, LayoutDashboard, Settings, Users, Clock, FileText } from 'lucide-react';
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { isMobile } = useIsMobile();
  
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
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
              <Link 
                to="/settings" 
                className={cn(
                  "text-sm font-medium flex items-center gap-1.5 transition-colors hover:text-primary",
                  location.pathname === "/settings" ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Settings className="h-4 w-4" />
                Paramètres
              </Link>
              <div className="ml-4">
                <ThemeToggle />
              </div>
            </nav>
          </div>
        </header>
      )}
      <div className="flex flex-1">
        {isMobile && <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />}
        <main className={cn(
          "flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto",
          isMobile && (isCollapsed ? "md:ml-[70px]" : "md:ml-[240px]")
        )}>
          <div className={cn("mx-auto max-w-6xl", className)}>{children}</div>
        </main>
      </div>
    </div>
  );
}
