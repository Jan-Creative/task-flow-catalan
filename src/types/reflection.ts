export interface DailyReflection {
  id: string;
  user_id: string;
  reflection_date: string;
  day_rating: number;
  work_satisfaction: number;
  energy_level: number;
  stress_level: number;
  tasks_completed_percentage: number;
  notes?: string;
  accomplishments?: string[];
  obstacles?: string[];
  mood_tags?: string[];
  gratitude_notes?: string;
  tomorrow_focus?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReflectionData {
  reflection_date: string;
  day_rating: number;
  work_satisfaction: number;
  energy_level: number;
  stress_level: number;
  tasks_completed_percentage: number;
  notes?: string;
  accomplishments?: string[];
  obstacles?: string[];
  mood_tags?: string[];
  gratitude_notes?: string;
  tomorrow_focus?: string;
}

export interface UpdateReflectionData extends Partial<CreateReflectionData> {}

export const MOOD_TAGS = [
  'Motivat/da',
  'Productiu/va',
  'Estressat/da',
  'Relaxat/da',
  'Inspirat/da',
  'Cansat/da',
  'Enfocat/da',
  'Confós/sa',
  'Satisfet/ta',
  'Frustrat/da',
  'Optimista',
  'Preocupat/da'
] as const;

export const COMMON_OBSTACLES = [
  'Interrupcions',
  'Falta de temps',
  'Falta de motivació',
  'Tecnologia',
  'Reunions excessives',
  'Procrastinació',
  'Falta de recursos',
  'Comunicació',
  'Multitasking',
  'Distraccions'
] as const;

export const COMMON_ACCOMPLISHMENTS = [
  'Tasques prioritàries',
  'Deadlines complerts',
  'Objectius assolits',
  'Aprenentatge nou',
  'Millora processos',
  'Col·laboració efectiva',
  'Creativitat',
  'Organització',
  'Comunicació clara',
  'Resolució problemes'
] as const;