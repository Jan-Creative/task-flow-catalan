/**
 * Simplified CreateTaskModal using new optimized hooks and components
 */

import React, { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { useTaskForm } from "@/hooks/useTaskForm";
import { useStableCallback } from "@/hooks/useOptimizedPerformance";
import {
  TaskStatusSelector,
  TaskPrioritySelector,
  TaskDatePicker,
  CustomPropertiesDisplay,
  DescriptionToggle
} from "@/components/task-form/TaskFormComponents";
import type { Tasca, TaskStatus, TaskPriority } from "@/types";

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (task: {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date?: string;
    folder_id?: string;
  }, customProperties?: Array<{
    propertyId: string;
    optionId: string;
  }>) => void;
  folders: Array<{ id: string; name: string; }>;
  editingTask?: Tasca | null;
}

const CreateTaskModal = ({ open, onClose, onSubmit, folders, editingTask }: CreateTaskModalProps) => {
  // Use the optimized task form hook
  const taskForm = useTaskForm({
    initialData: editingTask ? {
      title: editingTask.title,
      description: editingTask.description || '',
      status: editingTask.status,
      priority: editingTask.priority,
      folder_id: editingTask.folder_id || '',
      due_date: editingTask.due_date || '',
      customProperties: []
    } : undefined,
    onSubmit: async (data) => {
      const { customProperties, ...taskData } = data;
      onSubmit(taskData, customProperties);
      handleClose();
    },
    mode: editingTask ? 'edit' : 'create'
  });

  // Stable callbacks to prevent re-renders
  const handleClose = useStableCallback(() => {
    taskForm.resetForm();
    onClose();
  });

  const handleKeyDown = useStableCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      taskForm.resetForm();
    }
  }, [open, taskForm]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-lg font-semibold">
            {taskForm.isEditMode ? 'Editar Tasca' : 'Nova Tasca'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={taskForm.handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Títol *</label>
            <Input
              placeholder="Escriu el títol de la tasca..."
              value={taskForm.values.title}
              onChange={(e) => taskForm.setValue('title', e.target.value)}
              disabled={taskForm.isSubmitting}
              className={taskForm.errors.title ? 'border-destructive' : ''}
            />
            {taskForm.errors.title && (
              <p className="text-sm text-destructive">{taskForm.errors.title}</p>
            )}
          </div>

          {/* Description Toggle */}
          <div className="flex gap-2">
            <DescriptionToggle
              isOpen={taskForm.uiState.isDescriptionOpen}
              onToggle={taskForm.toggleDescription}
              disabled={taskForm.isSubmitting}
            />
          </div>

          {/* Description */}
          {taskForm.uiState.isDescriptionOpen && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripció</label>
              <Textarea
                placeholder="Afegeix una descripció opcional..."
                value={taskForm.values.description}
                onChange={(e) => taskForm.setValue('description', e.target.value)}
                className="min-h-[100px]"
                disabled={taskForm.isSubmitting}
              />
              {taskForm.errors.description && (
                <p className="text-sm text-destructive">{taskForm.errors.description}</p>
              )}
            </div>
          )}

          {/* Status Selector */}
          <TaskStatusSelector
            value={taskForm.values.status}
            options={taskForm.statusOptions}
            onChange={(value) => taskForm.setValue('status', value as TaskStatus)}
            disabled={taskForm.isSubmitting}
          />

          {/* Priority Selector */}
          <TaskPrioritySelector
            value={taskForm.values.priority}
            options={taskForm.priorityOptions}
            onChange={(value) => taskForm.setValue('priority', value as TaskPriority)}
            disabled={taskForm.isSubmitting}
          />

          {/* Date Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Data límit</label>
            <TaskDatePicker
              value={taskForm.values.due_date}
              onChange={(date) => taskForm.setValue('due_date', date)}
              isOpen={taskForm.uiState.isDatePickerOpen}
              onOpenChange={taskForm.toggleDatePicker}
              disabled={taskForm.isSubmitting}
            />
          </div>

          {/* Custom Properties */}
          {taskForm.hasCustomProperties && (
            <CustomPropertiesDisplay
              properties={taskForm.values.customProperties}
              definitions={taskForm.properties}
              onRemove={taskForm.removeCustomProperty}
              disabled={taskForm.isSubmitting}
            />
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={taskForm.isSubmitting}
            >
              Cancel·lar
            </Button>
            <Button
              type="submit"
              disabled={taskForm.isSubmitting || !taskForm.isValid}
            >
              {taskForm.isSubmitting ? 'Guardant...' : (taskForm.isEditMode ? 'Actualitzar' : 'Crear Tasca')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;