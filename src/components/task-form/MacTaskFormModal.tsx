/**
 * Mac Task Form Modal - Comprehensive task creation/editing optimized for Mac
 */

import React, { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Command } from "lucide-react";
import { useMacTaskForm } from "@/hooks/tasks/useMacTaskForm";
import { useStableCallback } from "@/hooks/useOptimizedPerformance";
import { useKeyboardShortcuts } from "@/contexts/KeyboardShortcutsContext";
import { MacFormSections } from "./MacFormSections";
import type { Tasca, TaskStatus, TaskPriority } from "@/types";

interface MacTaskFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (task: {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date?: string;
    start_date?: string;
    folder_id?: string;
    estimated_time?: number;
  }, customProperties?: Array<{
    propertyId: string;
    optionId: string;
  }>) => void;
  folders: Array<{ id: string; name: string; }>;
  editingTask?: Tasca | null;
}

const MacTaskFormModal = ({ open, onClose, onSubmit, folders, editingTask }: MacTaskFormModalProps) => {
  const { setEnabled } = useKeyboardShortcuts();
  
  // Use the Mac-optimized form hook
  const macForm = useMacTaskForm({
    initialData: editingTask ? {
      title: editingTask.title,
      description: editingTask.description || '',
      status: editingTask.status,
      priority: editingTask.priority,
      folder_id: editingTask.folder_id || '',
      due_date: editingTask.due_date || '',
      start_date: '',
      estimated_time: 0,
      customProperties: [],
      tags: [],
      subtasks: [],
      reminders: []
    } : undefined,
    onSubmit: async (data) => {
      const { customProperties, tags, subtasks, reminders, ...taskData } = data;
      try {
        await onSubmit(taskData, customProperties);
        handleClose();
      } catch (error) {
        console.error('[MacTaskFormModal] Submit failed:', error);
      }
    },
    mode: editingTask ? 'edit' : 'create',
    folders
  });

  // Stable callbacks
  const handleClose = useStableCallback(() => {
    macForm.resetForm();
    onClose();
  });

  // Mac-specific keyboard shortcuts
  const handleKeyDown = useStableCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
    
    // Cmd+Return to save (Mac convention)
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (macForm.isValid && !macForm.isSubmitting) {
        macForm.handleSubmit();
      }
    }
    
    // Cmd+D to focus description
    if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
      e.preventDefault();
      macForm.focusDescription();
    }
    
    // Cmd+T to focus title
    if ((e.metaKey || e.ctrlKey) && e.key === 't') {
      e.preventDefault();
      macForm.focusTitle();
    }
  });

  // Disable global shortcuts while modal is open
  useEffect(() => {
    if (open) {
      setEnabled(false);
      console.debug('[MacTaskFormModal] opened', { editingTask });
    } else {
      setEnabled(true);
    }
    return () => setEnabled(true);
  }, [open, setEnabled, editingTask]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent 
        className="max-w-7xl max-h-[90vh] overflow-hidden p-0 gap-0 bg-background/20 backdrop-blur-xl border border-border/10 shadow-2xl"
        onKeyDown={handleKeyDown}
      >
        {/* Mac-style Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border/10 bg-gradient-to-r from-background/20 to-background/5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="h-10 w-2 bg-gradient-to-b from-primary to-primary/60 rounded-full shadow-sm"></div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {macForm.isEditMode ? 'Editar Tasca' : 'Nova Tasca'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Configura tots els detalls de la teva tasca
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Mac shortcut hint */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border">
              <Command className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Return per guardar</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-9 w-9 p-0 hover:bg-muted/60 rounded-lg transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mac 3-Column Form Layout */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={macForm.handleSubmit} className="h-full" autoComplete="off">
            <MacFormSections 
              form={macForm}
              folders={folders}
            />
          </form>
        </div>

        {/* Mac-style Footer */}
        <div className="px-8 py-6 border-t border-border/10 bg-gradient-to-r from-background/20 to-background/5 backdrop-blur-md">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
            </div>
            
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={macForm.isSubmitting}
                className="px-8 h-11 rounded-lg border-border/20 hover:bg-card/60 backdrop-blur-sm"
              >
                Cancel·lar
              </Button>
              <Button
                type="submit"
                disabled={macForm.isSubmitting || !macForm.isValid}
                className="px-8 h-11 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {macForm.isSubmitting ? 'Guardant...' : (macForm.isEditMode ? 'Actualitzar Tasca' : 'Crear Tasca')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MacTaskFormModal;