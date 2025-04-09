
import React from 'react';
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
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data.monthlyGrowth}
          margin={{ top: 10, right: 20, left: 0, bottom: 40 }} // Increased bottom margin
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12, fontWeight: 500 }}
            tickLine={{ stroke: 'var(--border)' }}
            height={40} // Increased height
            angle={0} // No angle
            textAnchor="middle" // Center text
            interval={0} // Show all labels
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
              borderColor: '#60a5fa',
              borderRadius: '12px',
              padding: '8px 12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            labelStyle={{ fontWeight: 'bold', color: '#2563eb' }}
          />
          <Legend
            formatter={(value) => (
              <span style={{ 
                color: value === "Cette année" ? "#60a5fa" : "#c084fc", 
                fontWeight: 500,
                padding: '0 10px'
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
            barSize={20} // Ajustement de la largeur des barres
          />
          <Bar 
            dataKey="prevPatients" 
            name="Année précédente" 
            fill="#c084fc" 
            radius={[6, 6, 0, 0]}
            barSize={20} // Ajustement de la largeur des barres
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
