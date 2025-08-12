import { FolderOpen, MoreVertical, Edit2, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Folder {
  id: string;
  name: string;
  color: string;
  is_system?: boolean;
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
  return (
    <div 
      className="group flex items-center justify-between p-4 rounded-xl hover:bg-secondary/50 transition-all duration-200 cursor-pointer border border-transparent hover:border-border/50"
      onClick={onSelect}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div 
          className="flex-shrink-0 p-2 rounded-lg backdrop-blur-sm"
          style={{ 
            backgroundColor: `${folder.color}20`,
            border: `1px solid ${folder.color}40`
          }}
        >
          <FolderOpen 
            className="h-5 w-5" 
            style={{ color: folder.color }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">
            {folder.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {taskCount} {taskCount === 1 ? 'tasca' : 'tasques'}
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
            className="w-48 bg-popover/95 backdrop-blur-md border border-border/50"
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
  );
}