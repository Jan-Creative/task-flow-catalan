import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { PropertyWithOptions } from "./useProperties";

export const usePropertyLabels = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Connect directly to React Query for instant updates
  const { data: properties = [], isLoading: loading } = useQuery({
    queryKey: ['properties', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: propertyDefs, error } = await supabase
        .from('property_definitions')
        .select(`
          *,
          property_options (*)
        `)
        .eq('user_id', user.id)
        .order('created_at');

      if (error) throw error;

      return propertyDefs?.map(prop => ({
        ...prop,
        type: prop.type as 'select' | 'multiselect',
        options: prop.property_options?.sort((a, b) => a.sort_order - b.sort_order) || []
      })) || [];
    },
    enabled: !!user,
  });

  const getOptionsByProperty = (propertyName: string) => {
    const property = properties.find(p => p.name === propertyName);
    return property?.options || [];
  };

  const getStatusLabel = (value: string): string => {
    const statusOptions = getOptionsByProperty('Estat');
    const option = statusOptions.find(opt => opt.value === value);
    return option?.label || getFallbackStatusLabel(value);
  };

  const getPriorityLabel = (value: string): string => {
    const priorityOptions = getOptionsByProperty('Prioritat');
    const option = priorityOptions.find(opt => opt.value === value);
    return option?.label || getFallbackPriorityLabel(value);
  };

  const getStatusColor = (value: string): string => {
    const statusOptions = getOptionsByProperty('Estat');
    const option = statusOptions.find(opt => opt.value === value);
    return option?.color || getFallbackStatusColor(value);
  };

  const getPriorityColor = (value: string): string => {
    const priorityOptions = getOptionsByProperty('Prioritat');
    const option = priorityOptions.find(opt => opt.value === value);
    return option?.color || getFallbackPriorityColor(value);
  };

  const getStatusOptions = () => {
    return getOptionsByProperty('Estat');
  };

  const getPriorityOptions = () => {
    return getOptionsByProperty('Prioritat');
  };

  // Fallback functions for compatibility
  const getFallbackStatusLabel = (status: string): string => {
    switch (status) {
      case 'pendent': return 'Pendent';
      case 'en_proces': return 'En procés';
      case 'completat': return 'Completat';
      default: return status;
    }
  };

  const getFallbackPriorityLabel = (priority: string): string => {
    switch (priority) {
      case 'alta': return 'Alta';
      case 'mitjana': return 'Mitjana';
      case 'baixa': return 'Baixa';
      case 'urgent': return 'Urgent';
      default: return priority;
    }
  };

  const getFallbackStatusColor = (status: string): string => {
    switch (status) {
      case 'pendent': return '#64748b';
      case 'en_proces': return '#3b82f6';
      case 'completat': return '#10b981';
      default: return '#64748b';
    }
  };

  const getFallbackPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'alta': return '#ef4444';
      case 'mitjana': return '#f59e0b';
      case 'baixa': return '#64748b';
      case 'urgent': return '#dc2626';
      default: return '#64748b';
    }
  };

  return {
    getStatusLabel,
    getPriorityLabel,
    getStatusColor,
    getPriorityColor,
    getStatusOptions,
    getPriorityOptions,
    loading,
  };
};