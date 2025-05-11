
import React from 'react';
import { CardTitle, CardDescription, CardContent, Card, CardHeader } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Patient, DashboardData } from "@/types";
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { User, UserRound, UserCircle, Baby } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DemographicsCardProps {
  patients?: Patient[];
  data?: DashboardData;
}

interface GenderChartData {
  name: string;
  value: number;
  percentage: number;
  icon: React.ReactNode;
}

export const DemographicsCard: React.FC<DemographicsCardProps> = ({
  patients,
  data
}) => {
  const { isMobile } = useIsMobile();
  const patientsList = patients || [];
  const totalPatients = patientsList.length || data?.totalPatients || 0;
  const maleCount = data?.maleCount || 0;
  const femaleCount = data?.femaleCount || 0;

  // Function to determine if a patient is a child (age < 18)
  const isChild = (patient: Patient): boolean => {
    if (!patient.birthDate) return false;
    
    const birthDate = new Date(patient.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // If birth month hasn't occurred this year yet or if birth month is the same but birth day hasn't occurred yet
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 < 18; // Subtract 1 from age
    }
    
    return age < 18;
  };

  // Calculate children count from patients list
  const getChildrenCount = (): number => {
    if (patientsList.length > 0) {
      return patientsList.filter(isChild).length;
    }
    // Default value if no patient data available
    return 0;
  };

  const childrenCount = getChildrenCount();

  const GENDER_COLORS = {
    "Homme": "#3b82f6",  
    "Femme": "#d946ef",
    "Enfant": "#10b981", // Emerald color for children
    "Non spécifié": "#94a3b8"
  };

  const calculateGenderData = (): GenderChartData[] => {
    if (data && data.maleCount !== undefined && data.femaleCount !== undefined) {
      // If using dashboard data, we'll have to add children data separately
      // For now, return adult data only as we can't determine children from this dataset
      return [{
        name: "Homme",
        value: data.maleCount,
        percentage: totalPatients > 0 ? Math.round((data.maleCount / totalPatients) * 100) : 0,
        icon: <User className="h-5 w-5 text-blue-600" />
      }, {
        name: "Femme",
        value: data.femaleCount,
        percentage: totalPatients > 0 ? Math.round((data.femaleCount / totalPatients) * 100) : 0,
        icon: <UserRound className="h-5 w-5 text-pink-600" />
      }];
    }

    if (patientsList.length > 0) {
      const childPatients = patientsList.filter(isChild);
      const adultPatients = patientsList.filter(patient => !isChild(patient));
      
      // Count adult males and females
      const adultMales = adultPatients.filter(p => p.gender === "Homme").length;
      const adultFemales = adultPatients.filter(p => p.gender === "Femme").length;
      const otherOrUndefined = adultPatients.filter(p => p.gender !== "Homme" && p.gender !== "Femme").length;
      
      const result: GenderChartData[] = [];
      
      // Add adult males if any
      if (adultMales > 0) {
        result.push({
          name: "Homme",
          value: adultMales,
          percentage: Math.round((adultMales / totalPatients) * 100),
          icon: <User className="h-5 w-5 text-blue-600" />
        });
      }
      
      // Add adult females if any
      if (adultFemales > 0) {
        result.push({
          name: "Femme",
          value: adultFemales,
          percentage: Math.round((adultFemales / totalPatients) * 100),
          icon: <UserRound className="h-5 w-5 text-pink-600" />
        });
      }
      
      // Add children as a separate category if any
      if (childPatients.length > 0) {
        result.push({
          name: "Enfant",
          value: childPatients.length,
          percentage: Math.round((childPatients.length / totalPatients) * 100),
          icon: <Baby className="h-5 w-5 text-emerald-600" />
        });
      }
      
      // Add other/undefined if any
      if (otherOrUndefined > 0) {
        result.push({
          name: "Non spécifié",
          value: otherOrUndefined,
          percentage: Math.round((otherOrUndefined / totalPatients) * 100),
          icon: <UserCircle className="h-5 w-5 text-gray-600" />
        });
      }
      
      return result;
    }
    
    // Default data if no patients
    return [{
      name: "Homme",
      value: 1,
      percentage: 50,
      icon: <User className="h-5 w-5 text-blue-600" />
    }, {
      name: "Femme",
      value: 1,
      percentage: 50,
      icon: <UserRound className="h-5 w-5 text-pink-600" />
    }];
  };

  const chartData = calculateGenderData();

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
    
    const genderIcon = chartData[index].icon;
    
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
        <g transform={`translate(${x - 12}, ${y + 15}) scale(0.8)`}>
          {genderIcon}
        </g>
      </g>
    );
  };

  const CustomTooltip = ({
    active,
    payload
  }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return <div className="bg-white dark:bg-gray-800 p-3 border rounded-md shadow">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{data.value}</span> patients
          </p>
          <p className="text-sm text-primary font-semibold">
            {data.percentage}% du total
          </p>
        </div>;
    }
    return null;
  };

  const CustomLegend = ({
    payload
  }: any) => {
    if (!payload) return null;
    return <ul className="flex flex-wrap justify-center gap-4 pt-4">
        {payload.map((entry: any, index: number) => <li key={`legend-${index}`} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{
          backgroundColor: entry.color
        }} />
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
          </li>)}
      </ul>;
  };

  const isLoading = patientsList.length === 0 && !data || !maleCount && !femaleCount && totalPatients === 0;
  
  if (isLoading) {
    return <Card className="overflow-hidden rounded-lg border-t-4 border-t-gray-300 bg-gradient-to-r from-white to-gray-100 dark:bg-neutral-800 p-4 sm:p-6 shadow-lg">
        <CardHeader>
          <CardTitle>Démographie des patients</CardTitle>
          <CardDescription>
            Chargement des données démographiques...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </CardContent>
      </Card>;
  }
  
  const hasChildrenData = chartData.some(item => item.name === "Enfant");
  
  return (
    <Card className="overflow-hidden rounded-lg bg-gradient-to-r from-white to-gray-100 dark:bg-neutral-800 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader>
        <CardTitle className="text-gray-800 dark:text-white">
          Démographie des patients
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Répartition par genre sur un total de {totalPatients} patients
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`h-[${isMobile ? '300' : '300'}px] mt-4`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={chartData} 
                cx="50%" 
                cy="50%" 
                labelLine={false} 
                label={renderCustomizedLabel} 
                outerRadius={isMobile ? 100 : 120}
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
        
        {/* Children statistics summary */}
        {hasChildrenData && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Baby className="h-4 w-4 text-emerald-600" />
              <span className="font-medium">Enfants: </span>
              <span>
                {childrenCount} patient{childrenCount > 1 ? 's' : ''} ({Math.round((childrenCount / totalPatients) * 100)}% du total)
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
