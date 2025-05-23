
import React, { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartLoader } from "./chart-loader";

interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  children: ReactNode;
}

/**
 * Composant wrapper pour les graphiques avec titre, sous-titre et gestion de l'état de chargement
 */
export const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  subtitle,
  isLoading = false,
  children,
}) => {
  return (
    <Card className="overflow-hidden rounded-lg border-t-4 border-t-gray-300 bg-gradient-to-r from-white to-gray-100 dark:bg-neutral-800 p-4 sm:p-2 shadow-lg">
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
      <CardContent className="h-[300px]">
        {isLoading ? <ChartLoader /> : children}
      </CardContent>
    </Card>
  );
};
