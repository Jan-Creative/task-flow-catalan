/**
 * Conditional debug logging utility
 * Only logs in development environment
 */

type LogLevel = 'log' | 'warn' | 'error' | 'info';

const isDevelopment = process.env.NODE_ENV === 'development';

export const debugLog = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  // Always log errors, regardless of environment
  error: (...args: any[]) => {
    console.error(...args);
  },
  
  // Performance metrics only in development
  performance: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`🚀 ${message}:`, data);
    }
  },
  
  // Debug with context prefix
  debug: (context: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`🔍 ${context}:`, ...args);
    }
  }
};