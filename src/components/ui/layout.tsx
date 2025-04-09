
import React from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/ui/sidebar";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
          <div className={cn("mx-auto max-w-6xl", className)}>{children}</div>
        </main>
      </div>
    </div>
  );
}
