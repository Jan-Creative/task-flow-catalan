/**
 * Sistema de optimització de rendiment per l'aplicació
 */

// ============= PERFORMANCE MONITORING =============

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  componentCount: number;
  lastMeasurement: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    renderTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    componentCount: 0,
    lastMeasurement: Date.now()
  };

  private observers: ((metrics: PerformanceMetrics) => void)[] = [];
  private measurementInterval: NodeJS.Timeout | null = null;

  startMonitoring() {
    if (this.measurementInterval) return;

    this.measurementInterval = setInterval(() => {
      this.collectMetrics();
    }, 5000); // Mesurar cada 5 segons

    // Cleanup on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.stopMonitoring();
      });
    }
  }

  stopMonitoring() {
    if (this.measurementInterval) {
      clearInterval(this.measurementInterval);
      this.measurementInterval = null;
    }
  }

  private collectMetrics() {
    const now = Date.now();
    
    // Memory usage (si està disponible)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;
    }

    // Component count (aproximat basant-se en elements DOM)
    this.metrics.componentCount = document.querySelectorAll('[data-component]').length;

    this.metrics.lastMeasurement = now;

    // Notificar observers
    this.observers.forEach(callback => callback({ ...this.metrics }));

    // Log warnings si el rendiment és baix
    this.checkPerformanceThresholds();
  }

  private checkPerformanceThresholds() {
    if (this.metrics.memoryUsage > 0.8) {
      console.warn('⚠️ Ús de memòria alt:', Math.round(this.metrics.memoryUsage * 100) + '%');
    }

    if (this.metrics.componentCount > 1000) {
      console.warn('⚠️ Número alt de components:', this.metrics.componentCount);
    }
  }

  onMetricsUpdate(callback: (metrics: PerformanceMetrics) => void) {
    this.observers.push(callback);
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

export const performanceMonitor = new PerformanceMonitor();

// ============= RENDER OPTIMIZATION =============

/**
 * Debounce per optimitzar funcions que es criden massa sovint
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): T => {
  let timeout: NodeJS.Timeout | null = null;
  
  return ((...args: any[]) => {
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) func.apply(null, args);
    }, wait);
    
    if (callNow) func.apply(null, args);
  }) as T;
};

/**
 * Throttle per limitar execucions d'una funció
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;
  
  return ((...args: any[]) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
};

// ============= MEMORY OPTIMIZATION =============

/**
 * Neteja automàtica d'event listeners
 */
export class EventListenerCleaner {
  private listeners: Array<{
    element: Element | Window | Document;
    event: string;
    handler: EventListener;
    options?: boolean | AddEventListenerOptions;
  }> = [];

  add(
    element: Element | Window | Document,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ) {
    element.addEventListener(event, handler, options);
    this.listeners.push({ element, event, handler, options });
  }

  cleanup() {
    this.listeners.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    this.listeners = [];
  }

  remove(element: Element | Window | Document, event: string, handler: EventListener) {
    const index = this.listeners.findIndex(
      l => l.element === element && l.event === event && l.handler === handler
    );
    
    if (index > -1) {
      element.removeEventListener(event, handler);
      this.listeners.splice(index, 1);
    }
  }
}

// ============= IMAGE OPTIMIZATION =============

/**
 * Lazy loading amb intersection observer optimitzat
 */
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null;
  private imageCache = new Map<string, HTMLImageElement>();

  constructor() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          rootMargin: '50px', // Precarregar 50px abans que aparegui
          threshold: 0.1
        }
      );
    }
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        this.loadImage(img);
        this.observer?.unobserve(img);
      }
    });
  }

  private async loadImage(img: HTMLImageElement) {
    const src = img.dataset.src;
    if (!src) return;

    // Check cache primer
    if (this.imageCache.has(src)) {
      const cachedImg = this.imageCache.get(src)!;
      img.src = cachedImg.src;
      img.classList.remove('lazy');
      return;
    }

    try {
      // Precarregar imatge
      const tempImg = new Image();
      tempImg.onload = () => {
        img.src = src;
        img.classList.remove('lazy');
        this.imageCache.set(src, tempImg);
      };
      tempImg.onerror = () => {
        img.classList.add('error');
      };
      tempImg.src = src;
    } catch (error) {
      console.warn('Error carregant imatge:', src, error);
      img.classList.add('error');
    }
  }

  observe(img: HTMLImageElement) {
    if (this.observer) {
      this.observer.observe(img);
    } else {
      // Fallback per navegadors sense suport
      this.loadImage(img);
    }
  }

  disconnect() {
    this.observer?.disconnect();
    this.imageCache.clear();
  }
}

export const lazyImageLoader = new LazyImageLoader();

// ============= QUERY OPTIMIZATION =============

/**
 * Cache intel·ligent per queries
 */
export class QueryCache {
  private cache = new Map<string, {
    data: any;
    timestamp: number;
    ttl: number;
  }>();

  set(key: string, data: any, ttl = 5 * 60 * 1000) { // 5 minuts per defecte
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    // Neteja automàtica després del TTL
    setTimeout(() => {
      this.cache.delete(key);
    }, ttl);
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Comprovar si ha expirat
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(keyPattern: string) {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes(keyPattern)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  clear() {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const queryCache = new QueryCache();

// ============= INITIALIZATION =============

/**
 * Inicialitza optimitzacions de rendiment
 */
export const initializePerformanceOptimizations = () => {
  if (typeof window === 'undefined') return;

  // Iniciar monitoring
  performanceMonitor.startMonitoring();

  // Log mètriques inicials
  console.log('🚀 Performance optimizations initialized');
  
  // Neteja en tancar l'app
  window.addEventListener('beforeunload', () => {
    performanceMonitor.stopMonitoring();
    lazyImageLoader.disconnect();
    queryCache.clear();
  });
};