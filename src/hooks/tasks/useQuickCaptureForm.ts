/**
 * Quick Capture Form Hook - Simplified iPhone task capture
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { TaskFormData, TaskStatus, TaskPriority } from '@/types/task';
import { useTypedForm, createRequiredValidator, createLengthValidator } from '../useTypedForm';
import { usePhoneDetection } from '../device/usePhoneDetection';

export interface QuickCaptureFormState extends TaskFormData {
  isToday: boolean;
  [key: string]: unknown;
}

export interface QuickCaptureFormConfig {
  initialData?: Partial<QuickCaptureFormState>;
  onSubmit: (data: QuickCaptureFormState) => void | Promise<void>;
  mode: 'create' | 'edit';
  folders: Array<{ id: string; name: string }>;
}

export interface QuickCaptureFormReturn {
  // Form state and validation
  values: QuickCaptureFormState;
  errors: Record<string, string>;
  isValid: boolean;
  isSubmitting: boolean;
  setValue: (field: keyof QuickCaptureFormState, value: any) => void;
  handleSubmit: (e?: React.FormEvent) => void;
  resetForm: () => void;
  
  // UI state
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  canQuickSubmit: boolean;
  
  // Quick capture optimized options
  statusOptions: Array<{ value: string; label: string; color: string; emoji: string }>;
  priorityOptions: Array<{ value: string; label: string; color: string; emoji: string }>;
  quickSuggestions: string[];
  
  // Quick actions
  toggleToday: () => void;
  setPriorityQuick: (priority: TaskPriority) => void;
  addQuickFolder: (folderId: string) => void;
  quickSubmit: () => void;
  
  // Focus management
  titleRef: React.RefObject<HTMLInputElement>;
  focusTitle: () => void;
  
  // Phone detection
  phoneInfo: ReturnType<typeof usePhoneDetection>;
  
  isEditMode: boolean;
}

export const useQuickCaptureForm = (config: QuickCaptureFormConfig): QuickCaptureFormReturn => {
  const phoneInfo = usePhoneDetection();
  
  // Refs for focus management
  const titleRef = useRef<HTMLInputElement>(null);
  
  // UI state for expanded/collapsed view
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Form state with minimal validation for quick capture
  const form = useTypedForm<QuickCaptureFormState>({
    initialValues: {
      title: config.initialData?.title || '',
      description: config.initialData?.description || '',
      status: config.initialData?.status || 'pendent' as TaskStatus,
      priority: config.initialData?.priority || 'mitjana' as TaskPriority,
      folder_id: config.initialData?.folder_id || '',
      due_date: config.initialData?.due_date || '',
      isToday: config.initialData?.isToday || false,
    },
    validators: {
      title: [
        createRequiredValidator('Títol'),
        createLengthValidator(1, 100, 'Títol')
      ]
    },
    onSubmit: config.onSubmit
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

  // Check if quick submit is possible
  const canQuickSubmit = useMemo(() => {
    return form.values.title.trim().length > 0 && form.isValid;
  }, [form.values.title, form.isValid]);

  // Quick action functions
  const toggleToday = useCallback(() => {
    // Only toggle isToday without affecting due_date to maintain consistency with Mac/iPad
    form.setValue('isToday', !form.values.isToday);
  }, [form]);

  const setPriorityQuick = useCallback((priority: TaskPriority) => {
    form.setValue('priority', priority);
  }, [form]);

  const addQuickFolder = useCallback((folderId: string) => {
    form.setValue('folder_id', folderId);
  }, [form]);

  // Quick submit without expansion
  const quickSubmit = useCallback(() => {
    if (canQuickSubmit) {
      form.handleSubmit();
    }
  }, [canQuickSubmit, form]);

  // Focus management
  const focusTitle = useCallback(() => {
    titleRef.current?.focus();
  }, []);

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
      isToday: config.initialData?.isToday || false,
    } as QuickCaptureFormState;

    form.updateInitialValues(newValues);
    setIsExpanded(false);
  }, [config.initialData, form.updateInitialValues]);

  return {
    // Form state and validation
    ...form,
    
    // UI state
    isExpanded,
    setIsExpanded,
    canQuickSubmit,
    
    // Options
    statusOptions,
    priorityOptions,
    quickSuggestions,
    
    // Quick actions
    toggleToday,
    setPriorityQuick,
    addQuickFolder,
    quickSubmit,
    
    // Focus management
    titleRef,
    focusTitle,
    
    // Device info
    phoneInfo,
    
    isEditMode: config.mode === 'edit'
  };
};