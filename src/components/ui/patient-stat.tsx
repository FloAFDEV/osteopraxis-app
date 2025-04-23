
import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PatientStatProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  colorClass?: string;
}

export function PatientStat({
  title,
  value,
  icon,
  colorClass = "text-blue-500"
}: PatientStatProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className={cn(
        "absolute top-2 right-2",
        colorClass
      )}>
        {icon}
      </div>
      <div className="p-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className={cn(
          "text-2xl font-bold mt-1",
          colorClass
        )}>
          {value}
        </h3>
      </div>
    </Card>
  );
}
