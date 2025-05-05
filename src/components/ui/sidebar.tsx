import {
  Home,
  Calendar,
  Users,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { NavItem } from "@/components/ui/nav-item";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useMobile } from "@/hooks/useMobile";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isMobile = useMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  return (
    <aside className={`${isOpen ? "w-64" : "w-20"} min-h-screen bg-sidebar border-r transition-all duration-300 ease-in-out fixed left-0 top-0 z-30 ${isMobile && !isOpen ? "-translate-x-full" : ""}`}>
      <div className={`flex items-center ${isOpen ? "justify-between" : "justify-center"} h-16 border-b px-4`}>
        {isOpen ? (
          <div className="flex items-center space-x-2">
            <img
              className="h-8 w-8"
              src="https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=2187&h=2187"
              alt="Logo"
            />
            <h1 className="text-xl font-bold">Ostéo App</h1>
          </div>
        ) : (
          <img
            className="h-8 w-8"
            src="https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=2187&h=2187"
            alt="Logo"
          />
        )}
        <button
          onClick={toggleSidebar}
          className={`${isOpen ? "" : "hidden"} p-2 rounded-md hover:bg-sidebar-hover`}
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      <div className="pt-4 pb-2 px-4">
        <div onClick={toggleSidebar} className={`${isOpen ? "hidden" : "flex justify-center mb-4"} md:flex`}>
          <button className="p-2 rounded-full hover:bg-sidebar-hover">
            <ChevronRight size={18} />
          </button>
        </div>

        <nav className="space-y-1">
          <NavItem
            icon={Home}
            text="Accueil"
            to="/"
            isOpen={isOpen}
            isActive={location.pathname === "/"}
          />
          <NavItem
            icon={Users}
            text="Patients"
            to="/patients"
            isOpen={isOpen}
            isActive={location.pathname.includes("/patients")}
          />
          <NavItem
            icon={Calendar}
            text="Séances"
            to="/appointments"
            isOpen={isOpen}
            isActive={location.pathname.includes("/appointments")}
          />
          <NavItem
            icon={FileText}
            text="Notes d'honoraire"
            to="/invoices"
            isOpen={isOpen}
            isActive={location.pathname.includes("/invoices")}
          />
          <NavItem
            icon={Settings}
            text="Paramètres"
            to="/settings"
            isOpen={isOpen}
            isActive={location.pathname.includes("/settings")}
          />
          {user?.role === 'ADMIN' && (
            <NavItem
              icon={ShieldCheck}
              text="Administration"
              to="/admin"
              isOpen={isOpen}
              isActive={location.pathname.includes("/admin")}
            />
          )}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
        <div className="flex items-center">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div
            className={`${
              isOpen ? "opacity-100 ml-3" : "opacity-0 w-0"
            } transition-all duration-300 overflow-hidden whitespace-nowrap`}
          >
            <div className="font-medium text-sm">
              {user?.first_name} {user?.last_name}
            </div>
            <div
              className="text-xs text-muted-foreground cursor-pointer hover:underline"
              onClick={handleLogout}
            >
              Se déconnecter
            </div>
          </div>
          {!isOpen && (
            <button
              onClick={handleLogout}
              className="ml-3 p-2 rounded-md hover:bg-sidebar-hover"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
