/**
 * iPad Form Fields - Touch-optimized form components for iPad interface
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
  AlertTriangle,
  Smartphone
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { TaskStatus, TaskPriority } from '@/types';
import { NewReminderBuilder } from './NewReminderBuilder';

// Touch-friendly field wrapper with larger touch targets
const TouchFieldWrapper: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  error?: string;
  icon?: React.ReactNode;
}> = ({ label, required, children, className, error, icon }) => (
  <div className={cn("space-y-4", className)}>
    <label className="text-base font-semibold text-foreground flex items-center gap-3 px-1">
      {icon && <div className="h-5 w-5 text-primary">{icon}</div>}
      {label}
      {required && <span className="text-destructive text-lg">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-sm text-destructive px-1 py-1 bg-destructive/10 rounded-md">{error}</p>
    )}
  </div>
);

// Touch-optimized Title Field - Larger for easy tapping
const TitleField = forwardRef<HTMLInputElement, {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}>(({ value, onChange, error, disabled }, ref) => (
  <TouchFieldWrapper 
    label="Títol de la tasca" 
    required 
    error={error}
    icon={<CheckSquare />}
  >
    <Input
      ref={ref}
      placeholder="Introdueix un títol descriptiu..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="h-14 text-lg font-medium bg-[hsl(var(--input-form-primary))] backdrop-blur-sm border-2 border-transparent focus:border-primary/30 rounded-xl px-6 transition-all duration-300 touch-manipulation"
      autoFocus
    />
  </TouchFieldWrapper>
));

// Enhanced Description Field with touch-friendly sizing
const DescriptionField = forwardRef<HTMLTextAreaElement, {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}>(({ value, onChange, error, disabled }, ref) => (
  <TouchFieldWrapper 
    label="Descripció detallada" 
    error={error}
    icon={<Hash />}
  >
    <Textarea
      ref={ref}
      placeholder="Afegeix una descripció completa de la tasca..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="min-h-[140px] text-base bg-[hsl(var(--input-form-primary))] backdrop-blur-sm border-2 border-transparent focus:border-primary/30 rounded-xl px-6 py-4 transition-all duration-300 resize-none touch-manipulation"
      maxLength={2000}
    />
    <div className="flex justify-between text-sm text-muted-foreground px-2">
      <span>Format markdown suportat</span>
      <span className="font-medium">{value.length}/2000</span>
    </div>
  </TouchFieldWrapper>
));

// Touch-optimized Status Field with visual icons
const StatusField: React.FC<{
  value: TaskStatus;
  options: Array<{ value: string; label: string; color: string; icon?: string }>;
  onChange: (value: TaskStatus) => void;
  disabled?: boolean;
}> = ({ value, options, onChange, disabled }) => (
  <TouchFieldWrapper 
    label="Estat actual"
    icon={<Circle />}
  >
    <Select value={value} onValueChange={(val) => onChange(val as TaskStatus)} disabled={disabled}>
      <SelectTrigger className="h-14 bg-[hsl(var(--input-form-primary))] backdrop-blur-sm border-2 border-transparent focus:border-primary/30 rounded-xl px-6 text-lg transition-all duration-300 touch-manipulation">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-popover/95 backdrop-blur-md border-0 rounded-xl">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="h-12 px-6 text-base">
            <div className="flex items-center gap-3">
              <span className="text-lg" style={{ color: option.color }}>
                {option.icon || '○'}
              </span>
              {option.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </TouchFieldWrapper>
);

// Enhanced Priority Field with visual indicators
const PriorityField: React.FC<{
  value: TaskPriority;
  options: Array<{ value: string; label: string; color: string; icon?: string }>;
  onChange: (value: TaskPriority) => void;
  disabled?: boolean;
}> = ({ value, options, onChange, disabled }) => (
  <TouchFieldWrapper 
    label="Nivell de prioritat"
    icon={<AlertTriangle />}
  >
    <Select value={value} onValueChange={(val) => onChange(val as TaskPriority)} disabled={disabled}>
      <SelectTrigger className="h-14 bg-[hsl(var(--input-form-primary))] backdrop-blur-sm border-2 border-transparent focus:border-primary/30 rounded-xl px-6 text-lg transition-all duration-300 touch-manipulation">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-popover/95 backdrop-blur-md border-0 rounded-xl">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="h-12 px-6 text-base">
            <div className="flex items-center gap-3">
              <span className="text-lg" style={{ color: option.color }}>
                {option.icon || '●'}
              </span>
              {option.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </TouchFieldWrapper>
);

// iPad-optimized Date Range Field
const DateRangeField: React.FC<{
  startDate: string;
  dueDate: string;
  onStartDateChange: (date: string) => void;
  onDueDateChange: (date: string) => void;
  disabled?: boolean;
}> = ({ startDate, dueDate, onStartDateChange, onDueDateChange, disabled }) => (
  <TouchFieldWrapper 
    label="Planificació temporal"
    icon={<CalendarIcon />}
  >
    <div className="grid grid-cols-1 gap-4">
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground px-2">Data d'inici</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-14 justify-start text-left font-medium bg-[hsl(var(--input-form-primary))] border-2 border-transparent hover:border-primary/30 rounded-xl px-6 text-base transition-all duration-300 touch-manipulation"
              disabled={disabled}
            >
              <CalendarIcon className="mr-3 h-5 w-5" />
              {startDate ? format(new Date(startDate), 'PPP') : "Selecciona data d'inici"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-popover/95 backdrop-blur-md border-0 rounded-xl" align="start">
            <Calendar
              mode="single"
              selected={startDate ? new Date(startDate) : undefined}
              onSelect={(date) => onStartDateChange(date ? date.toISOString().split('T')[0] : '')}
              initialFocus
              className="pointer-events-auto rounded-xl"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground px-2">Data límit</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-14 justify-start text-left font-medium bg-[hsl(var(--input-form-primary))] border-2 border-transparent hover:border-primary/30 rounded-xl px-6 text-base transition-all duration-300 touch-manipulation"
              disabled={disabled}
            >
              <CalendarIcon className="mr-3 h-5 w-5" />
              {dueDate ? format(new Date(dueDate), 'PPP') : "Selecciona data límit"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-popover/95 backdrop-blur-md border-0 rounded-xl" align="start">
            <Calendar
              mode="single"
              selected={dueDate ? new Date(dueDate) : undefined}
              onSelect={(date) => onDueDateChange(date ? date.toISOString().split('T')[0] : '')}
              initialFocus
              className="pointer-events-auto rounded-xl"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  </TouchFieldWrapper>
);

// Touch-optimized Time Estimation
const TimeEstimationField: React.FC<{
  value: number;
  onChange: (time: number) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => (
  <TouchFieldWrapper 
    label="Estimació de temps"
    icon={<Clock />}
  >
    <div className="flex items-center gap-4 p-4 bg-[hsl(var(--input-form-primary))] rounded-xl">
      <Clock className="h-5 w-5 text-primary" />
      <Input
        type="number"
        min="0"
        max="999"
        step="0.5"
        placeholder="0"
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="h-12 text-lg bg-transparent border-2 border-transparent focus:border-primary/30 rounded-lg px-4 transition-all duration-300 touch-manipulation"
      />
      <span className="text-base font-medium text-muted-foreground">hores</span>
    </div>
  </TouchFieldWrapper>
);

// Enhanced Folder Selector for iPad
const FolderSelector: React.FC<{
  value: string;
  folders: Array<{ id: string; name: string }>;
  onChange: (folderId: string) => void;
  onCreateNew: () => void;
  disabled?: boolean;
}> = ({ value, folders, onChange, onCreateNew, disabled }) => (
  <TouchFieldWrapper 
    label="Carpeta/Projecte"
    icon={<FolderPlus />}
  >
    <div className="flex gap-3">
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="flex-1 h-14 bg-[hsl(var(--input-form-primary))] border-2 border-transparent focus:border-primary/30 rounded-xl px-6 text-lg transition-all duration-300 touch-manipulation">
          <SelectValue placeholder="Selecciona carpeta" />
        </SelectTrigger>
        <SelectContent className="bg-popover/95 backdrop-blur-md border-0 rounded-xl">
          {folders.map((folder) => (
            <SelectItem key={folder.id} value={folder.id} className="h-12 px-6 text-base">
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
        className="h-14 px-4 bg-[hsl(var(--input-form-secondary))] border-2 border-transparent hover:border-primary/30 rounded-xl transition-all duration-300 touch-manipulation"
      >
        <FolderPlus className="h-5 w-5" />
      </Button>
    </div>
  </TouchFieldWrapper>
);

// iPad-optimized Reminders Field
const RemindersField: React.FC<{
  reminders: Array<{ id: string; datetime: string; message: string }>;
  onAdd: (reminder: { datetime: string; message: string }) => void;
  onRemove: (id: string) => void;
  simplified?: boolean;
  disabled?: boolean;
  dueDate?: string;
  startDate?: string;
}> = ({ reminders, onAdd, onRemove, simplified = false, disabled, dueDate, startDate }) => {
  return (
    <TouchFieldWrapper 
      label="Recordatoris"
      icon={<Bell />}
    >
      <div className="p-6 bg-[hsl(var(--input-form-primary))] rounded-xl">
        <NewReminderBuilder
          reminders={reminders}
          onAdd={onAdd}
          onRemove={onRemove}
          startDate={startDate}
          dueDate={dueDate}
          disabled={disabled}
        />
      </div>
    </TouchFieldWrapper>
  );
};

// Touch-friendly Tags Field
const TagsField: React.FC<{
  tags: string[];
  availableTags: string[];
  onAdd: (tag: string) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}> = ({ tags, availableTags, onAdd, onRemove, disabled }) => (
  <TouchFieldWrapper 
    label="Etiquetes"
    icon={<Tag />}
  >
    <div className="space-y-4">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {tags.map((tag, index) => (
            <Badge key={tag} variant="secondary" className="gap-2 h-10 px-4 text-base rounded-lg">
              <Hash className="h-4 w-4" />
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(index)}
                disabled={disabled}
                className="h-6 w-6 p-0 ml-2 hover:bg-destructive/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      <Select onValueChange={onAdd} disabled={disabled}>
        <SelectTrigger className="h-14 border-dashed bg-[hsl(var(--input-form-secondary))] border-2 border-transparent hover:border-primary/30 rounded-xl px-6 text-lg transition-all duration-300 touch-manipulation">
          <SelectValue placeholder="Afegir etiqueta" />
        </SelectTrigger>
        <SelectContent className="bg-popover/95 backdrop-blur-md border-0 rounded-xl">
          {availableTags.map((tag) => (
            <SelectItem key={tag} value={tag} className="h-12 px-6 text-base">
              <div className="flex items-center gap-3">
                <Tag className="h-4 w-4" />
                {tag}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </TouchFieldWrapper>
);

// Touch-optimized Subtasks Field
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
    <TouchFieldWrapper 
      label="Subtasques ràpides"
      icon={<CheckSquare />}
    >
      <div className="space-y-3">
        {subtasks.map((subtask) => (
          <div key={subtask.id} className="flex items-center gap-4 p-4 bg-[hsl(var(--input-form-secondary))] rounded-xl">
            <Checkbox
              checked={subtask.completed}
              onCheckedChange={() => onToggle(subtask.id)}
              disabled={disabled}
              className="h-5 w-5"
            />
            <span className={cn(
              "flex-1 text-base",
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
              className="h-10 w-10 p-0 rounded-full hover:bg-destructive/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="flex gap-3">
          <Input
            placeholder="Nova subtasca..."
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            disabled={disabled}
            className="h-12 text-base bg-[hsl(var(--input-form-primary))] border-2 border-transparent focus:border-primary/30 rounded-xl px-4 transition-all duration-300 touch-manipulation"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={disabled || !newSubtask.trim()}
            className="h-12 px-4 rounded-xl touch-manipulation"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </TouchFieldWrapper>
  );
};

// Notes Field for iPad
const NotesField: React.FC<{
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => (
  <TouchFieldWrapper 
    label="Notes addicionals"
    icon={<Hash />}
  >
    <Textarea
      placeholder="Notes internes, contexte adicional..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="min-h-[100px] text-base bg-[hsl(var(--input-form-secondary))] border-2 border-transparent focus:border-primary/30 rounded-xl px-6 py-4 transition-all duration-300 resize-none touch-manipulation"
      maxLength={500}
    />
  </TouchFieldWrapper>
);

// Custom Properties Field for iPad
const CustomPropertiesField: React.FC<{
  properties: Array<{ propertyId: string; optionId: string }>;
  definitions: Array<{ id: string; name: string; options: Array<{ id: string; label: string }> }>;
  onAdd: (propertyId: string, optionId: string) => void;
  onRemove: (propertyId: string) => void;
  disabled?: boolean;
}> = ({ properties, definitions, onAdd, onRemove, disabled }) => (
  <TouchFieldWrapper 
    label="Propietats personalitzades"
    icon={<Smartphone />}
  >
    <div className="space-y-4">
      {properties.map((prop) => {
        const definition = definitions.find(d => d.id === prop.propertyId);
        const option = definition?.options.find(o => o.id === prop.optionId);
        return (
          <div key={prop.propertyId} className="flex items-center gap-4 p-4 bg-[hsl(var(--input-form-secondary))] rounded-xl">
            <span className="text-base font-semibold">{definition?.name}:</span>
            <Badge variant="outline" className="h-8 px-3 text-sm">{option?.label}</Badge>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(prop.propertyId)}
              disabled={disabled}
              className="h-10 w-10 p-0 ml-auto rounded-full hover:bg-destructive/20"
            >
              <X className="h-4 w-4" />
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
          <SelectTrigger className="h-14 border-dashed bg-[hsl(var(--input-form-secondary))] border-2 border-transparent hover:border-primary/30 rounded-xl px-6 text-lg transition-all duration-300 touch-manipulation">
            <SelectValue placeholder="Afegir propietat" />
          </SelectTrigger>
          <SelectContent className="bg-popover/95 backdrop-blur-md border-0 rounded-xl">
            {definitions.map((definition) => (
              <SelectItem key={definition.id} value={definition.id} className="h-12 px-6 text-base">
                {definition.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  </TouchFieldWrapper>
);

// Export all fields as an object
export const iPadFormFields = {
  TitleField,
  DescriptionField,
  StatusField,
  PriorityField,
  DateRangeField,
  TimeEstimationField,
  FolderSelector,
  RemindersField,
  TagsField,
  QuickSubtasksField,
  NotesField,
  CustomPropertiesField,
  TouchFieldWrapper
};