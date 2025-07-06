import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Collection de skeleton loaders optimisés pour différents composants
 */

// Loader pour les cartes de patients
export const PatientCardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("space-y-3 p-4 border rounded-lg", className)}>
    <div className="flex items-center space-x-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-[60%]" />
        <Skeleton className="h-3 w-[40%]" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-[80%]" />
    </div>
    <div className="flex justify-between">
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-6 w-20" />
    </div>
  </div>
);

// Loader pour la liste de patients
export const PatientListSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-[40%]" />
          <Skeleton className="h-3 w-[60%]" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    ))}
  </div>
);

// Loader pour les rendez-vous
export const AppointmentSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("space-y-3 p-4 border rounded-lg", className)}>
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-4 w-20" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-5 w-[70%]" />
      <Skeleton className="h-4 w-[50%]" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
);

// Loader pour le planning
export const ScheduleSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-40" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
    
    {/* Planning grid */}
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <AppointmentSkeleton key={j} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Loader pour le dashboard
export const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-60" />
      <Skeleton className="h-8 w-32" />
    </div>
    
    {/* Stats cards */}
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-6 border rounded-lg space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
    
    {/* Charts */}
    <div className="grid gap-6 md:grid-cols-2">
      <div className="p-6 border rounded-lg space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="p-6 border rounded-lg space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  </div>
);

// Loader pour les formulaires
export const FormSkeleton = () => (
  <div className="space-y-6 p-6 border rounded-lg">
    <Skeleton className="h-8 w-60" />
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
    <div className="flex justify-end gap-2">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
);

// Loader générique intelligent
export const SmartSkeleton = ({ 
  type, 
  count = 1, 
  className 
}: { 
  type: 'patient-card' | 'patient-list' | 'appointment' | 'schedule' | 'dashboard' | 'form';
  count?: number;
  className?: string;
}) => {
  const SkeletonComponent = {
    'patient-card': PatientCardSkeleton,
    'patient-list': PatientListSkeleton,
    'appointment': AppointmentSkeleton,
    'schedule': ScheduleSkeleton,
    'dashboard': DashboardSkeleton,
    'form': FormSkeleton
  }[type];

  if (type === 'patient-list') {
    return <PatientListSkeleton count={count} />;
  }

  if (type === 'schedule' || type === 'dashboard' || type === 'form') {
    return <SkeletonComponent />;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
};