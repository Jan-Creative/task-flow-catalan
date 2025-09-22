/**
 * Professional Logging System
 * Replaces all console.* statements with structured, environment-aware logging
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'performance';

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  context: string;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

export interface LoggerConfig {
  enabledInProduction: boolean;
  maxEntries: number;
  enableConsoleOutput: boolean;
  enableRemoteLogging: boolean;
  remoteEndpoint?: string;
}

class ProfessionalLogger {
  private entries: LogEntry[] = [];
  private sessionId: string;
  private config: LoggerConfig;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.config = {
      enabledInProduction: false,
      maxEntries: 1000,
      enableConsoleOutput: import.meta.env.DEV,
      enableRemoteLogging: import.meta.env.PROD,
      remoteEndpoint: '/api/logs'
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldLog(level: LogLevel): boolean {
    if (import.meta.env.DEV) return true;
    if (!this.config.enabledInProduction) return level === 'error' || level === 'warn';
    return true;
  }

  private formatMessage(level: LogLevel, context: string, message: string): string {
    const timestamp = new Date().toISOString();
    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      performance: '⚡'
    }[level];
    
    return `${emoji} [${timestamp}] [${context}] ${message}`;
  }

  private addEntry(entry: LogEntry): void {
    this.entries.push(entry);
    
    // Maintain max entries limit
    if (this.entries.length > this.config.maxEntries) {
      this.entries = this.entries.slice(-this.config.maxEntries);
    }

    // Send to remote logging service in production
    if (this.config.enableRemoteLogging && import.meta.env.PROD) {
      this.sendToRemote(entry).catch(() => {
        // Silently fail remote logging to avoid blocking user experience
      });
    }
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch {
      // Silently handle remote logging failures
    }
  }

  public debug(context: string, message: string, data?: unknown): void {
    if (!this.shouldLog('debug')) return;

    const entry: LogEntry = {
      level: 'debug',
      message,
      data,
      context,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.addEntry(entry);

    if (this.config.enableConsoleOutput) {
      console.log(this.formatMessage('debug', context, message), data || '');
    }
  }

  public info(context: string, message: string, data?: unknown): void {
    if (!this.shouldLog('info')) return;

    const entry: LogEntry = {
      level: 'info',
      message,
      data,
      context,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.addEntry(entry);

    if (this.config.enableConsoleOutput) {
      console.info(this.formatMessage('info', context, message), data || '');
    }
  }

  public warn(context: string, message: string, data?: unknown): void {
    if (!this.shouldLog('warn')) return;

    const entry: LogEntry = {
      level: 'warn',
      message,
      data,
      context,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.addEntry(entry);

    if (this.config.enableConsoleOutput) {
      console.warn(this.formatMessage('warn', context, message), data || '');
    }
  }

  public error(context: string, message: string, error?: unknown): void {
    const entry: LogEntry = {
      level: 'error',
      message,
      data: error,
      context,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.addEntry(entry);

    if (this.config.enableConsoleOutput) {
      console.error(this.formatMessage('error', context, message), error || '');
    }
  }

  public performance(context: string, message: string, data?: unknown): void {
    if (!this.shouldLog('performance')) return;

    const entry: LogEntry = {
      level: 'performance',
      message,
      data,
      context,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.addEntry(entry);

    if (this.config.enableConsoleOutput) {
      console.log(this.formatMessage('performance', context, message), data || '');
    }
  }

  public getRecentLogs(level?: LogLevel, limit: number = 100): LogEntry[] {
    let filtered = this.entries;
    if (level) {
      filtered = this.entries.filter(entry => entry.level === level);
    }
    return filtered.slice(-limit);
  }

  public clearLogs(): void {
    this.entries = [];
  }

  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Performance timing utilities
  public time(label: string, context: string = 'Performance'): void {
    const startTime = performance.now();
    
    // Store start time
    (globalThis as any).__loggerTimers = (globalThis as any).__loggerTimers || {};
    (globalThis as any).__loggerTimers[label] = startTime;
    
    this.performance(context, `Timer started: ${label}`);
  }

  public timeEnd(label: string, context: string = 'Performance'): void {
    const timers = (globalThis as any).__loggerTimers || {};
    const startTime = timers[label];
    
    if (startTime === undefined) {
      this.warn(context, `Timer '${label}' was never started`);
      return;
    }
    
    const duration = performance.now() - startTime;
    delete timers[label];
    
    this.performance(context, `Timer '${label}' completed`, { duration: `${duration.toFixed(2)}ms` });
  }

  // Memory usage tracking
  public logMemoryUsage(context: string = 'Performance'): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.performance(context, 'Memory usage', {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      });
    }
  }
}

// Export singleton instance
export const logger = new ProfessionalLogger();

// Backward compatibility helpers for easy migration
export const debugLog = {
  log: (context: string, message: string, data?: unknown) => logger.debug(context, message, data),
  info: (context: string, message: string, data?: unknown) => logger.info(context, message, data),
  warn: (context: string, message: string, data?: unknown) => logger.warn(context, message, data),
  error: (context: string, message: string, error?: unknown) => logger.error(context, message, error),
  performance: (context: string, message: string, data?: unknown) => logger.performance(context, message, data)
};

// Development-only performance monitoring
if (import.meta.env.DEV) {
  // Log memory usage every 30 seconds in development
  setInterval(() => {
    logger.logMemoryUsage('DevMonitor');
  }, 30000);
}