
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useMode } from '@/contexts/ModeContext';
import { useAdaptiveData } from '@/hooks/useAdaptiveData';
import { useQuery } from '@tanstack/react-query';
import { DemoBanner } from "@/components/DemoBanner";
import { DemoNavigation } from "@/components/DemoNavigation";
import PatientHeader from "@/components/patients/PatientHeader";
import PatientListItem from "@/components/patients/PatientListItem";
import { Card, CardContent } from "@/components/ui/card";

export default function DemoPatientsPage() {
  const { mode, setMode } = useMode();
  const dataService = useAdaptiveData();

  useEffect(() => {
    if (mode !== 'demo') {
      setMode('demo');
    }
  }, [mode, setMode]);

  const { data: patients = [], isLoading } = useQuery({
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
      <div className="container mx-auto p-6 space-y-6">
        <PatientHeader 
          patientCount={patients.length}
          isRefreshing={isLoading}
          onRefresh={() => {}}
        />
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {patients.map((patient: any) => (
                <PatientListItem
                  key={patient.id}
                  patient={patient}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
