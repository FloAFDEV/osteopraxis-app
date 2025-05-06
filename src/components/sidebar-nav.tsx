
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

interface SidebarNavProps {
  className?: string;
}

export function SidebarNav({ className }: SidebarNavProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    return currentPath.startsWith(path);
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/patients", label: "Patients" },
    { path: "/appointments", label: "Rendez-vous" },
    { path: "/invoices", label: "Factures" },
    { path: "/cabinets", label: "Cabinets" },
    { path: "/settings", label: "Paramètres" },
  ];

  return (
    <nav
      className={`flex flex-col gap-2 ${className}`}
      data-testid="sidebar-nav"
    >
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
            isActive(item.path)
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
