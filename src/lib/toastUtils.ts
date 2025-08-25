import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

// Bridge function to convert old toast format to Sonner format
const toastFn = (options: ToastOptions) => {
  if (options.variant === 'destructive') {
    sonnerToast.error(options.title, {
      description: options.description,
    });
  } else {
    sonnerToast.success(options.title, {
      description: options.description,
    });
  }
};

// Add success and error methods for direct calls
toastFn.success = (title: string, options?: { description?: string }) => {
  sonnerToast.success(title, options);
};

toastFn.error = (title: string, options?: { description?: string }) => {
  sonnerToast.error(title, options);
};

export const toast = toastFn;

// Also export useToast hook compatibility
export const useToast = () => {
  return { toast };
};