/**
 * Security Context and Hooks
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  logSecurityEvent, 
  checkRateLimit, 
  validateUserInput,
  validateSecurityEnvironment,
  type SecurityEvent 
} from '@/lib/securityUtils';
import { config } from '@/config/appConfig';
import { logger } from '@/lib/debugUtils';

// ============= SECURITY CONTEXT =============
interface SecurityContextValue {
  isSecure: boolean;
  rateLimitStatus: { allowed: boolean; remaining: number; resetTime: number } | null;
  securityIssues: string[];
  checkRateLimit: (action: string) => boolean;
  logEvent: (event: Omit<SecurityEvent, 'timestamp'>) => void;
  validateInput: (input: string, type: 'email' | 'password' | 'text' | 'url') => boolean;
  refreshSecurityStatus: () => void;
}

export const SecurityContext = createContext<SecurityContextValue | null>(null);

// ============= SECURITY PROVIDER =============
export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isSecure, setIsSecure] = useState(true);
  const [rateLimitStatus, setRateLimitStatus] = useState<SecurityContextValue['rateLimitStatus']>(null);
  const [securityIssues, setSecurityIssues] = useState<string[]>([]);

  // Get user identifier for rate limiting
  const getUserIdentifier = useCallback(() => {
    if (user?.id) return user.id;
    if (typeof window !== 'undefined') {
      // Fallback to IP-based identifier (in real implementation, would be server-side)
      return window.location.hostname + '_' + (window.navigator.userAgent.slice(0, 20));
    }
    return 'anonymous';
  }, [user]);

  // Check rate limit for specific actions
  const handleCheckRateLimit = useCallback((action: string) => {
    if (!config.security.enableRateLimit) return true;

    const identifier = `${getUserIdentifier()}_${action}`;
    const result = checkRateLimit(identifier, 10, 60000); // 10 requests per minute
    
    setRateLimitStatus(result);
    
    if (!result.allowed) {
      logSecurityEvent({
        type: 'rate_limit',
        userId: user?.id,
        resource: action,
        success: false,
        details: { remaining: result.remaining, resetTime: result.resetTime }
      });
    }
    
    return result.allowed;
  }, [getUserIdentifier, user]);

  // Log security events
  const handleLogEvent = useCallback((event: Omit<SecurityEvent, 'timestamp'>) => {
    const fullEvent: SecurityEvent = {
      ...event,
      userId: user?.id,
      ip: typeof window !== 'undefined' ? window.location.hostname : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
    };
    
    logSecurityEvent(fullEvent);
  }, [user]);

  // Validate user input
  const handleValidateInput = useCallback((input: string, type: 'email' | 'password' | 'text' | 'url') => {
    const isValid = validateUserInput(input, type);
    
    if (!isValid) {
      handleLogEvent({
        type: 'error',
        resource: `input_validation_${type}`,
        success: false,
        details: { inputLength: input.length, inputType: type }
      });
    }
    
    return isValid;
  }, [handleLogEvent]);

  // Refresh security status
  const refreshSecurityStatus = useCallback(() => {
    const validation = validateSecurityEnvironment();
    setIsSecure(validation.valid);
    setSecurityIssues(validation.issues);
    
    if (!validation.valid) {
      logger.warn('Security issues detected', validation.issues);
    }
  }, []);

  // Initialize security monitoring
  useEffect(() => {
    refreshSecurityStatus();
    
    // Monitor for security-related events
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleLogEvent({
          type: 'data_access',
          resource: 'page_hidden',
          success: true
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Check security status periodically
    const securityCheckInterval = setInterval(refreshSecurityStatus, 5 * 60 * 1000); // Every 5 minutes
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(securityCheckInterval);
    };
  }, [refreshSecurityStatus, handleLogEvent]);

  // Log authentication events
  useEffect(() => {
    if (user) {
      handleLogEvent({
        type: 'auth_attempt',
        resource: 'login',
        success: true,
        details: { userId: user.id, email: user.email }
      });
    }
  }, [user, handleLogEvent]);

  const value: SecurityContextValue = {
    isSecure,
    rateLimitStatus,
    securityIssues,
    checkRateLimit: handleCheckRateLimit,
    logEvent: handleLogEvent,
    validateInput: handleValidateInput,
    refreshSecurityStatus
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

// ============= SECURITY HOOK =============
export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    // PHASE 2 IMPROVEMENT: Return empty context instead of throwing
    // This prevents cascading failures when provider is unavailable
    const { EMPTY_SECURITY_CONTEXT } = require('./fallbacks/EmptySecurityContext');
    console.warn('useSecurity used outside provider, returning empty context');
    return EMPTY_SECURITY_CONTEXT;
  }
  return context;
};

// ============= SECURITY GUARDS =============
export const useSecurityGuard = (requiredLevel: 'basic' | 'authenticated' | 'admin' = 'basic') => {
  const { user } = useAuth();
  const { isSecure, checkRateLimit } = useSecurity();
  
  const canAccess = useCallback((action?: string) => {
    // Check basic security
    if (!isSecure) return false;
    
    // Check authentication if required
    if (requiredLevel !== 'basic' && !user) return false;
    
    // Check rate limits if action specified
    if (action && !checkRateLimit(action)) return false;
    
    // TODO: Implement role-based access control for admin level
    if (requiredLevel === 'admin') {
      // This would check user roles from the database
      // For now, we'll allow all authenticated users
      return !!user;
    }
    
    return true;
  }, [isSecure, user, requiredLevel, checkRateLimit]);

  return { canAccess };
};

// ============= SECURITY VALIDATION HOOK =============
export const useInputValidation = () => {
  const { validateInput } = useSecurity();
  
  const validateForm = useCallback((fields: Record<string, { value: string; type: 'email' | 'password' | 'text' | 'url' }>) => {
    const errors: Record<string, string> = {};
    
    Object.entries(fields).forEach(([fieldName, { value, type }]) => {
      if (!validateInput(value, type)) {
        switch (type) {
          case 'email':
            errors[fieldName] = 'Format d\'email invàlid';
            break;
          case 'password':
            errors[fieldName] = 'La contrasenya ha de tenir almenys 8 caràcters amb lletres i números';
            break;
          case 'url':
            errors[fieldName] = 'URL invàlida';
            break;
          default:
            errors[fieldName] = 'Valor invàlid';
        }
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, [validateInput]);

  return { validateForm, validateInput };
};