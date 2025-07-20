import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { DemoBanner } from "./DemoBanner";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  BarChart3, 
  Settings, 
  Menu,
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemo } from "@/contexts/DemoContext";

const navigation = [
  { name: "Dashboard", href: "/demo", icon: Home },
  { name: "Patients", href: "/demo/patients", icon: Users },
  { name: "Calendrier", href: "/demo/calendar", icon: Calendar },
  { name: "Facturation", href: "/demo/invoices", icon: FileText },
  { name: "Statistiques", href: "/demo/stats", icon: BarChart3 },
  { name: "Paramètres", href: "/demo/settings", icon: Settings },
];

export function DemoLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { demoData } = useDemo();

  const isActive = (href: string) => {
    if (href === "/demo") {
      return location.pathname === "/demo";
    }
    return location.pathname.startsWith(href);
  };

  const Sidebar = ({ className = "" }: { className?: string }) => (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-4 border-b">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">
            <span className="text-foreground">Patient</span>
            <span className="ml-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              Hub
            </span>
          </h1>
          <Badge variant="secondary" className="text-xs">Démo</Badge>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 shrink-0",
                  active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-medium text-primary-foreground">
              {demoData.osteopath.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {demoData.osteopath.name}
            </p>
            <p className="text-xs text-muted-foreground">Mode démo</p>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start" asChild>
            <Link to="/register">
              <LogOut className="mr-2 h-4 w-4" />
              Créer mon compte
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <DemoBanner />
      
      <div className="flex h-[calc(100vh-3rem)]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r">
          <Sidebar />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <header className="lg:hidden border-b bg-background px-4 py-2">
            <div className="flex items-center justify-between">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
              </Sheet>
              
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold">
                  <span className="text-foreground">Patient</span>
                  <span className="ml-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                    Hub
                  </span>
                </h1>
                <Badge variant="secondary" className="text-xs">Démo</Badge>
              </div>
              
              <Button variant="ghost" size="sm" asChild>
                <Link to="/register">S'inscrire</Link>
              </Button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}