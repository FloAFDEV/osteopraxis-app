
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardData } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface GrowthChartProps {
  data: DashboardData;
}

export function GrowthChart({ data }: GrowthChartProps) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Croissance mensuelle des patients</span>
          <span className="text-sm font-normal text-muted-foreground">
            {data.newPatientsThisYear} cette année
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] bg-white dark:bg-slate-900 rounded-lg p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.monthlyGrowth}
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fontWeight: 500 }}
                tickLine={{ stroke: 'var(--border)' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: 'var(--border)' }}
              />
              <Tooltip 
                formatter={(value, name) => {
                  return [value, name === "patients" ? "Patients" : "Année précédente"];
                }}
                labelFormatter={(label) => `Mois: ${label}`} 
                contentStyle={{ 
                  backgroundColor: 'white',
                  borderColor: 'var(--border)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ color: value === "Cette année" ? "#2563eb" : "#9333ea", fontWeight: 500 }}>
                    {value}
                  </span>
                )}
              />
              <Bar dataKey="patients" name="Cette année" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="prevPatients" name="Année précédente" fill="#9333ea" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
