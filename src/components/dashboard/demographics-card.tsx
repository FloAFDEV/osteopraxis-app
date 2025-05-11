
import React, { useEffect } from 'react';
import { CardTitle, CardDescription, CardContent, Card, CardHeader } from "@/components/ui/card";
import { Patient, DashboardData } from "@/types";
import { useIsMobile } from '@/hooks/use-mobile';
import { GenderPieChart } from './demographics/gender-pie-chart';
import { ChildrenStats } from './demographics/children-stats';
import { calculateGenderData, isChild } from './demographics/gender-chart-utils';

interface DemographicsCardProps {
  patients?: Patient[];
  data?: DashboardData;
}

export const DemographicsCard: React.FC<DemographicsCardProps> = ({
  patients,
  data
}) => {
  const { isMobile } = useIsMobile();
  const patientsList = patients || [];
  const totalPatients = patientsList.length || data?.totalPatients || 0;

  // Calculate children count directly from patients list or use the one from data
  const childrenCount = React.useMemo(() => {
    if (patientsList.length > 0) {
      const children = patientsList.filter(isChild);
      console.log(`Children calculation in demographics-card: found ${children.length} children out of ${patientsList.length} patients`);
      return children.length;
    }
    
    return data?.childrenCount || 0;
  }, [patientsList, data?.childrenCount]);

  // Log the final children count for debugging
  useEffect(() => {
    console.log(`Final children count in demographics-card: ${childrenCount}, total patients: ${totalPatients}`);
  }, [childrenCount, totalPatients]);

  const chartData = calculateGenderData(patientsList, totalPatients);
  
  // Add DEBUG: Log chart data just before rendering
  useEffect(() => {
    console.log("Chart data before rendering:", chartData);
  }, [chartData]);

  const isLoading = patientsList.length === 0 && !data || !data?.maleCount && !data?.femaleCount && totalPatients === 0;
  
  if (isLoading) {
    return (
      <Card className="overflow-hidden rounded-lg border-t-4 border-t-gray-300 bg-gradient-to-r from-white to-gray-100 dark:bg-neutral-800 p-4 sm:p-6 shadow-lg">
        <CardHeader>
          <CardTitle>Démographie des patients</CardTitle>
          <CardDescription>
            Chargement des données démographiques...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </CardContent>
      </Card>
    );
  }
  
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
        {/* Add gender data to render */}
        <div className="mb-2 text-sm">
          <span className="font-medium">Total:</span> {totalPatients} patients
        </div>
        
        <GenderPieChart chartData={chartData} totalPatients={totalPatients} />
        
        {/* Children statistics summary - always displayed with real values */}
        <ChildrenStats childrenCount={childrenCount} totalPatients={totalPatients} />
      </CardContent>
    </Card>
  );
};
