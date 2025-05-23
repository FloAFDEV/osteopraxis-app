
import React, { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardData } from "@/types";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartWrapper } from "./chart/chart-wrapper";
import { CustomTooltip } from "./chart/chart-tooltip";
import { formatSeriesName, prepareChartData } from "./chart/chart-utils";
import { LINE_COLORS, LINE_WIDTH } from "./chart/line-colors";

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
    return <ChartWrapper title="Croissance mensuelle" isLoading={true}>
      <div>Aucune donnée disponible</div>
    </ChartWrapper>;
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
            <Line
              type="monotone"
              dataKey="total"
              stroke={LINE_COLORS.total}
              strokeWidth={LINE_WIDTH.total}
              dot={{ stroke: LINE_COLORS.total, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              name="total"
              isAnimationActive={true}
              animationDuration={1200}
              connectNulls={true}
            />
            <Line
              type="monotone"
              dataKey="hommes"
              stroke={LINE_COLORS.hommes}
              strokeWidth={LINE_WIDTH.default}
              dot={{ stroke: LINE_COLORS.hommes, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5 }}
              name="hommes"
              isAnimationActive={true}
              animationDuration={1500}
              connectNulls={true}
            />
            <Line
              type="monotone"
              dataKey="femmes"
              stroke={LINE_COLORS.femmes}
              strokeWidth={LINE_WIDTH.default}
              dot={{ stroke: LINE_COLORS.femmes, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5 }}
              name="femmes"
              isAnimationActive={true}
              animationDuration={1800}
              connectNulls={true}
            />
            <Line
              type="monotone"
              dataKey="enfants"
              stroke={LINE_COLORS.enfants}
              strokeWidth={LINE_WIDTH.default}
              dot={{ stroke: LINE_COLORS.enfants, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5 }}
              name="enfants"
              isAnimationActive={true}
              animationDuration={2100}
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartWrapper>
  );
}
