
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/auth-context";

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ className, isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { isAdmin, logout } = useAuth();

  // Gère la fermeture du sidebar sur mobile après un clic
  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Vérifie si un lien est actif
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const navigation = [
    { name: "Tableau de bord", href: "/", icon: "dashboard" },
    { name: "Patients", href: "/patients", icon: "patients" },
    { name: "Rendez-vous", href: "/appointments", icon: "calendar" },
    { name: "Planning", href: "/schedule", icon: "schedule" },
    { name: "Cabinet", href: "/cabinet", icon: "settings" },
  ];

  // Ajouter la page admin uniquement pour les admins
  if (isAdmin) {
    navigation.push({ name: "Administration", href: "/admin", icon: "admin" });
  }

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex h-full w-64 flex-col border-r bg-background transition-transform",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0",
        className
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-between px-6">
        <Link to="/" className="text-2xl font-semibold tracking-tight">
          PatientHub
        </Link>
      </div>

      <ScrollArea className="flex-1 overflow-auto">
        <div className="space-y-1 px-2 py-2">
          {navigation.map((item) => (
            <Button
              key={item.href}
              variant={isActive(item.href) ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                isActive(item.href) ? "font-semibold" : ""
              )}
              asChild
              onClick={handleNavClick}
            >
              <Link to={item.href}>
                <IconForNav name={item.icon} className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            </Button>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-auto p-4">
        <div className="flex items-center justify-between">
          <ThemeToggle />
          <Button variant="ghost" onClick={logout}>
            <IconForNav name="logout" className="mr-2 h-5 w-5" />
            Déconnexion
          </Button>
        </div>
      </div>
    </div>
  );
}

// Composant pour les icônes
function IconForNav({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "dashboard":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      );
    case "patients":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M18 21a8 8 0 0 0-16 0" />
          <circle cx="10" cy="8" r="5" />
          <path d="M22 20c-1-5-4-8-8-8" />
          <path d="M15 13a5 5 0 0 0-5-5" />
        </svg>
      );
    case "calendar":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
          <path d="M8 14h.01" />
          <path d="M12 14h.01" />
          <path d="M16 14h.01" />
          <path d="M8 18h.01" />
          <path d="M12 18h.01" />
          <path d="M16 18h.01" />
        </svg>
      );
    case "schedule":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "settings":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
          <path d="M7 7h.01" />
        </svg>
      );
    case "admin":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "logout":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      );
    default:
      return null;
  }
}
