import React from 'react';
import { Brain, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartFolderIndicatorProps {
  isSmartFolder: boolean;
  isEnabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SmartFolderIndicator: React.FC<SmartFolderIndicatorProps> = ({
  isSmartFolder,
  isEnabled = true,
  size = 'md',
  className
}) => {
  if (!isSmartFolder) return null;

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  const iconSizes = {
    sm: 6,
    md: 8,
    lg: 10
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="relative">
        <Brain className={cn(sizeClasses[size], "text-blue-500")} />
        {isEnabled && (
          <div className="absolute -top-0.5 -right-0.5 p-0.5 bg-blue-500 rounded-full">
            <Sparkles size={iconSizes[size]} className="text-white" />
          </div>
        )}
      </div>
      {size !== 'sm' && (
        <span className="text-xs text-blue-600 dark:text-blue-400">
          Intel·ligent
        </span>
      )}
    </div>
  );
};