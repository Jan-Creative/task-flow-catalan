/**
 * Centralized logging system with environment-aware levels
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'performance';

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  context?: string;
  timestamp: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Keep last 100 logs for debugging

  private shouldLog(level: LogLevel): boolean {
    // Always log errors and warnings
    if (level === 'error' || level === 'warn') return true;
    // Other levels only in development
    return this.isDevelopment;
  }

  private createLogEntry(level: LogLevel, message: string, data?: unknown, context?: string): LogEntry {
    return {
      level,
      message,
      data,
      context,
      timestamp: new Date().toISOString()
    };
  }

  private addToHistory(entry: LogEntry): void {
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }
  }

  debug(context: string, message: string, data?: unknown): void {
    const entry = this.createLogEntry('debug', message, data, context);
    this.addToHistory(entry);
    
    if (this.shouldLog('debug')) {
      console.log(`🔍 ${context}: ${message}`, data || '');
    }
  }

  info(message: string, data?: unknown): void {
    const entry = this.createLogEntry('info', message, data);
    this.addToHistory(entry);
    
    if (this.shouldLog('info')) {
      console.info(`ℹ️ ${message}`, data || '');
    }
  }

  warn(message: string, data?: unknown): void {
    const entry = this.createLogEntry('warn', message, data);
    this.addToHistory(entry);
    
    if (this.shouldLog('warn')) {
      console.warn(`⚠️ ${message}`, data || '');
    }
  }

  error(message: string, error?: unknown): void {
    const entry = this.createLogEntry('error', message, error);
    this.addToHistory(entry);
    
    console.error(`🚨 ${message}`, error || '');
  }

  performance(message: string, data?: unknown): void {
    const entry = this.createLogEntry('performance', message, data);
    this.addToHistory(entry);
    
    if (this.shouldLog('performance')) {
      console.log(`🚀 ${message}`, data || '');
    }
  }

  // Legacy compatibility
  log(message: string, data?: unknown): void {
    this.info(message, data);
  }

  // Get recent logs for debugging
  getRecentLogs(level?: LogLevel): LogEntry[] {
    return level ? this.logs.filter(log => log.level === level) : this.logs;
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
  }
}

// Export singleton instance
export const logger = new Logger();

// Backward compatibility
export const debugLog = {
  log: (message: string, data?: unknown) => logger.log(message, data),
  warn: (message: string, data?: unknown) => logger.warn(message, data),
  info: (message: string, data?: unknown) => logger.info(message, data),
  error: (message: string, error?: unknown) => logger.error(message, error),
  performance: (message: string, data?: unknown) => logger.performance(message, data),
  debug: (context: string, message: string, data?: unknown) => logger.debug(context, message, data)
};