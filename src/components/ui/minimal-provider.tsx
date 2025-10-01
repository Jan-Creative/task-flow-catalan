import React from 'react';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

interface MinimalProviderProps {
  children: React.ReactNode;
}

// Minimal, safe context provider used for debug/safe mode rendering
export const MinimalProvider = ({ children }: MinimalProviderProps) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <Toaster />
        {children}
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default MinimalProvider;
