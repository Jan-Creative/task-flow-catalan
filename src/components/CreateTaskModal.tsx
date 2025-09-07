/**
 * Adaptive CreateTaskModal - Optimized for iPad with responsive 2-column layout
 */

import React, { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, FileText } from "lucide-react";
import { useTaskForm } from "@/hooks/useTaskForm";
import { useStableCallback } from "@/hooks/useOptimizedPerformance";
import { useResponsiveLayout } from "@/hooks/device/useResponsiveLayout";
import { 
  AdaptiveFormLayout, 
  FormMainSection, 
  FormMetaSection, 
  InlineField,
  CompactFieldGroup 
} from "@/components/form/AdaptiveFormLayout";
import { InlineDescriptionField } from "@/components/form/InlineDescriptionField";
import { CompactStatusSelector, CompactPrioritySelector } from "@/components/form/CompactSelectors";
import { OptimizedDatePicker } from "@/components/form/OptimizedDatePicker";
import { CustomPropertiesDisplay } from "@/components/task-form/TaskFormComponents";
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
  const { layout, useCompactMode } = useResponsiveLayout();
  const isTabletOrDesktop = layout === 'tablet' || layout === 'desktop';
  
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

  // Reset form when dialog opens/closes or editingTask changes
  useEffect(() => {
    if (open) {
      // When opening, reset form with current editingTask data
      taskForm.resetForm();
    }
  }, [open, editingTask, taskForm.resetForm]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className={`
          ${isTabletOrDesktop ? 'max-w-5xl' : 'max-w-lg'}
          max-h-[85vh] overflow-hidden
          p-0 gap-0
        `}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-background/95 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-primary rounded-full"></div>
            <h2 className="text-xl font-semibold tracking-tight">
              {taskForm.isEditMode ? 'Editar Tasca' : 'Nova Tasca'}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form Content with Scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form onSubmit={taskForm.handleSubmit} className="h-full">
            <AdaptiveFormLayout>
              {/* Main Information Column */}
              <FormMainSection title="Informació Principal">
                {/* Title */}
                <InlineField label="Títol" required>
                  <Input
                    placeholder="Escriu el títol de la tasca..."
                    value={taskForm.values.title}
                    onChange={(e) => taskForm.setValue('title', e.target.value)}
                    disabled={taskForm.isSubmitting}
                    className={`
                      h-11 text-base font-medium
                      ${taskForm.errors.title ? 'border-destructive' : ''}
                      focus:ring-2 focus:ring-primary/20
                    `}
                    autoFocus
                  />
                  {taskForm.errors.title && (
                    <p className="text-sm text-destructive mt-1">{taskForm.errors.title}</p>
                  )}
                </InlineField>

                {/* Description Toggle */}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={taskForm.toggleDescription}
                    disabled={taskForm.isSubmitting}
                    className="h-8 px-3 text-xs"
                  >
                    <FileText className="h-3 w-3 mr-1.5" />
                    {taskForm.uiState.isDescriptionOpen ? "Amagar descripció" : "Afegir descripció"}
                  </Button>
                </div>

                {/* Description */}
                {taskForm.uiState.isDescriptionOpen && (
                  <InlineField label="Descripció">
                    <InlineDescriptionField
                      value={taskForm.values.description}
                      onChange={(value) => taskForm.setValue('description', value)}
                      disabled={taskForm.isSubmitting}
                      maxLength={1000}
                    />
                    {taskForm.errors.description && (
                      <p className="text-sm text-destructive mt-1">{taskForm.errors.description}</p>
                    )}
                  </InlineField>
                )}
              </FormMainSection>

              {/* Metadata Column */}
              <FormMetaSection title="Detalls i Configuració">
                <CompactFieldGroup>
                  {/* Status Selector */}
                  <CompactStatusSelector
                    value={taskForm.values.status}
                    options={taskForm.statusOptions}
                    onChange={(value) => taskForm.setValue('status', value as TaskStatus)}
                    disabled={taskForm.isSubmitting}
                  />

                  {/* Priority Selector */}
                  <CompactPrioritySelector
                    value={taskForm.values.priority}
                    options={taskForm.priorityOptions}
                    onChange={(value) => taskForm.setValue('priority', value as TaskPriority)}
                    disabled={taskForm.isSubmitting}
                  />
                </CompactFieldGroup>

                {/* Date Picker */}
                <OptimizedDatePicker
                  value={taskForm.values.due_date}
                  onChange={(date) => taskForm.setValue('due_date', date)}
                  disabled={taskForm.isSubmitting}
                  compact={useCompactMode}
                />

                {/* Custom Properties */}
                {taskForm.hasCustomProperties && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-foreground">Propietats personalitzades</h4>
                    <CustomPropertiesDisplay
                      properties={taskForm.values.customProperties}
                      definitions={taskForm.properties}
                      onRemove={taskForm.removeCustomProperty}
                      disabled={taskForm.isSubmitting}
                    />
                  </div>
                )}
              </FormMetaSection>
            </AdaptiveFormLayout>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t bg-background/95 backdrop-blur">
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={taskForm.isSubmitting}
              className="px-6"
            >
              Cancel·lar
            </Button>
            <Button
              type="submit"
              onClick={taskForm.handleSubmit}
              disabled={taskForm.isSubmitting || !taskForm.isValid}
              className="px-6 bg-primary hover:bg-primary/90"
            >
              {taskForm.isSubmitting ? 'Guardant...' : (taskForm.isEditMode ? 'Actualitzar Tasca' : 'Crear Tasca')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;