import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  List, 
  LayoutGrid, 
  Filter,
  SortAsc,
  Search,
  Plus,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DatabaseToolbarProps {
  viewMode: "list" | "kanban";
  onViewModeChange: (mode: "list" | "kanban") => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  filterPriority: string;
  onFilterPriorityChange: (priority: string) => void;
}

const DatabaseToolbar = ({
  viewMode,
  onViewModeChange,
  filterStatus,
  onFilterStatusChange,
  filterPriority,
  onFilterPriorityChange
}: DatabaseToolbarProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filterStatus !== 'all') count++;
    if (filterPriority !== 'all') count++;
    return count;
  };

  return (
    <div className="flex items-center justify-between w-full bg-card/40 backdrop-blur-glass border border-border/30 rounded-2xl p-2 gap-2">
      {/* Left section - Filter button */}
      <div className="flex items-center gap-2">
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 gap-2 hover:bg-accent/50 relative"
            >
              <Filter className="h-4 w-4" />
              <span className="text-sm">Filtrar</span>
              {getActiveFiltersCount() > 0 && (
                <Badge 
                  variant="secondary" 
                  className="h-5 w-5 p-0 text-xs rounded-full bg-primary text-primary-foreground"
                >
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4" align="start">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Estat</label>
                <select
                  value={filterStatus}
                  onChange={(e) => onFilterStatusChange(e.target.value)}
                  className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2"
                >
                  <option value="all">Tots els estats</option>
                  <option value="pendent">Pendent</option>
                  <option value="en_proces">En procés</option>
                  <option value="completat">Completat</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Prioritat</label>
                <select
                  value={filterPriority}
                  onChange={(e) => onFilterPriorityChange(e.target.value)}
                  className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2"
                >
                  <option value="all">Totes les prioritats</option>
                  <option value="alta">Alta</option>
                  <option value="mitjana">Mitjana</option>
                  <option value="baixa">Baixa</option>
                </select>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Center section - View buttons */}
      <div className="flex items-center bg-muted/50 rounded-xl p-1">
        <Button
          variant={viewMode === "list" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("list")}
          className={cn(
            "h-7 px-3 gap-2",
            viewMode === "list" 
              ? "bg-background shadow-sm text-foreground" 
              : "hover:bg-accent/50 text-muted-foreground"
          )}
        >
          <List className="h-4 w-4" />
          <span className="text-sm">Llista</span>
        </Button>
        <Button
          variant={viewMode === "kanban" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("kanban")}
          className={cn(
            "h-7 px-3 gap-2",
            viewMode === "kanban" 
              ? "bg-background shadow-sm text-foreground" 
              : "hover:bg-accent/50 text-muted-foreground"
          )}
        >
          <LayoutGrid className="h-4 w-4" />
          <span className="text-sm">Tauler</span>
        </Button>
      </div>

      {/* Right section - Future buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 gap-2 hover:bg-accent/50 text-muted-foreground"
          disabled
        >
          <SortAsc className="h-4 w-4" />
          <span className="text-sm">Ordenar</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 gap-2 hover:bg-accent/50 text-muted-foreground"
          disabled
        >
          <Search className="h-4 w-4" />
          <span className="text-sm">Cercar</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 hover:bg-accent/50 text-muted-foreground"
          disabled
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DatabaseToolbar;