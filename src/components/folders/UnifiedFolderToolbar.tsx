import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  List, 
  LayoutGrid, 
  Filter, 
  ArrowUpDown, 
  Settings,
  CheckSquare,
  Plus,
  FolderOpen,
  Calendar,
  Clock,
  Trash2,
  Inbox,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDadesApp } from '@/hooks/useDadesApp';
import { useProperties } from "@/hooks/useProperties";
import { toast } from 'sonner';
import type { Task } from '@/types';

interface UnifiedFolderToolbarProps {
  // Basic toolbar props
  viewMode: "list" | "kanban";
  onViewModeChange: (mode: "list" | "kanban") => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  filterPriority: string;
  onFilterPriorityChange: (priority: string) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void;
  onNavigateToSettings?: () => void;
  onCreateTask?: () => void;
  
  // Selection props
  tasks: Task[];
  selectedTasks: string[];
  onSelectTask: (taskId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  selectionMode: boolean;
  onToggleSelectionMode: () => void;
  
  // Inbox-specific props
  isInboxFolder?: boolean;
  inboxTaskCount?: number;
}

export const UnifiedFolderToolbar = ({
  viewMode,
  onViewModeChange,
  filterStatus,
  onFilterStatusChange,
  filterPriority,
  onFilterPriorityChange,
  sortBy = "none",
  sortOrder = "asc",
  onSortChange,
  onNavigateToSettings,
  onCreateTask,
  tasks,
  selectedTasks,
  onSelectTask,
  onSelectAll,
  onClearSelection,
  selectionMode,
  onToggleSelectionMode,
  isInboxFolder = false,
  inboxTaskCount = 0
}: UnifiedFolderToolbarProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { updateTask, deleteTask, folders } = useDadesApp();
  const { properties } = useProperties();
  
  // Get property options
  const estatProperty = properties.find(p => p.name === 'Estat');
  const prioritatProperty = properties.find(p => p.name === 'Prioritat');
  
  // Utility functions
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filterStatus !== 'all') count++;
    if (filterPriority !== 'all') count++;
    return count;
  };

  const isSortActive = () => sortBy !== "none";
  
  // Selection actions
  const handleMoveToFolder = async (folderId: string) => {
    if (selectedTasks.length === 0) return;
    
    setIsProcessing(true);
    try {
      await Promise.all(
        selectedTasks.map(taskId => 
          updateTask(taskId, { folder_id: folderId === 'none' ? null : folderId })
        )
      );
      
      const folder = folderId === 'none' 
        ? 'Bustia' 
        : folders.find(f => f.id === folderId)?.name || 'carpeta';
      
      toast.success(`${selectedTasks.length} tasques mogudes a ${folder}`);
      onClearSelection();
    } catch (error) {
      console.error('Error moving tasks:', error);
      toast.error('Error al moure les tasques');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetDate = async (dateType: 'today' | 'tomorrow' | 'clear') => {
    if (selectedTasks.length === 0) return;
    
    setIsProcessing(true);
    try {
      let due_date = null;
      if (dateType === 'today') {
        due_date = new Date().toISOString().split('T')[0];
      } else if (dateType === 'tomorrow') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        due_date = tomorrow.toISOString().split('T')[0];
      }
      
      await Promise.all(
        selectedTasks.map(taskId => 
          updateTask(taskId, { due_date })
        )
      );
      
      const message = dateType === 'clear' 
        ? 'Data eliminada' 
        : `Data establerta a ${dateType === 'today' ? 'avui' : 'demà'}`;
      
      toast.success(`${selectedTasks.length} tasques actualitzades: ${message}`);
      onClearSelection();
    } catch (error) {
      console.error('Error setting date:', error);
      toast.error('Error al establir la data');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetPriority = async (priority: string) => {
    if (selectedTasks.length === 0) return;
    
    setIsProcessing(true);
    try {
      await Promise.all(
        selectedTasks.map(taskId => 
          updateTask(taskId, { priority })
        )
      );
      
      toast.success(`${selectedTasks.length} tasques actualitzades amb prioritat: ${priority}`);
      onClearSelection();
    } catch (error) {
      console.error('Error setting priority:', error);
      toast.error('Error al establir la prioritat');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedTasks.length === 0) return;
    
    if (!confirm(`Estàs segur que vols eliminar ${selectedTasks.length} tasques? Aquesta acció no es pot desfer.`)) {
      return;
    }
    
    setIsProcessing(true);
    try {
      await Promise.all(
        selectedTasks.map(taskId => deleteTask(taskId))
      );
      
      toast.success(`${selectedTasks.length} tasques eliminades`);
      onClearSelection();
    } catch (error) {
      console.error('Error deleting tasks:', error);
      toast.error('Error al eliminar les tasques');
    } finally {
      setIsProcessing(false);
    }
  };

  // Inbox notification
  const showInboxNotification = isInboxFolder && inboxTaskCount > 5 && !selectionMode;

  return (
    <div className="space-y-3">
      {/* Subtle inbox notification */}
      {showInboxNotification && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/10 p-1.5 rounded-lg">
              <Inbox className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                <span className="font-medium">{inboxTaskCount} tasques</span> sense organitzar
              </p>
            </div>
            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
              Organitzar
            </Badge>
          </div>
        </div>
      )}

      {/* Main unified toolbar */}
      <div className="flex items-center justify-between px-1 py-2">
        {/* Left section - View mode and selection toggle */}
        <div className="flex items-center gap-2">
          {!selectionMode ? (
            <>
              {/* View mode buttons */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onViewModeChange("list")} 
                      className={cn(
                        "h-7 px-2 text-xs transition-all",
                        viewMode === "list" 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <List className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Llista</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onViewModeChange("kanban")} 
                      className={cn(
                        "h-7 px-2 text-xs transition-all",
                        viewMode === "kanban" 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <LayoutGrid className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Tauler</TooltipContent>
                </Tooltip>
              </div>
              
              {/* Selection mode toggle */}
              {tasks.length > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onToggleSelectionMode}
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    >
                      <CheckSquare className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Seleccionar tasques</TooltipContent>
                </Tooltip>
              )}
            </>
          ) : (
            /* Selection mode controls */
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedTasks.length === tasks.length && tasks.length > 0}
                  onCheckedChange={onSelectAll}
                  className="h-4 w-4"
                />
                <span className="text-sm text-muted-foreground">
                  {selectedTasks.length} de {tasks.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel·lar
              </Button>
            </div>
          )}
        </div>

        {/* Center section - Filters and Sort (when not in selection mode) */}
        {!selectionMode && (
          <div className="flex items-center gap-1">
            {/* Filter */}
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 relative"
                    >
                      <Filter className="h-3.5 w-3.5" />
                      {getActiveFiltersCount() > 0 && (
                        <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Filtres</TooltipContent>
                </Tooltip>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3 bg-background/95 backdrop-blur-md border-border/60" align="center">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Estat</label>
                    <select 
                      value={filterStatus} 
                      onChange={e => onFilterStatusChange(e.target.value)} 
                      className="w-full text-xs bg-muted/50 border border-border/60 rounded-md px-2 py-1.5"
                    >
                      <option value="all">Tots els estats</option>
                      {estatProperty?.options?.map((option) => (
                        <option key={option.id} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Prioritat</label>
                    <select 
                      value={filterPriority} 
                      onChange={e => onFilterPriorityChange(e.target.value)} 
                      className="w-full text-xs bg-muted/50 border border-border/60 rounded-md px-2 py-1.5"
                    >
                      <option value="all">Totes les prioritats</option>
                      {prioritatProperty?.options?.map((option) => (
                        <option key={option.id} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Sort */}
            <Popover open={isSortOpen} onOpenChange={setIsSortOpen}>
              <PopoverTrigger asChild>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 relative"
                    >
                      <ArrowUpDown className="h-3.5 w-3.5" />
                      {isSortActive() && (
                        <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Ordenar</TooltipContent>
                </Tooltip>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 bg-background/95 backdrop-blur-md border-border/60" align="center">
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onSortChange?.("none", "asc");
                      setIsSortOpen(false);
                    }}
                    className="w-full justify-start text-xs"
                  >
                    Sense ordenació
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onSortChange?.("created_at", "desc");
                      setIsSortOpen(false);
                    }}
                    className="w-full justify-start text-xs"
                  >
                    Data de creació
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onSortChange?.("due_date", "asc");
                      setIsSortOpen(false);
                    }}
                    className="w-full justify-start text-xs"
                  >
                    Data de venciment
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Right section - Actions */}
        <div className="flex items-center gap-1">
          {selectionMode && selectedTasks.length > 0 ? (
            /* Selection actions */
            <div className="flex items-center gap-1">
              {/* Move to folder */}
              <Select onValueChange={handleMoveToFolder} disabled={isProcessing}>
                <SelectTrigger className="h-7 w-auto min-w-[80px] bg-background/80 border-border/60 text-xs">
                  <FolderOpen className="h-3 w-3" />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-md border-border/60">
                  <SelectItem value="none">Bustia</SelectItem>
                  {folders.filter(f => !f.is_system).map(folder => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: folder.color }}
                        />
                        {folder.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Quick actions for inbox */}
              {isInboxFolder && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDate('today')}
                        disabled={isProcessing}
                        className="h-7 px-2 text-xs bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        <Calendar className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Moure a avui</TooltipContent>
                  </Tooltip>
                </>
              )}

              {/* Delete */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteSelected}
                    disabled={isProcessing}
                    className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Eliminar</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            /* Normal actions */
            <div className="flex items-center gap-1">
              {/* Create task */}
              {onCreateTask && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onCreateTask}
                      className="h-7 px-2 text-xs text-primary hover:bg-primary/10"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Nova tasca</TooltipContent>
                </Tooltip>
              )}

              {/* Settings */}
              {onNavigateToSettings && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onNavigateToSettings}
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Configuració</TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};