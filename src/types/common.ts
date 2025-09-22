/**
 * Common TypeScript types to replace 'any' usage throughout the app
 */

// ============= GENERIC UTILITY TYPES =============
export type ID = string;
export type Timestamp = string;
export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;

// ============= API RESPONSE TYPES =============
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ============= EVENT HANDLER TYPES =============
export type EventHandler<T = unknown> = (event: T) => void;
export type AsyncEventHandler<T = unknown> = (event: T) => Promise<void>;

// ============= FORM TYPES =============
export interface FormField {
  name: string;
  value: unknown;
  error?: string;
  touched?: boolean;
}

export interface FormState {
  fields: FormField[];
  isValid: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

// ============= COMPONENT PROPS TYPES =============
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface PageProps extends BaseComponentProps {
  params?: Record<string, string>;
  searchParams?: Record<string, string>;
}

// ============= DATA FILTERING AND SORTING =============
export interface FilterOptions {
  field: string;
  value: unknown;
  operator?: 'eq' | 'ne' | 'gt' | 'lt' | 'contains' | 'in';
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total?: number;
}

// ============= NOTIFICATION TYPES =============
export interface NotificationData {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  handler: () => void | Promise<void>;
}

// ============= DEVICE INFO TYPES =============
export interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  timezone: string;
  screen: {
    width: number;
    height: number;
  };
}

// ============= QUERY CLIENT TYPES =============
export interface QueryCacheData<T = unknown> {
  data: T;
  timestamp: number;
  stale: boolean;
}

// ============= PERFORMANCE TYPES =============
export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  componentCount: number;
}

// ============= SETTINGS TYPES =============
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
  autoSave: boolean;
}

export interface UserPreferences extends AppSettings {
  userId: ID;
  backgroundType: string;
  shortcuts: Record<string, string>;
}

// ============= MAGNETIC DROP ZONE TYPES =============
export interface MagneticDropZoneData {
  id: string;
  type: 'task' | 'event' | 'note';
  position: {
    x: number;
    y: number;
  };
  bounds: DOMRect;
  isActive: boolean;
}

export interface DropZoneConfig {
  magneticDistance: number;
  snapToGrid: boolean;
  gridSize: number;
  allowedTypes: string[];
}

// ============= PROPERTY TYPES =============
export interface PropertyValue {
  id: string;
  value: string;
  color?: string;
  icon?: string;
}

export interface PropertyDefinition {
  id: string;
  name: string;
  type: 'select' | 'multi-select' | 'text' | 'number' | 'date' | 'boolean';
  values?: PropertyValue[];
  required?: boolean;
  defaultValue?: unknown;
}

export interface SelectedProperty {
  propertyId: string;
  values: string[];
}

// ============= TASK OPERATIONS TYPES =============
export interface TaskOperation {
  type: 'create' | 'update' | 'delete' | 'move';
  taskId?: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

export interface BulkOperation {
  taskIds: string[];
  operation: TaskOperation;
  rollback?: () => Promise<void>;
}

// ============= VIRTUAL LIST TYPES =============
export interface VirtualListItem {
  id: string;
  height: number;
  data: unknown;
}

export interface VirtualListConfig {
  itemHeight: number;
  overscan: number;
  scrollTolerance: number;
}

// ============= CACHE TYPES =============
export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
}

// ============= ERROR BOUNDARY TYPES =============
export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  eventType?: string;
}

export interface ErrorDetails {
  message: string;
  stack?: string;
  componentStack?: string;
  userId?: string;
  url?: string;
  userAgent?: string;
  timestamp: number;
}

// ============= KEYBOARD SHORTCUT TYPES =============
export interface ShortcutDefinition {
  key: string;
  modifiers: ('ctrl' | 'shift' | 'alt' | 'meta')[];
  action: string;
  description: string;
  category: string;
}

export interface ShortcutHandler {
  definition: ShortcutDefinition;
  handler: (event: KeyboardEvent) => void;
  enabled: boolean;
}