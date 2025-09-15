/**
 * Optimized Folder Header Component
 * Extracted from FolderDetailPage for better maintainability
 */

import React, { memo } from 'react';
import { ArrowLeft, FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FolderCustomizationPopover } from "@/components/folders/FolderCustomizationPopover";
import { getIconByName } from "@/lib/iconLibrary";
import type { Carpeta } from '@/types';

interface FolderHeaderProps {
  folder: Carpeta;
  taskCount: number;
  onBack: () => void;
  onCreate: () => void;
  onUpdate: (updates: any) => Promise<void>;
}

export const FolderHeader = memo(({
  folder,
  taskCount,
  onBack,
  onCreate,
  onUpdate
}: FolderHeaderProps) => {
  return (
    <div className="mb-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="mb-4 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Tornar a Carpetes
      </Button>

      <div className="flex items-center gap-4 mb-4">
        <FolderCustomizationPopover
          folderId={folder.id}
          currentIcon={folder.icon}
          currentColor={folder.color}
          onUpdate={onUpdate}
        >
          <div 
            className={`flex-shrink-0 p-3 rounded-xl backdrop-blur-sm transition-all duration-200 ${
              folder.is_system ? '' : 'cursor-pointer hover:scale-105'
            }`}
            style={{ 
              backgroundColor: `${folder.color}20`,
              border: `1px solid ${folder.color}40`
            }}
          >
            {(() => {
              if (folder.icon) {
                const IconComponent = getIconByName(folder.icon)?.icon;
                if (IconComponent) {
                  return <IconComponent className="h-6 w-6" style={{ color: folder.color }} />;
                }
              }
              return <FolderOpen className="h-6 w-6" style={{ color: folder.color }} />;
            })()}
          </div>
        </FolderCustomizationPopover>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {folder.name}
          </h1>
          <p className="text-muted-foreground">
            {taskCount} {taskCount === 1 ? 'tasca' : 'tasques'}
          </p>
        </div>

        <Button
          onClick={onCreate}
          className="bg-gradient-primary hover:scale-105 transition-bounce"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Tasca
        </Button>
      </div>
    </div>
  );
});

FolderHeader.displayName = 'FolderHeader';