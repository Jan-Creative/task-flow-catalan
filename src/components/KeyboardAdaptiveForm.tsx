/**
 * KeyboardAdaptiveForm - Liquid Glass iOS 26 Design
 * Formulari minimalista amb efectes glass i swipe lateral
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useKeyboardHeight } from '@/hooks/device/useKeyboardHeight';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Calendar, Folder, Flag, Clock, Send, Star, Target, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SmoothPriorityBadge } from '@/components/ui/smooth-priority-badge';
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';

interface TaskFormOptions {
  isToday?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
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
    priority: 'medium',
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
      const timer = setTimeout(() => {
        inputRef.current?.focus();
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
        priority: 'medium',
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

  const setQuickDate = useCallback((type: 'today' | 'tomorrow' | 'thisWeek' | null) => {
    const date = new Date();
    let targetDate = '';
    let isToday = false;

    if (type === 'today') {
      isToday = true;
      targetDate = date.toISOString().split('T')[0];
    } else if (type === 'tomorrow') {
      date.setDate(date.getDate() + 1);
      targetDate = date.toISOString().split('T')[0];
    } else if (type === 'thisWeek') {
      date.setDate(date.getDate() + 7);
      targetDate = date.toISOString().split('T')[0];
    }

    setFormOptions(prev => ({ 
      ...prev, 
      due_date: targetDate,
      isToday: isToday
    }));
  }, []);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (title.trim()) {
      onSubmit?.(title.trim(), formOptions);
      onClose();
      
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

  // Calculate transform for panel sliding
  const getTransformX = () => {
    switch (currentPanel) {
      case 'left': return '0%';
      case 'center': return '-100%';
      case 'right': return '-200%';
      default: return '-100%';
    }
  };

  return (
    <>
      {/* Liquid Glass Overlay */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-500"
        onClick={onClose}
      />
      
      {/* Floating Liquid Glass Form */}
      <div 
        className="fixed left-4 right-4 z-50 transition-all duration-500 ease-out"
        style={{ 
          bottom: `${bottomOffset}px`,
          transform: open ? 'translateY(0) scale(1)' : 'translateY(100%) scale(0.95)',
        }}
        {...touchHandlers}
      >
        {/* Liquid Glass Card Container */}
        <div 
          className="backdrop-blur-glass rounded-3xl shadow-glass border border-white/10 overflow-hidden"
          style={{
            background: 'var(--gradient-glass)',
            transition: 'var(--transition-smooth)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}
        >
          {/* Minimal Panel Indicators */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            {['left', 'center', 'right'].map((panel, index) => (
              <div
                key={panel}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-500",
                  currentPanel === panel
                    ? 'bg-primary/80 scale-125 shadow-lg'
                    : 'bg-white/25 scale-100'
                )}
                style={{
                  boxShadow: currentPanel === panel ? '0 0 12px rgba(0,150,150,0.4)' : 'none'
                }}
              />
            ))}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/60 hover:text-white/90 hover:bg-white/20 transition-all duration-300"
          >
            <X className="w-4 h-4" />
          </button>
          
          {/* Sliding Panels Container */}
          <div className="relative w-full overflow-hidden min-h-[180px]">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(${getTransformX()})`,
                width: '300%'
              }}
            >
              {/* Left Panel - Priority & Folder */}
              <div className="w-1/3 flex-shrink-0 px-6 py-8">
                <div className="space-y-6 pt-6">
                  {/* Priority Selector */}
                  <div className="space-y-3">
                    <p className="text-xs text-white/60 text-center font-medium">Prioritat</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'urgent', icon: Flag, color: 'text-red-400' },
                        { value: 'high', icon: Target, color: 'text-orange-400' },
                        { value: 'medium', icon: Clock, color: 'text-yellow-400' },
                        { value: 'low', icon: Sparkles, color: 'text-blue-400' }
                      ].map((priority) => {
                        const IconComponent = priority.icon;
                        const isSelected = formOptions.priority === priority.value;
                        return (
                          <Button
                            key={priority.value}
                            variant="ghost"
                            size="sm"
                            onClick={() => setPriority(priority.value as TaskFormOptions['priority'])}
                            className={cn(
                              "h-12 text-xs backdrop-blur-sm transition-all duration-300 rounded-xl",
                              isSelected 
                                ? 'bg-primary/20 border border-primary/30 text-primary-foreground shadow-lg' 
                                : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                            )}
                            style={{
                              boxShadow: isSelected ? '0 0 16px rgba(0,150,150,0.3)' : 'none'
                            }}
                          >
                            <IconComponent className={cn("h-3 w-3 mr-1", priority.color)} />
                            {priority.value.charAt(0).toUpperCase() + priority.value.slice(1)}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Folder Selector */}
                  <div className="space-y-3">
                    <p className="text-xs text-white/60 text-center font-medium">Carpeta</p>
                    <Button
                      variant="ghost"
                      className="w-full h-12 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 rounded-xl"
                    >
                      <Folder className="h-4 w-4 mr-2" />
                      Inbox
                    </Button>
                  </div>
                </div>
              </div>

              {/* Center Panel - Main Input */}
              <div className="w-1/3 flex-shrink-0 px-6 py-8">
                <div className="space-y-6 pt-6">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Escriu la tasca..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="text-lg font-medium bg-white/5 border border-white/20 focus:border-primary/40 text-white placeholder:text-white/40 backdrop-blur-sm transition-all duration-300 rounded-2xl h-14 px-4 focus-visible:ring-0 focus-visible:ring-offset-0"
                    style={{
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                    }}
                    autoFocus
                  />

                  {/* Current configuration preview with Liquid Glass badges */}
                  {(formOptions.isToday || formOptions.priority !== 'medium' || formOptions.due_date) && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {formOptions.isToday && (
                        <div className="px-3 py-1 bg-primary/20 border border-primary/30 text-primary-foreground backdrop-blur-sm rounded-full text-xs font-medium">
                          <Star className="h-3 w-3 mr-1 inline" />
                          Avui
                        </div>
                      )}
                      {formOptions.priority !== 'medium' && (
                        <SmoothPriorityBadge priority={formOptions.priority || 'medium'} size="sm" />
                      )}
                      {formOptions.due_date && !formOptions.isToday && (
                        <div className="px-3 py-1 bg-white/10 border border-white/20 text-white/80 backdrop-blur-sm rounded-full text-xs font-medium">
                          <Calendar className="h-3 w-3 mr-1 inline" />
                          {format(new Date(formOptions.due_date), 'd MMM', { locale: ca })}
                        </div>
                      )}
                    </div>
                  )}

                  <Button 
                    onClick={handleSubmit} 
                    className="w-full h-12 font-medium bg-primary/20 border border-primary/30 text-primary-foreground hover:bg-primary/30 backdrop-blur-sm transition-all duration-300 rounded-2xl"
                    disabled={!title.trim()}
                    style={{
                      boxShadow: '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                    }}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Afegir Tasca
                  </Button>
                </div>
              </div>

              {/* Right Panel - Quick Dates & Today */}
              <div className="w-1/3 flex-shrink-0 px-6 py-8">
                <div className="space-y-6 pt-6">
                  {/* Today Toggle - Prominent */}
                  <div className="text-center">
                    <Button
                      variant="ghost"
                      onClick={toggleToday}
                      className={cn(
                        "w-full h-14 text-base font-medium transition-all duration-300 rounded-2xl backdrop-blur-sm",
                        formOptions.isToday 
                          ? 'bg-primary/20 border border-primary/30 text-primary-foreground shadow-lg' 
                          : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                      )}
                      style={{
                        boxShadow: formOptions.isToday ? '0 0 20px rgba(0,150,150,0.3)' : 'none'
                      }}
                    >
                      <Star className={cn("h-5 w-5 mr-2", formOptions.isToday ? 'text-primary' : 'text-white/60')} />
                      {formOptions.isToday ? "És per avui" : "Marcar avui"}
                    </Button>
                  </div>
                  
                  {/* Quick Date Buttons */}
                  <div className="space-y-3">
                    <p className="text-xs text-white/60 text-center font-medium">Dates ràpides</p>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { label: 'Avui', onClick: () => setQuickDate('today') },
                        { label: 'Demà', onClick: () => setQuickDate('tomorrow') },
                        { label: 'Setmana', onClick: () => setQuickDate('thisWeek') }
                      ].map((item, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          onClick={item.onClick}
                          className="h-10 justify-start bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 rounded-xl"
                        >
                          <Calendar className="h-3 w-3 mr-2" />
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};