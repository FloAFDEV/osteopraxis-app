import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  color?: string; // ex: "text-blue-500"
  icon?: React.ReactNode;
}

const StatCard = ({
  title,
  value,
  description,
  color = "text-blue-500",
  icon
}: StatCardProps) => {
  const borderColor = color.replace("text-", "border-t-"); "border-t-blus-500";

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-lg shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-[2px] border-t-4",
        borderColor
      )}
    >
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
