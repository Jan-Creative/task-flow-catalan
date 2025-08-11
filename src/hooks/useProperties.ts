import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

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
      console.error('Error fetching properties:', error);
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

      await fetchProperties(); // Refresh data
      return data;
    } catch (error) {
      console.error('Error creating property option:', error);
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

      await fetchProperties(); // Refresh data
      return data;
    } catch (error) {
      console.error('Error updating property option:', error);
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

      await fetchProperties(); // Refresh data
    } catch (error) {
      console.error('Error deleting property option:', error);
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

      await fetchProperties(); // Refresh data
      return data;
    } catch (error) {
      console.error('Error updating property definition:', error);
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
      console.error('Error fetching task properties:', error);
      return [];
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
    } catch (error) {
      console.error('Error setting task property:', error);
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

  const ensureSystemProperties = async () => {
    if (!user) return;

    try {
      // Check if system properties exist
      const estatProperty = getPropertyByName('Estat');
      const prioritatProperty = getPropertyByName('Prioritat');

      if (!estatProperty) {
        // Create Estat property
        const { data: estatProp, error: estatError } = await supabase
          .from('property_definitions')
          .insert({
            name: 'Estat',
            type: 'select',
            icon: 'Circle',
            is_system: true,
            user_id: user.id
          })
          .select()
          .single();

        if (estatError) throw estatError;

        // Create default options for Estat
        const estatOptions = [
          { value: 'pendent', label: 'Pendent', color: '#64748b', sort_order: 0, is_default: true },
          { value: 'en_proces', label: 'En procés', color: '#3b82f6', sort_order: 1, is_default: false },
          { value: 'completat', label: 'Completat', color: '#10b981', sort_order: 2, is_default: false }
        ];

        for (const option of estatOptions) {
          await supabase.from('property_options').insert({
            property_id: estatProp.id,
            ...option
          });
        }
      }

      if (!prioritatProperty) {
        // Create Prioritat property
        const { data: prioritatProp, error: prioritatError } = await supabase
          .from('property_definitions')
          .insert({
            name: 'Prioritat',
            type: 'select',
            icon: 'Flag',
            is_system: true,
            user_id: user.id
          })
          .select()
          .single();

        if (prioritatError) throw prioritatError;

        // Create default options for Prioritat
        const prioritatOptions = [
          { value: 'baixa', label: 'Baixa', color: '#64748b', sort_order: 0, is_default: false },
          { value: 'mitjana', label: 'Mitjana', color: '#f59e0b', sort_order: 1, is_default: true },
          { value: 'alta', label: 'Alta', color: '#ef4444', sort_order: 2, is_default: false },
          { value: 'urgent', label: 'Urgent', color: '#dc2626', sort_order: 3, is_default: false }
        ];

        for (const option of prioritatOptions) {
          await supabase.from('property_options').insert({
            property_id: prioritatProp.id,
            ...option
          });
        }
      }

      // Refresh properties if we created any
      if (!estatProperty || !prioritatProperty) {
        await fetchProperties();
      }
    } catch (error) {
      console.error('Error ensuring system properties:', error);
    }
  };

  return {
    properties,
    loading,
    fetchProperties,
    getPropertyByName,
    getOptionsByProperty,
    createPropertyOption,
    updatePropertyOption,
    deletePropertyOption,
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