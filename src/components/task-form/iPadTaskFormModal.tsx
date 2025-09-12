/**
 * iPad Task Form Modal - Touch-optimized modal with modern aesthetic
 */

import React, { useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Command, Save, Sparkles } from 'lucide-react';
import { IPadFormSections } from './iPadFormSections';
import { useiPadTaskForm, type iPadTaskFormReturn } from '@/hooks/tasks/useiPadTaskForm';
import { useStableCallback } from '@/hooks/performance';
import { useKeyboardShortcuts } from '@/contexts/KeyboardShortcutsContext';
import type { Tasca } from '@/types';

interface iPadTaskFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (task: {
    title: string;
    description?: string;
    status: string;
    priority: string;
    due_date?: string;
    folder_id?: string;
  }, customProperties?: Array<{
    propertyId: string;
    optionId: string;
  }>) => void;
  folders: Array<{ id: string; name: string }>;
  editingTask?: Tasca | null;
}

export const iPadTaskFormModal: React.FC<iPadTaskFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  folders,
  editingTask = null
}) => {
  const { setEnabled } = useKeyboardShortcuts();

  // Initialize iPad form with editing data
  const iPadForm = useiPadTaskForm({
    initialData: editingTask ? {
      title: editingTask.title || '',
      description: editingTask.description || '',
      status: editingTask.status || 'pendent',
      priority: editingTask.priority || 'mitjana',
      folder_id: editingTask.folder_id || '',
      due_date: editingTask.due_date || '',
      start_date: '',
      estimated_time: 0,
      customProperties: [],
      tags: [],
      subtasks: [],
      reminders: [],
    } : {},
    onSubmit: async (data) => {
      const { customProperties, ...taskData } = data;
      try {
        onSubmit(taskData, customProperties);
        handleClose();
      } catch (error) {
        console.error('[iPadTaskFormModal] Submit failed:', error);
      }
    },
    mode: editingTask ? 'edit' : 'create',
    folders
  });

  // Handle modal close with form reset
  const handleClose = useStableCallback(() => {
    iPadForm.resetForm();
    onClose();
  });

  // iPad-specific keyboard shortcuts and gestures
  const handleKeyDown = useStableCallback((e: KeyboardEvent) => {
    // Escape to close
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
    
    // Return to save (for external keyboards)
    if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      if (iPadForm.isValid && !iPadForm.isSubmitting) {
        iPadForm.handleSubmit();
      }
    }
    
    // Cmd+Return for power users with external keyboard
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (iPadForm.isValid && !iPadForm.isSubmitting) {
        iPadForm.handleSubmit();
      }
    }
    
    // Cmd+D to focus description (iPad with keyboard)
    if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
      e.preventDefault();
      iPadForm.focusDescription();
    }
    
    // Cmd+T to focus title (iPad with keyboard)
    if ((e.metaKey || e.ctrlKey) && e.key === 't') {
      e.preventDefault();
      iPadForm.focusTitle();
    }

    // Arrow keys for section navigation
    if (e.key === 'ArrowLeft' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      iPadForm.previousSection();
    }
    
    if (e.key === 'ArrowRight' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      iPadForm.nextSection();
    }
  });

  // Handle global shortcuts management
  useEffect(() => {
    if (open) {
      setEnabled(false);
      document.addEventListener('keydown', handleKeyDown);
    } else {
      setEnabled(true);
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleKeyDown, setEnabled]);

  // Auto-save indicator
  const AutoSaveIndicator = () => {
    if (!iPadForm.uiState.isAutoSaving && !iPadForm.uiState.lastSaved) return null;
    
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {iPadForm.uiState.isAutoSaving ? (
          <>
            <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse" />
            <span>Guardant...</span>
          </>
        ) : (
          <>
            <div className="h-2 w-2 bg-green-500 rounded-full" />
            <span>Guardat {iPadForm.uiState.lastSaved?.toLocaleTimeString()}</span>
          </>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-4xl h-[85vh] p-0 gap-0 bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* iPad-style Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-background/20 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {iPadForm.isEditMode ? 'Editar Tasca' : 'Nova Tasca'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {iPadForm.isEditMode ? 'Modifica els detalls de la tasca' : 'Crea una nova tasca amb tots els detalls'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <AutoSaveIndicator />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-10 w-10 rounded-xl hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* iPad Form Layout */}
        <form onSubmit={iPadForm.handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <IPadFormSections
              form={iPadForm}
              folders={folders}
            />
          </div>

          {/* iPad-style Footer with Touch-Friendly Buttons */}
          <div className="px-6 py-6 border-t border-white/5 bg-background/20 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              {/* Keyboard Shortcuts (shown when external keyboard detected) */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="hidden sm:flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Command className="h-3 w-3" />
                    <span>T</span>
                  </div>
                  <span>Títol</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Command className="h-3 w-3" />
                    <span>D</span>
                  </div>
                  <span>Descripció</span>
                  <span>•</span>
                  <span>Return per guardar</span>
                </div>
                <div className="sm:hidden">
                  <span>Toca per navegar entre seccions</span>
                </div>
              </div>
              
              {/* Action Buttons - Touch Optimized */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={iPadForm.isSubmitting}
                  className="h-12 px-8 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 text-base font-medium touch-manipulation"
                >
                  Cancel·lar
                </Button>
                <Button
                  type="submit"
                  disabled={iPadForm.isSubmitting || !iPadForm.isValid}
                  className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl backdrop-blur-sm transition-all duration-300 text-base touch-manipulation"
                >
                  <div className="flex items-center gap-3">
                    <Save className="h-5 w-5" />
                    {iPadForm.isSubmitting ? 'Guardant...' : (iPadForm.isEditMode ? 'Actualitzar Tasca' : 'Crear Tasca')}
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};