/**
 * Automated console.log replacement utility
 * This script helps replace console statements with the new logger system
 */

import { logger } from './debugUtils';

// Export logger replacements for easy find-and-replace
export const loggerReplacements = {
  // Debug statements
  'console.log': (message: string, data?: unknown) => logger.debug('App', message, data),
  'console.debug': (message: string, data?: unknown) => logger.debug('App', message, data),
  
  // Info statements
  'console.info': (message: string, data?: unknown) => logger.info(message, data),
  
  // Warning statements
  'console.warn': (message: string, data?: unknown) => logger.warn(message, data),
  
  // Error statements
  'console.error': (message: string, error?: unknown) => logger.error(message, error),
  
  // Performance statements
  'console.time': (label: string) => logger.performance(`Timer started: ${label}`),
  'console.timeEnd': (label: string) => logger.performance(`Timer ended: ${label}`),
};

// Helper function to replace console statements in code
export const replaceConsoleStatement = (
  originalStatement: string,
  context: string = 'App'
): string => {
  // Handle console.log with context
  if (originalStatement.includes('console.log(')) {
    const match = originalStatement.match(/console\.log\(([^)]+)\)/);
    if (match) {
      const args = match[1];
      return `logger.debug('${context}', ${args})`;
    }
  }
  
  // Handle console.warn
  if (originalStatement.includes('console.warn(')) {
    const match = originalStatement.match(/console\.warn\(([^)]+)\)/);
    if (match) {
      const args = match[1];
      return `logger.warn(${args})`;
    }
  }
  
  // Handle console.error
  if (originalStatement.includes('console.error(')) {
    const match = originalStatement.match(/console\.error\(([^)]+)\)/);
    if (match) {
      const args = match[1];
      return `logger.error(${args})`;
    }
  }
  
  return originalStatement;
};

// Patterns for mass replacement
export const replacementPatterns = [
  {
    from: /console\.log\(([^)]+)\)/g,
    to: "logger.debug('App', $1)"
  },
  {
    from: /console\.warn\(([^)]+)\)/g,
    to: "logger.warn($1)"
  },
  {
    from: /console\.error\(([^)]+)\)/g,
    to: "logger.error($1)"
  },
  {
    from: /console\.debug\(([^)]+)\)/g,
    to: "logger.debug('App', $1)"
  },
  {
    from: /console\.info\(([^)]+)\)/g,
    to: "logger.info($1)"
  }
];