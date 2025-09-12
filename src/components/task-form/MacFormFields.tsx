/**
 * Mac Form Fields - Advanced form components optimized for Mac interface
 */

import React, { forwardRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  X, 
  CalendarIcon, 
  Clock, 
  FolderPlus, 
  Bell, 
  Tag, 
  CheckSquare,
  Hash,
  Circle,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { TaskStatus, TaskPriority } from '@/types';

// Field wrapper for consistent styling
const FieldWrapper: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  error?: string;
}> = ({ label, required, children, className, error }) => (
  <div className={cn("space-y-3", className)}>
    <label className="text-sm font-medium text-foreground flex items-center gap-2">
      {label}
      {required && <span className="text-destructive">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-sm text-destructive">{error}</p>
    )}
  </div>
);

// Title Field
const TitleField = forwardRef<HTMLInputElement, {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}>(({ value, onChange, error, disabled }, ref) => (
  <FieldWrapper label="Títol de la tasca" required error={error}>
    <Input
      ref={ref}
      placeholder="Escriu un títol descriptiu..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="h-12 text-lg font-medium bg-[hsl(var(--input-form-primary))] backdrop-blur-sm border-0 focus:outline-none focus:bg-[hsl(var(--input-form-focus))] hover:bg-[hsl(var(--input-form-hover))] transition-all duration-200"
      autoFocus
    />
  </FieldWrapper>
));

// Description Field with Rich Text
const DescriptionField = forwardRef<HTMLTextAreaElement, {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}>(({ value, onChange, error, disabled }, ref) => (
  <FieldWrapper label="Descripció detallada" error={error}>
    <Textarea
      ref={ref}
      placeholder="Afegeix una descripció completa de la tasca..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="min-h-[120px] bg-[hsl(var(--input-form-primary))] backdrop-blur-sm border-0 focus:outline-none focus:bg-[hsl(var(--input-form-focus))] hover:bg-[hsl(var(--input-form-hover))] transition-all duration-200 resize-none"
      maxLength={2000}
    />
    <div className="flex justify-between text-xs text-muted-foreground">
      <span>Accepta markdown per format</span>
      <span>{value.length}/2000</span>
    </div>
  </FieldWrapper>
));

