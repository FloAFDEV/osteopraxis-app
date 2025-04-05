
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardData } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface GrowthChartProps {
  data: DashboardData;
}

export function GrowthChart({ data }: GrowthChartProps) {
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Croissance mensuelle des patients</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.monthlyGrowth}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  return [value, name === "patients" ? "Patients" : "Année précédente"];
                }}
                labelFormatter={(label) => `Mois: ${label}`} 
              />
              <Bar dataKey="patients" fill="hsl(var(--primary))" name="patients" />
              <Bar dataKey="prevPatients" fill="hsl(var(--muted))" name="prevPatients" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
