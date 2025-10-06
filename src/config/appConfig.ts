/**
 * Configuration Management System
 */

import { logger } from '../lib/debugUtils';

// ============= ENVIRONMENT CONFIGURATION =============
export interface AppEnvironment {
  NODE_ENV: 'development' | 'production' | 'test';
  BUILD_MODE: 'dev' | 'preview' | 'production';
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  APP_VERSION: string;
  APP_NAME: string;
}

export interface FeatureFlags {
  enablePerformanceMonitoring: boolean;
  enableAnalytics: boolean;
  enableDebugLogging: boolean;
  enableErrorReporting: boolean;
  enableNotifications: boolean;
  enableExperimentalFeatures: boolean;
  enableDragAndDrop: boolean;
}

export interface SecuritySettings {
  enableRateLimit: boolean;
  maxLoginAttempts: number;
  sessionTimeout: number;
  enableSecurityHeaders: boolean;
  allowedOrigins: string[];
}

// ============= CONFIGURATION SCHEMA =============
export interface AppConfig {
  environment: AppEnvironment;
  features: FeatureFlags;
  security: SecuritySettings;
  supabase: {
    url: string;
    anonKey: string;
    settings: {
      auth: {
        autoRefreshToken: boolean;
        persistSession: boolean;
        detectSessionInUrl: boolean;
      };
      realtime: {
        enabled: boolean;
        heartbeatIntervalMs: number;
      };
    };
  };
  ui: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    animations: boolean;
    reducedMotion: boolean;
  };
  performance: {
    enableServiceWorker: boolean;
    cacheStrategy: 'aggressive' | 'conservative' | 'disabled';
    prefetchRoutes: boolean;
    lazyLoadImages: boolean;
  };
}

// ============= CONFIGURATION FACTORY =============
const createEnvironment = (): AppEnvironment => ({
  NODE_ENV: import.meta.env.DEV ? 'development' : (import.meta.env.PROD ? 'production' : 'test'),
  BUILD_MODE: determineBuildMode(),
  SUPABASE_URL: 'https://umfrvkakvgsypqcyyzke.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZnJ2a2FrdmdzeXBxY3l5emtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzM3NDksImV4cCI6MjA3MDQwOTc0OX0.unXiHHRqKsM_0vRU20nJz7aE-hyV-t1PXH0k0VfEeR4',
  APP_VERSION: '1.0.0',
  APP_NAME: 'Task Management App'
});

const createFeatureFlags = (env: AppEnvironment): FeatureFlags => ({
  enablePerformanceMonitoring: env.NODE_ENV === 'development',
  enableAnalytics: env.BUILD_MODE === 'production',
  enableDebugLogging: env.NODE_ENV !== 'production',
  enableErrorReporting: env.BUILD_MODE === 'production',
  enableNotifications: true,
  enableExperimentalFeatures: env.NODE_ENV === 'development',
  enableDragAndDrop: false // Disabled during development
});

const createSecuritySettings = (env: AppEnvironment): SecuritySettings => ({
  enableRateLimit: env.BUILD_MODE === 'production',
  maxLoginAttempts: 5,
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  enableSecurityHeaders: env.BUILD_MODE === 'production',
  allowedOrigins: [
    'https://umfrvkakvgsypqcyyzke.supabase.co',
    ...(import.meta.env.DEV ? ['http://localhost:3000', 'http://localhost:5173'] : [])
  ]
});

// ============= CONFIGURATION CREATION =============
const createAppConfig = (): AppConfig => {
  const environment = createEnvironment();
  const features = createFeatureFlags(environment);
  const security = createSecuritySettings(environment);

  return {
    environment,
    features,
    security,
    supabase: {
      url: environment.SUPABASE_URL,
      anonKey: environment.SUPABASE_ANON_KEY,
      settings: {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        },
        realtime: {
          enabled: true,
          heartbeatIntervalMs: 30000
        }
      }
    },
    ui: {
      theme: 'system',
      language: 'ca',
      animations: true,
      reducedMotion: false
    },
    performance: {
      enableServiceWorker: environment.BUILD_MODE === 'production',
      cacheStrategy: environment.BUILD_MODE === 'production' ? 'aggressive' : 'conservative',
      prefetchRoutes: environment.BUILD_MODE === 'production',
      lazyLoadImages: true
    }
  };
};

