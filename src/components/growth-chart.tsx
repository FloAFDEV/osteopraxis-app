
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardData } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface GrowthChartProps {
  data: DashboardData;
}

export function GrowthChart({ data }: GrowthChartProps) {
  return (
    <Card className="col-span-1 bg-white dark:bg-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Croissance mensuelle des patients</span>
          <span className="text-sm font-normal text-muted-foreground">
            {data.newPatientsThisYear} cette année
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] bg-white dark:bg-slate-800 rounded-xl">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.monthlyGrowth}
              margin={{ top: 5, right: 15, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value, name) => {
                  return [value, name === "patients" ? "Patients" : "Année précédente"];
                }}
                labelFormatter={(label) => `Mois: ${label}`} 
                contentStyle={{ 
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              <Bar dataKey="patients" name="Cette année" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="prevPatients" name="Année précédente" fill="#9333ea" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
