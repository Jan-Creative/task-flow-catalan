/**
 * Centralized hook exports - organized by category
 * This provides a clean API for importing hooks throughout the app
 */

// Re-export organized hook categories
export * from './core';
export * from './ui';
export * from './tasks';
export * from './performance';
export * from './notifications';
export * from './calendar';

// Utility and specialized hooks
export { useTypedForm } from './useTypedForm';
export { useUnifiedProperties } from './useUnifiedProperties';
export { useErrorHandler } from './useErrorHandler';
export { useRealtimeSafety } from './useRealtimeSafety';
export { useRealtimeSubscriptions } from './useRealtimeSubscriptions';
export { useServiceWorkerStatus } from './useServiceWorkerStatus';