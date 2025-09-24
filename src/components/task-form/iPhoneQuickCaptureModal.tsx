/**
 * iPhone Quick Capture Modal - Simplified quick capture with liquid glass aesthetic
 */

import React, { useEffect } from 'react';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  X, Zap, Calendar, ChevronDown, ChevronUp,
  Flag, Sparkles, Check, Plus 
} from 'lucide-react';
import { useQuickCaptureForm, type QuickCaptureFormReturn } from '@/hooks/tasks/useQuickCaptureForm';
import { useStableCallback } from '@/hooks/performance';
import { useKeyboardShortcuts } from '@/contexts/KeyboardShortcutsContext';
import type { Tasca } from '@/types';

interface iPhoneQuickCaptureModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (task: {
    title: string;
    description?: string;
    status: string;
    priority: string;
    due_date?: string;
    folder_id?: string;
  }) => void;
  folders: Array<{ id: string; name: string }>;
  editingTask?: Tasca | null;
}

// Quick suggestion pills component
const QuickSuggestions: React.FC<{ 
  suggestions: string[]; 
  onSelect: (suggestion: string) => void;
  currentTitle: string;
}> = ({ suggestions, onSelect, currentTitle }) => {
  if (currentTitle.trim()) return null;
  
  return (
    <div className="flex flex-wrap gap-2 p-4">
      {suggestions.slice(0, 4).map((suggestion, index) => (
        <Button
          key={index}
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onSelect(suggestion)}
          className="h-8 px-3 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 backdrop-blur-sm text-xs transition-all duration-200"
        >
          {suggestion}
        </Button>
      ))}
    </div>
  );
};

// Priority selector component
const PrioritySelector: React.FC<{
  options: Array<{ value: string; label: string; color: string; emoji: string }>;
  currentValue: string;
  onSelect: (value: string) => void;
}> = ({ options, currentValue, onSelect }) => (
  <div className="grid grid-cols-2 gap-2">
    {options.map((option) => (
      <Button
        key={option.value}
        type="button"
        variant={currentValue === option.value ? "default" : "outline"}
        onClick={() => onSelect(option.value)}
        className={`h-10 flex items-center gap-2 justify-start px-3 rounded-xl text-left transition-all duration-200 ${
          currentValue === option.value
            ? 'bg-primary text-primary-foreground shadow-lg scale-105'
            : 'bg-white/10 border border-white/20 hover:bg-white/20 backdrop-blur-sm'
        }`}
      >
        <span className="text-sm">{option.emoji}</span>
        <span className="text-xs font-medium">{option.label}</span>
      </Button>
    ))}
  </div>
);

