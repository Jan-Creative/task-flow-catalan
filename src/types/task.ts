/**
 * Enhanced Task-related types with proper TypeScript definitions
 */

import { ID, Timestamp, Optional } from './common';

// ============= TASK CORE TYPES =============
export type TaskStatus = "pendent" | "en_proces" | "completat" | string;
export type TaskPriority = "alta" | "mitjana" | "baixa" | "urgent" | string;

export interface TaskBase {
  id: ID;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  folder_id?: ID;
  due_date?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Main task interface
export interface Task extends TaskBase {
  // Additional computed properties can be added here
  isOverdue?: boolean;
  daysUntilDue?: number;
}

// Legacy alias for backward compatibility
export interface Tasca extends TaskBase {}

// ============= TASK FORM TYPES =============
export interface TaskFormData {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  folder_id?: ID;
  due_date?: string;
}

export interface CreateTaskData extends Omit<TaskBase, "id" | "created_at" | "updated_at"> {}
export interface UpdateTaskData extends Partial<Omit<TaskBase, "id" | "created_at" | "updated_at">> {}

// ============= TASK CONTEXT TYPES =============
export interface TaskContextValue {
  task: Optional<Task>;
  folder: Optional<FolderInfo>;
  subtasks: Subtask[];
  loading: boolean;
  error: Optional<Error>;
  updateTask: (updates: UpdateTaskData) => Promise<void>;
  deleteTask: () => Promise<void>;
  addSubtask: (title: string) => Promise<void>;
  toggleSubtask: (subtaskId: ID) => Promise<void>;
  deleteSubtask: (subtaskId: ID) => Promise<void>;
}

// ============= SUBTASK TYPES =============
export interface Subtask {
  id: ID;
  title: string;
  task_id: ID;
  is_completed: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// ============= FOLDER TYPES =============
export interface FolderInfo {
  id: ID;
  name: string;
  color: string;
  is_system: boolean;
  icon?: string;
}

export interface Carpeta extends FolderInfo {} // Legacy alias

// ============= PROPERTY TYPES =============
export interface PropertyDefinition {
  id: ID;
  name: string;
  type: 'select' | 'multiselect';
  icon?: string;
  is_system: boolean;
  user_id: ID;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface PropertyOption {
  id: ID;
  property_id: ID;
  value: string;
  label: string;
  color: string;
  icon?: string;
  sort_order: number;
  is_default: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface PropertyWithOptions extends PropertyDefinition {
  options: PropertyOption[];
}

export interface TaskProperty {
  id: ID;
  task_id: ID;
  property_id: ID;
  option_id: ID;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface TaskPropertyWithDetails {
  id: ID;
  task_id: ID;
  property_id: ID;
  option_id: ID;
  property_definitions: PropertyDefinition;
  property_options: PropertyOption;
}

export interface CustomProperty {
  propertyId: ID;
  optionId: ID;
}

// ============= TASK OPERATIONS TYPES =============
export interface TaskOperationResult {
  success: boolean;
  task?: Task;
  error?: string;
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  folder_id?: ID;
  search?: string;
  due_date?: {
    from?: string;
    to?: string;
  };
}

// ============= TASK STATISTICS =============
export interface TaskStatistics {
  total: number;
  completades: number;
  enProces: number;
  pendents: number;
  overdue: number;
}

export interface TasksByFolder {
  [folderId: string]: Task[];
}

export interface OptimizedTaskData {
  tasques: Task[];
  carpetes: FolderInfo[];
  estadistiquesTasques: TaskStatistics;
  tasquesPerCarpeta: TasksByFolder;
  tasquesAvui: Task[];
}

// Legacy aliases for backward compatibility
export interface EstadistiquesTasques extends TaskStatistics {}
export interface DadesOptimitzades extends OptimizedTaskData {}
export interface CrearTascaData extends CreateTaskData {}
export interface ActualitzarTascaData extends UpdateTaskData {}