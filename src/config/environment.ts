/**
 * Environment configuration and validation
 */

// ============= ENVIRONMENT TYPES =============
export interface AppConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enablePerformanceMonitoring: boolean;
  enableAnalytics: boolean;
  apiUrl: string;
  version: string;
}

// ============= ENVIRONMENT VALIDATION =============
const validateEnvVar = (name: string, value: string | undefined, required = true): string => {
  if (required && !value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value || '';
};

// ============= CONFIGURATION =============
const getConfig = (): AppConfig => {
  const nodeEnv = import.meta.env.MODE || 'development';
  
  return {
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    isTest: nodeEnv === 'test',
    logLevel: (import.meta.env.VITE_LOG_LEVEL as any) || (import.meta.env.PROD ? 'warn' : 'debug'),
    enablePerformanceMonitoring: import.meta.env.DEV,
    enableAnalytics: import.meta.env.PROD,
    apiUrl: import.meta.env.VITE_API_URL || 'https://umfrvkakvgsypqcyyzke.supabase.co',
    version: '1.0.0'
  };
};

// ============= EXPORTS =============
export const config = getConfig();

// Utility functions
export const isDev = () => config.isDevelopment;
export const isProd = () => config.isProduction;
export const isTest = () => config.isTest;

// Feature flags
export const features = {
  performanceMonitoring: config.enablePerformanceMonitoring,
  analytics: config.enableAnalytics,
  debugLogging: config.isDevelopment,
  errorReporting: config.isProduction
} as const;

// Validate critical configuration on startup
export const validateConfig = (): void => {
  try {
    // Add any critical validations here
    if (!config.apiUrl) {
      throw new Error('API URL is required');
    }
    
    console.log(`🚀 App initialized in ${import.meta.env.MODE} mode`);
    if (config.isDevelopment) {
      console.log('🔧 Development features enabled:', features);
    }
  } catch (error) {
    console.error('❌ Configuration validation failed:', error);
    throw error;
  }
};