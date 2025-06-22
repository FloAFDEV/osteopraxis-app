
// Utiliser directement Sonner pour les toasts colorés
import { toast as sonnerToast } from "sonner";

// Créer des versions stylisées du toast pour chaque type de message
const toast = {
  success: (title: string, options?: { description?: string }) => {
    return sonnerToast.success(title, {
      description: options?.description,
      style: {
        background: '#10b981',
        color: 'white',
        border: '1px solid #059669',
      },
      cancel: {
        label: "✕",
        onClick: () => {},
      },
    });
  },
  
  error: (title: string, options?: { description?: string }) => {
    return sonnerToast.error(title, {
      description: options?.description,
      style: {
        background: '#ef4444',
        color: 'white',
        border: '1px solid #dc2626',
      },
      cancel: {
        label: "✕",
        onClick: () => {},
      },
    });
  },
  
  warning: (title: string, options?: { description?: string }) => {
    return sonnerToast.warning(title, {
      description: options?.description,
      style: {
        background: '#f59e0b',
        color: 'white',
        border: '1px solid #d97706',
      },
      cancel: {
        label: "✕",
        onClick: () => {},
      },
    });
  },
  
  info: (title: string, options?: { description?: string }) => {
    return sonnerToast.info(title, {
      description: options?.description,
      style: {
        background: '#3b82f6',
        color: 'white',
        border: '1px solid #2563eb',
      },
      cancel: {
        label: "✕",
        onClick: () => {},
      },
    });
  },

  // Toast par défaut
  default: (title: string, options?: { description?: string }) => {
    return sonnerToast(title, {
      description: options?.description,
      cancel: {
        label: "✕",
        onClick: () => {},
      },
    });
  }
};

// Hook compatible avec l'ancien système
export function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
  };
}

export { toast };
