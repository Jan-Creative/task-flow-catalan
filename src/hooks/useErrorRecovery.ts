/**
 * Error Recovery Hook
 * Provides standardized error handling and recovery mechanisms
 */

import { useCallback, useState } from 'react';
import { logger } from '@/lib/debugUtils';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface ErrorRecoveryOptions {
  retryCount?: number;
  fallbackData?: any;
  onError?: (error: Error) => void;
  context?: string;
}

export const useErrorRecovery = (options: ErrorRecoveryOptions = {}) => {
  const {
    retryCount = 3,
    fallbackData = null,
    onError,
    context = 'Unknown'
  } = options;

  const [retries, setRetries] = useState(0);
  const [hasError, setHasError] = useState(false);
  const queryClient = useQueryClient();

  const handleError = useCallback(async (
    error: Error,
    operation: () => Promise<any>,
    recoveryOptions?: {
      showToast?: boolean;
      invalidateQueries?: string[];
      fallback?: any;
    }
  ) => {
    const { 
      showToast = true, 
      invalidateQueries = [], 
      fallback = fallbackData 
    } = recoveryOptions || {};

    logger.error(`Error in ${context}`, error);
    setHasError(true);

    // Call custom error handler if provided
    if (onError) {
      onError(error);
    }

    // Show user-friendly toast
    if (showToast) {
      toast.error("S'ha produït un error", {
        description: "Intentant recuperar automàticament...",
      });
    }

    // Attempt recovery if retries are available
    if (retries < retryCount) {
      setRetries(prev => prev + 1);
      
      try {
        // Invalidate specified queries to force refresh
        for (const queryKey of invalidateQueries) {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        }

        // Wait a bit before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        
        // Retry the operation
        const result = await operation();
        
        // Success - reset error state
        setHasError(false);
        setRetries(0);
        
        if (showToast) {
          toast.success("Recuperat correctament");
        }
        
        return result;
      } catch (retryError) {
        logger.error(`Retry ${retries + 1} failed in ${context}`, retryError);
        
        // If this was the last retry, show final error
        if (retries >= retryCount - 1) {
          if (showToast) {
            toast.error("No s'ha pogut recuperar", {
              description: "Si us plau, recarrega la pàgina."
            });
          }
          return fallback;
        }
        
        // Continue retrying
        return handleError(retryError as Error, operation, recoveryOptions);
      }
    }

    return fallback;
  }, [context, retries, retryCount, fallbackData, onError, queryClient]);

  const resetError = useCallback(() => {
    setHasError(false);
    setRetries(0);
  }, []);

  const withErrorRecovery = useCallback(async <T>(
    operation: () => Promise<T>,
    options?: {
      showToast?: boolean;
      invalidateQueries?: string[];
      fallback?: T;
    }
  ): Promise<T> => {
    try {
      const result = await operation();
      // Reset error state on success
      if (hasError) {
        resetError();
      }
      return result;
    } catch (error) {
      return handleError(error as Error, operation, options);
    }
  }, [handleError, hasError, resetError]);

  return {
    handleError,
    withErrorRecovery,
    resetError,
    hasError,
    retries,
    isRetrying: retries > 0
  };
};