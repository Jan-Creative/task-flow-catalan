/**
 * Task Form Hook - Encapsula la lògica complexa del formulari de tasques
 */

import { useState, useCallback, useMemo } from 'react';
import { TaskFormData, TaskStatus, TaskPriority } from '@/types/task';
import { useTypedForm, createRequiredValidator, createLengthValidator } from './useTypedForm';
import { useProperties } from './useProperties';

export interface CustomProperty {
  propertyId: string;
  optionId: string;
}

export interface TaskFormState extends TaskFormData {
  customProperties: CustomProperty[];
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
      title: '',
      description: '',
      status: 'pendent' as TaskStatus,
      priority: 'mitjana' as TaskPriority,
      folder_id: '',
      due_date: '',
      customProperties: [],
      ...config.initialData
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

  // Status and priority options
  const statusOptions = useMemo(() => [
    { value: 'pendent', label: 'Pendent', color: '#ef4444' },
    { value: 'en_proces', label: 'En procés', color: '#f59e0b' },
    { value: 'completat', label: 'Completat', color: '#10b981' }
  ], []);

  const priorityOptions = useMemo(() => [
    { value: 'baixa', label: 'Baixa', color: '#6b7280' },
    { value: 'mitjana', label: 'Mitjana', color: '#3b82f6' },
    { value: 'alta', label: 'Alta', color: '#f59e0b' },
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

  // Reset form
  const resetForm = useCallback(() => {
    form.resetForm();
    setUiState({
      isDescriptionOpen: false,
      isDatePickerOpen: false,
      selectedPropertyId: null,
      propertyDropdownOpen: false
    });
  }, [form]);

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