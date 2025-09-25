/**
 * SimpleTaskForm - Formulari ultra bàsic per iPhone
 * Sistema simplificat i net
 */

import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface SimpleTaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (title: string) => void;
}

export const SimpleTaskForm: React.FC<SimpleTaskFormProps> = ({
  open,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Auto-focus simple
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [open]);

  // Reset form quan es tanca
  useEffect(() => {
    if (!open) {
      setTitle('');
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit?.(title.trim());
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && title.trim()) {
      handleSubmit(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="w-full max-w-sm mx-auto p-0 border-0 bg-transparent shadow-none fixed bottom-8 left-4 right-4 top-auto translate-x-0 translate-y-0"
        onKeyDown={handleKeyDown}
      >
        <div className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
          {/* Header minimal */}
          <div className="px-4 py-3 border-b border-border/20">
            <h3 className="text-sm font-medium text-foreground/80">
              Nova tasca
            </h3>
          </div>
          
          {/* Form content */}
          <form onSubmit={handleSubmit} className="p-4">
            <Input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Escriu el títol de la tasca..."
              className="w-full text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60 text-foreground"
              autoFocus
              autoComplete="off"
              autoCapitalize="sentences"
            />
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};