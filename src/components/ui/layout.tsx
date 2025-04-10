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
export function Layout({
  children
}: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const {
    user,
    logout
  } = useAuth();
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
  return <div className="flex min-h-screen flex-col bg-slate-950">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <NavLink to="/" className="flex items-center gap-2 font-semibold text-lg">
              <Activity className="h-5 w-5 text-blue-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 font-bold">PatientHub</span>
            </NavLink>
          </div>
          
          <button className="md:hidden p-2 rounded-md" onClick={toggleMenu} aria-label="Toggle menu">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" className={({
            isActive
          }) => cn("text-sm font-medium transition-colors flex items-center gap-1 hover:text-blue-500", isActive ? "text-blue-500" : "text-muted-foreground")}>
              <Activity className="h-4 w-4" />
              Accueil
            </NavLink>
            <NavLink to="/patients" className={({
            isActive
          }) => cn("text-sm font-medium transition-colors flex items-center gap-1 hover:text-pink-500", isActive ? "text-pink-500" : "text-muted-foreground")}>
              <User className="h-4 w-4" />
              Patients
            </NavLink>
            <NavLink to="/appointments" className={({
            isActive
          }) => cn("text-sm font-medium transition-colors flex items-center gap-1 hover:text-purple-500", isActive ? "text-purple-500" : "text-muted-foreground")}>
              <Calendar className="h-4 w-4" />
              Rendez-vous
            </NavLink>
            <NavLink to="/schedule" className={({
            isActive
          }) => cn("text-sm font-medium transition-colors flex items-center gap-1 hover:text-blue-500", isActive ? "text-blue-500" : "text-muted-foreground")}>
              <Clock className="h-4 w-4" />
              Planning
            </NavLink>

            <ThemeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-primary-foreground">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                {user && <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    {user.email}
                  </div>}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <NavLink to="/cabinet" className="flex items-center cursor-pointer">
                    <Building className="mr-2 h-4 w-4" />
                    <span>Paramètres du cabinet</span>
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>

      {isMenuOpen && <div className="md:hidden fixed inset-0 z-30 bg-background/95 pt-16">
          <nav className="container py-4 flex flex-col gap-4">
            <NavLink to="/" className={({
          isActive
        }) => cn("p-2 rounded-md transition-colors flex items-center gap-2", isActive ? "bg-blue-500/10 text-blue-500" : "text-foreground")} onClick={() => setIsMenuOpen(false)}>
              <Home className="h-5 w-5" />
              Accueil
            </NavLink>
            <NavLink to="/patients" className={({
          isActive
        }) => cn("p-2 rounded-md transition-colors flex items-center gap-2", isActive ? "bg-pink-500/10 text-pink-500" : "text-foreground")} onClick={() => setIsMenuOpen(false)}>
              <User className="h-5 w-5" />
              Patients
            </NavLink>
            <NavLink to="/appointments" className={({
          isActive
        }) => cn("p-2 rounded-md transition-colors flex items-center gap-2", isActive ? "bg-purple-500/10 text-purple-500" : "text-foreground")} onClick={() => setIsMenuOpen(false)}>
              <Calendar className="h-5 w-5" />
              Rendez-vous
            </NavLink>
            <NavLink to="/schedule" className={({
          isActive
        }) => cn("p-2 rounded-md transition-colors flex items-center gap-2", isActive ? "bg-blue-500/10 text-blue-500" : "text-foreground")} onClick={() => setIsMenuOpen(false)}>
              <Clock className="h-5 w-5" />
              Planning
            </NavLink>
            <NavLink to="/cabinet" className={({
          isActive
        }) => cn("p-2 rounded-md transition-colors flex items-center gap-2", isActive ? "bg-purple-500/10 text-purple-500" : "text-foreground")} onClick={() => setIsMenuOpen(false)}>
              <Building className="h-5 w-5" />
              Paramètres du cabinet
            </NavLink>

            <div className="p-2 flex items-center justify-between">
              <span>Thème</span>
              <ThemeToggle />
            </div>

            <div className="p-2 rounded-md transition-colors flex items-center gap-2 text-destructive mt-4 cursor-pointer" onClick={() => {
          handleLogout();
          setIsMenuOpen(false);
        }}>
              <LogOut className="h-5 w-5" />
              Déconnexion
            </div>
          </nav>
        </div>}

      <main className="flex-1 container py-6">{children}</main>

      <footer className="border-t py-6 bg-muted/30">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2025 PatientHub. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <NavLink to="/terms-of-service" className="hover:text-blue-500 transition-colors">
              Conditions d&apos;utilisation
            </NavLink>
            <NavLink to="/privacy-policy" className="hover:text-purple-500 transition-colors">
              Politique de confidentialité
            </NavLink>
          </div>
        </div>
      </footer>
    </div>;
}