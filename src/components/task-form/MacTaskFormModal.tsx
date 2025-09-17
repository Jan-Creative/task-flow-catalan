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
    // Time block fields
    time_block_id?: string;
    scheduled_start_time?: string;
    scheduled_end_time?: string;
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
    
    // Return to save (simple Return key)
    if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      if (macForm.isValid && !macForm.isSubmitting) {
        macForm.handleSubmit();
      }
    }
    
    // Cmd+Return to save (Mac convention - maintained for compatibility)
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
        className="max-w-4xl max-h-[90vh] overflow-hidden p-0 gap-0 bg-background/5 backdrop-blur-xl backdrop-saturate-150 backdrop-brightness-110 border border-white/5 rounded-2xl shadow-lg/10"
        overlayClassName="bg-transparent"
        onKeyDown={handleKeyDown}
      >
        {/* Mac-style Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="h-10 w-2 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {macForm.isEditMode ? 'Editar Tasca' : 'Nova Tasca'}
              </h2>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Configura tots els detalls de la teva tasca
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Mac shortcut hint */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
              <Command className="h-3.5 w-3.5 text-muted-foreground/70" />
              <span className="text-xs text-muted-foreground/70">Return per guardar</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-9 w-9 p-0 hover:bg-white/15 backdrop-blur-sm rounded-lg transition-all duration-200 border border-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mac Form Layout with Submit within Form */}
        <form onSubmit={macForm.handleSubmit} className="flex-1 overflow-hidden flex flex-col" autoComplete="off">
          <div className="flex-1 overflow-y-auto">
            <MacFormSections 
              form={macForm}
              folders={folders}
            />
          </div>

          {/* Mac-style Footer - Now inside form */}
          <div className="px-6 py-4 border-t border-white/5">
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
                <span>•</span>
                <span>Return per guardar</span>
              </div>
              
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={macForm.isSubmitting}
                  className="px-6 h-9 rounded-lg bg-white/10 border border-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
                >
                  Cancel·lar
                </Button>
                <Button
                  type="submit"
                  disabled={macForm.isSubmitting || !macForm.isValid}
                  className="px-6 h-9 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg hover:shadow-xl backdrop-blur-sm transition-all duration-200"
                >
                  {macForm.isSubmitting ? 'Guardant...' : (macForm.isEditMode ? 'Actualitzar Tasca' : 'Crear Tasca')}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MacTaskFormModal;