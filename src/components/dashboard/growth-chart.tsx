
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardData } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

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
    <div className="h-[300px] bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-blue-600 dark:text-blue-400">Évolution des patients</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Comparaison avec l'année dernière</p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data.monthlyGrowth}
          margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
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
              borderRadius: '12px',
              padding: '8px 12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            labelStyle={{ fontWeight: 'bold' }}
          />
          <Legend
            formatter={(value) => (
              <span style={{ color: value === "Cette année" ? "#60a5fa" : "#c084fc", fontWeight: 500 }}>
                {value}
              </span>
            )}
          />
          <Bar dataKey="patients" name="Cette année" fill="#60a5fa" radius={[6, 6, 0, 0]} />
          <Bar dataKey="prevPatients" name="Année précédente" fill="#c084fc" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
