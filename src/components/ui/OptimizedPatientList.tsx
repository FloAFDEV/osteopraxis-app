import { Patient } from '@/types';
import { PatientCard } from '@/components/patient-card';
import PatientListItem from '@/components/patients/PatientListItem';
import { Card } from '@/components/ui/card';
import { memo } from 'react';

interface OptimizedPatientListProps {
  patients: Patient[];
  viewMode: 'cards' | 'list';
  isLoading?: boolean;
}

// Composant mémorisé pour éviter les re-renders inutiles
export const OptimizedPatientList = memo(({ 
  patients, 
  viewMode, 
  isLoading = false 
}: OptimizedPatientListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-muted rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aucun patient trouvé</p>
      </div>
    );
  }

  if (viewMode === 'cards') {
    return (
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {patients.map((patient) => (
          <PatientCard key={patient.id} patient={patient} compact={false} />
        ))}
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="divide-y">
        {patients.map((patient) => (
          <PatientListItem key={patient.id} patient={patient} />
        ))}
      </div>
    </Card>
  );
});

OptimizedPatientList.displayName = 'OptimizedPatientList';