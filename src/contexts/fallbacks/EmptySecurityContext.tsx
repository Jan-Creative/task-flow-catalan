import React, { ReactNode } from 'react';
import { SecurityContext } from '../SecurityContext';
import { logger } from '@/lib/logger';

// Empty context value with safe defaults
export const EMPTY_SECURITY_CONTEXT = {
  // States
  isSecure: false,
  rateLimitStatus: {
    allowed: true,
    remaining: 0,
    resetTime: Date.now(),
  },
  securityIssues: ['SecurityProvider failed to initialize'],

  // No-op functions
  checkRateLimit: () => {
    logger.warn('EmptySecurityContext', 'Security operations unavailable - provider failed');
    return true;
  },
  logEvent: () => {
    logger.warn('EmptySecurityContext', 'Security operations unavailable - provider failed');
  },
  validateInput: () => {
    logger.warn('EmptySecurityContext', 'Security operations unavailable - provider failed');
    return true;
  },
  refreshSecurityStatus: () => {
    logger.warn('EmptySecurityContext', 'Security operations unavailable - provider failed');
  },
};

export const EmptySecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <SecurityContext.Provider value={EMPTY_SECURITY_CONTEXT}>
      {children}
    </SecurityContext.Provider>
  );
};
