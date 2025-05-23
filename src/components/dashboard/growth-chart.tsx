
import React, { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardData } from "@/types";
import {
  CartesianGrid,
  Legend,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartWrapper } from "./chart/chart-wrapper";
import { CustomTooltip } from "./chart/chart-tooltip";
import { LineConfig } from "./chart/line-config";
import { formatSeriesName, prepareChartData } from "./chart/chart-utils";

interface GrowthChartProps {
  data: DashboardData;
}

/**
 * Graphique d'évolution de la croissance des patients
 */
export function GrowthChart({ data }: GrowthChartProps) {
  const { isMobile } = useIsMobile();
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Transforme les données du dashboard pour l'affichage dans le graphique
    const processedData = prepareChartData(data);
    
    // Vérifier si les données contiennent des valeurs non nulles
    console.log("Données du graphique:", processedData);
    
    setChartData(processedData);
    setIsLoading(false);
  }, [data]);

  if (!data || !data.monthlyGrowth) {
    return <ChartWrapper title="Croissance mensuelle" isLoading={true} />;
  }

  return (
    <ChartWrapper title="Croissance mensuelle" isLoading={isLoading}>
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 10,
              bottom: 5,
              left: isMobile ? 0 : 30,
            }}
          >
            {/* Grille de fond */}
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            
            {/* Axes X et Y */}
            <XAxis
              dataKey="month"
              tick={{ fill: "#64748b", fontSize: 16 }}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 16 }}
              domain={[0, "auto"]}
            />
            
            {/* Tooltip personnalisé */}
            <Tooltip content={<CustomTooltip />} />
            
            {/* Légende */}
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={formatSeriesName}
            />
            
            {/* Lignes pour chaque série de données */}
            <LineConfig dataKey="total" delay={0} />
            <LineConfig dataKey="hommes" delay={300} />
            <LineConfig dataKey="femmes" delay={600} />
            <LineConfig dataKey="enfants" delay={900} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartWrapper>
  );
}
