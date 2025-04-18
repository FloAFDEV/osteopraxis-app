import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types";

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      path: "/dashboard",
      label: "Tableau de bord",
      icon: "LayoutDashboard",
    },
    {
      path: "/patients",
      label: "Patients",
      icon: "User",
    },
    {
      path: "/appointments",
      label: "Rendez-vous",
      icon: "Calendar",
    },
    {
      path: "/invoices",
      label: "Factures",
      icon: "FileText",
    },
    {
      path: "/cabinets",
      label: "Cabinets",
      icon: "Building",
    },
    {
      path: "/settings",
      label: "Paramètres",
      icon: "Settings",
    },
  ];

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="hidden border-r bg-gray-100/40 dark:bg-secondary md:block">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Menu
          </h2>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <SidebarNavItem
                key={item.path}
                path={item.path}
                label={item.label}
                icon={item.icon}
                active={isActive(item.path)}
              />
            ))}
          </div>
        </div>
        <div className="mt-auto border-t p-3">
          {user && <UserAvatar user={user} />}
          <Button variant="outline" className="mt-4 w-full" onClick={logout}>
            Se déconnecter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

interface SidebarNavItemProps {
  path: string;
  label: string;
  icon: string;
  active: boolean;
}

const SidebarNavItem = ({
  path,
  label,
  icon,
  active,
}: SidebarNavItemProps) => {
  const Icon = React.lazy(() => import("lucide-react").then((module) => module[icon]));

  return (
    <NavLink
      to={path}
      className={`flex items-center gap-x-2 rounded-md px-3.5 py-2 text-sm font-medium hover:bg-gray-200 dark:hover:bg-secondary/50 ${
        active ? "bg-gray-200 dark:bg-secondary/50" : ""
      }`}
    >
      <React.Suspense fallback={<span></span>}>
        <Icon className="h-4 w-4" />
      </React.Suspense>
      {label}
    </NavLink>
  );
};

export const MobileSidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      path: "/dashboard",
      label: "Tableau de bord",
      icon: "LayoutDashboard",
    },
    {
      path: "/patients",
      label: "Patients",
      icon: "User",
    },
    {
      path: "/appointments",
      label: "Rendez-vous",
      icon: "Calendar",
    },
    {
      path: "/invoices",
      label: "Factures",
      icon: "FileText",
    },
        {
            path: "/cabinets",
            label: "Cabinets",
            icon: "Building",
        },
    {
      path: "/settings",
      label: "Paramètres",
      icon: "Settings",
    },
  ];

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <Sheet>
      <SheetTrigger className="md:hidden pr-4 transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary">
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="w-full">
        <SheetHeader className="text-left">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Naviguez facilement dans l'application.
          </SheetDescription>
        </SheetHeader>
        <div className="z-50 space-y-6">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <SidebarNavItem
                key={item.path}
                path={item.path}
                label={item.label}
                icon={item.icon}
                active={isActive(item.path)}
              />
            ))}
          </div>
          <div className="mt-auto border-t p-3">
            {user && <UserAvatar user={user} />}
            <Button variant="outline" className="mt-4 w-full" onClick={logout}>
              Se déconnecter
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Dans la fonction UserAvatar où il y a l'erreur avatar_url:
const UserAvatar = ({ user }: { user: User }) => {
  // Utilisons les propriétés first_name, last_name au lieu de avatar_url
  const initials = user && user.first_name && user.last_name 
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || "??";
  
  return (
    <div className="flex items-center">
      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium uppercase">
        {initials}
      </div>
      <div className="ml-2">
        <p className="text-sm font-medium">
          {user.first_name && user.last_name 
            ? `${user.first_name} ${user.last_name}`
            : user.email}
        </p>
        <p className="text-xs text-muted-foreground">
          {user.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
        </p>
      </div>
    </div>
  );
};
