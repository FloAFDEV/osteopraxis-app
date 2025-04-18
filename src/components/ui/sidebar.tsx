import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  Settings,
  Building2,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Cabinet } from "@/types";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const [cabinetOptions, setCabinetOptions] = useState<Cabinet[]>([]);
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const loadCabinets = async () => {
      if (!user) return;
      
      try {
        let cabinets;
        // If user has a professional profile, load cabinets for that profile
        if (user.professionalProfileId) {
          cabinets = await api.getCabinetsByProfessionalProfileId(user.professionalProfileId);
        } else {
          // Otherwise load cabinets by user ID
          cabinets = await api.getCabinetsByUserId(user.id);
        }
        
        setCabinetOptions(cabinets || []);
      } catch (error) {
        console.error("Error loading cabinets:", error);
      }
    };
    
    loadCabinets();
  }, [user]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const navigation = [
    {
      name: "Tableau de bord",
      href: "/dashboard",
      icon: LayoutDashboard,
      current: location.pathname === "/dashboard",
    },
    {
      name: "Patients",
      href: "/patients",
      icon: Users,
      current: location.pathname.startsWith("/patients"),
    },
    {
      name: "Rendez-vous",
      href: "/appointments",
      icon: CalendarDays,
      current: location.pathname.startsWith("/appointments"),
    },
    {
      name: "Facturation",
      href: "/invoices",
      icon: FileText,
      current: location.pathname.startsWith("/invoices"),
    },
    {
      name: "Cabinets",
      href: "/cabinets",
      icon: Building2,
      current: location.pathname.startsWith("/cabinets"),
    },
    {
      name: "Paramètres",
      href: "/settings",
      icon: Settings,
      current: location.pathname.startsWith("/settings"),
    },
  ];

  const getInitials = () => {
    if (!user) return "?";
    
    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    
    if (!firstName && !lastName) return user.email?.substring(0, 2).toUpperCase() || "?";
    
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setOpen(!open)}
          className="rounded-full shadow-md"
        >
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:translate-x-0 bg-card border-r shadow-sm",
          open ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo and title */}
          <div className="flex h-16 shrink-0 items-center px-4 border-b">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="bg-primary text-primary-foreground p-1 rounded">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <span className="text-lg font-semibold">OsteoApp</span>
            </Link>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    item.current
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      item.current
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Cabinet selector */}
            {cabinetOptions.length > 0 && (
              <div className="mt-6 px-4">
                <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Vos cabinets
                </h3>
                <div className="mt-2 space-y-1">
                  {cabinetOptions.map((cabinet) => (
                    <Link
                      key={cabinet.id}
                      to={`/cabinets/${cabinet.id}`}
                      className={cn(
                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                        location.pathname === `/cabinets/${cabinet.id}`
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Building2
                        className={cn(
                          "mr-3 h-4 w-4 flex-shrink-0",
                          location.pathname === `/cabinets/${cabinet.id}`
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      />
                      <span className="truncate">{cabinet.name}</span>
                    </Link>
                  ))}
                  <Link
                    to="/cabinets/new"
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <span className="mr-3 h-4 w-4 flex-shrink-0 text-muted-foreground">
                      +
                    </span>
                    Ajouter un cabinet
                  </Link>
                </div>
              </div>
            )}
          </ScrollArea>

          {/* User menu */}
          <div className="border-t p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-2 hover:bg-muted"
                >
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage
                        src={user?.avatar_url || ""}
                        alt={user?.email || ""}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-2 text-left">
                      <p className="text-sm font-medium truncate max-w-[120px]">
                        {user?.first_name
                          ? `${user.first_name} ${user.last_name || ""}`
                          : user?.email || "Utilisateur"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {user?.email}
                      </p>
                    </div>
                    <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Paramètres</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Se déconnecter</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </>
  );
}
