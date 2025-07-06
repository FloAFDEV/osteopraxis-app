import { lazy, ComponentType, LazyExoticComponent } from 'react';

/**
 * Hook pour le lazy loading intelligent des composants
 */

// Helper pour créer des composants lazy avec préchargement
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  preloadDelay = 2000
): LazyExoticComponent<T> => {
  const LazyComponent = lazy(importFn);

  // Précharge le composant après un délai
  setTimeout(() => {
    importFn().catch(() => {
      // Ignore les erreurs de préchargement
    });
  }, preloadDelay);

  return LazyComponent;
};

// Composants lazy préchargés pour les pages principales
export const LazyPages = {
  PatientDetail: createLazyComponent(
    () => import('@/pages/PatientDetailPage'),
    1000
  ),
  EditPatient: createLazyComponent(
    () => import('@/pages/EditPatientPage'),
    2000
  ),
  NewPatient: createLazyComponent(
    () => import('@/pages/NewPatientPage'),
    1500
  ),
  EditAppointment: createLazyComponent(
    () => import('@/pages/EditAppointmentPage'),
    2000
  ),
  NewAppointment: createLazyComponent(
    () => import('@/pages/NewAppointmentPage'),
    1500
  ),
  Settings: createLazyComponent(
    () => import('@/pages/SettingsPage'),
    3000
  )
};

export default createLazyComponent;