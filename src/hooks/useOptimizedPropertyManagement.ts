import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUnifiedProperties, PropertyDefinition, PropertyOption } from './useUnifiedProperties';

// ============= OPTIMIZED PROPERTY CRUD OPERATIONS =============
export const useOptimizedPropertyManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { properties } = useUnifiedProperties();

  // ============= PROPERTY OPTION OPERATIONS =============
  const createPropertyOption = useCallback(async (
    propertyId: string, 
    optionData: Omit<PropertyOption, 'id' | 'property_id' | 'created_at' | 'updated_at'>
  ) => {
    if (!user) throw new Error('User not authenticated');

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

      // Invalidate unified properties cache
      queryClient.invalidateQueries({ queryKey: ['unified-properties', user.id] });
      return data;
    } catch (error) {
      console.error('Error creating property option:', error);
      throw error;
    }
  }, [user, queryClient]);

  const updatePropertyOption = useCallback(async (
    optionId: string, 
    optionData: Partial<Omit<PropertyOption, 'id' | 'property_id' | 'created_at' | 'updated_at'>>
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('property_options')
        .update(optionData)
        .eq('id', optionId)
        .select()
        .single();

      if (error) throw error;

      // Invalidate unified properties cache
      queryClient.invalidateQueries({ queryKey: ['unified-properties', user.id] });
      return data;
    } catch (error) {
      console.error('Error updating property option:', error);
      throw error;
    }
  }, [user, queryClient]);

  const deletePropertyOption = useCallback(async (optionId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('property_options')
        .delete()
        .eq('id', optionId);

      if (error) throw error;

      // Invalidate unified properties cache
      queryClient.invalidateQueries({ queryKey: ['unified-properties', user.id] });
    } catch (error) {
      console.error('Error deleting property option:', error);
      throw error;
    }
  }, [user, queryClient]);

  // ============= PROPERTY DEFINITION OPERATIONS =============
  const createPropertyDefinition = useCallback(async (
    propertyData: Omit<PropertyDefinition, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
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

      // Invalidate unified properties cache
      queryClient.invalidateQueries({ queryKey: ['unified-properties', user.id] });
      return data;
    } catch (error) {
      console.error('Error creating property definition:', error);
      throw error;
    }
  }, [user, queryClient]);

  const updatePropertyDefinition = useCallback(async (
    propertyId: string, 
    propertyData: Partial<Omit<PropertyDefinition, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('property_definitions')
        .update(propertyData)
        .eq('id', propertyId)
        .select()
        .single();

      if (error) throw error;

      // Invalidate unified properties cache
      queryClient.invalidateQueries({ queryKey: ['unified-properties', user.id] });
      return data;
    } catch (error) {
      console.error('Error updating property definition:', error);
      throw error;
    }
  }, [user, queryClient]);

  const deletePropertyDefinition = useCallback(async (propertyId: string) => {
    if (!user) throw new Error('User not authenticated');

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

      // Invalidate unified properties cache and task properties
      queryClient.invalidateQueries({ queryKey: ['unified-properties', user.id] });
      queryClient.invalidateQueries({ queryKey: ['task-properties'] });
    } catch (error) {
      console.error('Error deleting property definition:', error);
      throw error;
    }
  }, [user, queryClient]);

  // ============= TASK PROPERTY OPERATIONS =============
  const setTaskProperty = useCallback(async (
    taskId: string, 
    propertyId: string, 
    optionId: string
  ) => {
    if (!user) throw new Error('User not authenticated');

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

      // Invalidate task properties cache
      queryClient.invalidateQueries({ queryKey: ['task-properties', taskId] });
    } catch (error) {
      console.error('Error setting task property:', error);
      throw error;
    }
  }, [user, queryClient]);

  // ============= SYSTEM PROPERTIES INITIALIZATION =============
  const ensureSystemProperties = useCallback(async () => {
    if (!user) return;

    try {
      // Check if system properties already exist
      const existingProps = properties.filter(p => p.is_system);
      const existingNames = new Set(existingProps.map(p => p.name));

      let propertiesCreated = false;

      // Create Estat property if it doesn't exist
      if (!existingNames.has('Estat')) {
        const estatProp = await createPropertyDefinition({
          name: 'Estat',
          type: 'select',
          icon: 'Circle',
          is_system: true
        });

        if (estatProp) {
          // Create default options for Estat
          const estatOptions = [
            { value: 'pendent', label: 'Pendent', color: '#64748b', sort_order: 0, is_default: true },
            { value: 'en_proces', label: 'En procés', color: '#3b82f6', sort_order: 1, is_default: false },
            { value: 'completat', label: 'Completat', color: '#10b981', sort_order: 2, is_default: false }
          ];

          for (const option of estatOptions) {
            await createPropertyOption(estatProp.id, option);
          }
          propertiesCreated = true;
        }
      }

      // Create Prioritat property if it doesn't exist
      if (!existingNames.has('Prioritat')) {
        const prioritatProp = await createPropertyDefinition({
          name: 'Prioritat',
          type: 'select',
          icon: 'Flag',
          is_system: true
        });

        if (prioritatProp) {
          // Create default options for Prioritat
          const prioritatOptions = [
            { value: 'baixa', label: 'Baixa', color: '#64748b', icon: 'Flag', sort_order: 0, is_default: false },
            { value: 'mitjana', label: 'Mitjana', color: '#f59e0b', icon: 'Flag', sort_order: 1, is_default: true },
            { value: 'alta', label: 'Alta', color: '#ef4444', icon: 'Flag', sort_order: 2, is_default: false },
            { value: 'urgent', label: 'Urgent', color: '#dc2626', icon: 'AlertTriangle', sort_order: 3, is_default: false }
          ];

          for (const option of prioritatOptions) {
            await createPropertyOption(prioritatProp.id, option);
          }
          propertiesCreated = true;
        }
      }

      // Refresh cache if properties were created
      if (propertiesCreated) {
        queryClient.invalidateQueries({ queryKey: ['unified-properties', user.id] });
      }
    } catch (error) {
      console.error('Error ensuring system properties:', error);
    }
  }, [user, properties, createPropertyDefinition, createPropertyOption, queryClient]);

  return {
    // Property option operations
    createPropertyOption,
    updatePropertyOption,
    deletePropertyOption,
    
    // Property definition operations
    createPropertyDefinition,
    updatePropertyDefinition,
    deletePropertyDefinition,
    
    // Task property operations
    setTaskProperty,
    
    // System properties
    ensureSystemProperties
  };
};