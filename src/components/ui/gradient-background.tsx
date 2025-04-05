
import React from 'react';
import { cn } from "@/lib/utils";

interface GradientBackgroundProps {
  className?: string;
  children: React.ReactNode;
  variant?: "default" | "subtle" | "strong";
}

export function GradientBackground({ 
  className, 
  children, 
  variant = "default"
}: GradientBackgroundProps) {
  const variantClasses = {
    default: "from-blue-500/10 via-purple-500/10 to-pink-500/10",
    subtle: "from-blue-500/5 via-purple-500/5 to-pink-500/5",
    strong: "from-blue-500/20 via-purple-500/20 to-pink-500/20"
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
      {children}
    </div>
  );
}
