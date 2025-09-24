/**
 * iPhone Task Form Hook - Quick capture form logic optimized for iPhone workflow
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { TaskFormData, TaskStatus, TaskPriority } from '@/types/task';
import { useTypedForm, createRequiredValidator, createLengthValidator } from '../useTypedForm';
import { usePhoneDetection } from '../device/usePhoneDetection';

// Generate unique IDs for new items
const generateId = () => `iphone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export interface iPhoneCustomProperty {
  propertyId: string;
  optionId: string;
}

export interface iPhoneTaskFormState extends TaskFormData {
  customProperties: iPhoneCustomProperty[];
  isToday: boolean;
  [key: string]: unknown;
}

export interface iPhoneTaskFormConfig {
  initialData?: Partial<iPhoneTaskFormState>;
  onSubmit: (data: iPhoneTaskFormState) => void | Promise<void>;
  mode: 'create' | 'edit';
  folders: Array<{ id: string; name: string }>;
}

export interface iPhoneTaskFormReturn {
  // Form state and validation
  values: iPhoneTaskFormState;
  errors: Record<string, string>;
  isValid: boolean;
  isSubmitting: boolean;
  setValue: (field: keyof iPhoneTaskFormState, value: any) => void;
  handleSubmit: (e?: React.FormEvent) => void;
  resetForm: () => void;
  
  // iPhone-specific UI state
  uiState: {
    currentStep: 'title' | 'quickActions' | 'details';
    showQuickActions: boolean;
    showDetails: boolean;
    canSubmit: boolean;
    orientation: 'portrait' | 'landscape';
  };
  setUiState: React.Dispatch<React.SetStateAction<any>>;
  
  // Quick capture optimized options
  statusOptions: Array<{ value: string; label: string; color: string; emoji: string }>;
  priorityOptions: Array<{ value: string; label: string; color: string; emoji: string }>;
  quickSuggestions: string[];
  
  // Step navigation
  nextStep: () => void;
  previousStep: () => void;
  skipToStep: (step: 'title' | 'quickActions' | 'details') => void;
  
  // Quick actions
  toggleToday: () => void;
  setPriorityQuick: (priority: TaskPriority) => void;
  addQuickFolder: (folderId: string) => void;
  
  // Focus management for iPhone
  titleRef: React.RefObject<HTMLInputElement>;
  focusTitle: () => void;
  
  // Phone detection
  phoneInfo: ReturnType<typeof usePhoneDetection>;
  
  isEditMode: boolean;
}

export const useiPhoneTaskForm = (config: iPhoneTaskFormConfig): iPhoneTaskFormReturn => {
  const phoneInfo = usePhoneDetection();
  
  // Refs for focus management
  const titleRef = useRef<HTMLInputElement>(null);
  
  // Form state with minimal validation for quick capture
  const form = useTypedForm<iPhoneTaskFormState>({
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
        createLengthValidator(1, 100, 'Títol') // Shorter for quick capture
      ]
    },
    onSubmit: config.onSubmit
  });

  // iPhone-specific UI state for step-by-step flow
  const [uiState, setUiState] = useState({
    currentStep: 'title' as 'title' | 'quickActions' | 'details',
    showQuickActions: false,
    showDetails: false,
    canSubmit: false,
    orientation: phoneInfo.orientation,
  });

  // Quick capture optimized options with emojis
  const statusOptions = useMemo(() => [
    { value: 'pendent', label: 'Pendent', color: '#64748b', emoji: '⏳' },
    { value: 'en_proces', label: 'En Procés', color: '#f59e0b', emoji: '🔄' },
    { value: 'completat', label: 'Completat', color: '#10b981', emoji: '✅' }
  ], []);

  const priorityOptions = useMemo(() => [
    { value: 'baixa', label: 'Baixa', color: '#64748b', emoji: '🔵' },
    { value: 'mitjana', label: 'Mitjana', color: '#f59e0b', emoji: '🟡' },
    { value: 'alta', label: 'Alta', color: '#ef4444', emoji: '🔴' },
    { value: 'urgent', label: 'Urgent', color: '#dc2626', emoji: '🚨' }
  ], []);

  // Quick suggestions for common tasks
  const quickSuggestions = useMemo(() => [
    'Trucar a...', 'Comprar...', 'Enviar email...', 'Revisar...', 
    'Preparar...', 'Reunió amb...', 'Estudiar...', 'Organitzar...'
  ], []);

  // Step navigation functions
  const nextStep = useCallback(() => {
    setUiState(prev => {
      if (prev.currentStep === 'title' && form.values.title.trim()) {
        return { ...prev, currentStep: 'quickActions', showQuickActions: true };
      }
      if (prev.currentStep === 'quickActions') {
        return { ...prev, currentStep: 'details', showDetails: true };
      }
      return prev;
    });
  }, [form.values.title]);

  const previousStep = useCallback(() => {
    setUiState(prev => {
      if (prev.currentStep === 'details') {
        return { ...prev, currentStep: 'quickActions', showDetails: false };
      }
      if (prev.currentStep === 'quickActions') {
        return { ...prev, currentStep: 'title', showQuickActions: false };
      }
      return prev;
    });
  }, []);

  const skipToStep = useCallback((step: 'title' | 'quickActions' | 'details') => {
    setUiState(prev => ({
      ...prev,
      currentStep: step,
      showQuickActions: step !== 'title',
      showDetails: step === 'details'
    }));
  }, []);

  // Quick action functions
  const toggleToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    form.setValue('due_date', form.values.isToday ? '' : today);
    form.setValue('isToday', !form.values.isToday);
  }, [form]);

  const setPriorityQuick = useCallback((priority: TaskPriority) => {
    form.setValue('priority', priority);
  }, [form]);

  const addQuickFolder = useCallback((folderId: string) => {
    form.setValue('folder_id', folderId);
  }, [form]);

  // Focus management
  const focusTitle = useCallback(() => {
    titleRef.current?.focus();
  }, []);

  // Update orientation on device change
  useEffect(() => {
    setUiState(prev => ({ ...prev, orientation: phoneInfo.orientation }));
  }, [phoneInfo.orientation]);

  // Update submit capability based on form state
  useEffect(() => {
    const canSubmit = form.values.title.trim().length > 0 && form.isValid;
    setUiState(prev => ({ ...prev, canSubmit }));
  }, [form.values.title, form.isValid]);

  // Auto-focus title on mount
  useEffect(() => {
    if (config.mode === 'create') {
      setTimeout(() => focusTitle(), 100);
    }
  }, [config.mode, focusTitle]);

  // Reset form functionality
  const resetForm = useCallback(() => {
    const newValues = {
      title: config.initialData?.title || '',
      description: config.initialData?.description || '',
      status: (config.initialData?.status as TaskStatus) || 'pendent',
      priority: (config.initialData?.priority as TaskPriority) || 'mitjana',
      folder_id: config.initialData?.folder_id || '',
      due_date: config.initialData?.due_date || '',
      customProperties: config.initialData?.customProperties || [],
      isToday: config.initialData?.isToday || false,
    } as iPhoneTaskFormState;

    form.updateInitialValues(newValues);
    setUiState({
      currentStep: 'title',
      showQuickActions: false,
      showDetails: false,
      canSubmit: false,
      orientation: phoneInfo.orientation,
    });
  }, [config.initialData, form.updateInitialValues, phoneInfo.orientation]);

  return {
    // Form state and validation
    ...form,
    
    // UI state
    uiState,
    setUiState,
    
    // Options
    statusOptions,
    priorityOptions,
    quickSuggestions,
    
    // Navigation
    nextStep,
    previousStep,
    skipToStep,
    
    // Quick actions
    toggleToday,
    setPriorityQuick,
    addQuickFolder,
    
    // Focus management
    titleRef,
    focusTitle,
    
    // Device info
    phoneInfo,
    
    isEditMode: config.mode === 'edit'
  };
};