/**
 * KeyboardAdaptiveForm - Liquid Glass iOS 26 Design
 * Formulari minimalista amb efectes glass i swipe lateral
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStableKeyboardHeight } from '@/hooks/device/useStableKeyboardHeight';
// FASE 10A: Comentat temporalment mentre investigem providers
// import { useKeyboardNavigation } from '@/contexts/KeyboardNavigationContext';
import { useFormPanelSwipe } from '@/hooks/useFormPanelSwipe';
import { useTasksCore } from '@/hooks/tasks/useTasksCore';
import { useDadesApp } from '@/hooks/useDadesApp';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Calendar, Folder, Flag, Clock, Send, Star, Target, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SmoothPriorityBadge } from '@/components/ui/smooth-priority-badge';
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';
import { logger } from '@/lib/logger';

interface TaskFormOptions {
  isToday?: boolean;
  priority?: 'baixa' | 'mitjana' | 'alta' | 'urgent';
  folder_id?: string;
  due_date?: string;
}

interface KeyboardAdaptiveFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (title: string, options?: TaskFormOptions) => void;
}

export const KeyboardAdaptiveForm: React.FC<KeyboardAdaptiveFormProps> = ({
  open,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [formOptions, setFormOptions] = useState<TaskFormOptions>({
    isToday: false,
    priority: 'mitjana',
    folder_id: '',
      due_date: ''
    });
    const [userPickedDueDate, setUserPickedDueDate] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Backend connections
  const { crearTasca: handleCreateTask } = useTasksCore();
  const { data: dadesOptimitzades, folders } = useDadesApp();
  const { height: keyboardHeight, isVisible: keyboardVisible, isStable } = useStableKeyboardHeight();
  // FASE 10A: Comentat temporalment - funció temporal no-op
  // const { setFormOpen } = useKeyboardNavigation();
  const setFormOpen = useCallback((_open: boolean) => {
    // Temporal: no-op function
  }, []);
  
  // Form panel swipe navigation
  const { currentPanel, setCurrentPanel, isDragging, dragOffset, touchHandlers } = useFormPanelSwipe({
    threshold: 80,
    maxDistance: 250,
  });
  
  // Posicionament dinàmic basat en l'altura del teclat
  const bottomOffset = keyboardVisible ? keyboardHeight + 20 : 40;
  
  // Auto-focus i coordinació amb navigation
  useEffect(() => {
    if (open) {
      setFormOpen(true);
      if (inputRef.current) {
        const timer = setTimeout(() => {
          inputRef.current?.focus();
          if ('vibrate' in navigator) {
            navigator.vibrate(10);
          }
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [open, setFormOpen]);

  // Reset form i coordinació amb navigation
  useEffect(() => {
    if (!open) {
      // Notificar que el formulari es tanca
      setFormOpen(false);
      
      // Reset form state
      setTitle('');
      setCurrentPanel('center');
      setIsSubmitting(false);
      setSubmitStatus('idle');
      setSelectedFolderId('');
      setFormOptions({
        isToday: false,
        priority: 'mitjana',
        folder_id: '',
        due_date: ''
      });
      setUserPickedDueDate(false);
    }
  }, [open, setCurrentPanel, setFormOpen]);

  // Set default folder (inbox) when data loads
  useEffect(() => {
    if (folders && !selectedFolderId) {
      const inboxFolder = folders.find(f => f.is_system && f.name === "Bustia");
      if (inboxFolder) {
        setSelectedFolderId(inboxFolder.id);
        setFormOptions(prev => ({ ...prev, folder_id: inboxFolder.id }));
      }
    }
  }, [folders, selectedFolderId]);


  // Quick action functions
  const toggleToday = useCallback(() => {
    setFormOptions(prev => ({
      ...prev,
      isToday: !prev.isToday
    }));
    // Do NOT mark a due_date here; keep date independent
    // If a date was previously picked, keep userPickedDueDate as is
  }, []);

  const setPriority = useCallback((priority: TaskFormOptions['priority']) => {
    setFormOptions(prev => ({ ...prev, priority }));
  }, []);

  const setQuickDate = useCallback((type: 'today' | 'tomorrow' | 'thisWeek' | null) => {
    const date = new Date();
    let targetDate = '';
    let isToday = false;

    if (type === 'today') {
      // When user explicitly picks "today" as due date, it's different from "isToday" toggle
      isToday = false; // Don't auto-set isToday when picking date today
      targetDate = date.toISOString().split('T')[0];
      setUserPickedDueDate(true); // Mark that user explicitly picked this date
    } else if (type === 'tomorrow') {
      date.setDate(date.getDate() + 1);
      targetDate = date.toISOString().split('T')[0];
      setUserPickedDueDate(true);
    } else if (type === 'thisWeek') {
      date.setDate(date.getDate() + 7);
      targetDate = date.toISOString().split('T')[0];
      setUserPickedDueDate(true);
    }

    setFormOptions(prev => ({ 
      ...prev, 
      due_date: targetDate,
      isToday: isToday
    }));
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Prepare task data for backend
      const taskData = {
        title: title.trim(),
        status: 'pendent',
        priority: formOptions.priority || 'mitjana',
        folder_id: selectedFolderId || formOptions.folder_id,
        // Only persist due_date if the user explicitly picked a date
        due_date: userPickedDueDate && formOptions.due_date ? formOptions.due_date : undefined,
        isToday: formOptions.isToday
      };

      logger.debug('KeyboardAdaptiveForm', 'Creating task with data', taskData);

      // Create task using backend hook
      await handleCreateTask(taskData);
      
      setSubmitStatus('success');
      
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 50]);
      }

      // Close form after short delay to show success
      setTimeout(() => {
        setFormOpen(false); // Coordinated close
        onClose();
      }, 500);

    } catch (error) {
      logger.error('KeyboardAdaptiveForm', 'Error creating task', error);
      setSubmitStatus('error');
      
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [title, formOptions, selectedFolderId, isSubmitting, handleCreateTask, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && title.trim()) {
      handleSubmit(e);
    }
  };

  if (!open) return null;

  // Calculate transform for panel sliding with drag offset
  const getTransformX = () => {
    // ARREGLAT: Transformació correcta per mostrar panell central per defecte
    const baseTransform = (() => {
      switch (currentPanel) {
        case 'left': return 0;        // Mostra panell prioritat (panell 1)
        case 'center': return -33.33; // Mostra panell tasca (panell 2) - DEFECTE
        case 'right': return -66.67;  // Mostra panell dates (panell 3)
        default: return -33.33;       // Per defecte center
      }
    })();
    
    // Add drag offset if dragging (suau interacció visual)
    const dragPercentage = isDragging ? (dragOffset / window.innerWidth) * 33.33 : 0;
    return `${baseTransform + dragPercentage}%`;
  };

  return (
    <>
      {/* Simple Dark Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Main Form Container */}
      <div 
        className="fixed left-4 right-4 z-50 transition-all duration-300 ease-out max-w-md mx-auto"
        style={{ 
          bottom: `${bottomOffset}px`,
          transform: open ? 'translateY(0) scale(1)' : 'translateY(100%) scale(0.95)',
        }}
        {...touchHandlers}
      >
        {/* Solid Card Container */}
        <div 
          className="bg-card border border-border rounded-xl shadow-lg overflow-hidden"
        >
          {/* Panel Indicators */}
          <div className="flex justify-center items-center gap-2 p-3 bg-muted/30 border-b border-border">
            {['left', 'center', 'right'].map((panel) => (
              <div
                key={panel}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  currentPanel === panel
                    ? 'bg-primary scale-125'
                    : 'bg-muted-foreground/30 scale-100'
                )}
              />
            ))}
            <div className="text-xs text-muted-foreground ml-2">
              {currentPanel === 'left' && '← Prioritat'}
              {currentPanel === 'center' && 'Tasca'}
              {currentPanel === 'right' && 'Dates →'}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-10 p-2 rounded-full bg-background/80 border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
          
          {/* Sliding Panels Container */}
          <div className="relative w-full overflow-hidden min-h-[200px]">
            <div 
              className="flex ease-out"
              style={{
                transform: `translateX(${getTransformX()})`,
                width: '300%',
                transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {/* LEFT PANEL - Prioritat (primer panell) */}
              <div className="w-1/3 flex-shrink-0 px-4 py-6">
                <div className="space-y-4">
                  {/* Priority Selector */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground text-center">Prioritat</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'baixa', label: 'Baixa', icon: Sparkles },
                        { value: 'mitjana', label: 'Mitjana', icon: Clock },
                        { value: 'alta', label: 'Alta', icon: Target },
                        { value: 'urgent', label: 'Urgent', icon: Flag }
                      ].map((priority) => {
                        const IconComponent = priority.icon;
                        const isSelected = formOptions.priority === priority.value;
                        return (
                          <Button
                            key={priority.value}
                            variant="outline"
                            size="sm"
                            onClick={() => setPriority(priority.value as TaskFormOptions['priority'])}
                            className={cn(
                              "h-10 text-xs transition-all duration-200",
                              isSelected 
                                ? 'bg-primary text-primary-foreground border-primary' 
                                : 'bg-background text-foreground border-border hover:bg-muted'
                            )}
                          >
                            <IconComponent className="h-3 w-3 mr-1" />
                            {priority.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Folder Selector */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground text-center">Carpeta</p>
                    <div className="space-y-2">
                      {folders.slice(0, 3).map((folder) => {
                        const isSelected = selectedFolderId === folder.id;
                        return (
                          <Button
                            key={folder.id}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedFolderId(folder.id);
                              setFormOptions(prev => ({ ...prev, folder_id: folder.id }));
                            }}
                            className={cn(
                              "w-full h-8 text-xs transition-all duration-200 justify-start",
                              isSelected 
                                ? 'bg-primary text-primary-foreground border-primary' 
                                : 'bg-background text-foreground border-border hover:bg-muted'
                            )}
                          >
                            <Folder className="h-3 w-3 mr-2" style={{ color: folder.color }} />
                            {folder.name}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Panel - Main Input */}
              <div className="w-1/3 flex-shrink-0 px-4 py-6">
                <div className="space-y-4">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Escriu la tasca..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="text-base font-medium bg-background border border-border focus:border-ring text-foreground placeholder:text-muted-foreground transition-all duration-200 rounded-lg h-12 px-4"
                    autoFocus
                  />

                  {/* Current configuration preview */}
                  {(formOptions.isToday || formOptions.priority !== 'mitjana' || formOptions.due_date) && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {formOptions.isToday && (
                        <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-md text-xs font-medium">
                          <Star className="h-3 w-3 mr-1 inline" />
                          Avui
                        </div>
                      )}
                      {formOptions.priority !== 'mitjana' && (
                        <div className="px-2 py-1 bg-primary/10 border border-primary/20 text-primary rounded-md text-xs font-medium">
                          {formOptions.priority?.charAt(0).toUpperCase() + formOptions.priority?.slice(1)}
                        </div>
                      )}
                      {formOptions.due_date && !formOptions.isToday && (
                        <div className="px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-600 rounded-md text-xs font-medium">
                          <Calendar className="h-3 w-3 mr-1 inline" />
                          {format(new Date(formOptions.due_date), 'd MMM', { locale: ca })}
                        </div>
                      )}
                      {selectedFolderId && folders && (
                        <div className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-600 rounded-md text-xs font-medium">
                          <Folder className="h-3 w-3 mr-1 inline" />
                          {folders.find(f => f.id === selectedFolderId)?.name}
                        </div>
                      )}
                    </div>
                  )}

                  <Button 
                    onClick={handleSubmit} 
                    className={cn(
                      "w-full h-10 font-medium transition-all duration-200 rounded-lg",
                      submitStatus === 'success' 
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : submitStatus === 'error'
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    )}
                    disabled={!title.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creant...
                      </>
                    ) : submitStatus === 'success' ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Creat!
                      </>
                    ) : submitStatus === 'error' ? (
                      <>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Error - Reintenta
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Crear Tasca
                      </>
                    )}
                  </Button>

                  {/* Navigation hints */}
                  <div className="flex justify-between text-xs text-muted-foreground pt-1">
                    <span className="flex items-center">
                      <span className="inline-block mr-1">←</span> 
                      Prioritat
                    </span>
                    <span className="flex items-center">
                      Dates 
                      <span className="inline-block ml-1">→</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Panel - Quick Dates & Today */}
              <div className="w-1/3 flex-shrink-0 px-4 py-6">
                <div className="space-y-4">
                  {/* Today Toggle */}
                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={toggleToday}
                      className={cn(
                        "w-full h-12 text-sm font-medium transition-all duration-200",
                        formOptions.isToday 
                          ? 'bg-blue-500/10 border-blue-500/20 text-blue-600' 
                          : 'bg-background text-foreground border-border hover:bg-muted'
                      )}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      {formOptions.isToday ? "És per avui" : "Avui"}
                    </Button>
                  </div>
                  
                  {/* Quick Date Buttons */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground text-center">Dates ràpides</p>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { label: 'Demà', days: 1 },
                        { label: '3 dies', days: 3 },
                        { label: '1 setmana', days: 7 }
                      ].map((item) => (
                        <Button
                          key={item.label}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const date = new Date();
                            date.setDate(date.getDate() + item.days);
                            setFormOptions(prev => ({ 
                              ...prev, 
                              due_date: date.toISOString().split('T')[0],
                              isToday: false
                            }));
                            setUserPickedDueDate(true);
                          }}
                          className="h-9 justify-start bg-background text-foreground border-border hover:bg-muted"
                        >
                          <Calendar className="h-3 w-3 mr-2" />
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};