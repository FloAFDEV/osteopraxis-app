
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Users,
  Calendar,
  Building2,
  FileText,
  User,
  Clock,
  Home,
  HelpCircle
} from "lucide-react";
import { HelpButton } from "@/components/ui/help-button";

interface SidebarNavProps {
  className?: string;
}

export function SidebarNav({ className }: SidebarNavProps) {
  const location = useLocation();

  const navigation = [
    {
      name: "Tableau de bord",
      href: "/dashboard",
      icon: Home,
      help: "Vue d'ensemble de votre activité avec les statistiques principales"
    },
    {
      name: "Patients",
      href: "/patients",
      icon: Users,
      help: "Gérez vos patients : consultez leurs dossiers, ajoutez-en de nouveaux"
    },
    {
      name: "Séances",
      href: "/appointments",
      icon: Calendar,
      help: "Consultez et gérez tous vos rendez-vous patients"
    },
    {
      name: "Planning",
      href: "/schedule",
      icon: Clock,
      help: "Vue planning pour organiser votre semaine et vos créneaux"
    },
    {
      name: "Cabinets",
      href: "/cabinets",
      icon: Building2,
      help: "Gérez les cabinets où vous exercez et leurs informations"
    },
    {
      name: "Factures",
      href: "/invoices",
      icon: FileText,
      help: "Créez et suivez vos notes d'honoraires et factures"
    },
    {
      name: "Profil",
      href: "/osteopath-profile",
      icon: User,
      help: "Gérez votre profil professionnel et vos informations"
    },
    {
      name: "Guide",
      href: "/settings",
      icon: HelpCircle,
      help: "Consultez le guide d'utilisation et la documentation"
    }
  ];

  return (
    <nav className={cn("space-y-1", className)}>
      {navigation.map((item) => {
        const isActive = location.pathname === item.href || 
          (item.href !== "/" && location.pathname.startsWith(item.href));
        
        return (
          <div key={item.name} className="flex items-center group">
            <Link
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors flex-1",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
            </Link>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">
              <HelpButton 
                content={item.help}
                className="text-blue-500 hover:text-blue-700"
              />
            </div>
          </div>
        );
      })}
    </nav>
  );
}
