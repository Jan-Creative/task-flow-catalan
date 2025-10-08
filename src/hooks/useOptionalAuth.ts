/**
 * PHASE 3: Optional Auth Hook
 * Provides auth without throwing errors if unavailable
 * Breaks circular dependencies in providers
 */

import { useAuth } from './useAuth';
import { logger } from '@/lib/logger';

export const useOptionalAuth = () => {
  try {
    const auth = useAuth();
    return auth;
  } catch (error) {
    // Auth provider not available - degrade gracefully
    logger.warn('useOptionalAuth', 'Auth provider unavailable, returning null');
    return {
      user: null,
      session: null,
      loading: false,
      signIn: async () => {
        logger.warn('useOptionalAuth', 'Auth operations unavailable');
      },
      signUp: async () => {
        logger.warn('useOptionalAuth', 'Auth operations unavailable');
      },
      signOut: async () => {
        logger.warn('useOptionalAuth', 'Auth operations unavailable');
      },
    };
  }
};
