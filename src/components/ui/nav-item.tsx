
import React from "react";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: LucideIcon;
  text: string;
  to: string;
  isOpen: boolean;
  isActive: boolean;
  onClick?: () => void;
}

export function NavItem({ icon: Icon, text, to, isOpen, isActive, onClick }: NavItemProps) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center py-2 px-3 rounded-md transition-colors",
        isActive
          ? "bg-sidebar-active text-foreground font-medium"
          : "hover:bg-sidebar-hover text-muted-foreground"
      )}
      onClick={onClick}
    >
      <Icon className="h-5 w-5" />
      <span
        className={cn(
          "ml-3 transition-all duration-300",
          isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
        )}
      >
        {text}
      </span>
    </Link>
  );
}
