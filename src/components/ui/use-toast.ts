
import { useToast as useHookToast, toast as hookToast } from "@/hooks/use-toast";
import type { ToastProps } from "@/components/ui/toast";

// Create styled versions of toast for each message type
const toast = {
  ...hookToast,
  
  // Success toast with green style and checkmark icon
  success: (title: string, options?: Omit<Parameters<typeof hookToast>[0], "title" | "variant">) => {
    return hookToast({
      title: `✅ ${title}`,
      variant: "success",
      className: 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100',
      ...options
    });
  },
  
  // Error toast with red style and X icon
  error: (title: string, options?: Omit<Parameters<typeof hookToast>[0], "title" | "variant">) => {
    return hookToast({
      title: `❌ ${title}`,
      variant: "error",
      className: 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100',
      ...options
    });
  },
  
  // Warning toast with amber/orange style and warning icon
  warning: (title: string, options?: Omit<Parameters<typeof hookToast>[0], "title" | "variant">) => {
    return hookToast({
      title: `⚠️ ${title}`,
      variant: "warning",
      className: 'bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100',
      ...options
    });
  },
  
  // Info toast with blue style and info icon
  info: (title: string, options?: Omit<Parameters<typeof hookToast>[0], "title" | "variant">) => {
    return hookToast({
      title: `ℹ️ ${title}`,
      variant: "info",
      className: 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100',
      ...options
    });
  }
};

// Export the functions with the custom wrapper
export { useHookToast as useToast, toast };
