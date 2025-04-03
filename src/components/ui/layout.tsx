
import React from "react";
import { NavLink } from "react-router-dom";
import { Calendar, User, Clock, Home, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <NavLink to="/" className="flex items-center gap-2 font-semibold text-lg">
              <span className="text-primary">Rendez-vous</span>
              <span className="text-accent">Zen</span>
            </NavLink>
          </div>
          
          <button
            className="md:hidden p-2 rounded-md"
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
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium transition-colors flex items-center gap-1 hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              <Home className="h-4 w-4" />
              Accueil
            </NavLink>
            <NavLink
              to="/appointments"
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium transition-colors flex items-center gap-1 hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              <Calendar className="h-4 w-4" />
              Rendez-vous
            </NavLink>
            <NavLink
              to="/patients"
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium transition-colors flex items-center gap-1 hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              <User className="h-4 w-4" />
              Patients
            </NavLink>
            <NavLink
              to="/schedule"
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium transition-colors flex items-center gap-1 hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              <Clock className="h-4 w-4" />
              Planning
            </NavLink>
          </nav>
        </div>
      </header>

      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-background/95 pt-16">
          <nav className="container py-4 flex flex-col gap-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "p-2 rounded-md transition-colors flex items-center gap-2",
                  isActive ? "bg-primary/10 text-primary" : "text-foreground"
                )
              }
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="h-5 w-5" />
              Accueil
            </NavLink>
            <NavLink
              to="/appointments"
              className={({ isActive }) =>
                cn(
                  "p-2 rounded-md transition-colors flex items-center gap-2",
                  isActive ? "bg-primary/10 text-primary" : "text-foreground"
                )
              }
              onClick={() => setIsMenuOpen(false)}
            >
              <Calendar className="h-5 w-5" />
              Rendez-vous
            </NavLink>
            <NavLink
              to="/patients"
              className={({ isActive }) =>
                cn(
                  "p-2 rounded-md transition-colors flex items-center gap-2",
                  isActive ? "bg-primary/10 text-primary" : "text-foreground"
                )
              }
              onClick={() => setIsMenuOpen(false)}
            >
              <User className="h-5 w-5" />
              Patients
            </NavLink>
            <NavLink
              to="/schedule"
              className={({ isActive }) =>
                cn(
                  "p-2 rounded-md transition-colors flex items-center gap-2",
                  isActive ? "bg-primary/10 text-primary" : "text-foreground"
                )
              }
              onClick={() => setIsMenuOpen(false)}
            >
              <Clock className="h-5 w-5" />
              Planning
            </NavLink>
          </nav>
        </div>
      )}

      <main className="flex-1 container py-6">{children}</main>

      <footer className="border-t py-6 bg-muted/30">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2025 Rendez-vous Zen. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <NavLink to="/terms" className="hover:text-primary transition-colors">
              Conditions d&apos;utilisation
            </NavLink>
            <NavLink to="/privacy" className="hover:text-primary transition-colors">
              Politique de confidentialité
            </NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
}
