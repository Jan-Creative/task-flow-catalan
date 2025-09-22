/**
 * Logger Replacement Utilities
 * Tools for migrating from console.* to structured logging
 */

import { logger } from './logger';

// Logger replacements mapping
export const loggerReplacements = {
  'console.log': (context: string = 'App', message: string, data?: unknown) => 
    logger.debug(context, message, data),
  'console.info': (context: string = 'App', message: string, data?: unknown) => 
    logger.info(context, message, data),
  'console.warn': (context: string = 'App', message: string, data?: unknown) => 
    logger.warn(context, message, data),
  'console.error': (context: string = 'App', message: string, error?: unknown) => 
    logger.error(context, message, error),
  'console.debug': (context: string = 'App', message: string, data?: unknown) => 
    logger.debug(context, message, data)
};

// Helper function to replace console statements
export function replaceConsoleStatement(originalStatement: string, context: string = 'App'): string {
  // Handle console.log with string literals
  if (originalStatement.includes('console.log(')) {
    const match = originalStatement.match(/console\.log\((['"`])(.*?)\1(?:,\s*(.+))?\)/);
    if (match) {
      const message = match[2];
      const data = match[3] || 'undefined';
      return `logger.debug('${context}', '${message}', ${data})`;
    }
  }
  
  // Handle console.warn
  if (originalStatement.includes('console.warn(')) {
    const match = originalStatement.match(/console\.warn\((['"`])(.*?)\1(?:,\s*(.+))?\)/);
    if (match) {
      const message = match[2];
      const data = match[3] || 'undefined';
      return `logger.warn('${context}', '${message}', ${data})`;
    }
  }
  
  // Handle console.error
  if (originalStatement.includes('console.error(')) {
    const match = originalStatement.match(/console\.error\((['"`])(.*?)\1(?:,\s*(.+))?\)/);
    if (match) {
      const message = match[2];
      const error = match[3] || 'undefined';
      return `logger.error('${context}', '${message}', ${error})`;
    }
  }
  
  return originalStatement;
}

// Bulk replacement patterns for mass updates
export const replacementPatterns = [
  {
    from: /console\.log\((['"`])(.*?)\1(?:,\s*(.+))?\)/g,
    to: "logger.debug('$CONTEXT$', '$2', $3)"
  },
  {
    from: /console\.info\((['"`])(.*?)\1(?:,\s*(.+))?\)/g,
    to: "logger.info('$CONTEXT$', '$2', $3)"
  },
  {
    from: /console\.warn\((['"`])(.*?)\1(?:,\s*(.+))?\)/g,
    to: "logger.warn('$CONTEXT$', '$2', $3)"
  },
  {
    from: /console\.error\((['"`])(.*?)\1(?:,\s*(.+))?\)/g,
    to: "logger.error('$CONTEXT$', '$2', $3)"
  },
  {
    from: /console\.debug\((['"`])(.*?)\1(?:,\s*(.+))?\)/g,
    to: "logger.debug('$CONTEXT$', '$2', $3)"
  }
];