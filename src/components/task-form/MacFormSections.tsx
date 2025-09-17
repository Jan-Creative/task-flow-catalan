/**
 * Mac Form Sections - Simplified and optimized layout
 */

import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Settings, Clock } from 'lucide-react';
import { MacFormFields } from './MacFormFields';
import { TaskTimeBlockSelector } from './TaskTimeBlockSelector';
import { InlineTimeBlockCreator } from './InlineTimeBlockCreator';
import type { MacTaskFormReturn } from '@/hooks/tasks/useMacTaskForm';

interface MacFormSectionsProps {
  form: MacTaskFormReturn;
  folders: Array<{ id: string; name: string; }>;
}

export const MacFormSections: React.FC<MacFormSectionsProps> = ({ form, folders }) => {
  const [showTimeBlockCreator, setShowTimeBlockCreator] = useState(false);

  // Mock time blocks data for demonstration
  const availableTimeBlocks = [
    { id: '1', title: 'Focus profund', startTime: '09:00', endTime: '11:00', color: '#22c55e' },
    { id: '2', title: 'Reunions', startTime: '14:00', endTime: '16:00', color: '#f97316' },
    { id: '3', title: 'Tasques administratives', startTime: '16:30', endTime: '17:30', color: '#64748b' },
  ];
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

        {/* Organized 2x3 Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Status, Priority & Folder */}
          <div className="space-y-4">
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

            <MacFormFields.FolderSelector
              value={form.values.folder_id}
              onChange={(value) => form.setValue('folder_id', value)}
              onCreateNew={form.createNewFolder}
              folders={folders}
            />

            <MacFormFields.TodayToggleField
              value={form.values.isToday || false}
              onChange={(value) => form.setValue('isToday', value)}
            />
          </div>

          {/* Right Column: Dates & Reminders */}
          <div className="space-y-4">
            <MacFormFields.DateRangeField
              startDate={form.values.start_date || ''}
              dueDate={form.values.due_date || ''}
              onStartDateChange={(value) => form.setValue('start_date', value)}
              onDueDateChange={(value) => form.setValue('due_date', value)}
            />
            
            <MacFormFields.RemindersField
              reminders={form.values.reminders}
              onAdd={(reminder) => form.addReminder(reminder)}
              onRemove={(id) => form.removeReminder(id)}
              dueDate={form.values.due_date}
              startDate={form.values.start_date}
              simplified={true}
            />
          </div>
        </div>
      </div>

      {/* Time Block Configuration - New Section */}
      <div className="pt-4 border-t border-border/20">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="timeblock" className="border-0">
            <AccordionTrigger className="hover:no-underline group py-3 px-4 rounded-lg hover:bg-background/10 transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Clock className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-foreground">Programació Temporal</div>
                  <div className="text-xs text-muted-foreground">Assigna un horari específic per a aquesta tasca</div>
                </div>
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="pt-4 pb-2">
              <div className="space-y-4 pl-4">
                {!showTimeBlockCreator ? (
                  <TaskTimeBlockSelector
                    selectedTimeBlockId={form.values.time_block_id}
                    selectedStartTime={form.values.scheduled_start_time}
                    selectedEndTime={form.values.scheduled_end_time}
                    onTimeBlockSelect={(timeBlockId) => {
                      const selectedBlock = availableTimeBlocks.find(b => b.id === timeBlockId);
                      if (selectedBlock) {
                        form.setValue('time_block_id', timeBlockId);
                        form.setValue('scheduled_start_time', selectedBlock.startTime);
                        form.setValue('scheduled_end_time', selectedBlock.endTime);
                      }
                    }}
                    onCustomTimeSelect={(startTime, endTime) => {
                      form.setValue('time_block_id', '');
                      form.setValue('scheduled_start_time', startTime);
                      form.setValue('scheduled_end_time', endTime);
                    }}
                    onClear={() => {
                      form.setValue('time_block_id', '');
                      form.setValue('scheduled_start_time', '');
                      form.setValue('scheduled_end_time', '');
                    }}
                    onCreateNew={() => setShowTimeBlockCreator(true)}
                    availableTimeBlocks={availableTimeBlocks}
                  />
                ) : (
                  <InlineTimeBlockCreator
                    onTimeBlockCreate={(block) => {
                      // In real implementation, this would create the block in the database
                      console.log('Creating time block:', block);
                      // For now, just simulate assigning the custom time
                      form.setValue('time_block_id', '');
                      form.setValue('scheduled_start_time', block.startTime);
                      form.setValue('scheduled_end_time', block.endTime);
                      setShowTimeBlockCreator(false);
                    }}
                    onCancel={() => setShowTimeBlockCreator(false)}
                  />
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
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
                  <div className="text-xs text-muted-foreground">Descripció, estimació, tags, subtasques i més</div>
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
                    dueDate={form.values.due_date}
                    startDate={form.values.start_date}
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