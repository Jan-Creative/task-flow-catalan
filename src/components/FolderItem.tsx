import { FolderOpen, MoreVertical, Edit2, Trash2, Brain, Sparkles } from "lucide-react";
import { getIconByName } from "@/lib/iconLibrary";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SwipeableItem } from "@/components/SwipeableItem";

interface Folder {
  id: string;
  name: string;
  color: string;
  is_system?: boolean;
  icon?: string;
  is_smart?: boolean;
  smart_rules?: {
    keywords: string[];
    enabled: boolean;
  };
}

interface FolderItemProps {
  folder: Folder;
  taskCount: number;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isInbox?: boolean;
}

export function FolderItem({ 
  folder, 
  taskCount, 
  onSelect, 
  onEdit, 
  onDelete, 
  isInbox = false 
}: FolderItemProps) {
  const navigate = useNavigate();

  const handleFolderClick = () => {
    if (isInbox) {
      navigate('/folder/inbox');
    } else {
      navigate(`/folder/${folder.id}`);
    }
    onSelect();
  };
  return (
    <SwipeableItem
      onEdit={!isInbox ? onEdit : undefined}
      onDelete={!isInbox ? onDelete : undefined}
      disabled={isInbox}
      className="rounded-xl"
    >
      <div 
        className="group flex items-center justify-between p-4 rounded-xl hover:bg-secondary/50 transition-all duration-200 cursor-pointer"
        onClick={handleFolderClick}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div 
            className="flex-shrink-0 p-2 rounded-lg backdrop-blur-sm relative"
            style={{ 
              backgroundColor: `${folder.color}20`
            }}
          >
            {(() => {
              if (folder.icon) {
                const IconComponent = getIconByName(folder.icon)?.icon;
                if (IconComponent) {
                  return <IconComponent className="h-5 w-5" style={{ color: folder.color }} />;
                }
              }
              return <FolderOpen className="h-5 w-5" style={{ color: folder.color }} />;
            })()}
            {folder.is_smart && (
              <div className="absolute -top-1 -right-1 p-0.5 bg-blue-500 rounded-full">
                <Brain size={8} className="text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-foreground truncate">
                {folder.name}
              </h3>
              {folder.is_smart && folder.smart_rules?.enabled && (
                <Sparkles size={12} className="text-blue-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {taskCount} {taskCount === 1 ? 'tasca' : 'tasques'}
              {folder.is_smart && (
                <span className="ml-1 text-blue-600 dark:text-blue-400">• Intel·ligent</span>
              )}
            </p>
          </div>
        </div>

        {!isInbox && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 bg-popover/95 backdrop-blur-md"
            >
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="cursor-pointer hover:bg-secondary/80"
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Editar carpeta
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar carpeta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </SwipeableItem>
  );
}