
import React from 'react';
import { cn } from "@/lib/utils";

interface GradientBackgroundProps {
  className?: string;
  children: React.ReactNode;
  variant?: "default" | "subtle" | "strong" | "blue" | "purple" | "pink" | "login";
}

export function GradientBackground({ 
  className, 
  children, 
  variant = "default"
}: GradientBackgroundProps) {
  const variantClasses = {
    default: "from-blue-500/10 via-purple-500/10 to-pink-500/10",
    subtle: "from-blue-500/5 via-purple-500/5 to-pink-500/5",
    strong: "from-blue-500/20 via-purple-500/20 to-pink-500/20",
    blue: "from-blue-600/20 to-blue-400/10",
    purple: "from-purple-600/20 to-purple-400/10",
    pink: "from-pink-600/20 to-pink-400/10",
    login: "from-[#0d1117] via-[#131c2b] to-[#1a1a2e]"
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl",
      className
    )}>
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r backdrop-blur-sm",
        variantClasses[variant]
      )}></div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
