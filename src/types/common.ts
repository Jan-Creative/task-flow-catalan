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