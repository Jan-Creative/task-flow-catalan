/**
 * Mac Form Sections - 3-column layout optimized for Mac workflow
 */

import React from 'react';
import { MacFormFields } from './MacFormFields';
import type { MacTaskFormReturn } from '@/hooks/tasks/useMacTaskForm';

interface MacFormSectionsProps {
  form: MacTaskFormReturn;
  folders: Array<{ id: string; name: string; }>;
}

export const MacFormSections: React.FC<MacFormSectionsProps> = ({ form, folders }) => {
  return (
    <div className="grid grid-cols-12 gap-8 p-8 min-h-full">
      {/* Column 1: Main Information (40% width) */}
      <div className="col-span-5 space-y-8">
        <div className="space-y-6 p-6 bg-[hsl(var(--input-form-secondary))] backdrop-blur-md rounded-xl border-0">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
              <h3 className="text-lg font-semibold text-foreground">Informació Principal</h3>
            </div>
            <p className="text-sm text-muted-foreground/70">Detalls fonamentals de la tasca</p>
          </div>

          <div className="space-y-6">
            <MacFormFields.TitleField 
              value={form.values.title}
              onChange={(value) => form.setValue('title', value)}
              error={form.errors.title}
              disabled={form.isSubmitting}
              ref={form.titleRef}
            />

            <MacFormFields.DescriptionField
              value={form.values.description}
              onChange={(value) => form.setValue('description', value)}
              error={form.errors.description}
              disabled={form.isSubmitting}
              ref={form.descriptionRef}
            />

            <MacFormFields.NotesField
              value={form.uiState.additionalNotes}
              onChange={(value) => form.setUiState(prev => ({ ...prev, additionalNotes: value }))}
              disabled={form.isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Column 2: Core Metadata (30% width) */}
      <div className="col-span-4 space-y-8">
        <div className="space-y-6 p-6 bg-[hsl(var(--input-form-secondary))] backdrop-blur-md rounded-xl border-0">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1 bg-gradient-to-b from-secondary to-secondary/60 rounded-full"></div>
              <h3 className="text-lg font-semibold text-foreground">Metadades</h3>
            </div>
            <p className="text-sm text-muted-foreground/70">Estats i planificació temporal</p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <MacFormFields.StatusField
                value={form.values.status}
                options={form.statusOptions}
                onChange={(value) => form.setValue('status', value)}
                disabled={form.isSubmitting}
              />

              <MacFormFields.PriorityField
                value={form.values.priority}
                options={form.priorityOptions}
                onChange={(value) => form.setValue('priority', value)}
                disabled={form.isSubmitting}
              />
            </div>

            <MacFormFields.DateRangeField
              startDate={form.values.start_date}
              dueDate={form.values.due_date}
              onStartDateChange={(date) => form.setValue('start_date', date)}
              onDueDateChange={(date) => form.setValue('due_date', date)}
              disabled={form.isSubmitting}
            />

            <MacFormFields.TimeEstimationField
              value={form.values.estimated_time}
              onChange={(time) => form.setValue('estimated_time', time)}
              disabled={form.isSubmitting}
            />

            <MacFormFields.FolderSelector
              value={form.values.folder_id}
              folders={folders}
              onChange={(folderId) => form.setValue('folder_id', folderId)}
              disabled={form.isSubmitting}
              onCreateNew={form.createNewFolder}
            />
          </div>
        </div>
      </div>

      {/* Column 3: Advanced Configuration (30% width) */}
      <div className="col-span-3 space-y-8">
        <div className="space-y-6 p-6 bg-[hsl(var(--input-form-secondary))] backdrop-blur-md rounded-xl border-0">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1 bg-gradient-to-b from-accent to-accent/60 rounded-full"></div>
              <h3 className="text-lg font-semibold text-foreground">Configuració Avançada</h3>
            </div>
            <p className="text-sm text-muted-foreground/70">Recordatoris i propietats personalitzades</p>
          </div>

          <div className="space-y-6">
            <MacFormFields.RemindersField
              reminders={form.values.reminders}
              onAdd={form.addReminder}
              onRemove={form.removeReminder}
              disabled={form.isSubmitting}
            />

            <MacFormFields.TagsField
              tags={form.values.tags}
              availableTags={form.availableTags}
              onAdd={form.addTag}
              onRemove={form.removeTag}
              onCreateNew={form.createNewTag}
              disabled={form.isSubmitting}
            />

            <MacFormFields.QuickSubtasksField
              subtasks={form.values.subtasks}
              onAdd={form.addSubtask}
              onRemove={form.removeSubtask}
              onToggle={form.toggleSubtask}
              disabled={form.isSubmitting}
            />

            <MacFormFields.CustomPropertiesField
              properties={form.values.customProperties}
              definitions={form.properties}
              onAdd={form.addCustomProperty}
              onRemove={form.removeCustomProperty}
              disabled={form.isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};