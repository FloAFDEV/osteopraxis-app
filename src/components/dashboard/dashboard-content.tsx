
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DashboardData } from "@/types";
import { GrowthChart as DashboardGrowthChart } from "./growth-chart";
import { GrowthChart as SimpleGrowthChart } from "../growth-chart";

interface DashboardContentProps {
  dashboardData: DashboardData;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({ dashboardData }) => {
  const [chartType, setChartType] = useState<"detailed" | "simple">("detailed");

  return (
    <div className="animate-fade-in animate-delay-300">
      <Card className="hover-scale">
        <CardContent className="p-6 bg-inherit">
          <h2 className="text-2xl font-bold mb-4">
            Évolution de l'activité
          </h2>
          <div className="h-full">
            {chartType === "detailed" ? (
              <DashboardGrowthChart data={dashboardData} />
            ) : (
              <SimpleGrowthChart data={dashboardData} />
            )}
          </div>
          <div className="m-0 mt-4 flex items-center gap-2">
            <label htmlFor="chartType" className="text-sm font-medium">
              Type de graphique :
            </label>

            <button
              id="chartType"
              type="button"
              aria-label={`Changer le type de graphique (actuellement : ${
                chartType === "detailed"
                  ? "Évolution annuelle"
                  : "Comparaison avec N-1"
              })`}
              onClick={() =>
                setChartType(
                  chartType === "detailed" ? "simple" : "detailed"
                )
              }
              className="relative w-44 h-9 text-xs rounded border border-gray-300 bg-gray-100 dark:text-gray-300 dark:bg-slate-700 perspective-[1000px] focus:outline-none"
            >
              <div
                className={`relative w-full h-full transition-transform duration-700 ease-&lsqb;cubic-bezier(0.4,0.0,0.2,1)&rsqb; [transform-style:preserve-3d] will-change-transform ${
                  chartType === "simple"
                    ? "[transform:rotateY(180deg)]"
                    : ""
                }`}
              >
                <div className="absolute inset-0 flex items-center justify-center px-2 font-bold text-center text-teal-700 dark:text-sky-400 [backface-visibility:hidden]">
                  Évolution annuelle
                </div>
                <div className="absolute inset-0 flex items-center justify-center px-2 font-bold text-center text-teal-700 dark:text-sky-400 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  Comparaison avec N-1
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
