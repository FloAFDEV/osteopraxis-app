
import { useToast as useHookToast, toast as hookToast } from "@/hooks/use-toast";

// Créer des versions stylisées du toast pour chaque type de message
const toast = {
  ...hookToast,
  
  // Toast de succès avec style vert
  success: (message: string, options?: any) => {
    return hookToast(message, {
      className: 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100',
      ...options
    });
  },
  
  // Toast d'erreur avec style rouge
  error: (message: string, options?: any) => {
    return hookToast(message, {
      className: 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100',
      ...options
    });
  },
  
  // Toast d'avertissement avec style orange/ambre
  warning: (message: string, options?: any) => {
    return hookToast(message, {
      className: 'bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100',
      ...options
    });
  },
  
  // Toast d'information avec style bleu
  info: (message: string, options?: any) => {
    return hookToast(message, {
      className: 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100',
      ...options
    });
  }
};

// Exporter les fonctions avec le wrapper personnalisé
export { useHookToast as useToast, toast };
