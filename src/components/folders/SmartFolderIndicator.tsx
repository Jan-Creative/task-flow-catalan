import React from 'react';
import { Sparkles } from 'lucide-react';
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
        {isEnabled && (
          <div className="p-0.5 bg-blue-500 rounded-full">
            <Sparkles size={iconSizes[size]} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );
};