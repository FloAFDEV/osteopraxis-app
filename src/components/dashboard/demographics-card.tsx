
import React from 'react';
import { CardTitle, CardDescription, CardContent, Card, CardHeader } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Patient } from "@/types";

interface DemographicsCardProps {
  patients: Patient[];
}

export const DemographicsCard: React.FC<DemographicsCardProps> = ({ patients }) => {
  // Calculate gender distribution
  const genderCounts = patients.reduce((acc, patient) => {
    const gender = patient.gender || "Non spécifié";
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Format data for pie chart
  const genderData = Object.entries(genderCounts).map(([name, value]) => ({
    name,
    value,
    percentage: Math.round((value / patients.length) * 100)
  }));
  
  // Colors based on gender
  const GENDER_COLORS = {
    "Homme": "#3b82f6",
    "Femme": "#d946ef",
    "Non spécifié": "#94a3b8"
  };
  
  // Custom tooltip to display percentage with better formatting
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border rounded-md shadow">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{data.value}</span> patients
          </p>
          <p className="text-sm text-primary font-semibold">
            {data.percentage}% du total
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Custom label for the pie chart
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    name,
  }: any) => {
    // Only show label for slices with significant percentage
    if (percent < 0.05) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        fontWeight="bold"
        fontSize="12"
        dominantBaseline="central"
        textAnchor="middle"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  // Custom Legend component with better styling
  const CustomLegend = ({ payload }: any) => {
    return (
      <ul className="flex flex-wrap justify-center gap-4 pt-4">
        {payload.map((entry: any, index: number) => (
          <li key={`legend-${index}`} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm">{entry.value} ({entry.payload.percentage}%)</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Démographie des patients</CardTitle>
        <CardDescription>
          Répartition par genre sur un total de {patients.length} patients
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={GENDER_COLORS[entry.name as keyof typeof GENDER_COLORS] || "#94a3b8"} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
