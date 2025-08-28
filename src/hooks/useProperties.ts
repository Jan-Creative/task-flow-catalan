import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { useRealtimeSafety } from './useRealtimeSafety';

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

export interface TaskProperty {
  id: string;
  task_id: string;
  property_id: string;
  option_id: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyWithOptions extends PropertyDefinition {
  options: PropertyOption[];
}

export const useProperties = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { isRealtimeAvailable, createSafeSubscription, error: realtimeError } = useRealtimeSafety();
  const [properties, setProperties] = useState<PropertyWithOptions[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch property definitions with their options
      const { data: propertyDefs, error: propError } = await supabase
        .from('property_definitions')
        .select(`
          *,
          property_options (*)
        `)
        .eq('user_id', user.id)
        .order('created_at');

      if (propError) throw propError;

      // Sort options by sort_order within each property
      const propertiesWithSortedOptions = propertyDefs?.map(prop => ({
        ...prop,
        type: prop.type as 'select' | 'multiselect',
        options: prop.property_options?.sort((a, b) => a.sort_order - b.sort_order) || []
      })) || [];

      setProperties(propertiesWithSortedOptions);
    } catch (error) {
      // Silent error handling to avoid console pollution
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const getPropertyByName = (name: string) => {
    return properties.find(p => p.name === name);
  };

  const getOptionsByProperty = (propertyName: string) => {
    const property = getPropertyByName(propertyName);
    return property?.options || [];
  };

  const createPropertyOption = async (propertyId: string, optionData: Omit<PropertyOption, 'id' | 'property_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('property_options')
        .insert({
          property_id: propertyId,
          ...optionData
        })
        .select()
        .single();

      if (error) throw error;

      // Optimistic update
      setProperties(prevProperties => 
        prevProperties.map(prop => 
          prop.id === propertyId 
            ? { ...prop, options: [...prop.options, data].sort((a, b) => a.sort_order - b.sort_order) }
            : prop
        )
      );

      // Invalidate queries for immediate refresh
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      return data;
    } catch (error) {
      throw error;
    }
  };

