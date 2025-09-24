/**
 * iPhone Task Form Modal - Quick capture optimized with liquid glass aesthetic
 */

import React, { useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  X, ArrowRight, ArrowLeft, Zap, Calendar, 
  FolderOpen, Flag, Sparkles, Check 
} from 'lucide-react';
import { useiPhoneTaskForm, type iPhoneTaskFormReturn } from '@/hooks/tasks/useiPhoneTaskForm';
import { useStableCallback } from '@/hooks/performance';
import { useKeyboardShortcuts } from '@/contexts/KeyboardShortcutsContext';
import type { Tasca } from '@/types';

interface iPhoneTaskFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (task: {
    title: string;
    description?: string;
    status: string;
    priority: string;
    due_date?: string;
    folder_id?: string;
  }, customProperties?: Array<{
    propertyId: string;
    optionId: string;
  }>) => void;
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
          className="h-8 px-3 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 backdrop-blur-sm text-xs"
        >
          {suggestion}
        </Button>
      ))}
    </div>
  );
};

// Step indicator component
const StepIndicator: React.FC<{
  currentStep: 'title' | 'quickActions' | 'details';
  totalSteps: number;
}> = ({ currentStep, totalSteps }) => {
  const stepIndex = { title: 0, quickActions: 1, details: 2 }[currentStep];
  
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`h-2 w-8 rounded-full transition-all duration-300 ${
            i <= stepIndex 
              ? 'bg-primary shadow-lg shadow-primary/50' 
              : 'bg-white/20'
          }`}
        />
      ))}
    </div>
  );
};

// Priority quick selector
const PriorityQuickSelector: React.FC<{
  options: Array<{ value: string; label: string; color: string; emoji: string }>;
  currentValue: string;
  onSelect: (value: string) => void;
}> = ({ options, currentValue, onSelect }) => (
  <div className="space-y-3">
    <Label className="text-sm font-medium text-foreground/90">Prioritat</Label>
    <div className="grid grid-cols-2 gap-3">
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant={currentValue === option.value ? "default" : "outline"}
          onClick={() => onSelect(option.value)}
          className={`h-12 flex items-center gap-3 justify-start px-4 rounded-xl text-left transition-all duration-200 ${
            currentValue === option.value
              ? 'bg-primary text-primary-foreground shadow-lg scale-105'
              : 'bg-white/10 border border-white/20 hover:bg-white/20 backdrop-blur-sm'
          }`}
        >
          <span className="text-lg">{option.emoji}</span>
          <span className="font-medium">{option.label}</span>
        </Button>
      ))}
    </div>
  </div>
);

