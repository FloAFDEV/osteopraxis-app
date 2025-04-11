
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  color?: string;
  icon?: React.ReactNode;
}

const StatCard = ({ title, value, description, color = "text-blue-500", icon }: StatCardProps) => {
  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-t-4" style={{ borderTopColor: `var(--${color.replace("text-", "")})` }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className={cn("h-7 w-7 font-medium", color)}>{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={cn("text-xs text-muted-foreground", color)}>
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

export default StatCard;