export const iPhoneQuickCaptureModal: React.FC<iPhoneQuickCaptureModalProps> = ({
  open,
  onClose,
  onSubmit,
  folders,
  editingTask = null
}) => {
  const { setEnabled } = useKeyboardShortcuts();

  // Initialize quick capture form
  const quickForm = useQuickCaptureForm({
    initialData: editingTask ? {
      title: editingTask.title || '',
      description: editingTask.description || '',
      status: editingTask.status || 'pendent',
      priority: editingTask.priority || 'mitjana',
      folder_id: editingTask.folder_id || '',
      due_date: editingTask.due_date || '',
      isToday: false,
    } : {},
    onSubmit: async (data) => {
      const { isToday, ...taskData } = data;
      try {
        onSubmit(taskData);
        handleClose();
      } catch (error) {
        console.error('[iPhoneQuickCaptureModal] Submit failed:', error);
      }
    },
    mode: editingTask ? 'edit' : 'create',
    folders
  });

  // Handle modal close with form reset
  const handleClose = useStableCallback(() => {
    quickForm.resetForm();
    onClose();
  });

  // Handle quick suggestion selection
  const handleSuggestionSelect = useStableCallback((suggestion: string) => {
    quickForm.setValue('title', suggestion);
  });

  // Handle keyboard shortcuts
  const handleKeyDown = useStableCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
    
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (quickForm.canQuickSubmit) {
        quickForm.quickSubmit();
      }
    }
  });

  // Disable global shortcuts while modal is open
  useEffect(() => {
    if (open) {
      setEnabled(false);
    } else {
      setEnabled(true);
    }
    return () => setEnabled(true);
  }, [open, setEnabled]);

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent 
        className="max-h-[85vh] p-0 rounded-t-3xl bg-background/95 backdrop-blur-2xl backdrop-saturate-150 border-t border-white/20 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Pull Handle */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-white/30 rounded-full" />
        </div>

        {/* iPhone Header */}
        <div className="flex items-center justify-between px-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {quickForm.isEditMode ? 'Editar Tasca' : 'Captura Ràpida'}
              </h2>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 rounded-lg hover:bg-white/15"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Main Content */}
        <form onSubmit={quickForm.handleSubmit} className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {/* Primary Section - Always Visible */}
            <div className="p-6 space-y-6">
              {/* Title Input */}
              <div className="space-y-2">
                <Input
                  ref={quickForm.titleRef}
                  placeholder="Què has de fer?"
                  value={quickForm.values.title}
                  onChange={(e) => quickForm.setValue('title', e.target.value)}
                  className="h-14 text-lg px-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm focus:bg-white/15 transition-all duration-200"
                  autoFocus
                />
                
                {quickForm.errors.title && (
                  <p className="text-sm text-red-400 px-2">{quickForm.errors.title}</p>
                )}
              </div>

              {/* Quick Actions Row */}
              <div className="flex items-center gap-3">
                {/* Today Toggle */}
                <Button
                  type="button"
                  variant={quickForm.values.isToday ? "default" : "outline"}
                  onClick={quickForm.toggleToday}
                  className={`h-12 px-4 rounded-xl transition-all duration-200 ${
                    quickForm.values.isToday 
                      ? 'bg-primary text-primary-foreground shadow-lg' 
                      : 'bg-white/10 border border-white/20 hover:bg-white/20'
                  }`}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm">Avui</span>
                </Button>

                {/* Expand Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => quickForm.setIsExpanded(!quickForm.isExpanded)}
                  className="h-12 px-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="text-sm">Opcions</span>
                  {quickForm.isExpanded ? (
                    <ChevronUp className="h-4 w-4 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-2" />
                  )}
                </Button>
              </div>

              {/* Quick Suggestions */}
              <QuickSuggestions
                suggestions={quickForm.quickSuggestions}
                onSelect={handleSuggestionSelect}
                currentTitle={quickForm.values.title}
              />
            </div>

            {/* Expanded Section - Optional */}
            {quickForm.isExpanded && (
              <div className="px-6 pb-6 space-y-6 border-t border-white/10">
                <div className="pt-6 space-y-4">
                  {/* Priority */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground/90">Prioritat</Label>
                    <PrioritySelector
                      options={quickForm.priorityOptions}
                      currentValue={quickForm.values.priority}
                      onSelect={(priority) => quickForm.setPriorityQuick(priority as any)}
                    />
                  </div>

                  {/* Folder */}
                  {folders.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-foreground/90">Carpeta</Label>
                      <Select
                        value={quickForm.values.folder_id}
                        onValueChange={(value) => quickForm.setValue('folder_id', value)}
                      >
                        <SelectTrigger className="h-12 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm">
                          <SelectValue placeholder="Selecciona una carpeta" />
                        </SelectTrigger>
                        <SelectContent>
                          {folders.map((folder) => (
                            <SelectItem key={folder.id} value={folder.id}>
                              {folder.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Description */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground/90">Descripció</Label>
                    <Textarea
                      placeholder="Afegeix detalls opcionals..."
                      value={quickForm.values.description}
                      onChange={(e) => quickForm.setValue('description', e.target.value)}
                      className="min-h-[80px] rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm resize-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* iPhone Footer */}
          <div className="p-6 bg-background/10 border-t border-white/10">
            <Button
              type="submit"
              disabled={!quickForm.canQuickSubmit || quickForm.isSubmitting}
              className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg shadow-lg hover:shadow-xl backdrop-blur-sm transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                {quickForm.isSubmitting ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Guardant...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    <span>Guardar Tasca</span>
                  </>
                )}
              </div>
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
};