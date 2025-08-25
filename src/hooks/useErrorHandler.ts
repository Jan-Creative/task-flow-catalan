/**
 * Centralized error handling hook
 */

import { useCallback } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/debugUtils';
import { ApiError } from '@/types/common';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
}

export const useErrorHandler = () => {
  const handleError = useCallback((
    error: unknown,
    context: ErrorContext = {},
    showToast = true
  ) => {
    // Extract error message
    let message = 'Ha ocorregut un error inesperat';
    let details: Record<string, unknown> = {};

    if (error instanceof Error) {
      message = error.message;
      details.stack = error.stack;
    } else if (typeof error === 'object' && error !== null) {
      const apiError = error as ApiError;
      if (apiError.message) {
        message = apiError.message;
      }
      if (apiError.details) {
        details = { ...details, ...apiError.details };
      }
    } else if (typeof error === 'string') {
      message = error;
    }

    // Log error with context
    logger.error(`Error in ${context.component || 'Unknown Component'}`, {
      message,
      action: context.action,
      userId: context.userId,
      details,
      timestamp: new Date().toISOString()
    });

    // Show user-friendly toast if requested
    if (showToast) {
      const userMessage = getUserFriendlyMessage(message);
      toast.error(userMessage);
    }

    return {
      message,
      userMessage: getUserFriendlyMessage(message),
      details
    };
  }, []);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context: ErrorContext = {},
    showToast = true
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context, showToast);
      return null;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError
  };
};

// ============= HELPER FUNCTIONS =============
const getUserFriendlyMessage = (technicalMessage: string): string => {
  const errorMappings: Record<string, string> = {
    'Network Error': 'Problema de connexió. Comprova la teva connexió a internet.',
    'Unauthorized': 'No tens permisos per realitzar aquesta acció.',
    'Forbidden': 'Accés denegat.',
    'Not Found': 'L\'element sol·licitat no s\'ha trobat.',
    'Internal Server Error': 'Error del servidor. Prova-ho més tard.',
    'Bad Request': 'Petició incorrecta. Verifica les dades introduïdes.',
    'Conflict': 'Conflicte amb les dades existents.',
    'Too Many Requests': 'Massa peticions. Prova-ho més tard.',
    'Service Unavailable': 'Servei no disponible temporalment.'
  };

  // Check for exact matches first
  if (errorMappings[technicalMessage]) {
    return errorMappings[technicalMessage];
  }

  // Check for partial matches
  for (const [key, userMessage] of Object.entries(errorMappings)) {
    if (technicalMessage.includes(key)) {
      return userMessage;
    }
  }

  // Database specific errors
  if (technicalMessage.includes('duplicate key')) {
    return 'Aquest element ja existeix.';
  }

  if (technicalMessage.includes('violates foreign key')) {
    return 'No es pot eliminar perquè està relacionat amb altres elements.';
  }

  if (technicalMessage.includes('permission denied')) {
    return 'No tens permisos per realitzar aquesta acció.';
  }

  if (technicalMessage.includes('connection')) {
    return 'Problema de connexió. Comprova la teva connexió a internet.';
  }

  // Return a generic message if no specific mapping found
  return 'Ha ocorregut un error. Prova-ho de nou.';
};