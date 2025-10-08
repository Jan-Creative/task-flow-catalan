import React from 'react';

interface ProviderLoadingFallbackProps {
  providerName?: string;
}

/**
 * PHASE 5: Enhanced loading fallback for providers
 * Shows which provider is loading to help with debugging
 */
export const ProviderLoadingFallback: React.FC<ProviderLoadingFallbackProps> = ({ 
  providerName = 'Provider' 
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-3 p-6">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <div className="absolute inset-0 animate-pulse rounded-full border-2 border-primary/20"></div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-foreground">Loading {providerName}</p>
          <p className="text-xs text-muted-foreground">Initializing application...</p>
        </div>
      </div>
    </div>
  );
};
