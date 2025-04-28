
import React from 'react';
import { cn } from '@/lib/utils';
import { AppointmentStatus } from '@/types';

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

export function AppointmentStatusBadge({ status, className }: AppointmentStatusBadgeProps) {
  const baseStyle = "px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm border";
  
  const statusStyles: Record<AppointmentStatus, string> = {
    SCHEDULED: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    COMPLETED: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    CANCELED: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    CANCELLED: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800", // Pour gérer l'ancienne orthographe
    RESCHEDULED: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    NO_SHOW: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800"
  };

  const statusLabels: Record<AppointmentStatus, string> = {
    SCHEDULED: "Planifié",
    COMPLETED: "Terminé",
    CANCELED: "Annulé",
    CANCELLED: "Annulé", // Pour gérer l'ancienne orthographe
    RESCHEDULED: "Reporté",
    NO_SHOW: "Absent"
  };

  return (
    <span 
      className={cn(baseStyle, statusStyles[status], className)}
      aria-label={`Statut: ${statusLabels[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
