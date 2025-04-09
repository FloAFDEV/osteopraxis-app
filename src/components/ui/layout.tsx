
import React from "react";
import { NavLink } from "react-router-dom";
import { Calendar, User, Clock, Activity, Menu, X, Settings, LogOut, Building, Home, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = () => {
    if (!user) return "?";
    
    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user.email.charAt(0).toUpperCase();
  };

  const navItems = [
    {
      name: "Accueil",
      path: "/",
      icon: <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
    },
    {
      name: "Patients",
      path: "/patients",
      icon: <User className="h-5 w-5 text-green-600 dark:text-green-400" />
    },
    {
      name: "Rendez-vous",
      path: "/appointments",
      icon: <Calendar className="h-5 w-5 text-red-600 dark:text-red-400" />
    },
    {
      name: "Planning",
      path: "/schedule",
      icon: <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
    },
    {
      name: "Cabinet",
      path: "/cabinet",
      icon: <Building className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
    }
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <NavLink to="/" className="flex items-center gap-2 font-semibold text-lg">
              <Activity className="h-5 w-5 text-blue-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 font-bold">PatientHub</span>
            </NavLink>
          </div>
          
          <button
            className="md:hidden p-2 rounded-xl"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "text-sm font-medium transition-colors flex items-center gap-1 hover:text-blue-500 rounded-xl px-3 py-2",
                    isActive ? "bg-blue-50 dark:bg-blue-900/30 shadow-sm" : "text-muted-foreground"
                  )
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}

            <ThemeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-2 rounded-xl">
                  <Avatar className="h-9 w-9 rounded-xl">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-primary-foreground rounded-xl">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                {user && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    {user.email}
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <NavLink to="/cabinet" className="flex items-center cursor-pointer rounded-lg">
                    <Building className="mr-2 h-4 w-4 text-yellow-600" />
                    <span>Paramètres du cabinet</span>
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer rounded-lg">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>

      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-background/95 pt-16">
          <nav className="container py-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "p-3 rounded-xl transition-colors flex items-center gap-3",
                    isActive 
                      ? "bg-blue-50 dark:bg-blue-900/30 shadow-sm text-blue-600 dark:text-blue-400" 
                      : "text-foreground"
                  )
                }
                onClick={() => setIsMenuOpen(false)}
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}

            <div className="p-3 flex items-center justify-between rounded-xl">
              <span>Thème</span>
              <ThemeToggle />
            </div>

            <div
              className="p-3 rounded-xl transition-colors flex items-center gap-3 text-red-600 dark:text-red-400 mt-4 cursor-pointer bg-red-50 dark:bg-red-900/20"
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
            >
              <LogOut className="h-5 w-5" />
              Déconnexion
            </div>
          </nav>
        </div>
      )}

      <main className="flex-1 container py-6">{children}</main>

      <footer className="border-t py-6 bg-muted/30">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2025 PatientHub. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <NavLink to="/terms-of-service" className="hover:text-blue-500 transition-colors rounded-lg px-2 py-1">
              Conditions d&apos;utilisation
            </NavLink>
            <NavLink to="/privacy-policy" className="hover:text-purple-500 transition-colors rounded-lg px-2 py-1">
              Politique de confidentialité
            </NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
}
