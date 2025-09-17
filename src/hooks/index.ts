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
export * from './device';

// Utility and specialized hooks
export { useTypedForm } from './useTypedForm';
export { useUnifiedProperties } from './useUnifiedProperties';
export { useErrorHandler } from './useErrorHandler';
export { useRealtimeSafety } from './useRealtimeSafety';
export { useRealtimeSubscriptions } from './useRealtimeSubscriptions';
export { useServiceWorkerStatus } from './useServiceWorkerStatus';

// Task Management
export { useTaskManager } from './useTaskManager';
export { useOptimizedTaskManager } from './useOptimizedTaskManager';
export { useTaskTimeBlocks } from './useTaskTimeBlocks';
export { useSmartFolders } from './useSmartFolders';

// Performance & Optimization
export { useErrorRecovery } from './useErrorRecovery';
export { useOptimizedCache } from './useOptimizedCache';
export { useOfflineTasks } from './useOfflineTasks';
export { useOfflineContext } from '@/contexts/OfflineContext';