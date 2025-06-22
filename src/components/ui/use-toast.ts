
import { toast as sonnerToast } from "sonner";

// Toast utilisant uniquement Sonner
const toast = {
  success: (title: string, options?: { description?: string }) => {
    return sonnerToast.success(title, {
      description: options?.description,
    });
  },
  
  error: (title: string, options?: { description?: string }) => {
    return sonnerToast.error(title, {
      description: options?.description,
    });
  },
  
  warning: (title: string, options?: { description?: string }) => {
    return sonnerToast.warning(title, {
      description: options?.description,
    });
  },
  
  info: (title: string, options?: { description?: string }) => {
    return sonnerToast.info(title, {
      description: options?.description,
    });
  },

  // Toast par défaut
  default: (title: string, options?: { description?: string }) => {
    return sonnerToast(title, {
      description: options?.description,
    });
  }
};

// Hook simplifié pour Sonner uniquement
export function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
  };
}

export { toast };
