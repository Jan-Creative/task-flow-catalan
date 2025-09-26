/**
 * KeyboardAdaptiveForm - Formulari que s'adapta al teclat iOS
 * Posicionament dinàmic per sobre del teclat amb targeta elegant
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useKeyboardHeight } from '@/hooks/device/useKeyboardHeight';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Check, Calendar, Folder, Flag, Clock, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskFormOptions {
  isToday?: boolean;
  priority?: 'baixa' | 'mitjana' | 'alta' | 'urgent';
  folder_id?: string;
  due_date?: string;
}

interface KeyboardAdaptiveFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (title: string, options?: TaskFormOptions) => void;
}

export const KeyboardAdaptiveForm: React.FC<KeyboardAdaptiveFormProps> = ({
  open,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [currentPanel, setCurrentPanel] = useState<'left' | 'center' | 'right'>('center');
  const [formOptions, setFormOptions] = useState<TaskFormOptions>({
    isToday: false,
    priority: 'mitjana',
    folder_id: '',
    due_date: ''
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const { height: keyboardHeight, isVisible: keyboardVisible } = useKeyboardHeight();
  
  // Posicionament dinàmic basat en l'altura del teclat
  const bottomOffset = keyboardVisible ? keyboardHeight + 20 : 40;
  
  // Auto-focus quan s'obre el formulari
  useEffect(() => {
    if (open && inputRef.current) {
      // Esperar que l'animació es completi abans d'aplicar focus
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        
        // Vibració hàptica lleu si està disponible
        if ('vibrate' in navigator) {
          navigator.vibrate(10);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Reset form quan es tanca
  useEffect(() => {
    if (!open) {
      setTitle('');
      setCurrentPanel('center');
      setFormOptions({
        isToday: false,
        priority: 'mitjana',
        folder_id: '',
        due_date: ''
      });
    }
  }, [open]);

  // Swipe gestures configuration
  const { swipeState, touchHandlers } = useSwipeGestures({
    threshold: 50,
    maxDistance: 300,
    onSwipeLeft: () => {
      if (currentPanel === 'center') setCurrentPanel('right');
      else if (currentPanel === 'left') setCurrentPanel('center');
    },
    onSwipeRight: () => {
      if (currentPanel === 'center') setCurrentPanel('left');
      else if (currentPanel === 'right') setCurrentPanel('center');
    },
    onSwipeEnd: (direction, distance) => {
      if (distance > 150) {
        if (direction === 'left' && currentPanel !== 'right') {
          setCurrentPanel(currentPanel === 'left' ? 'center' : 'right');
        } else if (direction === 'right' && currentPanel !== 'left') {
          setCurrentPanel(currentPanel === 'right' ? 'center' : 'left');
        }
      }
    }
  });

  // Quick action functions
  const toggleToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setFormOptions(prev => ({
      ...prev,
      isToday: !prev.isToday,
      due_date: !prev.isToday ? today : ''
    }));
  }, []);

  const setPriority = useCallback((priority: TaskFormOptions['priority']) => {
    setFormOptions(prev => ({ ...prev, priority }));
  }, []);

  const setQuickDate = useCallback((days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setFormOptions(prev => ({ 
      ...prev, 
      due_date: date.toISOString().split('T')[0],
      isToday: days === 0
    }));
  }, []);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (title.trim()) {
      onSubmit?.(title.trim(), formOptions);
      onClose();
      
      // Vibració de confirmació
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 50]);
      }
    }
  }, [title, formOptions, onSubmit, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && title.trim()) {
      handleSubmit(e);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay amb blur */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Formulari adaptatiu amb swipe panels */}
      <div 
        className="fixed left-4 right-4 z-50 transition-all duration-300 ease-out"
        style={{ 
          bottom: `${bottomOffset}px`,
          transform: open ? 'translateY(0)' : 'translateY(100%)',
        }}
        {...touchHandlers}
      >
        {/* Targeta elegant amb panells lliscants */}
        <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header amb indicadors de panells */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Nova tasca</span>
              
              {/* Indicadors de panells */}
              <div className="flex gap-1">
                <div className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  currentPanel === 'left' ? "bg-primary" : "bg-muted-foreground/30"
                )} />
                <div className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  currentPanel === 'center' ? "bg-primary" : "bg-muted-foreground/30"
                )} />
                <div className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  currentPanel === 'right' ? "bg-primary" : "bg-muted-foreground/30"
                )} />
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-full transition-colors"
              aria-label="Tancar"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          
          {/* Contenidor de panells lliscants */}
          <div className="relative w-full overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-out"
              style={{
                transform: `translateX(${currentPanel === 'left' ? '0%' : currentPanel === 'center' ? '-100%' : '-200%'})`
              }}
            >
              {/* Panell Esquerre - Accions Ràpides */}
              <div className="w-full flex-shrink-0 p-4 space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  Accions Ràpides
                </h4>
                
                {/* Toggle "És per avui" */}
                <Button
                  variant={formOptions.isToday ? "default" : "outline"}
                  size="sm"
                  onClick={toggleToday}
                  className="w-full justify-start gap-2"
                >
                  <Clock className="h-4 w-4" />
                  {formOptions.isToday ? '✅ És per avui' : 'Marcar per avui'}
                </Button>
                
                {/* Selector de prioritat ràpid */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Prioritat:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'baixa', label: 'Baixa', emoji: '🔵' },
                      { value: 'mitjana', label: 'Mitjana', emoji: '🟡' },
                      { value: 'alta', label: 'Alta', emoji: '🔴' },
                      { value: 'urgent', label: 'Urgent', emoji: '🚨' }
                    ].map((priority) => (
                      <Button
                        key={priority.value}
                        variant={formOptions.priority === priority.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPriority(priority.value as TaskFormOptions['priority'])}
                        className="text-xs"
                      >
                        {priority.emoji} {priority.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Panell Central - Camp Principal */}
              <div className="w-full flex-shrink-0 p-4 space-y-4">
                {/* Camp de títol */}
                <div className="flex items-center space-x-3">
                  <Input
                    ref={inputRef}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Escriu el títol de la tasca..."
                    className="flex-1 text-base font-medium border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                    autoComplete="off"
                    autoCapitalize="sentences"
                    inputMode="text"
                    enterKeyHint="done"
                    onKeyDown={handleKeyDown}
                  />
                  
                  {title.trim() && (
                    <Button
                      onClick={handleSubmit}
                      size="sm"
                      className="gap-2 shrink-0"
                    >
                      <Send className="h-4 w-4" />
                      Crear
                    </Button>
                  )}
                </div>

                {/* Indicador de configuració actual */}
                {(formOptions.isToday || formOptions.priority !== 'mitjana' || formOptions.due_date) && (
                  <div className="flex flex-wrap gap-2 text-xs">
                    {formOptions.isToday && (
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">
                        📅 Avui
                      </span>
                    )}
                    {formOptions.priority !== 'mitjana' && (
                      <span className="px-2 py-1 bg-orange-500/10 text-orange-600 rounded-full">
                        🚩 {formOptions.priority?.charAt(0).toUpperCase() + formOptions.priority?.slice(1)}
                      </span>
                    )}
                    {formOptions.due_date && !formOptions.isToday && (
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-600 rounded-full">
                        📅 {new Date(formOptions.due_date).toLocaleDateString('ca-ES')}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Panell Dret - Dates i Carpetes */}
              <div className="w-full flex-shrink-0 p-4 space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Planificació
                </h4>
                
                {/* Dates ràpides */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Data límit:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={formOptions.isToday ? "default" : "outline"}
                      size="sm"
                      onClick={() => setQuickDate(0)}
                      className="text-xs"
                    >
                      📅 Avui
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickDate(1)}
                      className="text-xs"
                    >
                      📅 Demà
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickDate(7)}
                      className="text-xs"
                    >
                      📅 Setmana
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFormOptions(prev => ({ ...prev, due_date: '', isToday: false }))}
                      className="text-xs"
                    >
                      🚫 Sense data
                    </Button>
                  </div>
                </div>

                {/* Carpetes ràpides (placeholder) */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Folder className="h-3 w-3" />
                    Carpeta:
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    disabled
                  >
                    📁 Safata d'entrada
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="px-4 py-2 bg-primary/10 border-t border-border/50">
              <div className="text-xs text-muted-foreground text-center">
                Teclat: {keyboardHeight}px | Posició: {bottomOffset}px | Panell: {currentPanel}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};