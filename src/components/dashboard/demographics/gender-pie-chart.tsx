
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { User, UserRound, Baby, UserCircle, ChartPie } from 'lucide-react';
import { TooltipProvider, Tooltip as UITooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

export interface GenderChartData {
  name: string;
  value: number;
  percentage: number;
  icon: React.ReactNode;
}

interface GenderPieChartProps {
  chartData: GenderChartData[];
  totalPatients: number;
}

export const GENDER_COLORS = {
  "Homme": "#3b82f6",
  "Femme": "#d946ef",
  "Enfant": "#10b981",
  "Non spécifié": "#94a3b8"
};

export const GenderPieChart: React.FC<GenderPieChartProps> = ({ chartData, totalPatients }) => {
  const { isMobile } = useIsMobile();
  
  // Log data for debugging
  console.log("GenderPieChart received data:", chartData, "totalPatients:", totalPatients);

  // Create safe data for the chart - ensure we always have valid data
  const validChartData = chartData?.filter(item => item.value > 0) || [];
  
  console.log("Valid chart data after filtering:", validChartData);
  
  // If we have no data, show a placeholder
  if (!validChartData.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
        <ChartPie className="h-12 w-12 mb-2" />
        <p>Aucune donnée démographique disponible</p>
      </div>
    );
  }

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index
  }: any) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <g>
        <text 
          x={x} 
          y={y} 
          fill="white" 
          fontWeight="bold" 
          fontSize="14" 
          dominantBaseline="central" 
          textAnchor="middle"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      </g>
    );
  };

  const CustomTooltip = ({
    active,
    payload
  }: any) => {
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

  const CustomLegend = ({
    payload
  }: any) => {
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
                  <p>
                    {entry.payload.value} patients ({entry.payload.percentage}% du total)
                  </p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="h-[300px] mt-4">
      <ResponsiveContainer width="100%" height="100%" debounce={1}>
        <PieChart>
          <Pie 
            data={validChartData} 
            cx="50%" 
            cy="50%" 
            labelLine={false} 
            label={renderCustomizedLabel} 
            outerRadius={isMobile ? 80 : 100}
            fill="#8884d8" 
            dataKey="value"
            isAnimationActive={true}
            animationDuration={800}
            animationBegin={300}
          >
            {validChartData.map((entry, index) => (
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
  );
};
