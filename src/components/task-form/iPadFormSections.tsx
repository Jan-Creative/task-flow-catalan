/**
 * iPad Form Sections - Touch-optimized layout with adaptive sections
 */

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Calendar, 
  Bell, 
  CheckSquare, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Clock
} from 'lucide-react';
import { iPadFormFields } from './iPadFormFields';
import type { iPadTaskFormReturn } from '@/hooks/tasks/useiPadTaskForm';

interface iPadFormSectionsProps {
  form: iPadTaskFormReturn;
  folders: Array<{ id: string; name: string; }>;
}

export const IPadFormSections: React.FC<iPadFormSectionsProps> = ({ form, folders }) => {
  const { uiState } = form;
  const isLandscape = uiState.orientation === 'landscape';
  
  // Section navigation for gesture support
  const SectionNavigation = () => (
    <div className="flex justify-between items-center px-2 py-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={form.previousSection}
        className="h-10 w-10 rounded-full hover:bg-primary/10"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      <div className="flex gap-2">
        {['essentials', 'dates', 'reminders', 'advanced'].map((section, index) => (
          <div 
            key={section}
            className={`h-2 w-8 rounded-full transition-all duration-300 ${
              uiState.activeSection === section 
                ? 'bg-primary' 
                : 'bg-primary/20'
            }`}
          />
        ))}
      </div>
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={form.nextSection}
        className="h-10 w-10 rounded-full hover:bg-primary/10"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );

  // Landscape layout - Use tabs for better space utilization
  if (isLandscape) {
    return (
      <div className="flex flex-col h-full">
        <Tabs value={uiState.activeSection} onValueChange={(section) => 
          form.setUiState(prev => ({ ...prev, activeSection: section }))
        } className="flex-1 flex flex-col">
          
          <TabsList className="grid w-full grid-cols-4 h-14 rounded-xl bg-background/50 backdrop-blur-sm border-0">
            <TabsTrigger 
              value="essentials" 
              className="h-10 rounded-lg text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Essencials
            </TabsTrigger>
            <TabsTrigger 
              value="dates" 
              className="h-10 rounded-lg text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Dates
            </TabsTrigger>
            <TabsTrigger 
              value="reminders" 
              className="h-10 rounded-lg text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Bell className="h-4 w-4 mr-2" />
              Recordatoris
            </TabsTrigger>
            <TabsTrigger 
              value="advanced" 
              className="h-10 rounded-lg text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Avançat
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="essentials" className="mt-0 p-6 space-y-6">
              <iPadFormFields.TitleField 
                value={form.values.title}
                onChange={(value) => form.setValue('title', value)}
                error={form.errors.title}
                ref={form.titleRef}
              />

              <div className="grid grid-cols-2 gap-6">
                <iPadFormFields.StatusField
                  value={form.values.status}
                  onChange={(value) => form.setValue('status', value)}
                  options={form.statusOptions}
                />
                
                <iPadFormFields.PriorityField
                  value={form.values.priority}
                  onChange={(value) => form.setValue('priority', value)}
                  options={form.priorityOptions}
                />
              </div>

              <iPadFormFields.FolderSelector
                value={form.values.folder_id}
                onChange={(value) => form.setValue('folder_id', value)}
                onCreateNew={form.createNewFolder}
                folders={folders}
              />
            </TabsContent>

            <TabsContent value="dates" className="mt-0 p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <iPadFormFields.DateRangeField
                    startDate={form.values.start_date || ''}
                    dueDate={form.values.due_date || ''}
                    onStartDateChange={(value) => form.setValue('start_date', value)}
                    onDueDateChange={(value) => form.setValue('due_date', value)}
                  />
                </div>
                
                <div>
                  <iPadFormFields.TimeEstimationField
                    value={form.values.estimated_time}
                    onChange={(value) => form.setValue('estimated_time', value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reminders" className="mt-0 p-6">
              <iPadFormFields.RemindersField
                reminders={form.values.reminders}
                onAdd={(reminder) => form.addReminder(reminder)}
                onRemove={(id) => form.removeReminder(id)}
                dueDate={form.values.due_date}
                startDate={form.values.start_date}
                simplified={false}
              />
            </TabsContent>

            <TabsContent value="advanced" className="mt-0 p-6 space-y-6">
              <iPadFormFields.DescriptionField
                value={form.values.description}
                onChange={(value) => form.setValue('description', value)}
                error={form.errors.description}
                ref={form.descriptionRef}
              />

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <iPadFormFields.TagsField
                    tags={form.values.tags}
                    onAdd={(tag) => form.addTag(tag)}
                    onRemove={(index) => form.removeTag(form.values.tags[index])}
                    availableTags={form.availableTags}
                  />
                </div>
                
                <div>
                  <iPadFormFields.CustomPropertiesField
                    properties={form.values.customProperties}
                    definitions={form.properties}
                    onAdd={(propertyId, optionId) => form.addCustomProperty(propertyId, optionId)}
                    onRemove={(propertyId) => form.removeCustomProperty(propertyId)}
                  />
                </div>
              </div>

              <iPadFormFields.QuickSubtasksField
                subtasks={form.values.subtasks}
                onAdd={(title) => form.addSubtask(title)}
                onRemove={(id) => form.removeSubtask(id)}
                onToggle={(id) => form.toggleSubtask(id)}
              />

              <iPadFormFields.NotesField
                value={form.uiState.additionalNotes}
                onChange={(value) => form.setUiState(prev => ({ ...prev, additionalNotes: value }))}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    );
  }

  // Portrait layout - Use accordion for vertical space efficiency
  return (
    <div className="p-6 space-y-6">
      {/* Essential Fields - Always Visible */}
      <div className="space-y-6">
        <iPadFormFields.TitleField 
          value={form.values.title}
          onChange={(value) => form.setValue('title', value)}
          error={form.errors.title}
          ref={form.titleRef}
        />

        {/* Quick Access Controls */}
        <div className="grid grid-cols-1 gap-4">
          <iPadFormFields.StatusField
            value={form.values.status}
            onChange={(value) => form.setValue('status', value)}
            options={form.statusOptions}
          />
          
          <iPadFormFields.PriorityField
            value={form.values.priority}
            onChange={(value) => form.setValue('priority', value)}
            options={form.priorityOptions}
          />

          <iPadFormFields.FolderSelector
            value={form.values.folder_id}
            onChange={(value) => form.setValue('folder_id', value)}
            onCreateNew={form.createNewFolder}
            folders={folders}
          />
        </div>
      </div>

      {/* Section Navigation */}
      <SectionNavigation />

      {/* Expandable Sections */}
      <div className="space-y-4">
        <Accordion type="multiple" defaultValue={['dates', 'reminders']} className="w-full space-y-4">
          
          {/* Dates Section */}
          <AccordionItem value="dates" className="border border-border/20 rounded-xl overflow-hidden">
            <AccordionTrigger className="hover:no-underline group py-6 px-6 bg-background/30 hover:bg-background/50 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Calendar className="h-6 w-6 text-blue-500" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-semibold text-foreground">Planificació Temporal</div>
                  <div className="text-sm text-muted-foreground">Dates d'inici, límit i estimació</div>
                </div>
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6 pt-4">
                <iPadFormFields.DateRangeField
                  startDate={form.values.start_date || ''}
                  dueDate={form.values.due_date || ''}
                  onStartDateChange={(value) => form.setValue('start_date', value)}
                  onDueDateChange={(value) => form.setValue('due_date', value)}
                />
                
                <iPadFormFields.TimeEstimationField
                  value={form.values.estimated_time}
                  onChange={(value) => form.setValue('estimated_time', value)}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Reminders Section */}
          <AccordionItem value="reminders" className="border border-border/20 rounded-xl overflow-hidden">
            <AccordionTrigger className="hover:no-underline group py-6 px-6 bg-background/30 hover:bg-background/50 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                  <Bell className="h-6 w-6 text-orange-500" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-semibold text-foreground">Recordatoris</div>
                  <div className="text-sm text-muted-foreground">Notificacions i alertes personalitzades</div>
                </div>
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="px-6 pb-6">
              <div className="pt-4">
                <iPadFormFields.RemindersField
                  reminders={form.values.reminders}
                  onAdd={(reminder) => form.addReminder(reminder)}
                  onRemove={(id) => form.removeReminder(id)}
                  dueDate={form.values.due_date}
                  startDate={form.values.start_date}
                  simplified={false}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Advanced Configuration */}
          <AccordionItem value="advanced" className="border border-border/20 rounded-xl overflow-hidden">
            <AccordionTrigger className="hover:no-underline group py-6 px-6 bg-background/30 hover:bg-background/50 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <Settings className="h-6 w-6 text-purple-500" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-semibold text-foreground">Configuració Avançada</div>
                  <div className="text-sm text-muted-foreground">Descripció, tags, subtasques i propietats</div>
                </div>
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6 pt-4">
                <iPadFormFields.DescriptionField
                  value={form.values.description}
                  onChange={(value) => form.setValue('description', value)}
                  error={form.errors.description}
                  ref={form.descriptionRef}
                />

                <iPadFormFields.TagsField
                  tags={form.values.tags}
                  onAdd={(tag) => form.addTag(tag)}
                  onRemove={(index) => form.removeTag(form.values.tags[index])}
                  availableTags={form.availableTags}
                />

                <iPadFormFields.QuickSubtasksField
                  subtasks={form.values.subtasks}
                  onAdd={(title) => form.addSubtask(title)}
                  onRemove={(id) => form.removeSubtask(id)}
                  onToggle={(id) => form.toggleSubtask(id)}
                />

                <iPadFormFields.CustomPropertiesField
                  properties={form.values.customProperties}
                  definitions={form.properties}
                  onAdd={(propertyId, optionId) => form.addCustomProperty(propertyId, optionId)}
                  onRemove={(propertyId) => form.removeCustomProperty(propertyId)}
                />

                <iPadFormFields.NotesField
                  value={form.uiState.additionalNotes}
                  onChange={(value) => form.setUiState(prev => ({ ...prev, additionalNotes: value }))}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};