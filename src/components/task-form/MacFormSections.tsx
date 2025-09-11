/**
 * Mac Form Sections - 3-column layout optimized for Mac workflow
 */

import React from 'react';
import { MacFormFields } from './MacFormFields';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { MacTaskFormReturn } from '@/hooks/tasks/useMacTaskForm';

interface MacFormSectionsProps {
  form: MacTaskFormReturn;
  folders: Array<{ id: string; name: string; }>;
}

export const MacFormSections: React.FC<MacFormSectionsProps> = ({ form, folders }) => {
  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      {/* Essential Information */}
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
      </div>

      {/* Configuration Section */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="configuration" className="border-border/10">
          <AccordionTrigger className="hover:no-underline py-4 text-left">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary/20">
                <span className="text-sm">⚙️</span>
              </div>
              <span className="font-medium text-foreground">Configuració</span>
              <span className="text-xs text-muted-foreground ml-auto mr-4">Dates, temps, carpeta</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="space-y-6">
              <MacFormFields.DateRangeField
                startDate={form.values.start_date}
                dueDate={form.values.due_date}
                onStartDateChange={(date) => form.setValue('start_date', date)}
                onDueDateChange={(date) => form.setValue('due_date', date)}
                disabled={form.isSubmitting}
              />

              <div className="grid grid-cols-2 gap-4">
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
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="advanced" className="border-border/10">
          <AccordionTrigger className="hover:no-underline py-4 text-left">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/20">
                <span className="text-sm">🔔</span>
              </div>
              <span className="font-medium text-foreground">Avançat</span>
              <span className="text-xs text-muted-foreground ml-auto mr-4">Recordatoris, tags, subtasques</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
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

              <div className="grid grid-cols-1 gap-6">
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Additional Notes */}
      <div className="pt-4">
        <MacFormFields.NotesField
          value={form.uiState.additionalNotes}
          onChange={(value) => form.setUiState(prev => ({ ...prev, additionalNotes: value }))}
          disabled={form.isSubmitting}
        />
      </div>
    </div>
  );
};