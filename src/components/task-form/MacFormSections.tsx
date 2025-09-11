/**
 * Mac Form Sections - Simplified and optimized layout
 */

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Settings } from 'lucide-react';
import { MacFormFields } from './MacFormFields';
import type { MacTaskFormReturn } from '@/hooks/tasks/useMacTaskForm';

interface MacFormSectionsProps {
  form: MacTaskFormReturn;
  folders: Array<{ id: string; name: string; }>;
}

export const MacFormSections: React.FC<MacFormSectionsProps> = ({ form, folders }) => {
  return (
    <div className="p-6 space-y-6">
      {/* Essential Fields - Always Visible */}
      <div className="space-y-4">
        {/* Title - Full Width */}
        <div className="w-full">
          <MacFormFields.TitleField 
            value={form.values.title}
            onChange={(value) => form.setValue('title', value)}
            error={form.errors.title}
            ref={form.titleRef}
          />
        </div>

        {/* Status, Priority, Date - Three Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MacFormFields.StatusField
            value={form.values.status}
            onChange={(value) => form.setValue('status', value)}
            options={form.statusOptions}
          />
          
          <MacFormFields.PriorityField
            value={form.values.priority}
            onChange={(value) => form.setValue('priority', value)}
            options={form.priorityOptions}
          />
          
          <MacFormFields.DateRangeField
            startDate={form.values.start_date || ''}
            dueDate={form.values.due_date || ''}
            onStartDateChange={(value) => form.setValue('start_date', value)}
            onDueDateChange={(value) => form.setValue('due_date', value)}
          />
        </div>

        {/* Quick Reminder - Positioned after dates */}
        <div className="max-w-md mx-auto">
          <MacFormFields.RemindersField
            reminders={form.values.reminders}
            onAdd={(reminder) => form.addReminder(reminder)}
            onRemove={(id) => form.removeReminder(id)}
            simplified={true}
          />
        </div>
      </div>

      {/* Advanced Configuration - Collapsible */}
      <div className="pt-4 border-t border-border/20">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="advanced" className="border-0">
            <AccordionTrigger className="hover:no-underline group py-3 px-4 rounded-lg hover:bg-background/10 transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Settings className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-foreground">Configuració Avançada</div>
                  <div className="text-xs text-muted-foreground">Descripció, dates, carpeta, tags i més</div>
                </div>
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="pt-4 pb-2">
              <div className="space-y-6 pl-4">
                {/* Description */}
                <div>
                  <MacFormFields.DescriptionField
                    value={form.values.description}
                    onChange={(value) => form.setValue('description', value)}
                    error={form.errors.description}
                    ref={form.descriptionRef}
                  />
                </div>

                {/* Time Estimation */}
                <div>
                  <MacFormFields.TimeEstimationField
                    value={form.values.estimated_time}
                    onChange={(value) => form.setValue('estimated_time', value)}
                  />
                </div>

                {/* Folder */}
                <div>
                  <MacFormFields.FolderSelector
                    value={form.values.folder_id}
                    onChange={(value) => form.setValue('folder_id', value)}
                    onCreateNew={form.createNewFolder}
                    folders={folders}
                  />
                </div>

                {/* Tags */}
                <div>
                  <MacFormFields.TagsField
                    tags={form.values.tags}
                    onAdd={(tag) => form.addTag(tag)}
                    onRemove={(index) => form.removeTag(form.values.tags[index])}
                    availableTags={form.availableTags}
                  />
                </div>

                {/* Subtasks */}
                <div>
                  <MacFormFields.QuickSubtasksField
                    subtasks={form.values.subtasks}
                    onAdd={(title) => form.addSubtask(title)}
                    onRemove={(id) => form.removeSubtask(id)}
                    onToggle={(id) => form.toggleSubtask(id)}
                  />
                </div>

                {/* Custom Properties */}
                <div>
                  <MacFormFields.CustomPropertiesField
                    properties={form.values.customProperties}
                    definitions={form.properties}
                    onAdd={(propertyId, optionId) => form.addCustomProperty(propertyId, optionId)}
                    onRemove={(propertyId) => form.removeCustomProperty(propertyId)}
                  />
                </div>

                {/* Multiple Reminders */}
                <div>
                  <MacFormFields.RemindersField
                    reminders={form.values.reminders}
                    onAdd={(reminder) => form.addReminder(reminder)}
                    onRemove={(id) => form.removeReminder(id)}
                    simplified={false}
                  />
                </div>

                {/* Notes */}
                <div>
                  <MacFormFields.NotesField
                    value={form.uiState.additionalNotes}
                    onChange={(value) => form.setUiState(prev => ({ ...prev, additionalNotes: value }))}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};