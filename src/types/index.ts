// ============= TIPUS CENTRALITZATS DE L'APLICACIÓ =============

export interface Tasca {
  id: string;
  title: string;
  description?: string;
  status: "pendent" | "en_proces" | "completat";
  priority: "alta" | "mitjana" | "baixa";
  folder_id?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Carpeta {
  id: string;
  name: string;
  color: string;
  is_system: boolean;
}

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

export interface GestorErrors {
  error: Error | null;
  clearError: () => void;
  handleError: (error: Error) => void;
}

export interface CrearTascaData extends Omit<Tasca, "id" | "created_at" | "updated_at"> {}
export interface ActualitzarTascaData extends Partial<Omit<Tasca, "id" | "created_at" | "updated_at">> {}
export interface ActualitzarCarpetaData {
  name?: string;
  color?: string;
}