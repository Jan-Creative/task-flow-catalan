/**
 * FASE 3: Boot Optimizer
 * Utilities per optimitzar el temps de càrrega inicial
 */

import { bootTracer } from './bootTracer';

/**
 * Preconnect a dominis externs crítics
 */
export function preconnectCriticalDomains() {
  const domains = [
    'https://umfrvkakvgsypqcyyzke.supabase.co',
    // Afegir altres dominis crítics aquí
  ];

  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });

  bootTracer.trace('BootOptimizer', 'Preconnect domains configured', { count: domains.length });
}

/**
 * Detecta i reporta el rendiment del dispositiu
 */
export function detectDevicePerformance() {
  const performanceMetrics = {
    // @ts-ignore - deviceMemory pot no estar disponible
    memory: navigator.deviceMemory || 'unknown',
    // @ts-ignore - hardwareConcurrency
    cores: navigator.hardwareConcurrency || 'unknown',
    connection: (navigator as any).connection?.effectiveType || 'unknown',
  };

  bootTracer.trace('BootOptimizer', 'Device performance detected', performanceMetrics);
  
  // Retornar categoria de rendiment
  const memory = performanceMetrics.memory;
  if (typeof memory === 'number') {
    if (memory <= 2) return 'low';
    if (memory <= 4) return 'medium';
    return 'high';
  }
  
  return 'unknown';
}

/**
 * Aplica optimitzacions basades en el rendiment del dispositiu
 */
export function applyPerformanceOptimizations(performance: 'low' | 'medium' | 'high' | 'unknown') {
  const optimizations = {
    low: {
      maxPhase: 2, // Carregar només providers essencials
      animations: false,
      prefetch: false,
    },
    medium: {
      maxPhase: 3,
      animations: true,
      prefetch: true,
    },
    high: {
      maxPhase: Infinity,
      animations: true,
      prefetch: true,
    },
    unknown: {
      maxPhase: Infinity,
      animations: true,
      prefetch: true,
    }
  };

  const config = optimizations[performance];
  bootTracer.trace('BootOptimizer', 'Applied optimizations', { performance, config });
  
  return config;
}

/**
 * Cleanup de recursos no essencials després del boot
 */
export function cleanupAfterBoot() {
  // Cleanup debug logs si no estem en mode debug
  if (!window.location.search.includes('bootdebug=1')) {
    const debugLogs = document.querySelectorAll('[data-debug-log]');
    debugLogs.forEach(log => log.remove());
  }

  // Cleanup boot tracer si no estem en mode debug
  if (!window.location.search.includes('bootdebug=1')) {
    window.__BOOT_TRACE = [];
  }

  bootTracer.trace('BootOptimizer', 'Post-boot cleanup completed');
}
