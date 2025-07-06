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
    <Card className="border-l-4 border-l-green-500">
      <CardHeader>
        <CardTitle className="text-green-700 dark:text-green-300">Évolution des Revenus (12 derniers mois)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
            <XAxis 
              dataKey="month" 
              fontSize={12}
              tickMargin={10}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              fontSize={12}
              tickFormatter={(value) => `${value}€`}
              stroke="hsl(var(--muted-foreground))"
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
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="revenus" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: '#10b981', strokeWidth: 3, fill: '#ffffff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}