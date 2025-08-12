import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import type { GestorErrors } from "@/types";

export const useGestorErrors = (): GestorErrors => {
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const handleError = useCallback((error: Error) => {
    console.error('Error de l\'aplicació:', error);
    setError(error);
    
    // Mostrar error a l'usuari
    toast({
      title: "Error",
      description: error.message || "S'ha produït un error inesperat",
      variant: "destructive",
    });
  }, [toast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    clearError,
    handleError,
  };
};