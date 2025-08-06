import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useMode } from '@/contexts/ModeContext';
import { DemoBanner } from "@/components/DemoBanner";
import { DemoNavigation } from "@/components/DemoNavigation";
import { MonthlyScheduleView } from "@/components/schedule/MonthlyScheduleView";

export default function DemoSchedulePage() {
  const { mode, setMode, getDemoData } = useMode();

  useEffect(() => {
    if (mode !== 'demo') {
      setMode('demo');
    }
  }, [mode, setMode]);

  if (mode !== 'demo') {
    return <Navigate to="/" replace />;
  }

  const demoData = getDemoData();

  return (
    <div className="min-h-screen bg-background">
      <DemoBanner />
      <DemoNavigation />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Planning - Mode Démo</h1>
        <MonthlyScheduleView 
          appointments={demoData.appointments}
          patients={demoData.patients}
          selectedDate={new Date()}
          onDateChange={() => {}}
        />
      </div>
    </div>
  );
}