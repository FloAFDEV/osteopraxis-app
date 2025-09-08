import React, { useMemo, useState, useCallback } from 'react';
import { useVirtualization } from '@/hooks/usePerformanceOptimization';
import { AppointmentCard } from '@/components/AppointmentCard';
import { Appointment, Patient, AppointmentStatus } from '@/types';

interface VirtualizedAppointmentsListProps {
  appointments: Appointment[];
  patients: Patient[];
  onStatusChange?: (appointmentId: number, status: AppointmentStatus) => Promise<void>;
  itemHeight?: number;
  containerHeight?: number;
  className?: string;
}

/**
 * Liste virtualisée des rendez-vous pour améliorer les performances
 * Lighthouse recommande la virtualisation pour les longues listes
 */
export const VirtualizedAppointmentsList: React.FC<VirtualizedAppointmentsListProps> = ({
  appointments,
  patients,
  onStatusChange,
  itemHeight = 200,
  containerHeight = 600,
  className = ''
}) => {
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  
  // Créer un map pour l'accès rapide aux patients
  const patientMap = useMemo(() => {
    return patients.reduce((acc, patient) => {
      acc[patient.id] = patient;
      return acc;
    }, {} as Record<number, Patient>);
  }, [patients]);

  // Utiliser la virtualisation si plus de 20 éléments
  const shouldVirtualize = appointments.length > 20;
  
  const {
    visibleItems,
    totalHeight,
    scrollTop,
    setScrollTop,
  } = useVirtualization(
    appointments,
    itemHeight,
    containerHeight,
    5 // overscan
  );

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (shouldVirtualize) {
      setScrollTop(e.currentTarget.scrollTop);
    }
  }, [setScrollTop, shouldVirtualize]);

  const handleCancelAppointment = useCallback((appointment: Appointment) => {
    // Implémentation de l'annulation avec optimistic update
    if (onStatusChange) {
      onStatusChange(appointment.id, 'CANCELED');
    }
  }, [onStatusChange]);

  // Si pas besoin de virtualisation, rendu normal
  if (!shouldVirtualize) {
    return (
      <div className={`grid gap-4 md:grid-cols-2 xl:grid-cols-3 ${className}`}>
        {appointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            patient={patientMap[appointment.patientId]}
            onStatusChange={onStatusChange}
            onCancel={() => handleCancelAppointment(appointment)}
          />
        ))}
      </div>
    );
  }

  // Rendu virtualisé pour les longues listes
  return (
    <div className={className}>
      <div
        ref={setContainerRef}
        className="relative overflow-auto border rounded-lg"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleItems.map(({ item: appointment, index, offsetTop }) => (
            <div
              key={`${appointment.id}-${index}`}
              className="absolute w-full px-2"
              style={{
                top: offsetTop,
                height: itemHeight,
              }}
            >
              <div className="h-full pb-2">
                <AppointmentCard
                  appointment={appointment}
                  patient={patientMap[appointment.patientId]}
                  onStatusChange={onStatusChange}
                  onCancel={() => handleCancelAppointment(appointment)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Indicateur de performance */}
      <div className="text-xs text-muted-foreground mt-2 text-center">
        Affichage virtualisé: {visibleItems.length} sur {appointments.length} éléments
      </div>
    </div>
  );
};

export default VirtualizedAppointmentsList;