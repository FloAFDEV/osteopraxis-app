
import React from 'react';
import { DashboardData } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GrowthChartProps {
  data: DashboardData;
}

export function GrowthChart({ data }: GrowthChartProps) {
  // Handle case when data is not available yet
  if (!data || !data.monthlyGrowth) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden bg-white dark:bg-slate-800">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg font-semibold">Croissance des patients</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] bg-white dark:bg-slate-800">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.monthlyGrowth}
              margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fontWeight: 500, fill: 'var(--foreground)' }}
                tickLine={{ stroke: 'var(--border)' }}
                height={40}
                angle={0}
                textAnchor="middle"
                interval={0}
                stroke="var(--border)"
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'var(--foreground)' }}
                tickLine={{ stroke: 'var(--border)' }}
                stroke="var(--border)"
              />
              <Tooltip 
                formatter={(value, name) => {
                  return [value, name === "patients" ? "Patients" : "Année précédente"];
                }}
                labelFormatter={(label) => `Mois: ${label}`} 
                contentStyle={{ 
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  color: 'var(--foreground)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ fontWeight: 'bold', color: 'var(--primary)' }}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ 
                    fontWeight: 500,
                    padding: '0 10px',
                    color: 'var(--foreground)'
                  }}>
                    {value}
                  </span>
                )}
                wrapperStyle={{ paddingTop: '15px' }}
              />
              <Bar 
                dataKey="patients" 
                name="Cette année" 
                fill="#60a5fa" 
                radius={[6, 6, 0, 0]}
                barSize={20}
              />
              <Bar 
                dataKey="prevPatients" 
                name="Année précédente" 
                fill="#c084fc" 
                radius={[6, 6, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
