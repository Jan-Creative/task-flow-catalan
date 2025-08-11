import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { List, LayoutGrid, Filter, SortAsc, Search, Plus, ChevronDown, Settings, Zap, Maximize2, X, Eye, Table, ArrowUpDown, Group, Palette, Link, Lock, FileText, Bot, MoreHorizontal, CheckSquare, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
interface DatabaseToolbarProps {
  viewMode: "list" | "kanban";
  onViewModeChange: (mode: "list" | "kanban") => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  filterPriority: string;
  onFilterPriorityChange: (priority: string) => void;
  onNavigateToSettings?: () => void;
}
const DatabaseToolbar = ({
  viewMode,
  onViewModeChange,
  filterStatus,
  onFilterStatusChange,
  filterPriority,
  onFilterPriorityChange,
  onNavigateToSettings
}: DatabaseToolbarProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();

  const handleAdvancedSettingsClick = () => {
    onNavigateToSettings?.();
    setIsSettingsOpen(false);
  };
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filterStatus !== 'all') count++;
    if (filterPriority !== 'all') count++;
    return count;
  };
  return <div className="flex items-center w-full gap-2">
      {/* Left section - View buttons (Notion style) */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => onViewModeChange("list")} className={cn("h-7 px-3 text-xs font-medium rounded-md border-0", viewMode === "list" ? "bg-[#404040] text-white" : "bg-transparent text-[#b8b8b8] hover:bg-[#353535] hover:text-white")}>
          <List className="h-3 w-3 mr-1.5" />
          Llista
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onViewModeChange("kanban")} className={cn("h-7 px-3 text-xs font-medium rounded-md border-0", viewMode === "kanban" ? "bg-[#404040] text-white" : "bg-transparent text-[#b8b8b8] hover:bg-[#353535] hover:text-white")}>
          <LayoutGrid className="h-3 w-3 mr-1.5" />
          Tauler
        </Button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right section - Action buttons */}
      <div className="flex items-center gap-1">
        {/* Filter button with dropdowns */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-[#b8b8b8] hover:bg-[#353535] hover:text-white rounded-md relative">
              <Filter className="h-3.5 w-3.5" />
              {getActiveFiltersCount() > 0 && <div className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3 bg-[#1f1f1f] border border-[#333]" align="end">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white">Estat</label>
                <select value={filterStatus} onChange={e => onFilterStatusChange(e.target.value)} className="w-full text-xs bg-[#2a2a2a] border border-[#333] rounded-md px-2 py-1.5 text-white">
                  <option value="all">Tots els estats</option>
                  <option value="pendent">Pendent</option>
                  <option value="en_proces">En procés</option>
                  <option value="completat">Completat</option>
                </select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white">Prioritat</label>
                <select value={filterPriority} onChange={e => onFilterPriorityChange(e.target.value)} className="w-full text-xs bg-[#2a2a2a] border border-[#333] rounded-md px-2 py-1.5 text-white">
                  <option value="all">Totes les prioritats</option>
                  <option value="alta">Alta</option>
                  <option value="mitjana">Mitjana</option>
                  <option value="baixa">Baixa</option>
                </select>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Sort button */}
        

        {/* Lightning/Zap button */}
        

        {/* Search button */}
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-[#b8b8b8] hover:bg-[#353535] hover:text-white rounded-md" disabled>
          <Search className="h-3.5 w-3.5" />
        </Button>

        {/* Expand button */}
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-[#b8b8b8] hover:bg-[#353535] hover:text-white rounded-md" disabled>
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>

        {/* Settings button with menu */}
        <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-[#b8b8b8] hover:bg-[#353535] hover:text-white rounded-md">
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 bg-[#1f1f1f] border border-[#333]" align="end">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white">Propietats</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-[#b8b8b8] hover:bg-[#353535] hover:text-white"
                  onClick={() => setIsSettingsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Properties Section */}
              <div className="space-y-1">
                {/* Estat */}
                <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-[#2a2a2a] cursor-pointer opacity-60">
                  <div className="flex items-center gap-3">
                    <CheckSquare className="h-4 w-4 text-[#b8b8b8]" />
                    <span className="text-sm text-white">Estat</span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-[#b8b8b8] rotate-[-90deg]" />
                </div>

                {/* Prioritat */}
                <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-[#2a2a2a] cursor-pointer opacity-60">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-[#b8b8b8]" />
                    <span className="text-sm text-white">Prioritat</span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-[#b8b8b8] rotate-[-90deg]" />
                </div>

                {/* Noves propietats */}
                <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-[#2a2a2a] cursor-pointer opacity-60">
                  <div className="flex items-center gap-3">
                    <Plus className="h-4 w-4 text-[#b8b8b8]" />
                    <span className="text-sm text-white">Noves propietats</span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-[#b8b8b8] rotate-[-90deg]" />
                </div>

                {/* Separator */}
                <Separator className="bg-[#333] my-3" />

                {/* Configuració avançada */}
                <div 
                  className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-[#2a2a2a] cursor-pointer"
                  onClick={handleAdvancedSettingsClick}
                >
                  <div className="flex items-center gap-3">
                    <MoreHorizontal className="h-4 w-4 text-[#b8b8b8]" />
                    <span className="text-sm text-white">Configuració avançada</span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-[#b8b8b8] rotate-[-90deg]" />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Nuevo button */}
        <Button variant="ghost" size="sm" className="h-7 px-3 text-xs font-medium bg-[#0070f3] hover:bg-[#0060df] text-white rounded-md ml-2" disabled>
          Nuevo
        </Button>
      </div>
    </div>;
};
export default DatabaseToolbar;