export const iPhoneTaskFormModal: React.FC<iPhoneTaskFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  folders,
  editingTask = null
}) => {
  const { setEnabled } = useKeyboardShortcuts();

  // Initialize iPhone form
  const iPhoneForm = useiPhoneTaskForm({
    initialData: editingTask ? {
      title: editingTask.title || '',
      description: editingTask.description || '',
      status: editingTask.status || 'pendent',
      priority: editingTask.priority || 'mitjana',
      folder_id: editingTask.folder_id || '',
      due_date: editingTask.due_date || '',
      customProperties: [],
      isToday: false,
    } : {},
    onSubmit: async (data) => {
      const { customProperties, ...taskData } = data;
      try {
        onSubmit(taskData, customProperties);
        handleClose();
      } catch (error) {
        console.error('[iPhoneTaskFormModal] Submit failed:', error);
      }
    },
    mode: editingTask ? 'edit' : 'create',
    folders
  });

  // Handle modal close with form reset
  const handleClose = useStableCallback(() => {
    iPhoneForm.resetForm();
    onClose();
  });

  // Handle quick suggestion selection
  const handleSuggestionSelect = useStableCallback((suggestion: string) => {
    iPhoneForm.setValue('title', suggestion);
    setTimeout(() => iPhoneForm.nextStep(), 300);
  });

  // Handle swipe gestures (simplified for web)
  const handleKeyDown = useStableCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (iPhoneForm.uiState.canSubmit && iPhoneForm.uiState.currentStep !== 'title') {
        iPhoneForm.handleSubmit();
      } else if (iPhoneForm.values.title.trim()) {
        iPhoneForm.nextStep();
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

  // Render step content
  const renderStepContent = () => {
    switch (iPhoneForm.uiState.currentStep) {
      case 'title':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3 px-6">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {iPhoneForm.isEditMode ? 'Editar Tasca' : 'Nova Tasca'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {iPhoneForm.isEditMode ? 'Modifica el títol de la tasca' : 'Escriu el títol de la tasca per començar'}
              </p>
            </div>

            <div className="px-6 space-y-4">
              <Input
                ref={iPhoneForm.titleRef}
                placeholder="Què has de fer?"
                value={iPhoneForm.values.title}
                onChange={(e) => iPhoneForm.setValue('title', e.target.value)}
                className="h-14 text-lg px-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm focus:bg-white/15 transition-all duration-200"
                autoFocus
              />
              
              {iPhoneForm.errors.title && (
                <p className="text-sm text-red-400 px-2">{iPhoneForm.errors.title}</p>
              )}
            </div>

            <QuickSuggestions
              suggestions={iPhoneForm.quickSuggestions}
              onSelect={handleSuggestionSelect}
              currentTitle={iPhoneForm.values.title}
            />
          </div>
        );

      case 'quickActions':
        return (
          <div className="space-y-6 px-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Configuració Ràpida</h3>
              <p className="text-sm text-muted-foreground">Afegeix detalls opcionals o salta per guardar</p>
            </div>

            <div className="space-y-6">
              {/* Today toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium text-foreground">És per avui?</Label>
                  <p className="text-sm text-muted-foreground">Programa per avui</p>
                </div>
                <Button
                  type="button"
                  variant={iPhoneForm.values.isToday ? "default" : "outline"}
                  onClick={iPhoneForm.toggleToday}
                  className={`h-12 w-12 rounded-xl transition-all duration-200 ${
                    iPhoneForm.values.isToday 
                      ? 'bg-primary text-primary-foreground shadow-lg' 
                      : 'bg-white/10 border border-white/20 hover:bg-white/20'
                  }`}
                >
                  <Calendar className="h-5 w-5" />
                </Button>
              </div>

              {/* Priority selector */}
              <PriorityQuickSelector
                options={iPhoneForm.priorityOptions}
                currentValue={iPhoneForm.values.priority}
                onSelect={(priority) => iPhoneForm.setPriorityQuick(priority as any)}
              />

              {/* Folder selector */}
              {folders.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground/90">Carpeta</Label>
                  <Select
                    value={iPhoneForm.values.folder_id}
                    onValueChange={(value) => iPhoneForm.setValue('folder_id', value)}
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
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="space-y-6 px-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Detalls Adicionals</h3>
              <p className="text-sm text-muted-foreground">Afegeix més informació si cal</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-foreground/90">Descripció</Label>
                <Textarea
                  placeholder="Afegeix una descripció..."
                  value={iPhoneForm.values.description}
                  onChange={(e) => iPhoneForm.setValue('description', e.target.value)}
                  className="min-h-[100px] rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm resize-none"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="h-full w-full max-w-none max-h-none p-0 m-0 rounded-none bg-background/3 backdrop-blur-2xl backdrop-saturate-150 backdrop-brightness-110 border-0 overflow-hidden"
        overlayClassName="bg-black/20 backdrop-blur-sm"
        onKeyDown={handleKeyDown}
      >
        {/* iPhone Header */}
        <div className="flex items-center justify-between p-6 bg-background/10 backdrop-blur-lg border-b border-white/10">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={iPhoneForm.previousStep}
            disabled={iPhoneForm.uiState.currentStep === 'title'}
            className="h-10 w-10 rounded-xl hover:bg-white/15"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <StepIndicator 
            currentStep={iPhoneForm.uiState.currentStep} 
            totalSteps={3} 
          />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-10 w-10 rounded-xl hover:bg-white/15"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Content */}
        <form onSubmit={iPhoneForm.handleSubmit} className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto pb-6">
            {renderStepContent()}
          </div>

          {/* iPhone Footer */}
          <div className="p-6 bg-background/20 backdrop-blur-lg border-t border-white/10 safe-area-inset-bottom">
            <div className="flex gap-4">
              {iPhoneForm.uiState.currentStep === 'title' ? (
                <Button
                  type="button"
                  onClick={iPhoneForm.nextStep}
                  disabled={!iPhoneForm.values.title.trim()}
                  className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg shadow-lg hover:shadow-xl backdrop-blur-sm transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span>Continuar</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </Button>
              ) : (
                <>
                  {iPhoneForm.uiState.currentStep === 'quickActions' && (
                    <Button
                      type="submit"
                      disabled={!iPhoneForm.uiState.canSubmit || iPhoneForm.isSubmitting}
                      className="flex-1 h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl backdrop-blur-sm transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5" />
                        <span>Guardar Ràpid</span>
                      </div>
                    </Button>
                  )}
                  
                  <Button
                    type={iPhoneForm.uiState.currentStep === 'details' ? 'submit' : 'button'}
                    onClick={iPhoneForm.uiState.currentStep === 'quickActions' ? iPhoneForm.nextStep : undefined}
                    disabled={iPhoneForm.uiState.currentStep === 'details' && (!iPhoneForm.uiState.canSubmit || iPhoneForm.isSubmitting)}
                    className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg shadow-lg hover:shadow-xl backdrop-blur-sm transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      {iPhoneForm.uiState.currentStep === 'details' ? (
                        <>
                          <Check className="h-5 w-5" />
                          <span>{iPhoneForm.isSubmitting ? 'Guardant...' : 'Guardar Tasca'}</span>
                        </>
                      ) : (
                        <>
                          <span>Més Detalls</span>
                          <ArrowRight className="h-5 w-5" />
                        </>
                      )}
                    </div>
                  </Button>
                </>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};