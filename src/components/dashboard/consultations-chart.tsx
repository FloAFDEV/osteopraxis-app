
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts";
import { DashboardData } from "@/types";
import { Stethoscope, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConsultationsChartProps {
  data: DashboardData;
}

const chartConfig = {
  consultations: {
    label: "Consultations",
    color: "hsl(var(--chart-1))",
  },
};

export function ConsultationsChart({ data }: ConsultationsChartProps) {
  // Determine trend color and icon
  const trendColor = data.consultationsTrend > 0 
    ? "text-green-500" 
    : data.consultationsTrend < 0 
    ? "text-red-500" 
    : "text-gray-500";
  
  const TrendIcon = data.consultationsTrend > 0 
    ? TrendingUp 
    : data.consultationsTrend < 0 
    ? TrendingDown 
    : TrendingUp;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-indigo-500" />
            <CardTitle className="text-lg font-semibold">Évolution des consultations</CardTitle>
          </div>
          <div className={cn("flex items-center gap-1 text-sm font-medium", trendColor)}>
            <TrendIcon className="h-4 w-4" />
            <span>
              {data.consultationsTrend > 0 ? '+' : ''}{data.consultationsTrend}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Graphique principal - 12 derniers mois */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            12 derniers mois
          </h4>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.consultationsLast12Months}>
                <defs>
                  <linearGradient id="consultationsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(99, 102, 241)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="rgb(99, 102, 241)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent indicator="line" />}
                  cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="consultations"
                  stroke="rgb(99, 102, 241)"
                  strokeWidth={2}
                  fill="url(#consultationsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Graphique secondaire - 7 derniers jours */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            7 derniers jours
          </h4>
          <ChartContainer config={chartConfig} className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.consultationsLast7Days}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  cursor={{ fill: 'hsl(var(--muted) / 0.1)' }}
                />
                <Bar
                  dataKey="consultations"
                  fill="rgb(99, 102, 241)"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Métriques résumées */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {data.averageConsultationsPerDay}
            </p>
            <p className="text-xs text-muted-foreground">
              Consultations/jour
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {data.averageConsultationsPerMonth}
            </p>
            <p className="text-xs text-muted-foreground">
              Consultations/mois
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
