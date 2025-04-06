
import React from 'react';
import { CardTitle, CardDescription, CardContent, Card, CardHeader } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Patient, DashboardData } from "@/types";
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface DemographicsCardProps {
  patients?: Patient[];
  data?: DashboardData;
}

export const DemographicsCard: React.FC<DemographicsCardProps> = ({ patients, data }) => {
  // Use either patients prop or extract from data prop
  const patientsList = patients || [];
  const totalPatients = patientsList.length;
  
  // Calculate gender distribution, safely handling empty array
  const calculateGenderData = () => {
    if (!patientsList.length) {
      if (data) {
        // Use the data prop if available and patients array is empty
        return [
          { name: "Homme", value: data.maleCount, percentage: Math.round((data.maleCount / (data.totalPatients || 1)) * 100) },
          { name: "Femme", value: data.femaleCount, percentage: Math.round((data.femaleCount / (data.totalPatients || 1)) * 100) }
        ];
      }
      return [];
    }
    
    const genderCounts = patientsList.reduce((acc, patient) => {
      const gender = patient.gender || "Non spécifié";
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(genderCounts).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / (totalPatients || 1)) * 100) // Avoid division by zero
    }));
  };
  
  // Get chart data
  const chartData = calculateGenderData();
  
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
        fontSize="14"
        dominantBaseline="central"
        textAnchor="middle"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  // Custom Legend component with better styling
  const CustomLegend = ({ payload }: any) => {
    if (!payload) return null;
    
    return (
      <ul className="flex flex-wrap justify-center gap-4 pt-4">
        {payload.map((entry: any, index: number) => (
          <li key={`legend-${index}`} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm cursor-help">
                    {entry.value} ({entry.payload.percentage}%)
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{entry.payload.value} patients ({entry.payload.percentage}% du total)</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </li>
        ))}
      </ul>
    );
  };

  // Handle empty data case
  if (chartData.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Démographie des patients</CardTitle>
          <CardDescription>
            Aucune donnée démographique disponible
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-muted-foreground text-center">Ajoutez des patients pour voir les statistiques démographiques</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full dark:border-gray-700">
      <CardHeader>
        <CardTitle>Démographie des patients</CardTitle>
        <CardDescription>
          Répartition par genre sur un total de {totalPatients || data?.totalPatients || 0} patients
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
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
