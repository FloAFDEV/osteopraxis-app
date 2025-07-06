import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AdvancedStats } from "@/services/stats/advanced-stats-service";

interface RevenueChartProps {
  data: AdvancedStats["revenue"]["monthlyBreakdown"];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map(item => ({
    month: item.month,
    revenus: item.amount,
    factures: item.count
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution des Revenus (12 derniers mois)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              fontSize={12}
              tickMargin={10}
            />
            <YAxis 
              fontSize={12}
              tickFormatter={(value) => `${value}€`}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                name === 'revenus' ? `${value.toFixed(2)}€` : `${value}`,
                name === 'revenus' ? 'Revenus' : 'Factures'
              ]}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="revenus" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}