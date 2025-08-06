import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Users, BarChart3, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DemoNavigation() {
  const location = useLocation();

  const navItems = [
    {
      path: '/demo',
      label: 'Tableau de bord',
      icon: Home,
    },
    {
      path: '/demo/patients',
      label: 'Patients',
      icon: Users,
    },
    {
      path: '/demo/schedule',
      label: 'Planning',
      icon: Calendar,
    },
    {
      path: '/demo/invoices',
      label: 'Factures',
      icon: BarChart3,
    },
  ];

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/demo" className="font-bold text-xl">
            PatientHub <span className="text-blue-500">Demo</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  asChild
                  className={cn(
                    "flex items-center gap-2",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <Link to={item.path}>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/register">
              Créer mon compte
            </Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link to="/login">
              Connexion
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Navigation mobile */}
      <div className="md:hidden mt-4 flex flex-wrap gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={item.path}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              asChild
              className={cn(
                "flex items-center gap-2",
                isActive && "bg-primary text-primary-foreground"
              )}
            >
              <Link to={item.path}>
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}