// ============= UTILITIES =============
function determineBuildMode(): AppEnvironment['BUILD_MODE'] {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Check if we're on a Lovable preview URL (sandbox domains)
    if (hostname.includes('sandbox.lovable.dev') || 
        hostname.includes('lovable.app') || 
        hostname.includes('lovableproject.com')) {
      return 'preview';
    }
    
    // Check if we're on localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'dev';
    }
    
    // Check for other development indicators
    if (hostname.includes('staging') || hostname.includes('dev') || hostname.includes('test')) {
      return 'preview';
    }
  }
  
  // Default to production for any other domain (custom domains in production)
  return 'production';
}

// ============= CONFIGURATION VALIDATION =============
export const validateConfig = (config: AppConfig): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate Supabase configuration
  if (!config.supabase.url || !config.supabase.url.startsWith('https://')) {
    errors.push('Invalid Supabase URL - must be HTTPS');
  }

  if (!config.supabase.anonKey || config.supabase.anonKey.length < 100) {
    errors.push('Invalid Supabase anon key');
  }

  // Validate security settings for production only (not preview)
  if (config.environment.BUILD_MODE === 'production') {
    if (!config.security.enableRateLimit) {
      errors.push('Rate limiting should be enabled in production');
    }

    if (!config.security.enableSecurityHeaders) {
      errors.push('Security headers should be enabled in production');
    }

    if (config.features.enableDebugLogging) {
      errors.push('Debug logging should be disabled in production');
    }
  }

  // Allow debug features in preview/development environments
  if (config.environment.BUILD_MODE === 'preview') {
    // Preview environment can have debug features enabled for testing
    // This is normal and expected
  }

  // Validate origins
  config.security.allowedOrigins.forEach(origin => {
    try {
      new URL(origin);
    } catch {
      errors.push(`Invalid origin URL: ${origin}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

// ============= CONFIGURATION INSTANCE =============
export const config = createAppConfig();

// Validate configuration on startup - only throw error for critical issues
const validation = validateConfig(config);
if (!validation.valid) {
  // Filter out debug logging warnings for non-production environments
  const criticalErrors = validation.errors.filter(error => {
    // Allow debug logging in preview and development environments
    if (error.includes('Debug logging should be disabled') && 
        config.environment.BUILD_MODE !== 'production') {
      return false;
    }
    return true;
  });
  
  if (criticalErrors.length > 0) {
    logger.error('Critical configuration validation failed', { errors: criticalErrors });
    throw new Error(`Critical configuration validation failed: ${criticalErrors.join(', ')}`);
  } else {
    // Just log non-critical warnings
    logger.warn('Configuration validation warnings', { warnings: validation.errors });
  }
}

// Log successful configuration in development
if (config.features.enableDebugLogging) {
  logger.info('Configuration loaded successfully', {
    environment: config.environment.NODE_ENV,
    buildMode: config.environment.BUILD_MODE,
    features: Object.entries(config.features)
      .filter(([, enabled]) => enabled)
      .map(([feature]) => feature)
  });
}

// ============= CONFIGURATION ACCESSORS =============
export const isDev = () => config.environment.NODE_ENV === 'development';
export const isProd = () => config.environment.BUILD_MODE === 'production';
export const isPreview = () => config.environment.BUILD_MODE === 'preview';

export const getSupabaseConfig = () => config.supabase;
export const getSecurityConfig = () => config.security;
export const getFeatureFlags = () => config.features;
export const getUIConfig = () => config.ui;
export const getPerformanceConfig = () => config.performance;

// Drag and drop accessor
export const isDragAndDropEnabled = () => config.features.enableDragAndDrop;

// ============= RUNTIME CONFIGURATION UPDATES =============
export const updateFeatureFlag = (flag: keyof FeatureFlags, enabled: boolean): void => {
  config.features[flag] = enabled;
  logger.info(`Feature flag updated: ${flag} = ${enabled}`);
};

export const updateUIConfig = (updates: Partial<AppConfig['ui']>): void => {
  Object.assign(config.ui, updates);
  logger.info('UI configuration updated', updates);
};

// ============= CONFIGURATION PERSISTENCE =============
export const getConfigSummary = () => ({
  version: config.environment.APP_VERSION,
  environment: config.environment.NODE_ENV,
  buildMode: config.environment.BUILD_MODE,
  features: config.features,
  lastUpdated: new Date().toISOString()
});