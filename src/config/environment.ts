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
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  return {
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
    isTest: nodeEnv === 'test',
    logLevel: (process.env.LOG_LEVEL as any) || (nodeEnv === 'production' ? 'warn' : 'debug'),
    enablePerformanceMonitoring: nodeEnv === 'development',
    enableAnalytics: nodeEnv === 'production',
    apiUrl: process.env.VITE_API_URL || 'https://umfrvkakvgsypqcyyzke.supabase.co',
    version: process.env.npm_package_version || '1.0.0'
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
    
    console.log(`🚀 App initialized in ${process.env.NODE_ENV} mode`);
    if (config.isDevelopment) {
      console.log('🔧 Development features enabled:', features);
    }
  } catch (error) {
    console.error('❌ Configuration validation failed:', error);
    throw error;
  }
};