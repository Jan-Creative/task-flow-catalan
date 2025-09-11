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
  Circle
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
      className="h-12 text-lg font-medium border-border/50 focus:border-primary"
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
      className="min-h-[120px] border-border/50 focus:border-primary resize-none"
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
      className="min-h-[80px] border-border/50 focus:border-primary resize-none"
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
      <SelectTrigger className="h-11 border-border/50">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
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
      <SelectTrigger className="h-11 border-border/50">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
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
              className="w-full h-11 justify-start text-left font-normal border-border/50"
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(new Date(startDate), 'PPP') : "Selecciona data d'inici"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
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
              className="w-full h-11 justify-start text-left font-normal border-border/50"
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(new Date(dueDate), 'PPP') : "Selecciona data límit"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
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
        className="h-11 border-border/50"
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
        <SelectTrigger className="flex-1 h-11 border-border/50">
          <SelectValue placeholder="Selecciona carpeta" />
        </SelectTrigger>
        <SelectContent>
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
        className="h-11 px-3 border-border/50"
      >
        <FolderPlus className="h-4 w-4" />
      </Button>
    </div>
  </FieldWrapper>
);

// Reminders Field
const RemindersField: React.FC<{
  reminders: Array<{ id: string; datetime: string; message: string }>;
  onAdd: (reminder: { datetime: string; message: string }) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}> = ({ reminders, onAdd, onRemove, disabled }) => (
  <FieldWrapper label="Recordatoris">
    <div className="space-y-3">
      {reminders.map((reminder) => (
        <div key={reminder.id} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1 text-sm">
            <div className="font-medium">{format(new Date(reminder.datetime), 'PPp')}</div>
            {reminder.message && <div className="text-muted-foreground">{reminder.message}</div>}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(reminder.id)}
            disabled={disabled}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onAdd({ datetime: new Date().toISOString(), message: '' })}
        disabled={disabled}
        className="w-full h-10 border-dashed border-border/50"
      >
        <Plus className="h-4 w-4 mr-2" />
        Afegir recordatori
      </Button>
    </div>
  </FieldWrapper>
);

// Tags Field
const TagsField: React.FC<{
  tags: string[];
  availableTags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  onCreateNew: (tag: string) => void;
  disabled?: boolean;
}> = ({ tags, availableTags, onAdd, onRemove, onCreateNew, disabled }) => (
  <FieldWrapper label="Etiquetes">
    <div className="space-y-3">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              <Hash className="h-3 w-3" />
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(tag)}
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
        <SelectTrigger className="h-10 border-dashed border-border/50">
          <SelectValue placeholder="Afegir etiqueta" />
        </SelectTrigger>
        <SelectContent>
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
          <div key={subtask.id} className="flex items-center gap-2 p-2 bg-muted/20 rounded">
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
            className="h-9 text-sm border-border/50"
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
          <div key={prop.propertyId} className="flex items-center gap-2 p-2 bg-muted/20 rounded">
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
          <SelectTrigger className="h-10 border-dashed border-border/50">
            <SelectValue placeholder="Afegir propietat" />
          </SelectTrigger>
          <SelectContent>
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