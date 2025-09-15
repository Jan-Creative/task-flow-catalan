/**
 * Mac Task Form Hook - Comprehensive form logic optimized for Mac workflow
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { TaskFormData, TaskStatus, TaskPriority } from '@/types/task';
import { useTypedForm, createRequiredValidator, createLengthValidator } from '../useTypedForm';
import { useProperties } from '../useProperties';
// Generate unique IDs for new items
const generateId = () => `mac_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export interface MacCustomProperty {
  propertyId: string;
  optionId: string;
}

export interface MacReminder {
  id: string;
  datetime: string;
  message: string;
}

export interface MacSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface MacTaskFormState extends TaskFormData {
  start_date: string;
  estimated_time: number;
  customProperties: MacCustomProperty[];
  tags: string[];
  subtasks: MacSubtask[];
  reminders: MacReminder[];
  isToday: boolean;
  [key: string]: unknown; // Add index signature for compatibility
}

export interface MacTaskFormConfig {
  initialData?: Partial<MacTaskFormState>;
  onSubmit: (data: MacTaskFormState) => void | Promise<void>;
  mode: 'create' | 'edit';
  folders: Array<{ id: string; name: string }>;
}

export interface MacTaskFormReturn {
  // Form state and validation
  values: MacTaskFormState;
  errors: Record<string, string>;
  isValid: boolean;
  isSubmitting: boolean;
  setValue: (field: keyof MacTaskFormState, value: any) => void;
  handleSubmit: (e?: React.FormEvent) => void;
  resetForm: () => void;
  
  // UI state
  uiState: {
    additionalNotes: string;
    isAutoSaving: boolean;
    lastSaved?: Date;
  };
  setUiState: React.Dispatch<React.SetStateAction<any>>;
  
  // Options
  statusOptions: Array<{ value: string; label: string; color: string }>;
  priorityOptions: Array<{ value: string; label: string; color: string }>;
  properties: Array<{ id: string; name: string; options: Array<{ id: string; label: string }> }>;
  availableTags: string[];
  
  // Custom properties
  addCustomProperty: (propertyId: string, optionId: string) => void;
  removeCustomProperty: (propertyId: string) => void;
  
  // Tags management
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  createNewTag: (tag: string) => void;
  
  // Subtasks management
  addSubtask: (title: string) => void;
  removeSubtask: (id: string) => void;
  toggleSubtask: (id: string) => void;
  
  // Reminders management
  addReminder: (reminder: Omit<MacReminder, 'id'>) => void;
  removeReminder: (id: string) => void;
  
  // Folder management
  createNewFolder: () => void;
  
  // Focus management
  titleRef: React.RefObject<HTMLInputElement>;
  descriptionRef: React.RefObject<HTMLTextAreaElement>;
  focusTitle: () => void;
  focusDescription: () => void;
  
  // Computed values
  isEditMode: boolean;
}

export const useMacTaskForm = (config: MacTaskFormConfig): MacTaskFormReturn => {
  const { properties } = useProperties();
  
  // Refs for focus management
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  
  // Form state with typed validation
  const form = useTypedForm<MacTaskFormState>({
    initialValues: {
      title: config.initialData?.title || '',
      description: config.initialData?.description || '',
      status: config.initialData?.status || 'pendent' as TaskStatus,
      priority: config.initialData?.priority || 'mitjana' as TaskPriority,
      folder_id: config.initialData?.folder_id || '',
      due_date: config.initialData?.due_date || '',
      start_date: config.initialData?.start_date || '',
      estimated_time: config.initialData?.estimated_time || 0,
      customProperties: config.initialData?.customProperties || [],
      tags: config.initialData?.tags || [],
      subtasks: config.initialData?.subtasks || [],
      reminders: config.initialData?.reminders || [],
      isToday: config.initialData?.isToday || false,
    },
    validators: {
      title: [
        createRequiredValidator('Títol'),
        createLengthValidator(1, 200, 'Títol')
      ],
      description: [
        createLengthValidator(0, 2000, 'Descripció')
      ]
    },
    onSubmit: config.onSubmit
  });

  // UI state for Mac-specific features
  const [uiState, setUiState] = useState({
    additionalNotes: '',
    isAutoSaving: false,
    lastSaved: undefined as Date | undefined,
  });

  // Status and priority options
  const statusOptions = useMemo(() => [
    { value: 'pendent', label: 'Pendent', color: '#64748b' },
    { value: 'en_proces', label: 'En Procés', color: '#f59e0b' },
    { value: 'completat', label: 'Completat', color: '#10b981' }
  ], []);

  const priorityOptions = useMemo(() => [
    { value: 'baixa', label: 'Baixa', color: '#64748b' },
    { value: 'mitjana', label: 'Mitjana', color: '#f59e0b' },
    { value: 'alta', label: 'Alta', color: '#ef4444' },
    { value: 'urgent', label: 'Urgent', color: '#dc2626' }
  ], []);

  // Available tags (could be loaded from API)
  const availableTags = useMemo(() => [
    'urgent', 'important', 'reunió', 'projecte', 'personal', 'treball', 'estudi'
  ], []);

  // Transform properties to match expected interface
  const transformedProperties = useMemo(() => 
    properties.map(prop => ({
      id: prop.id,
      name: prop.name,
      options: prop.options.map(opt => ({
        id: opt.id,
        label: opt.label
      }))
    })), [properties]);

  // Custom properties management
  const addCustomProperty = useCallback((propertyId: string, optionId: string) => {
    const currentProperties = form.values.customProperties;
    const existingIndex = currentProperties.findIndex(p => p.propertyId === propertyId);
    
    let newProperties: MacCustomProperty[];
    if (existingIndex >= 0) {
      newProperties = [
        ...currentProperties.slice(0, existingIndex),
        { propertyId, optionId },
        ...currentProperties.slice(existingIndex + 1)
      ];
    } else {
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

  // Tags management
  const addTag = useCallback((tag: string) => {
    if (!form.values.tags.includes(tag)) {
      form.setValue('tags', [...form.values.tags, tag]);
    }
  }, [form]);

  const removeTag = useCallback((tag: string) => {
    form.setValue('tags', form.values.tags.filter(t => t !== tag));
  }, [form]);

  const createNewTag = useCallback((tag: string) => {
    // In a real app, this would call an API to create the tag
    addTag(tag);
  }, [addTag]);

  // Subtasks management
  const addSubtask = useCallback((title: string) => {
    const newSubtask: MacSubtask = {
      id: generateId(),
      title,
      completed: false
    };
    form.setValue('subtasks', [...form.values.subtasks, newSubtask]);
  }, [form]);

  const removeSubtask = useCallback((id: string) => {
    form.setValue('subtasks', form.values.subtasks.filter(s => s.id !== id));
  }, [form]);

  const toggleSubtask = useCallback((id: string) => {
    const newSubtasks = form.values.subtasks.map(subtask =>
      subtask.id === id 
        ? { ...subtask, completed: !subtask.completed }
        : subtask
    );
    form.setValue('subtasks', newSubtasks);
  }, [form]);

  // Reminders management
  const addReminder = useCallback((reminder: Omit<MacReminder, 'id'>) => {
    const newReminder: MacReminder = {
      id: generateId(),
      ...reminder
    };
    form.setValue('reminders', [...form.values.reminders, newReminder]);
  }, [form]);

  const removeReminder = useCallback((id: string) => {
    form.setValue('reminders', form.values.reminders.filter(r => r.id !== id));
  }, [form]);

  // Folder management
  const createNewFolder = useCallback(() => {
    // In a real app, this would open a modal to create a new folder
    console.log('Create new folder');
  }, []);

  // Focus management
  const focusTitle = useCallback(() => {
    titleRef.current?.focus();
  }, []);

  const focusDescription = useCallback(() => {
    descriptionRef.current?.focus();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (form.values.title.trim() && config.mode === 'edit') {
        setUiState(prev => ({ ...prev, isAutoSaving: true }));
        // Simulate auto-save
        setTimeout(() => {
          setUiState(prev => ({ 
            ...prev, 
            isAutoSaving: false, 
            lastSaved: new Date() 
          }));
        }, 1000);
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(timeoutId);
  }, [form.values, config.mode]);

  // Reset form functionality
  const resetForm = useCallback(() => {
    const newValues = {
      title: config.initialData?.title || '',
      description: config.initialData?.description || '',
      status: (config.initialData?.status as TaskStatus) || 'pendent',
      priority: (config.initialData?.priority as TaskPriority) || 'mitjana',
      folder_id: config.initialData?.folder_id || '',
      due_date: config.initialData?.due_date || '',
      start_date: config.initialData?.start_date || '',
      estimated_time: config.initialData?.estimated_time || 0,
      customProperties: config.initialData?.customProperties || [],
      tags: config.initialData?.tags || [],
      subtasks: config.initialData?.subtasks || [],
      reminders: config.initialData?.reminders || [],
    } as MacTaskFormState;

    form.updateInitialValues(newValues);
    setUiState({
      additionalNotes: '',
      isAutoSaving: false,
      lastSaved: undefined,
    });
  }, [config.initialData, form.updateInitialValues]);

  return {
    // Form state and validation
    ...form,
    
    // UI state
    uiState,
    setUiState,
    
    // Options
    statusOptions,
    priorityOptions,
    properties: transformedProperties,
    availableTags,
    
    // Custom properties
    addCustomProperty,
    removeCustomProperty,
    
    // Tags management
    addTag,
    removeTag,
    createNewTag,
    
    // Subtasks management
    addSubtask,
    removeSubtask,
    toggleSubtask,
    
    // Reminders management
    addReminder,
    removeReminder,
    
    // Folder management
    createNewFolder,
    
    // Focus management
    titleRef,
    descriptionRef,
    focusTitle,
    focusDescription,
    
    // Computed values
    isEditMode: config.mode === 'edit'
  };
};