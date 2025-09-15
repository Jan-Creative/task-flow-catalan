/**
 * Task Form Hook - Encapsula la lògica complexa del formulari de tasques
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { TaskFormData, TaskStatus, TaskPriority } from '@/types/task';
import { useTypedForm, createRequiredValidator, createLengthValidator } from './useTypedForm';
import { useProperties } from './useProperties';

export interface CustomProperty {
  propertyId: string;
  optionId: string;
}

export interface TaskFormState extends TaskFormData {
  customProperties: CustomProperty[];
  isToday: boolean;
  [key: string]: unknown; // Add index signature for compatibility
}

export interface TaskFormConfig {
  initialData?: Partial<TaskFormState>;
  onSubmit: (data: TaskFormState) => void | Promise<void>;
  mode: 'create' | 'edit';
}

export const useTaskForm = (config: TaskFormConfig) => {
  const { properties } = useProperties();
  
  // Form state with typed validation
  const form = useTypedForm<TaskFormState>({
    initialValues: {
      title: config.initialData?.title || '',
      description: config.initialData?.description || '',
      status: config.initialData?.status || 'pendent' as TaskStatus,
      priority: config.initialData?.priority || 'mitjana' as TaskPriority,
      folder_id: config.initialData?.folder_id || '',
      due_date: config.initialData?.due_date || '',
      customProperties: config.initialData?.customProperties || [],
      isToday: config.initialData?.isToday || false,
    },
    validators: {
      title: [
        createRequiredValidator('Títol'),
        createLengthValidator(1, 200, 'Títol')
      ],
      description: [
        createLengthValidator(0, 1000, 'Descripció')
      ]
    },
    onSubmit: config.onSubmit
  });

  // UI state for modals and dropdowns
  const [uiState, setUiState] = useState({
    isDescriptionOpen: false,
    isDatePickerOpen: false,
    selectedPropertyId: null as string | null,
    propertyDropdownOpen: false
  });

  // Status and priority options (values aligned with database CHECK constraints)
  const statusOptions = useMemo(() => [
    { value: 'pendent', label: 'Pendent', color: '#64748b' },
    { value: 'en_proces', label: 'En Procés', color: '#f59e0b' },
    { value: 'completat', label: 'Completat', color: '#10b981' }
  ], []);

  const priorityOptions = useMemo(() => [
    { value: 'baixa', label: 'Baixa', color: '#64748b' },
    { value: 'mitjana', label: 'Mitjana', color: '#f59e0b' },
    { value: 'alta', label: 'Alta', color: '#ef4444' },
    { value: 'urgent', label: 'Urgent', color: '#ef4444' }
  ], []);

  // Custom properties management
  const addCustomProperty = useCallback((propertyId: string, optionId: string) => {
    const currentProperties = form.values.customProperties;
    const existingIndex = currentProperties.findIndex(p => p.propertyId === propertyId);
    
    let newProperties: CustomProperty[];
    if (existingIndex >= 0) {
      // Replace existing property
      newProperties = [
        ...currentProperties.slice(0, existingIndex),
        { propertyId, optionId },
        ...currentProperties.slice(existingIndex + 1)
      ];
    } else {
      // Add new property
      newProperties = [...currentProperties, { propertyId, optionId }];
    }
    
    form.setValue('customProperties', newProperties);
  }, [form]);

  const removeCustomProperty = useCallback((propertyId: string) => {
    const newProperties = form.values.customProperties.filter(
      p => p.propertyId !== propertyId
    );
    form.setValue('customProperties', newProperties);
  }, [form]);

  // UI state helpers
  const toggleDescription = useCallback(() => {
    setUiState(prev => ({ ...prev, isDescriptionOpen: !prev.isDescriptionOpen }));
  }, []);

  const toggleDatePicker = useCallback(() => {
    setUiState(prev => ({ ...prev, isDatePickerOpen: !prev.isDatePickerOpen }));
  }, []);

  const openPropertyDropdown = useCallback((propertyId: string) => {
    setUiState(prev => ({ 
      ...prev, 
      selectedPropertyId: propertyId,
      propertyDropdownOpen: true 
    }));
  }, []);

  const closePropertyDropdown = useCallback(() => {
    setUiState(prev => ({ 
      ...prev, 
      selectedPropertyId: null,
      propertyDropdownOpen: false 
    }));
  }, []);

  // Update values when initial data changes
  useEffect(() => {
    if (config.initialData) {
      const newValues = {
        title: config.initialData.title || '',
        description: config.initialData.description || '',
        status: config.initialData.status || 'pendent' as TaskStatus,
        priority: config.initialData.priority || 'mitjana' as TaskPriority,
        folder_id: config.initialData.folder_id || '',
        due_date: config.initialData.due_date || '',
        customProperties: config.initialData.customProperties || [],
      };
      
      form.updateInitialValues(newValues);
      setUiState(prev => ({
        ...prev,
        isDescriptionOpen: Boolean(config.initialData?.description),
      }));
    }
  }, [config.initialData, form.updateInitialValues]);

// Reset form and update values when config changes
const resetForm = useCallback(() => {
  const newValues = {
    title: config.initialData?.title || '',
    description: config.initialData?.description || '',
    status: (config.initialData?.status as TaskStatus) || 'pendent',
    priority: (config.initialData?.priority as TaskPriority) || 'mitjana',
    folder_id: config.initialData?.folder_id || '',
    due_date: config.initialData?.due_date || '',
    customProperties: config.initialData?.customProperties || [],
  } as TaskFormState;

  // Batch update initial values to avoid flicker and keep validators clean
  form.updateInitialValues(newValues);

  setUiState({
    isDescriptionOpen: Boolean(config.initialData?.description),
    isDatePickerOpen: false,
    selectedPropertyId: null,
    propertyDropdownOpen: false
  });

  // Debugging aid (temporary)
  console.debug('[useTaskForm] resetForm', newValues);
}, [config.initialData, form.updateInitialValues]);

  return {
    // Form state and validation
    ...form,
    
    // UI state
    uiState,
    
    // Options
    statusOptions,
    priorityOptions,
    properties,
    
    // Custom properties
    addCustomProperty,
    removeCustomProperty,
    
    // UI actions
    toggleDescription,
    toggleDatePicker,
    openPropertyDropdown,
    closePropertyDropdown,
    resetForm,
    
    // Computed values
    hasCustomProperties: form.values.customProperties.length > 0,
    isEditMode: config.mode === 'edit'
  };
};