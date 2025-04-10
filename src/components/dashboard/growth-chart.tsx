import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { DashboardData } from "@/types";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line
} from "recharts";

interface GrowthChartProps {
  data: DashboardData;
}

export function GrowthChart({ data }: GrowthChartProps) {
  if (!data || !data.monthlyGrowth) {
    return (
      <Card className="overflow-hidden rounded-lg border-t-4 border-t-gray-300 bg-gradient-to-r from-white to-gray-100 dark:bg-neutral-800 p-4 sm:p-6 shadow-lg">
        <CardHeader>
          <CardTitle>Croissance mensuelle</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </CardContent>
      </Card>
    );
  }

  // Traduction des mois
  const monthMap: Record<string, string> = {
    January: "Janvier",
    February: "Février",
    March: "Mars",
    April: "Avril",
    May: "Mai",
    June: "Juin",
    July: "Juillet",
    August: "Août",
    September: "Septembre",
    October: "Octobre",
    November: "Novembre",
    December: "Décembre"
  };

  const formattedData = data.monthlyGrowth.map((item) => ({
    month: monthMap[item.month] || item.month,
    patients: item.patients,
    growthText: item.growthText
  }));

   return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
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
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
            }}
            itemStyle={{ color: "#ffffff", fontSize: "14px" }}
            labelStyle={{ color: "#ffffff", fontWeight: "bold" }}
            formatter={(_, __, props: any) => {
              const patients = props.payload?.patients ?? 0;
              const growthText = props.payload?.growthText ?? "";
              return [
                `👥 ${patients} patients`,
                growthText || "Pas de comparaison disponible"
              ];
            }}
          />
          <Line
            type="monotone"
            dataKey="patients"
            stroke="#4C51BF"
            strokeWidth={3}
            dot={{ stroke: "#4C51BF", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
