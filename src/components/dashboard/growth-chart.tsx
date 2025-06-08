
import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardData } from "@/types";
import { useEffect, useState } from "react";
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
import { CustomLegend } from "./chart/custom-legend";
import { processGrowthData, ProcessedGrowthData } from "./chart/growth-data-processor";
import { renderGrowthLines, NAME_MAP, TOOLTIP_NAME_MAP } from "./chart/growth-chart-config";

interface GrowthChartProps {
  data: DashboardData;
}

/**
 * Graphique d'évolution de la croissance des patients
 */
export function GrowthChart({ data }: GrowthChartProps) {
  const { isMobile } = useIsMobile();
  const [chartData, setChartData] = useState<ProcessedGrowthData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!data || !data.monthlyGrowth) return;

    const formattedData = processGrowthData(data);
    console.log("Données du graphique:", formattedData);

    setChartData(formattedData);
    setIsLoading(false);
  }, [data]);

  if (!data || !data.monthlyGrowth) {
    return (
      <ChartWrapper title="Croissance mensuelle" isLoading={true}>
        <div>Aucune donnée disponible</div>
      </ChartWrapper>
    );
  }

  return (
    <ChartWrapper title="Croissance mensuelle" isLoading={isLoading}>
      <div className="w-full flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 10,
              left: isMobile ? 0 : 1,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            
            <XAxis
              dataKey="month"
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 12 }}
              domain={[0, "auto"]}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#0891b2",
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              itemStyle={{ color: "#ffffff", fontSize: "14px" }}
              labelStyle={{
                color: "#ffffff",
                fontWeight: "bold",
              }}
              formatter={(value, name) => {
                return [
                  `${value} patients`,
                  TOOLTIP_NAME_MAP[name as keyof typeof TOOLTIP_NAME_MAP] || name,
                ];
              }}
            />

            <Legend content={<CustomLegend nameMap={NAME_MAP} />} />

            {renderGrowthLines()}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartWrapper>
  );
}
