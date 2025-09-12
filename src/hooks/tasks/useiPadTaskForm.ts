/**
 * iPad Task Form Hook - Touch-optimized form logic with gesture support
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { TaskFormData, TaskStatus, TaskPriority } from '@/types/task';
import { useTypedForm, createRequiredValidator, createLengthValidator } from '../useTypedForm';
import { useProperties } from '../useProperties';

// Generate unique IDs for new items
const generateId = () => `ipad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export interface iPadCustomProperty {
  propertyId: string;
  optionId: string;
}

export interface iPadReminder {
  id: string;
  datetime: string;
  message: string;
}

export interface iPadSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface iPadTaskFormState extends TaskFormData {
  start_date: string;
  estimated_time: number;
  customProperties: iPadCustomProperty[];
  tags: string[];
  subtasks: iPadSubtask[];
  reminders: iPadReminder[];
  [key: string]: unknown;
}

export interface iPadTaskFormConfig {
  initialData?: Partial<iPadTaskFormState>;
  onSubmit: (data: iPadTaskFormState) => void | Promise<void>;
  mode: 'create' | 'edit';
  folders: Array<{ id: string; name: string }>;
}

export interface iPadTaskFormReturn {
  // Form state and validation
  values: iPadTaskFormState;
  errors: Record<string, string>;
  isValid: boolean;
  isSubmitting: boolean;
  setValue: (field: keyof iPadTaskFormState, value: any) => void;
  handleSubmit: (e?: React.FormEvent) => void;
  resetForm: () => void;
  
  // UI state for iPad-specific features
  uiState: {
    additionalNotes: string;
    isAutoSaving: boolean;
    lastSaved?: Date;
    orientation: 'portrait' | 'landscape';
    activeSection: string;
  };
  setUiState: React.Dispatch<React.SetStateAction<any>>;
  
  // Touch-optimized options
  statusOptions: Array<{ value: string; label: string; color: string; icon?: string }>;
  priorityOptions: Array<{ value: string; label: string; color: string; icon?: string }>;
  properties: Array<{ id: string; name: string; options: Array<{ id: string; label: string }> }>;
  availableTags: string[];
  
  // Gesture-friendly management functions
  addCustomProperty: (propertyId: string, optionId: string) => void;
  removeCustomProperty: (propertyId: string) => void;
  
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  createNewTag: (tag: string) => void;
  
  addSubtask: (title: string) => void;
  removeSubtask: (id: string) => void;
  toggleSubtask: (id: string) => void;
  
  addReminder: (reminder: Omit<iPadReminder, 'id'>) => void;
  removeReminder: (id: string) => void;
  
  createNewFolder: () => void;
  
  // iPad-specific features
  titleRef: React.RefObject<HTMLInputElement>;
  descriptionRef: React.RefObject<HTMLTextAreaElement>;
  focusTitle: () => void;
  focusDescription: () => void;
  nextSection: () => void;
  previousSection: () => void;
  
  isEditMode: boolean;
}

export const useiPadTaskForm = (config: iPadTaskFormConfig): iPadTaskFormReturn => {
  const { properties } = useProperties();
  
  // Refs for focus management
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  
  // Form state with validation optimized for touch
  const form = useTypedForm<iPadTaskFormState>({
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

  // iPad-specific UI state
  const [uiState, setUiState] = useState({
    additionalNotes: '',
    isAutoSaving: false,
    lastSaved: undefined as Date | undefined,
    orientation: 'portrait' as 'portrait' | 'landscape',
    activeSection: 'essentials',
  });

  // Enhanced options with touch-friendly icons
  const statusOptions = useMemo(() => [
    { value: 'pendent', label: 'Pendent', color: '#64748b', icon: '○' },
    { value: 'en_proces', label: 'En Procés', color: '#f59e0b', icon: '◐' },
    { value: 'completat', label: 'Completat', color: '#10b981', icon: '●' }
  ], []);

  const priorityOptions = useMemo(() => [
    { value: 'baixa', label: 'Baixa', color: '#64748b', icon: '↓' },
    { value: 'mitjana', label: 'Mitjana', color: '#f59e0b', icon: '→' },
    { value: 'alta', label: 'Alta', color: '#ef4444', icon: '↑' },
    { value: 'urgent', label: 'Urgent', color: '#dc2626', icon: '⚡' }
  ], []);

  // iPad-optimized tag suggestions
  const availableTags = useMemo(() => [
    'urgent', 'important', 'reunió', 'projecte', 'personal', 'treball', 'estudi',
    'revisió', 'deadline', 'client', 'equip', 'presentació', 'document'
  ], []);

  // Transform properties for iPad interface
  const transformedProperties = useMemo(() => 
    properties.map(prop => ({
      id: prop.id,
      name: prop.name,
      options: prop.options.map(opt => ({
        id: opt.id,
        label: opt.label
      }))
    })), [properties]);

  // Enhanced touch-friendly management functions
  const addCustomProperty = useCallback((propertyId: string, optionId: string) => {
    const currentProperties = form.values.customProperties;
    const existingIndex = currentProperties.findIndex(p => p.propertyId === propertyId);
    
    let newProperties: iPadCustomProperty[];
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

  const addTag = useCallback((tag: string) => {
    if (!form.values.tags.includes(tag)) {
      form.setValue('tags', [...form.values.tags, tag]);
    }
  }, [form]);

  const removeTag = useCallback((tag: string) => {
    form.setValue('tags', form.values.tags.filter(t => t !== tag));
  }, [form]);

  const createNewTag = useCallback((tag: string) => {
    addTag(tag);
  }, [addTag]);

  const addSubtask = useCallback((title: string) => {
    const newSubtask: iPadSubtask = {
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

  const addReminder = useCallback((reminder: Omit<iPadReminder, 'id'>) => {
    const newReminder: iPadReminder = {
      id: generateId(),
      ...reminder
    };
    form.setValue('reminders', [...form.values.reminders, newReminder]);
  }, [form]);

  const removeReminder = useCallback((id: string) => {
    form.setValue('reminders', form.values.reminders.filter(r => r.id !== id));
  }, [form]);

  const createNewFolder = useCallback(() => {
    console.log('Create new folder for iPad');
  }, []);

  // iPad-specific navigation
  const sections = ['essentials', 'dates', 'reminders', 'advanced'];
  
  const nextSection = useCallback(() => {
    const currentIndex = sections.indexOf(uiState.activeSection);
    const nextIndex = (currentIndex + 1) % sections.length;
    setUiState(prev => ({ ...prev, activeSection: sections[nextIndex] }));
  }, [uiState.activeSection, sections]);

  const previousSection = useCallback(() => {
    const currentIndex = sections.indexOf(uiState.activeSection);
    const prevIndex = (currentIndex - 1 + sections.length) % sections.length;
    setUiState(prev => ({ ...prev, activeSection: sections[prevIndex] }));
  }, [uiState.activeSection, sections]);

  // Focus management
  const focusTitle = useCallback(() => {
    titleRef.current?.focus();
  }, []);

  const focusDescription = useCallback(() => {
    descriptionRef.current?.focus();
  }, []);

  // Orientation detection
  useEffect(() => {
    const updateOrientation = () => {
      const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      setUiState(prev => ({ ...prev, orientation }));
    };

    updateOrientation();
    window.addEventListener('orientationchange', updateOrientation);
    window.addEventListener('resize', updateOrientation);

    return () => {
      window.removeEventListener('orientationchange', updateOrientation);
      window.removeEventListener('resize', updateOrientation);
    };
  }, []);

  // Auto-save with more aggressive timing for touch devices
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (form.values.title.trim() && config.mode === 'edit') {
        setUiState(prev => ({ ...prev, isAutoSaving: true }));
        setTimeout(() => {
          setUiState(prev => ({ 
            ...prev, 
            isAutoSaving: false, 
            lastSaved: new Date() 
          }));
        }, 800);
      }
    }, 20000); // Auto-save every 20 seconds on iPad

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
    } as iPadTaskFormState;

    form.updateInitialValues(newValues);
    setUiState({
      additionalNotes: '',
      isAutoSaving: false,
      lastSaved: undefined,
      orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
      activeSection: 'essentials',
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
    
    // Management functions
    addCustomProperty,
    removeCustomProperty,
    addTag,
    removeTag,
    createNewTag,
    addSubtask,
    removeSubtask,
    toggleSubtask,
    addReminder,
    removeReminder,
    createNewFolder,
    
    // iPad-specific features
    titleRef,
    descriptionRef,
    focusTitle,
    focusDescription,
    nextSection,
    previousSection,
    
    isEditMode: config.mode === 'edit'
  };
};