  const updatePropertyOption = async (optionId: string, optionData: Partial<Omit<PropertyOption, 'id' | 'property_id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('property_options')
        .update(optionData)
        .eq('id', optionId)
        .select()
        .single();

      if (error) throw error;

      // Optimistic update
      setProperties(prevProperties => 
        prevProperties.map(prop => ({
          ...prop,
          options: prop.options.map(opt => 
            opt.id === optionId ? { ...opt, ...optionData } : opt
          )
        }))
      );

      // Invalidate queries for immediate refresh
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      return data;
    } catch (error) {
      throw error;
    }
  };

  const deletePropertyOption = async (optionId: string) => {
    try {
      const { error } = await supabase
        .from('property_options')
        .delete()
        .eq('id', optionId);

      if (error) throw error;

      // Optimistic update
      setProperties(prevProperties => 
        prevProperties.map(prop => ({
          ...prop,
          options: prop.options.filter(opt => opt.id !== optionId)
        }))
      );

      // Invalidate queries for immediate refresh
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    } catch (error) {
      throw error;
    }
  };

  const deletePropertyDefinition = async (propertyId: string) => {
    try {
      // First delete all associated options
      const { error: optionsError } = await supabase
        .from('property_options')
        .delete()
        .eq('property_id', propertyId);

      if (optionsError) throw optionsError;

      // Then delete all task properties using this property
      const { error: taskPropsError } = await supabase
        .from('task_properties')
        .delete()
        .eq('property_id', propertyId);

      if (taskPropsError) throw taskPropsError;

      // Finally delete the property definition
      const { error } = await supabase
        .from('property_definitions')
        .delete()
        .eq('id', propertyId)
        .eq('is_system', false); // Only allow deleting custom properties

      if (error) throw error;

      // Optimistic update
      setProperties(prevProperties => 
        prevProperties.filter(prop => prop.id !== propertyId)
      );

      // Invalidate queries for immediate refresh
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['task-properties'] });
    } catch (error) {
      throw error;
    }
  };

  const updatePropertyDefinition = async (propertyId: string, propertyData: Partial<Omit<PropertyDefinition, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('property_definitions')
        .update(propertyData)
        .eq('id', propertyId)
        .select()
        .single();

      if (error) throw error;

      // Optimistic update
      setProperties(prevProperties => 
        prevProperties.map(prop => 
          prop.id === propertyId ? { ...prop, ...propertyData } : prop
        )
      );
      
      // Invalidate queries for immediate refresh
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      return data;
    } catch (error) {
      throw error;
    }
  };

  const getTaskProperties = async (taskId: string) => {
    try {
      const { data, error } = await supabase
        .from('task_properties')
        .select(`
          *,
          property_options (*),
          property_definitions (*)
        `)
        .eq('task_id', taskId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      return [];
    }
  };

  const createPropertyDefinition = async (propertyData: Omit<PropertyDefinition, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('property_definitions')
        .insert({
          ...propertyData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Optimistic update
      setProperties(prevProperties => [...prevProperties, { 
        ...data, 
        type: data.type as 'select' | 'multiselect',
        options: [] 
      }]);
      
      // Invalidate queries for immediate refresh
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      return data;
    } catch (error) {
      throw error;
    }
  };

  const setTaskProperty = async (taskId: string, propertyId: string, optionId: string) => {
    try {
      // First try to update existing
      const { data: existing } = await supabase
        .from('task_properties')
        .select('id')
        .eq('task_id', taskId)
        .eq('property_id', propertyId)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('task_properties')
          .update({ option_id: optionId })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('task_properties')
          .insert({
            task_id: taskId,
            property_id: propertyId,
            option_id: optionId
          });

        if (error) throw error;
      }

      // Invalidate task properties query for immediate refresh in TaskDetailsCard
      queryClient.invalidateQueries({ queryKey: ['task-properties', taskId] });
      queryClient.invalidateQueries({ queryKey: ['task-properties'] });
    } catch (error) {
      throw error;
    }
  };

  // Legacy support functions for backward compatibility
  const getStatusOptions = () => {
    return getOptionsByProperty('Estat');
  };

  const getPriorityOptions = () => {
    return getOptionsByProperty('Prioritat');
  };

  const getStatusProperty = () => {
    return getPropertyByName('Estat');
  };

  const getPriorityProperty = () => {
    return getPropertyByName('Prioritat');
  };

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Realtime subscription: refresh properties on any change (with safety check)
  useEffect(() => {
    if (!user || !isRealtimeAvailable) {
      // Si realtime no està disponible, configurem polling cada 30 segons
      if (!user) return;
      
      const pollInterval = setInterval(() => {
        fetchProperties();
      }, 30000); // Poll cada 30 segons

      return () => clearInterval(pollInterval);
    }

    // Utilitzem la subscripció segura
    const channel1 = createSafeSubscription(
      'properties-changes',
      { event: '*', schema: 'public', table: 'property_definitions' },
      () => fetchProperties()
    );

    const channel2 = createSafeSubscription(
      'properties-options-changes', 
      { event: '*', schema: 'public', table: 'property_options' },
      () => fetchProperties()
    );

    return () => {
      try {
        if (channel1) supabase.removeChannel(channel1);
        if (channel2) supabase.removeChannel(channel2);
      } catch (error) {
        // Silenci per evitar errors en la neteja
      }
    };
  }, [user?.id, fetchProperties, isRealtimeAvailable, createSafeSubscription]);

  const ensureSystemProperties = async () => {
    if (!user) return;

    try {
      // First fetch current properties to check if they already exist
      const { data: existingProps } = await supabase
        .from('property_definitions')
        .select('name')
        .eq('user_id', user.id)
        .in('name', ['Estat', 'Prioritat']);

      const existingNames = new Set(existingProps?.map(p => p.name) || []);
      let propertiesCreated = false;

      // Create Estat property if it doesn't exist
      if (!existingNames.has('Estat')) {
        const { data: estatProp, error: estatError } = await supabase
          .from('property_definitions')
          .upsert({
            name: 'Estat',
            type: 'select',
            icon: 'Circle',
            is_system: true,
            user_id: user.id
          }, {
            onConflict: 'user_id,name',
            ignoreDuplicates: true
          })
          .select()
          .maybeSingle();

        if (estatError && !estatError.message.includes('duplicate key')) {
          throw estatError;
        }

        if (estatProp) {
          // Create default options for Estat
          const estatOptions = [
            { value: 'pendent', label: 'Pendent', color: '#64748b', sort_order: 0, is_default: true },
            { value: 'en_proces', label: 'En procés', color: '#3b82f6', sort_order: 1, is_default: false },
            { value: 'completat', label: 'Completat', color: '#10b981', sort_order: 2, is_default: false }
          ];

          for (const option of estatOptions) {
            await supabase.from('property_options').upsert({
              property_id: estatProp.id,
              ...option
            }, {
              onConflict: 'property_id,value',
              ignoreDuplicates: true
            });
          }
          propertiesCreated = true;
        }
      }

      // Create Prioritat property if it doesn't exist
      if (!existingNames.has('Prioritat')) {
        const { data: prioritatProp, error: prioritatError } = await supabase
          .from('property_definitions')
          .upsert({
            name: 'Prioritat',
            type: 'select',
            icon: 'Flag',
            is_system: true,
            user_id: user.id
          }, {
            onConflict: 'user_id,name',
            ignoreDuplicates: true
          })
          .select()
          .maybeSingle();

        if (prioritatError && !prioritatError.message.includes('duplicate key')) {
          throw prioritatError;
        }

        if (prioritatProp) {
          // Create default options for Prioritat
          const prioritatOptions = [
            { value: 'baixa', label: 'Baixa', color: '#64748b', icon: 'Flag', sort_order: 0, is_default: false },
            { value: 'mitjana', label: 'Mitjana', color: '#f59e0b', icon: 'Flag', sort_order: 1, is_default: true },
            { value: 'alta', label: 'Alta', color: '#ef4444', icon: 'Flag', sort_order: 2, is_default: false },
            { value: 'urgent', label: 'Urgent', color: '#dc2626', icon: 'AlertTriangle', sort_order: 3, is_default: false }
          ];

          for (const option of prioritatOptions) {
            await supabase.from('property_options').upsert({
              property_id: prioritatProp.id,
              ...option
            }, {
              onConflict: 'property_id,value',
              ignoreDuplicates: true
            });
          }
          propertiesCreated = true;
        }
      }

      // Only invalidate and refresh if we actually created properties
      if (propertiesCreated) {
        queryClient.invalidateQueries({ queryKey: ['properties'] });
        await fetchProperties();
      }
    } catch (error) {
      // Silent error handling - don't log to avoid console pollution
      // System properties will be retried on next component mount
    }
  };

  return {
    properties,
    loading,
    fetchProperties,
    getPropertyByName,
    getOptionsByProperty,
    createPropertyDefinition,
    createPropertyOption,
    updatePropertyOption,
    deletePropertyOption,
    deletePropertyDefinition,
    updatePropertyDefinition,
    getTaskProperties,
    setTaskProperty,
    ensureSystemProperties,
    // Legacy support
    getStatusOptions,
    getPriorityOptions,
    getStatusProperty,
    getPriorityProperty,
  };
};

export default useProperties;