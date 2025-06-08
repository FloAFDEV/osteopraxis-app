
import React, { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartLoader } from "./chart-loader";

interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  children: ReactNode;
  height?: string;
}

/**
 * Composant wrapper pour les graphiques avec titre, sous-titre et gestion de l'état de chargement
 */
export const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  subtitle,
  isLoading = false,
  children,
  height = "400px",
}) => {
  return (
    <Card className="overflow-hidden rounded-lg bg-gradient-to-r from-white to-gray-100 dark:bg-neutral-800 p-1 sm:p-1 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          {subtitle && (
            <span className="text-sm font-normal text-muted-foreground">
              {subtitle}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent style={{ height }} className="flex flex-col">
        {isLoading ? <ChartLoader /> : children}
      </CardContent>
    </Card>
  );
};
