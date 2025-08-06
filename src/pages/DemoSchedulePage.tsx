
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useMode } from '@/contexts/ModeContext';
import { useAdaptiveData } from '@/hooks/useAdaptiveData';
import { useQuery } from '@tanstack/react-query';
import { DemoBanner } from "@/components/DemoBanner";
import { DemoNavigation } from "@/components/DemoNavigation";
import { MonthlyScheduleView } from "@/components/schedule/MonthlyScheduleView";

export default function DemoSchedulePage() {
  const { mode, setMode } = useMode();
  const dataService = useAdaptiveData();

  useEffect(() => {
    if (mode !== 'demo') {
      setMode('demo');
    }
  }, [mode, setMode]);

  const { data: appointments = [] } = useQuery({
    queryKey: ['demo-appointments'],
    queryFn: () => dataService.getAppointments(),
    enabled: mode === 'demo',
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['demo-patients'],
    queryFn: () => dataService.getPatients(),
    enabled: mode === 'demo',
  });

  if (mode !== 'demo') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <DemoBanner />
      <DemoNavigation />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Planning - Mode Démo</h1>
        <MonthlyScheduleView 
          appointments={appointments}
          patients={patients}
          selectedDate={new Date()}
          onDateChange={() => {}}
        />
      </div>
    </div>
  );
}