// Notes Field
const NotesField: React.FC<{
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => (
  <FieldWrapper label="Notes addicionals">
    <Textarea
      placeholder="Notes internes, contexte adicional..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="min-h-[80px] bg-[hsl(var(--input-form-secondary))] backdrop-blur-sm border-0 focus:outline-none focus:bg-[hsl(var(--input-form-focus))] hover:bg-[hsl(var(--input-form-hover))] transition-all duration-200 resize-none"
      maxLength={500}
    />
  </FieldWrapper>
);

// Status Field
const StatusField: React.FC<{
  value: TaskStatus;
  options: Array<{ value: string; label: string; color: string }>;
  onChange: (value: TaskStatus) => void;
  disabled?: boolean;
}> = ({ value, options, onChange, disabled }) => (
  <FieldWrapper label="Estat">
    <Select value={value} onValueChange={(val) => onChange(val as TaskStatus)} disabled={disabled}>
      <SelectTrigger className="h-11 bg-[hsl(var(--input-form-primary))] backdrop-blur-sm border-0 focus:outline-none focus:bg-[hsl(var(--input-form-focus))] hover:bg-[hsl(var(--input-form-hover))] transition-all duration-200">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-popover/95 backdrop-blur-md border-0">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              <Circle className="h-3 w-3" style={{ color: option.color, fill: option.color }} />
              {option.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </FieldWrapper>
);

// Priority Field
const PriorityField: React.FC<{
  value: TaskPriority;
  options: Array<{ value: string; label: string; color: string }>;
  onChange: (value: TaskPriority) => void;
  disabled?: boolean;
}> = ({ value, options, onChange, disabled }) => (
  <FieldWrapper label="Prioritat">
    <Select value={value} onValueChange={(val) => onChange(val as TaskPriority)} disabled={disabled}>
      <SelectTrigger className="h-11 bg-[hsl(var(--input-form-primary))] backdrop-blur-sm border-0 focus:outline-none focus:bg-[hsl(var(--input-form-focus))] hover:bg-[hsl(var(--input-form-hover))] transition-all duration-200">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-popover/95 backdrop-blur-md border-0">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: option.color }} />
              {option.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </FieldWrapper>
);

// Date Range Field
const DateRangeField: React.FC<{
  startDate: string;
  dueDate: string;
  onStartDateChange: (date: string) => void;
  onDueDateChange: (date: string) => void;
  disabled?: boolean;
}> = ({ startDate, dueDate, onStartDateChange, onDueDateChange, disabled }) => (
  <FieldWrapper label="Planificació temporal">
    <div className="grid grid-cols-1 gap-3">
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Data d'inici</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-11 justify-start text-left font-normal bg-[hsl(var(--input-form-primary))] border-0 hover:bg-[hsl(var(--input-form-hover))] transition-all duration-200"
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(new Date(startDate), 'PPP') : "Selecciona data d'inici"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-popover/95 backdrop-blur-md border-0" align="start">
            <Calendar
              mode="single"
              selected={startDate ? new Date(startDate) : undefined}
              onSelect={(date) => onStartDateChange(date ? date.toISOString().split('T')[0] : '')}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Data límit</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-11 justify-start text-left font-normal bg-[hsl(var(--input-form-primary))] border-0 hover:bg-[hsl(var(--input-form-hover))] transition-all duration-200"
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(new Date(dueDate), 'PPP') : "Selecciona data límit"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-popover/95 backdrop-blur-md border-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate ? new Date(dueDate) : undefined}
              onSelect={(date) => onDueDateChange(date ? date.toISOString().split('T')[0] : '')}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  </FieldWrapper>
);

// Time Estimation Field
const TimeEstimationField: React.FC<{
  value: number;
  onChange: (time: number) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => (
  <FieldWrapper label="Estimació de temps">
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-muted-foreground" />
      <Input
        type="number"
        min="0"
        max="999"
        step="0.5"
        placeholder="0"
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="h-11 bg-[hsl(var(--input-form-primary))] border-0 focus:bg-[hsl(var(--input-form-focus))] hover:bg-[hsl(var(--input-form-hover))] transition-all duration-200"
      />
      <span className="text-sm text-muted-foreground">hores</span>
    </div>
  </FieldWrapper>
);

// Folder Selector
const FolderSelector: React.FC<{
  value: string;
  folders: Array<{ id: string; name: string }>;
  onChange: (folderId: string) => void;
  onCreateNew: () => void;
  disabled?: boolean;
}> = ({ value, folders, onChange, onCreateNew, disabled }) => (
  <FieldWrapper label="Carpeta/Projecte">
    <div className="flex gap-2">
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="flex-1 h-11 bg-[hsl(var(--input-form-primary))] border-0 focus:bg-[hsl(var(--input-form-focus))] hover:bg-[hsl(var(--input-form-hover))] transition-all duration-200">
          <SelectValue placeholder="Selecciona carpeta" />
        </SelectTrigger>
        <SelectContent className="bg-popover/95 backdrop-blur-md border-0">
          {folders.map((folder) => (
            <SelectItem key={folder.id} value={folder.id}>
              {folder.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onCreateNew}
        disabled={disabled}
        className="h-11 px-3 bg-[hsl(var(--input-form-secondary))] border-0 hover:bg-[hsl(var(--input-form-hover))] transition-all duration-200"
      >
        <FolderPlus className="h-4 w-4" />
      </Button>
    </div>
  </FieldWrapper>
);

// Enhanced Reminders Field with Custom Date/Time Support and Dual Context
// Import the new reminder component
import { NewReminderBuilder } from './NewReminderBuilder';

const RemindersField: React.FC<{
  reminders: Array<{ id: string; datetime: string; message: string }>;
  onAdd: (reminder: { datetime: string; message: string }) => void;
  onRemove: (id: string) => void;
  onUpdate?: (id: string, reminder: { datetime: string; message: string }) => void;
  simplified?: boolean;
  disabled?: boolean;
  dueDate?: string;
  startDate?: string;
}> = ({ reminders, onAdd, onRemove, simplified = false, disabled, dueDate, startDate }) => {
  return (
    <FieldWrapper label="Recordatoris">
      <NewReminderBuilder
        reminders={reminders}
        onAdd={onAdd}
        onRemove={onRemove}
        startDate={startDate}
        dueDate={dueDate}
        disabled={disabled}
      />
    </FieldWrapper>
  );
};

// Tags Field
const TagsField: React.FC<{
  tags: string[];
  availableTags: string[];
  onAdd: (tag: string) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}> = ({ tags, availableTags, onAdd, onRemove, disabled }) => (
  <FieldWrapper label="Etiquetes">
    <div className="space-y-3">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              <Hash className="h-3 w-3" />
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(index)}
                disabled={disabled}
                className="h-4 w-4 p-0 ml-1 hover:bg-destructive/20"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      <Select onValueChange={onAdd} disabled={disabled}>
        <SelectTrigger className="h-10 border-dashed bg-[hsl(var(--input-form-secondary))] border-0 hover:bg-[hsl(var(--input-form-hover))] transition-all duration-200">
          <SelectValue placeholder="Afegir etiqueta" />
        </SelectTrigger>
        <SelectContent className="bg-popover/95 backdrop-blur-md border-0">
          {availableTags.map((tag) => (
            <SelectItem key={tag} value={tag}>
              <div className="flex items-center gap-2">
                <Tag className="h-3 w-3" />
                {tag}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </FieldWrapper>
);

// Quick Subtasks Field
const QuickSubtasksField: React.FC<{
  subtasks: Array<{ id: string; title: string; completed: boolean }>;
  onAdd: (title: string) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
  disabled?: boolean;
}> = ({ subtasks, onAdd, onRemove, onToggle, disabled }) => {
  const [newSubtask, setNewSubtask] = React.useState('');

  const handleAdd = () => {
    if (newSubtask.trim()) {
      onAdd(newSubtask.trim());
      setNewSubtask('');
    }
  };

  return (
    <FieldWrapper label="Subtasques ràpides">
      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div key={subtask.id} className="flex items-center gap-2 p-2 bg-[hsl(var(--input-form-secondary))] rounded">
            <Checkbox
              checked={subtask.completed}
              onCheckedChange={() => onToggle(subtask.id)}
              disabled={disabled}
            />
            <span className={cn(
              "flex-1 text-sm",
              subtask.completed && "line-through text-muted-foreground"
            )}>
              {subtask.title}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(subtask.id)}
              disabled={disabled}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Input
            placeholder="Nova subtasca..."
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            disabled={disabled}
            className="h-9 text-sm bg-[hsl(var(--input-form-primary))] border-0 focus:bg-[hsl(var(--input-form-focus))] hover:bg-[hsl(var(--input-form-hover))] transition-all duration-200"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={disabled || !newSubtask.trim()}
            className="h-9 px-3"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </FieldWrapper>
  );
};

// Custom Properties Field
const CustomPropertiesField: React.FC<{
  properties: Array<{ propertyId: string; optionId: string }>;
  definitions: Array<{ id: string; name: string; options: Array<{ id: string; label: string }> }>;
  onAdd: (propertyId: string, optionId: string) => void;
  onRemove: (propertyId: string) => void;
  disabled?: boolean;
}> = ({ properties, definitions, onAdd, onRemove, disabled }) => (
  <FieldWrapper label="Propietats personalitzades">
    <div className="space-y-3">
      {properties.map((prop) => {
        const definition = definitions.find(d => d.id === prop.propertyId);
        const option = definition?.options.find(o => o.id === prop.optionId);
        return (
          <div key={prop.propertyId} className="flex items-center gap-2 p-2 bg-[hsl(var(--input-form-secondary))] rounded">
            <span className="text-sm font-medium">{definition?.name}:</span>
            <Badge variant="outline">{option?.label}</Badge>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(prop.propertyId)}
              disabled={disabled}
              className="h-6 w-6 p-0 ml-auto"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      })}
      {definitions.length > 0 && (
        <Select onValueChange={(propertyId) => {
          const definition = definitions.find(d => d.id === propertyId);
          if (definition && definition.options.length > 0) {
            onAdd(propertyId, definition.options[0].id);
          }
        }} disabled={disabled}>
          <SelectTrigger className="h-10 border-dashed bg-[hsl(var(--input-form-secondary))] border-0 hover:bg-[hsl(var(--input-form-hover))] transition-all duration-200">
            <SelectValue placeholder="Afegir propietat" />
          </SelectTrigger>
          <SelectContent className="bg-popover/95 backdrop-blur-md border-0">
            {definitions.map((definition) => (
              <SelectItem key={definition.id} value={definition.id}>
                {definition.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  </FieldWrapper>
);

export const MacFormFields = {
  TitleField,
  DescriptionField,
  NotesField,
  StatusField,
  PriorityField,
  DateRangeField,
  TimeEstimationField,
  FolderSelector,
  RemindersField,
  TagsField,
  QuickSubtasksField,
  CustomPropertiesField
};