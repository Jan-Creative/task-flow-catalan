import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { PropertyWithOptions } from "./useProperties";

// Persistent cache for immediate access to colors
const PROPERTY_CACHE_KEY = 'property-definitions-cache';
const CACHE_VERSION = 'v1';

interface CachedPropertyData {
  version: string;
  timestamp: number;
  userId: string;
  properties: PropertyWithOptions[];
}

// Get cached properties from sessionStorage
const getCachedProperties = (userId: string): PropertyWithOptions[] => {
  try {
    const cached = sessionStorage.getItem(PROPERTY_CACHE_KEY);
    if (!cached) return [];
    
    const data: CachedPropertyData = JSON.parse(cached);
    
    // Validate cache
    if (data.version !== CACHE_VERSION || data.userId !== userId) {
      sessionStorage.removeItem(PROPERTY_CACHE_KEY);
      return [];
    }
    
    // Use cache if less than 30 minutes old
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes
    
    if (now - data.timestamp < maxAge) {
      return data.properties;
    }
    
    return [];
  } catch {
    return [];
  }
};

// Store properties in sessionStorage
const setCachedProperties = (userId: string, properties: PropertyWithOptions[]) => {
  try {
    const data: CachedPropertyData = {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      userId,
      properties
    };
    sessionStorage.setItem(PROPERTY_CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
};

export const useOptimizedPropertyLabels = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get cached properties immediately
  const cachedProperties = user ? getCachedProperties(user.id) : [];

  const { data: properties = cachedProperties, isLoading: loading } = useQuery({
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

      const formattedProperties = propertyDefs?.map(prop => ({
        ...prop,
        type: prop.type as 'select' | 'multiselect',
        options: prop.property_options?.sort((a, b) => a.sort_order - b.sort_order) || []
      })) || [];

      // Cache the fresh data
      if (user && formattedProperties.length > 0) {
        setCachedProperties(user.id, formattedProperties);
      }

      return formattedProperties;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    initialData: cachedProperties.length > 0 ? cachedProperties : undefined,
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

  const getStatusIcon = (value: string): string | undefined => {
    const statusOptions = getOptionsByProperty('Estat');
    const option = statusOptions.find(opt => opt.value === value);
    return option?.icon;
  };

  const getPriorityIcon = (value: string): string | undefined => {
    const priorityOptions = getOptionsByProperty('Prioritat');
    const option = priorityOptions.find(opt => opt.value === value);
    return option?.icon;
  };

  const getStatusOptions = () => {
    return getOptionsByProperty('Estat');
  };

  const getPriorityOptions = () => {
    return getOptionsByProperty('Prioritat');
  };

  // Fallback functions with HSL colors matching design system
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
      case 'pendent': return 'hsl(210, 10%, 50%)'; // muted
      case 'en_proces': return 'hsl(180, 100%, 35%)'; // primary-glow
      case 'completat': return 'hsl(142, 71%, 45%)'; // success
      default: return 'hsl(210, 10%, 50%)';
    }
  };

  const getFallbackPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'alta': return 'hsl(0, 84%, 60%)'; // destructive
      case 'mitjana': return 'hsl(48, 96%, 53%)'; // warning
      case 'baixa': return 'hsl(210, 10%, 50%)'; // muted
      case 'urgent': return 'hsl(0, 84%, 50%)'; // darker destructive
      default: return 'hsl(210, 10%, 50%)';
    }
  };

  // Only report loading if we have no cached data
  const isActuallyLoading = loading && properties.length === 0;

  return {
    getStatusLabel,
    getPriorityLabel,
    getStatusColor,
    getPriorityColor,
    getStatusIcon,
    getPriorityIcon,
    getStatusOptions,
    getPriorityOptions,
    loading: isActuallyLoading,
    hasData: properties.length > 0,
  };
};