import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { usePropertyRealtimeSubscriptions } from "./useRealtimeSubscriptions";

// ============= UNIFIED PROPERTY INTERFACES =============
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

export interface TaskPropertyWithDetails {
  id: string;
  task_id: string;
  property_id: string;
  option_id: string;
  property_definitions: PropertyDefinition;
  property_options: PropertyOption;
}

// ============= UNIFIED PROPERTY HOOK =============
export const useUnifiedProperties = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Setup realtime subscriptions for properties
  usePropertyRealtimeSubscriptions();

  // Fetch all property definitions with options
  const {
    data: properties = [],
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['unified-properties', user?.id],
    queryFn: async (): Promise<PropertyWithOptions[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('property_definitions')
        .select(`
          *,
          property_options (*)
        `)
        .eq('user_id', user.id)
        .order('created_at');

      if (error) throw error;

      return (data || []).map(prop => ({
        ...prop,
        type: prop.type as 'select' | 'multiselect',
        options: (prop.property_options || []).sort((a, b) => a.sort_order - b.sort_order)
      }));
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // ============= PROPERTY QUERY FUNCTIONS =============
  const getPropertyByName = (name: string) => {
    return properties.find(p => p.name === name);
  };

  const getOptionsByProperty = (propertyName: string) => {
    const property = getPropertyByName(propertyName);
    return property?.options || [];
  };

  const getStatusOptions = () => getOptionsByProperty('Estat');
  const getPriorityOptions = () => getOptionsByProperty('Prioritat');
  const getStatusProperty = () => getPropertyByName('Estat');
  const getPriorityProperty = () => getPropertyByName('Prioritat');

  // ============= LABEL & COLOR HELPERS =============
  const getOptionByPropertyAndValue = (propertyName: string, value: string) => {
    const options = getOptionsByProperty(propertyName);
    return options.find(opt => opt.value === value);
  };

  const getStatusLabel = (value: string) => {
    const option = getOptionByPropertyAndValue('Estat', value);
    return option?.label || getStatusLabelFallback(value);
  };

  const getPriorityLabel = (value: string) => {
    const option = getOptionByPropertyAndValue('Prioritat', value);
    return option?.label || getPriorityLabelFallback(value);
  };

  const getStatusColor = (value: string) => {
    const option = getOptionByPropertyAndValue('Estat', value);
    return option?.color || getStatusColorFallback(value);
  };

  const getPriorityColor = (value: string) => {
    const option = getOptionByPropertyAndValue('Prioritat', value);
    return option?.color || getPriorityColorFallback(value);
  };

  const getStatusIcon = (value: string) => {
    const option = getOptionByPropertyAndValue('Estat', value);
    return option?.icon || getStatusIconFallback(value);
  };

  const getPriorityIcon = (value: string) => {
    const option = getOptionByPropertyAndValue('Prioritat', value);
    return option?.icon || getPriorityIconFallback(value);
  };

  // ============= FALLBACK FUNCTIONS =============
  const getStatusLabelFallback = (value: string) => {
    const statusLabels: Record<string, string> = {
      'pendent': 'Pendent',
      'en_proces': 'En procés',
      'completat': 'Completat'
    };
    return statusLabels[value] || value;
  };

  const getPriorityLabelFallback = (value: string) => {
    const priorityLabels: Record<string, string> = {
      'baixa': 'Baixa',
      'mitjana': 'Mitjana',
      'alta': 'Alta'
    };
    return priorityLabels[value] || value;
  };

  const getStatusColorFallback = (value: string) => {
    const statusColors: Record<string, string> = {
      'pendent': '#64748b',
      'en_proces': '#3b82f6',
      'completat': '#10b981'
    };
    return statusColors[value] || '#6b7280';
  };

  const getPriorityColorFallback = (value: string) => {
    const priorityColors: Record<string, string> = {
      'baixa': '#64748b',
      'mitjana': '#f59e0b',
      'alta': '#ef4444'
    };
    return priorityColors[value] || '#6b7280';
  };

  const getStatusIconFallback = (value: string) => {
    const statusIcons: Record<string, string> = {
      'pendent': 'Circle',
      'en_proces': 'Clock',
      'completat': 'CheckCircle'
    };
    return statusIcons[value];
  };

  const getPriorityIconFallback = (value: string) => {
    const priorityIcons: Record<string, string> = {
      'baixa': 'Flag',
      'mitjana': 'Flag',
      'alta': 'Flag'
    };
    return priorityIcons[value];
  };

  return {
    // Core data
    properties,
    loading,
    error,
    
    // Property queries
    getPropertyByName,
    getOptionsByProperty,
    getStatusOptions,
    getPriorityOptions,
    getStatusProperty,
    getPriorityProperty,
    
    // Label helpers
    getStatusLabel,
    getPriorityLabel,
    getStatusColor,
    getPriorityColor,
    getStatusIcon,
    getPriorityIcon,
  };
};