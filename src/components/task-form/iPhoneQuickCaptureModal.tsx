/**
 * iPhone Quick Capture Modal - Simplified quick capture with liquid glass aesthetic
 */

import React, { useEffect, useState } from 'react';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  X, Zap, Calendar, ChevronDown, ChevronUp,
  Flag, Sparkles, Check, Plus, MoreHorizontal 
} from 'lucide-react';
import { useQuickCaptureForm, type QuickCaptureFormReturn } from '@/hooks/tasks/useQuickCaptureForm';
import { useStableCallback } from '@/hooks/performance';
import { useKeyboardShortcuts } from '@/contexts/KeyboardShortcutsContext';
import { useKeyboardHeight, useSwipeGestures } from '@/hooks/device';
import { cn } from '@/lib/utils';
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
  const { height: keyboardHeight, isVisible: isKeyboardVisible } = useKeyboardHeight();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

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

  // Swipe gestures
  const swipeGestures = useSwipeGestures({
    onSwipeUp: () => {
      if (!isExpanded) {
        setIsExpanded(true);
        setShowMoreOptions(true);
      }
    },
    onSwipeDown: () => {
      if (isExpanded) {
        setIsExpanded(false);
        setShowMoreOptions(false);
      }
    },
    onSwipeDownForce: () => {
      handleClose();
    },
    threshold: 30,
    velocityThreshold: 0.3,
  });

  // Handle modal close with form reset
  const handleClose = useStableCallback(() => {
    quickForm.resetForm();
    setIsExpanded(false);
    setShowMoreOptions(false);
    onClose();
  });

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    setShowMoreOptions(!showMoreOptions);
  };

  // Auto-expand when description field gets focus
  const handleDescriptionFocus = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      setShowMoreOptions(true);
    }
  };

  // Handle quick suggestion selection
  const handleSuggestionSelect = useStableCallback((suggestion: string) => {
    quickForm.setValue('title', suggestion);
    quickForm.titleRef.current?.focus();
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

  // Calculate positioning based on keyboard
  const cardBottomOffset = isKeyboardVisible ? keyboardHeight + 16 : 24;
  const maxCardHeight = isKeyboardVisible 
    ? `calc(100vh - ${keyboardHeight + 80}px)` 
    : isExpanded ? '60vh' : 'auto';

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
        className="fixed left-4 right-4 mx-auto max-w-sm p-0 rounded-2xl bg-background/95 backdrop-blur-2xl backdrop-saturate-150 border border-white/20 shadow-2xl overflow-hidden transition-all duration-300 ease-out"
        style={{
          bottom: `${cardBottomOffset}px`,
          maxHeight: maxCardHeight,
          transform: `translateY(${swipeGestures.dragOffset}px)`,
          transition: swipeGestures.isDragging ? 'none' : 'transform 0.3s ease-out, bottom 0.3s ease-out, max-height 0.3s ease-out',
        }}
        onKeyDown={handleKeyDown}
        {...swipeGestures.gestureHandlers}
      >
        {/* Swipe Indicator */}
        <div className="flex justify-center py-2">
          <div 
            className={cn(
              "w-8 h-1 rounded-full transition-all duration-200",
              isExpanded ? "bg-primary/50" : "bg-white/30"
            )} 
          />
        </div>

        {/* Compact Header - Always Visible */}
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-6 w-6 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground/80">
              {quickForm.isEditMode ? 'Editar Tasca' : 'Captura Ràpida'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpanded}
              className="ml-auto h-6 w-6 p-0 rounded-lg bg-white/10 hover:bg-white/20 text-foreground/60"
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <MoreHorizontal className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        <form onSubmit={quickForm.handleSubmit} className="flex flex-col">
          {/* Compact Mode - Title + Today Toggle */}
          <div className="px-4 pb-3">
            {/* Quick Suggestions */}
            {!quickForm.values.title && !isExpanded && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {quickForm.quickSuggestions.slice(0, 2).map((suggestion, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="h-6 px-2 text-xs rounded-full bg-white/10 border-white/20 hover:bg-white/20"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Title Input */}
            <div className="space-y-1">
              <Input
                ref={quickForm.titleRef}
                placeholder="Què has de fer?"
                value={quickForm.values.title}
                onChange={(e) => quickForm.setValue('title', e.target.value)}
                className="h-10 text-sm bg-white/10 border-white/20 text-foreground placeholder:text-foreground/60 focus:bg-white/20 focus:border-primary/50"
                autoFocus
              />
              {quickForm.errors.title && (
                <p className="text-xs text-red-400">{quickForm.errors.title}</p>
              )}
            </div>

            {/* Today Toggle - Always Visible */}
            <div className="flex items-center justify-between mt-3 p-2 rounded-lg bg-white/5">
              <span className="text-xs font-medium text-foreground/80">Afegir a Avui</span>
              <Switch
                checked={quickForm.values.isToday}
                onCheckedChange={quickForm.toggleToday}
                className="data-[state=checked]:bg-primary scale-75"
              />
            </div>
          </div>

          {/* Expanded Options */}
          {isExpanded && showMoreOptions && (
            <div className="px-4 pb-4 space-y-3 animate-accordion-down overflow-y-auto max-h-48">
              {/* More Suggestions when Expanded */}
              {!quickForm.values.title && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {quickForm.quickSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className="h-6 px-2 text-xs rounded-full bg-white/10 border-white/20 hover:bg-white/20"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Priority Selection */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground/70">Prioritat</label>
                <PrioritySelector
                  options={quickForm.priorityOptions}
                  currentValue={quickForm.values.priority}
                  onSelect={(priority) => quickForm.setPriorityQuick(priority as any)}
                />
              </div>

              {/* Folder Selection */}
              {folders.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground/70">Carpeta</label>
                  <Select
                    value={quickForm.values.folder_id}
                    onValueChange={(value) => quickForm.setValue('folder_id', value)}
                  >
                    <SelectTrigger className="h-8 bg-white/10 border-white/20 text-foreground text-sm">
                      <SelectValue placeholder="Escull carpeta" />
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
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground/70">Descripció</label>
                <Textarea
                  placeholder="Afegeix detalls..."
                  value={quickForm.values.description}
                  onChange={(e) => quickForm.setValue('description', e.target.value)}
                  onFocus={handleDescriptionFocus}
                  className="min-h-[60px] text-sm bg-white/10 border-white/20 text-foreground placeholder:text-foreground/60 focus:bg-white/20 focus:border-primary/50 resize-none"
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="px-4 pb-4 pt-2 border-t border-white/10">
            <Button
              type="submit"
              disabled={!quickForm.canQuickSubmit || quickForm.isSubmitting}
              className={cn(
                "w-full h-10 text-sm font-medium rounded-xl transition-all duration-200",
                quickForm.canQuickSubmit
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-white/10 text-foreground/50 cursor-not-allowed"
              )}
            >
              {quickForm.isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardant...
                </div>
              ) : (
                quickForm.isEditMode ? 'Actualitzar' : 'Guardar Tasca'
              )}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
};