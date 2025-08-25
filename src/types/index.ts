// ============= TIPUS CENTRALITZATS DE L'APLICACIÓ =============

// ============= TASK TYPES =============
export interface Tasca {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  folder_id?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

// More flexible types for custom priorities and statuses
export type TaskStatus = "pendent" | "en_proces" | "completat" | string;
export type TaskPriority = "alta" | "mitjana" | "baixa" | "urgent" | string;

// Alias for compatibility with existing code
export interface Task extends Tasca {}

// ============= FOLDER TYPES =============
export interface Carpeta {
  id: string;
  name: string;
  color: string;
  is_system: boolean;
  icon?: string;
}

// ============= PROPERTY TYPES =============
export interface PropertyDefinition {
  id: string;
  name: string;
  type: 'select' | 'multiselect';
  icon?: string;
  is_system: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyOption {
  id: string;
  property_id: string;
  value: string;
  label: string;
  color: string;
  icon?: string;
  sort_order: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyWithOptions extends PropertyDefinition {
  options: PropertyOption[];
}

export interface TaskProperty {
  id: string;
  task_id: string;
  property_id: string;
  option_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskPropertyWithDetails {
  id: string;
  task_id: string;
  property_id: string;
  option_id: string;
  property_definitions: PropertyDefinition;
  property_options: PropertyOption;
}

// ============= CUSTOM PROPERTY OPERATIONS =============
export interface CustomProperty {
  propertyId: string;
  optionId: string;
}

// ============= SUBTASK TYPES =============
export interface Subtask {
  id: string;
  title: string;
  task_id: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

// ============= STATISTICS TYPES =============
export interface EstadistiquesTasques {
  total: number;
  completades: number;
  enProces: number;
  pendents: number;
}

export interface DadesOptimitzades {
  tasques: Tasca[];
  carpetes: Carpeta[];
  estadistiquesTasques: EstadistiquesTasques;
  tasquesPerCarpeta: Record<string, Tasca[]>;
  tasquesAvui: Tasca[];
}


// ============= FORM DATA TYPES =============
export interface CrearTascaData extends Omit<Tasca, "id" | "created_at" | "updated_at"> {}
export interface ActualitzarTascaData extends Partial<Omit<Tasca, "id" | "created_at" | "updated_at">> {}
export interface ActualitzarCarpetaData {
  name?: string;
  color?: string;
  icon?: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  folder_id?: string;
  due_date?: string;
}