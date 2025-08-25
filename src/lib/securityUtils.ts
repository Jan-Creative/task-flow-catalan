/**
 * Enhanced Security Configuration and Validation
 */

import { logger } from './debugUtils';

// ============= SECURITY CONFIGURATION =============
export interface SecurityConfig {
  enableSecurityHeaders: boolean;
  enableCSRF: boolean;
  allowedOrigins: string[];
  rateLimit: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
  encryption: {
    algorithm: string;
    keyLength: number;
  };
  session: {
    maxAge: number;
    secure: boolean;
    httpOnly: boolean;
  };
}

export const securityConfig: SecurityConfig = {
  enableSecurityHeaders: true,
  enableCSRF: process.env.NODE_ENV === 'production',
  allowedOrigins: [
    'https://umfrvkakvgsypqcyyzke.supabase.co',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  rateLimit: {
    enabled: process.env.NODE_ENV === 'production',
    maxRequests: 100,
    windowMs: 15 * 60 * 1000 // 15 minutes
  },
  encryption: {
    algorithm: 'AES-256-GCM',
    keyLength: 32
  },
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true
  }
};

// ============= DATA VALIDATION =============
export const validateUserInput = (input: string, type: 'email' | 'password' | 'text' | 'url'): boolean => {
  if (!input || typeof input !== 'string') return false;

  switch (type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(input) && input.length <= 320;
    
    case 'password':
      // Minimum 8 characters, at least one letter and one number
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
      return passwordRegex.test(input) && input.length <= 128;
    
    case 'text':
      // Prevent XSS attempts
      const xssRegex = /<script|javascript:|onload=|onerror=/i;
      return !xssRegex.test(input) && input.length <= 1000;
    
    case 'url':
      try {
        const url = new URL(input);
        return ['http:', 'https:'].includes(url.protocol);
      } catch {
        return false;
      }
    
    default:
      return false;
  }
};

// ============= CONTENT SECURITY POLICY =============
export const generateCSPHeader = (): string => {
  const policies = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://umfrvkakvgsypqcyyzke.supabase.co",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://umfrvkakvgsypqcyyzke.supabase.co wss://umfrvkakvgsypqcyyzke.supabase.co",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ];

  return policies.join('; ');
};

// ============= SANITIZATION UTILITIES =============
export const sanitizeHtml = (input: string): string => {
  if (!input) return '';
  
  // Basic HTML entity encoding
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const sanitizeUrl = (url: string): string => {
  if (!url) return '';
  
  try {
    const parsedUrl = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return '';
    }
    
    return parsedUrl.toString();
  } catch {
    return '';
  }
};

// ============= RATE LIMITING =============
interface RateLimitData {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitData>();

export const checkRateLimit = (
  identifier: string, 
  maxRequests: number = 60, 
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } => {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Clean up old entries
  rateLimitStore.forEach((data, key) => {
    if (data.resetTime < now) {
      rateLimitStore.delete(key);
    }
  });
  
  const current = rateLimitStore.get(identifier);
  
  if (!current || current.resetTime < now) {
    // First request in window or window has reset
    const resetTime = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime
    };
  }
  
  if (current.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime
    };
  }
  
  // Increment count
  current.count++;
  rateLimitStore.set(identifier, current);
  
  return {
    allowed: true,
    remaining: maxRequests - current.count,
    resetTime: current.resetTime
  };
};

// ============= SECURITY HEADERS =============
export const getSecurityHeaders = (): Record<string, string> => {
  return {
    'Content-Security-Policy': generateCSPHeader(),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin'
  };
};

// ============= AUDIT LOGGING =============
export interface SecurityEvent {
  type: 'auth_attempt' | 'data_access' | 'config_change' | 'error' | 'rate_limit';
  userId?: string;
  ip?: string;
  userAgent?: string;
  resource?: string;
  success: boolean;
  details?: Record<string, unknown>;
}

export const logSecurityEvent = (event: SecurityEvent): void => {
  const logEntry = {
    ...event,
    timestamp: new Date().toISOString(),
    severity: event.success ? 'info' : 'warn'
  };
  
  // In production, this would go to a dedicated security log
  if (event.success) {
    logger.info('Security Event', logEntry);
  } else {
    logger.warn('Security Event - Potential Issue', logEntry);
  }
  
  // TODO: In production, integrate with SIEM or security monitoring service
};

// ============= ENVIRONMENT VALIDATION =============
export const validateSecurityEnvironment = (): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // Check if we're in production mode properly
  if (process.env.NODE_ENV === 'production') {
    if (window.location.protocol !== 'https:') {
      issues.push('Production site should use HTTPS');
    }
  }
  
  // Check for development tools in production
  if (process.env.NODE_ENV === 'production') {
    if (window.localStorage.getItem('debug') || window.sessionStorage.getItem('debug')) {
      issues.push('Debug mode detected in production');
    }
  }
  
  // Log validation results
  if (issues.length > 0) {
    logger.warn('Security validation failed', { issues });
  } else {
    logger.info('Security validation passed');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
};