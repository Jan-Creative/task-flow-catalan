/**
 * Advanced Performance Optimization Suite
 * Comprehensive performance monitoring and optimization utilities
 */

import { logger } from './logger';
import type { PerformanceMetrics, CacheEntry, CacheConfig } from '@/types/common';

// ============= PERFORMANCE MONITORING =============

export interface PerformanceThresholds {
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  cacheHitRate: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;
  
  private thresholds: PerformanceThresholds = {
    renderTime: 16, // 60fps threshold
    memoryUsage: 100 * 1024 * 1024, // 100MB
    bundleSize: 500 * 1024, // 500KB
    cacheHitRate: 0.8 // 80%
  };

  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    logger.performance('PerformanceMonitor', 'Started performance monitoring');
    
    this.observeResourceTiming();
    this.observeUserTiming();
    this.observeLongTasks();
    this.observeLayoutShifts();
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    logger.performance('PerformanceMonitor', 'Stopped performance monitoring');
  }

  private observeResourceTiming(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.entryType === 'resource') {
          this.recordResourceMetric(entry as PerformanceResourceTiming);
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.push(observer);
  }

  private observeUserTiming(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.entryType === 'measure') {
          this.recordTimingMetric(entry);
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });
    this.observers.push(observer);
  }

  private observeLongTasks(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.duration > 50) { // Long task threshold
          logger.warn('PerformanceMonitor', 'Long task detected', {
            duration: entry.duration,
            startTime: entry.startTime
          });
        }
      });
    });

    observer.observe({ entryTypes: ['longtask'] });
    this.observers.push(observer);
  }

  private observeLayoutShifts(): void {
    if (!('PerformanceObserver' in window)) return;

    let cumulativeLayoutShift = 0;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if ((entry as any).value && !(entry as any).hadRecentInput) {
          cumulativeLayoutShift += (entry as any).value;
          
          if (cumulativeLayoutShift > 0.1) { // CLS threshold
            logger.warn('PerformanceMonitor', 'High Cumulative Layout Shift detected', {
              cls: cumulativeLayoutShift
            });
          }
        }
      });
    });

    observer.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(observer);
  }

  private recordResourceMetric(entry: PerformanceResourceTiming): void {
    const metric = {
      name: entry.name,
      duration: entry.duration,
      transferSize: entry.transferSize,
      type: this.getResourceType(entry.name)
    };

    if (metric.duration > 1000) { // Slow resource threshold
      logger.warn('PerformanceMonitor', 'Slow resource detected', metric);
    }
  }

  private recordTimingMetric(entry: PerformanceEntry): void {
    const metric = {
      name: entry.name,
      duration: entry.duration,
      startTime: entry.startTime
    };

    if (metric.duration > this.thresholds.renderTime) {
      logger.warn('PerformanceMonitor', 'Slow operation detected', metric);
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'style';
    if (url.match(/\.(png|jpg|jpeg|webp|svg)$/)) return 'image';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  checkThresholds(): { passed: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check Core Web Vitals
    this.checkCoreWebVitals(issues);
    
    // Check memory usage
    this.checkMemoryUsage(issues);
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  private checkCoreWebVitals(issues: string[]): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      const fcp = navigation.responseStart - navigation.fetchStart;
      const lcp = navigation.loadEventEnd - navigation.fetchStart;
      
      if (fcp > 1800) issues.push(`First Contentful Paint too slow: ${fcp}ms`);
      if (lcp > 2500) issues.push(`Largest Contentful Paint too slow: ${lcp}ms`);
    }
  }

  private checkMemoryUsage(issues: string[]): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      if (memory.usedJSHeapSize > this.thresholds.memoryUsage) {
        issues.push(`High memory usage: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      }
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// ============= RENDER OPTIMIZATION =============

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number,
  immediate = false
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ============= MEMORY OPTIMIZATION =============

export class EventListenerCleaner {
  private listeners: Map<Element, Array<{ event: string; listener: EventListener }>> = new Map();

  addListener(element: Element, event: string, listener: EventListener, options?: AddEventListenerOptions): void {
    element.addEventListener(event, listener, options);
    
    if (!this.listeners.has(element)) {
      this.listeners.set(element, []);
    }
    
    this.listeners.get(element)!.push({ event, listener });
  }

  removeListener(element: Element, event: string, listener: EventListener): void {
    element.removeEventListener(event, listener);
    
    const elementListeners = this.listeners.get(element);
    if (elementListeners) {
      const index = elementListeners.findIndex(l => l.event === event && l.listener === listener);
      if (index > -1) {
        elementListeners.splice(index, 1);
      }
    }
  }

  cleanupElement(element: Element): void {
    const elementListeners = this.listeners.get(element);
    if (elementListeners) {
      elementListeners.forEach(({ event, listener }) => {
        element.removeEventListener(event, listener);
      });
      this.listeners.delete(element);
    }
  }

  cleanupAll(): void {
    this.listeners.forEach((listeners, element) => {
      listeners.forEach(({ event, listener }) => {
        element.removeEventListener(event, listener);
      });
    });
    this.listeners.clear();
  }
}

// ============= QUERY OPTIMIZATION =============

export class QueryCache<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 100,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      cleanupInterval: 60 * 1000, // 1 minute
      ...config
    };

    this.startCleanupTimer();
  }

  set(key: string, data: T, ttl?: number): void {
    // Cleanup if at max size
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.config.defaultTTL,
      hits: 0
    };

    this.cache.set(key, entry);
    logger.debug('QueryCache', 'Cache set', { key, size: this.cache.size });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update hit count
    entry.hits++;
    logger.debug('QueryCache', 'Cache hit', { key, hits: entry.hits });
    
    return entry.data;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      logger.debug('QueryCache', 'Cache cleared completely');
      return;
    }

    const regex = new RegExp(pattern);
    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
    
    logger.debug('QueryCache', 'Cache invalidated by pattern', { pattern });
  }

  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      logger.debug('QueryCache', 'Evicted oldest entry', { key: oldestKey });
    }
  }

  private startCleanupTimer(): void {
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;

      for (const [key, entry] of this.cache) {
        if (now - entry.timestamp > entry.ttl) {
          this.cache.delete(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        logger.debug('QueryCache', 'Cleanup completed', { cleaned, remaining: this.cache.size });
      }
    }, this.config.cleanupInterval);
  }

  getStats(): { size: number; hitRate: number; avgHits: number } {
    const entries = Array.from(this.cache.values());
    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0);
    const totalRequests = entries.length > 0 ? totalHits + entries.length : 0;

    return {
      size: this.cache.size,
      hitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
      avgHits: entries.length > 0 ? totalHits / entries.length : 0
    };
  }
}

export const queryCache = new QueryCache();

// ============= INITIALIZATION =============

export const initializePerformanceOptimizations = (): void => {
  logger.info('PerformanceOptimizer', 'Initializing performance optimizations');

  // Start performance monitoring in development
  if (import.meta.env.DEV) {
    performanceMonitor.startMonitoring();
  }

  // Setup cleanup on page unload
  window.addEventListener('beforeunload', () => {
    performanceMonitor.stopMonitoring();
  });

  logger.info('PerformanceOptimizer', 'Performance optimizations initialized');
};