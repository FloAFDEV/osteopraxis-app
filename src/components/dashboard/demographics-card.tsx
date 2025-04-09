
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
  const totalPatients = patientsList.length || (data?.totalPatients || 0);
  const maleCount = data?.maleCount || 0;
  const femaleCount = data?.femaleCount || 0;
  
  // Calculate gender distribution, safely handling empty array
  const calculateGenderData = () => {
    // If we have data from the dashboard data prop
    if (data && data.maleCount !== undefined && data.femaleCount !== undefined) {
      return [
        { name: "Homme", value: data.maleCount, percentage: Math.round((data.maleCount / (data.totalPatients || 1)) * 100) },
        { name: "Femme", value: data.femaleCount, percentage: Math.round((data.femaleCount / (data.totalPatients || 1)) * 100) }
      ];
    }
    
    // If we have patients data but no dashboard data
    if (patientsList.length > 0) {
      const genderCounts = patientsList.reduce((acc, patient) => {
        const gender = patient.gender || "Non spécifié";
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return Object.entries(genderCounts).map(([name, value]) => ({
        name,
        value,
        percentage: Math.round((value / totalPatients) * 100)
      }));
    }
    
    // Default data if no real data available
    return [
      { name: "Homme", value: 1, percentage: 50 },
      { name: "Femme", value: 1, percentage: 50 }
    ];
  };
  
  // Get chart data
  const chartData = calculateGenderData();
  
  // Colors based on gender
  const GENDER_COLORS = {
    "Homme": "#60a5fa", // blue-400
    "Femme": "#f472b6", // pink-400
    "Non spécifié": "#94a3b8"
  };
  
  // Custom tooltip to display percentage with better formatting
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border rounded-xl shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{data.value}</span> patients
          </p>
          <p className="text-sm text-blue-500 dark:text-blue-400 font-semibold">
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
                <TooltipContent className="rounded-xl">
                  <p>{entry.payload.value} patients ({entry.payload.percentage}% du total)</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </li>
        ))}
      </ul>
    );
  };

  // Handle loading or no data
  if ((patientsList.length === 0 && !data) || (!maleCount && !femaleCount && totalPatients === 0)) {
    return (
      <Card className="h-full rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-blue-500 dark:text-blue-400">Démographie des patients</CardTitle>
          <CardDescription>
            Chargement des données démographiques...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-blue-500 dark:text-blue-400">Démographie des patients</CardTitle>
        <CardDescription>
          Répartition par genre sur un total de {totalPatients} patients
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
}
