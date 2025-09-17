import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

/**
 * Authentication guard hook that ensures valid session for database operations
 */
export const useAuthGuard = () => {
  const { user, signOut } = useAuth();

  const ensureValidSession = useCallback(async () => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Session invalid:', sessionError);
      
      // Try to refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session) {
        console.error('Failed to refresh session:', refreshError);
        
        // Force logout and show auth page
        toast.error("Sessió expirada", {
          description: "Si us plau, torna a iniciar sessió."
        });
        
        await signOut();
        throw new Error("Sessió expirada. Si us plau, torna a iniciar sessió.");
      }
      
      console.log('Session refreshed successfully');
      return refreshData.session;
    }
    
    return session;
  }, [user, signOut]);

  const withAuthGuard = useCallback(async (operation: () => Promise<any>) => {
    await ensureValidSession();
    return operation();
  }, [ensureValidSession]);

  return {
    ensureValidSession,
    withAuthGuard,
    isAuthenticated: !!user
  };
};