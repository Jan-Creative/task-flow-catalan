import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';
import { BackgroundConfigPopover } from './BackgroundConfigPopover';

export const FloatingBackgroundButton: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <BackgroundConfigPopover>
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg backdrop-blur-md bg-background/70 border border-border/30 hover:bg-background/90 transition-all duration-200 hover:scale-105"
          variant="outline"
        >
          <Palette className="h-6 w-6" />
          <span className="sr-only">Configurar fons</span>
        </Button>
      </BackgroundConfigPopover>
    </div>
  );
};