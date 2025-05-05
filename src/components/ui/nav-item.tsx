
import React from 'react';
import { NavLink, type To } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItemProps {
  to: To;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isExternal?: boolean;
  className?: string;
}

export function NavItem({ to, icon, children, isExternal = false, className }: NavItemProps) {
  const content = (
    <div className="flex items-center space-x-3">
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </div>
  );

  if (isExternal) {
    return (
      <a
        href={to.toString()}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "block w-full px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors",
          className
        )}
      >
        {content}
      </a>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        cn(
          "block w-full px-4 py-2 text-sm rounded-md transition-colors",
          isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground",
          className
        )
      }
    >
      {content}
    </NavLink>
  );
}
