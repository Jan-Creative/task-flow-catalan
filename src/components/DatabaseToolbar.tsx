import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { List, LayoutGrid, Filter, SortAsc, Search, Plus, ChevronDown, Settings, Zap, Maximize2, X, Eye, Table, ArrowUpDown, Group, Palette, Link, Lock, FileText, Bot, MoreHorizontal, CheckSquare, AlertTriangle, ArrowLeft, Circle, Edit3, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useProperties } from "@/hooks/useProperties";
import { useToast } from "@/hooks/use-toast";
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
  const [currentPropertyView, setCurrentPropertyView] = useState<'main' | 'estat' | 'prioritat'>('main');
  const [editingPropertyName, setEditingPropertyName] = useState<string>('');
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editingOptionValue, setEditingOptionValue] = useState<string>('');
  const [newOptionName, setNewOptionName] = useState('');
  const [showAddOption, setShowAddOption] = useState(false);
  const { properties, getPropertyByName, updatePropertyOption, createPropertyOption, deletePropertyOption, updatePropertyDefinition, loading, ensureSystemProperties } = useProperties();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get current property data
  const estatProperty = getPropertyByName('Estat');
  const prioritatProperty = getPropertyByName('Prioritat');

  // Auto-create system properties when component loads
  useEffect(() => {
    if (!loading && (!estatProperty || !prioritatProperty)) {
      ensureSystemProperties();
    }
  }, [loading, estatProperty, prioritatProperty, ensureSystemProperties]);

  const handleAdvancedSettingsClick = () => {
    onNavigateToSettings?.();
    setIsSettingsOpen(false);
  };

  const handleBackToMain = () => {
    setCurrentPropertyView('main');
  };

  const handleEstatClick = () => {
    setCurrentPropertyView('estat');
  };

  const handlePrioritatClick = () => {
    setCurrentPropertyView('prioritat');
  };

  // Property name editing functions
  const handlePropertyNameChange = async (propertyId: string, newName: string) => {
    if (!newName.trim()) return;
    
    try {
      await updatePropertyDefinition(propertyId, { name: newName });
      toast({
        title: "Propietat actualitzada",
        description: `El nom s'ha canviat a "${newName}"`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No s'ha pogut actualitzar el nom de la propietat",
        variant: "destructive",
      });
    }
  };

  // Option editing functions
  const handleOptionUpdate = async (optionId: string, updates: { label?: string; color?: string }) => {
    try {
      await updatePropertyOption(optionId, updates);
      setEditingOptionId(null);
      toast({
        title: "Opció actualitzada",
        description: "Els canvis s'han guardat correctament",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No s'ha pogut actualitzar l'opció",
        variant: "destructive",
      });
    }
  };

  // Create new option
  const handleCreateOption = async (propertyId: string) => {
    if (!newOptionName.trim()) return;
    
    try {
      // Get current property to determine sort order
      const currentProperty = currentPropertyView === 'estat' ? estatProperty : prioritatProperty;
      const currentOptions = currentProperty?.options || [];
      
      await createPropertyOption(propertyId, {
        label: newOptionName,
        value: newOptionName.toLowerCase().replace(/\s+/g, '_'),
        color: '#6366f1',
        sort_order: currentOptions.length,
        is_default: false
      });
      setNewOptionName('');
      setShowAddOption(false);
      toast({
        title: "Opció creada",
        description: `S'ha afegit l'opció "${newOptionName}"`,
      });
    } catch (error) {
      console.error('Error creating option:', error);
      toast({
        title: "Error",
        description: "No s'ha pogut crear l'opció",
        variant: "destructive",
      });
    }
  };

  // Delete option
  const handleDeleteOption = async (optionId: string, optionName: string) => {
    if (confirm(`Estàs segur que vols eliminar l'opció "${optionName}"?`)) {
      try {
        await deletePropertyOption(optionId);
        toast({
          title: "Opció eliminada",
          description: `S'ha eliminat l'opció "${optionName}"`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No s'ha pogut eliminar l'opció",
          variant: "destructive",
        });
      }
    }
  };

  const getColorForOption = (color: string) => {
    return color || '#6366f1';
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
                  {estatProperty?.options?.map((option) => (
                    <option key={option.id} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white">Prioritat</label>
                <select value={filterPriority} onChange={e => onFilterPriorityChange(e.target.value)} className="w-full text-xs bg-[#2a2a2a] border border-[#333] rounded-md px-2 py-1.5 text-white">
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
            {currentPropertyView === 'main' && (
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
                  <div 
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-[#2a2a2a] cursor-pointer"
                    onClick={handleEstatClick}
                  >
                    <div className="flex items-center gap-3">
                      <CheckSquare className="h-4 w-4 text-[#b8b8b8]" />
                      <span className="text-sm text-white">Estat</span>
                    </div>
                    <ChevronDown className="h-3 w-3 text-[#b8b8b8] rotate-[-90deg]" />
                  </div>

                  {/* Prioritat */}
                  <div 
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-[#2a2a2a] cursor-pointer"
                    onClick={handlePrioritatClick}
                  >
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
            )}

            {currentPropertyView === 'estat' && (
              <div className="p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-[#b8b8b8]">Carregant...</div>
                  </div>
                ) : (
                  <>
                    {/* Header with back button */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-[#b8b8b8] hover:bg-[#353535] hover:text-white"
                          onClick={handleBackToMain}
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                          <CheckSquare className="h-4 w-4 text-[#b8b8b8]" />
                          <input 
                            type="text" 
                            value={editingPropertyName || estatProperty?.name || 'Estat'}
                            onChange={(e) => setEditingPropertyName(e.target.value)}
                            onBlur={() => {
                              if (estatProperty && editingPropertyName && editingPropertyName !== estatProperty.name) {
                                handlePropertyNameChange(estatProperty.id, editingPropertyName);
                              }
                              setEditingPropertyName('');
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.currentTarget.blur();
                              }
                            }}
                            className="bg-transparent text-sm font-medium text-white border-none outline-none focus:bg-[#2a2a2a] rounded px-1 py-0.5"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-[#b8b8b8] hover:bg-[#353535] hover:text-white"
                        onClick={() => setIsSettingsOpen(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Property type info */}
                    <div className="mb-4">
                      <p className="text-xs text-[#b8b8b8]">Tipus: Select</p>
                    </div>

                    {/* Current status options */}
                    <div className="space-y-2 mb-4">
                      {estatProperty?.options?.map((option) => (
                        <div key={option.id} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-[#2a2a2a] group">
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={getColorForOption(option.color)}
                              onChange={(e) => handleOptionUpdate(option.id, { color: e.target.value })}
                              className="h-3 w-3 rounded-full border-none cursor-pointer"
                              style={{ backgroundColor: getColorForOption(option.color) }}
                            />
                            {editingOptionId === option.id ? (
                              <input 
                                type="text" 
                                value={editingOptionValue}
                                onChange={(e) => setEditingOptionValue(e.target.value)}
                                onBlur={() => {
                                  if (editingOptionValue !== option.label) {
                                    handleOptionUpdate(option.id, { label: editingOptionValue });
                                  }
                                  setEditingOptionId(null);
                                  setEditingOptionValue('');
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    if (editingOptionValue !== option.label) {
                                      handleOptionUpdate(option.id, { label: editingOptionValue });
                                    }
                                    setEditingOptionId(null);
                                    setEditingOptionValue('');
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingOptionId(null);
                                    setEditingOptionValue('');
                                  }
                                }}
                                className="bg-[#353535] text-sm text-white border border-[#555] outline-none rounded px-1 py-0.5"
                                autoFocus
                              />
                            ) : (
                              <span 
                                className="text-sm text-white cursor-pointer"
                                onClick={() => {
                                  setEditingOptionId(option.id);
                                  setEditingOptionValue(option.label);
                                }}
                              >
                                {option.label}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0 text-[#b8b8b8] hover:bg-[#404040]"
                              onClick={() => setEditingOptionId(option.id)}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0 text-red-400 hover:bg-[#404040]"
                              onClick={() => handleDeleteOption(option.id, option.label)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {/* Add new option */}
                      {showAddOption ? (
                        <div className="flex items-center gap-3 py-2 px-3 rounded-md bg-[#2a2a2a]">
                          <Circle className="h-3 w-3 text-[#6366f1] fill-[#6366f1]" />
                          <input
                            type="text"
                            value={newOptionName}
                            onChange={(e) => setNewOptionName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && estatProperty) {
                                handleCreateOption(estatProperty.id);
                              }
                              if (e.key === 'Escape') {
                                setShowAddOption(false);
                                setNewOptionName('');
                              }
                            }}
                            placeholder="Nom de l'opció"
                            className="bg-[#353535] text-sm text-white border border-[#555] outline-none rounded px-2 py-1 flex-1"
                            autoFocus
                          />
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-green-400 hover:bg-[#404040]"
                              onClick={() => estatProperty && handleCreateOption(estatProperty.id)}
                            >
                              <CheckSquare className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-[#b8b8b8] hover:bg-[#404040]"
                              onClick={() => {
                                setShowAddOption(false);
                                setNewOptionName('');
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-[#2a2a2a] cursor-pointer text-[#b8b8b8] hover:text-white"
                          onClick={() => setShowAddOption(true)}
                        >
                          <Plus className="h-3 w-3" />
                          <span className="text-sm">Afegir una opció</span>
                        </div>
                      )}
                     </div>

                     {/* Advanced options */}
                     <Separator className="bg-[#333] my-4" />
                     
                     <div className="space-y-3">
                       {/* Toggle option */}
                       <div className="flex items-center justify-between">
                         <span className="text-sm text-white">Ajustar a la vista</span>
                         <div className="w-8 h-4 bg-[#404040] rounded-full relative cursor-pointer">
                           <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform"></div>
                         </div>
                       </div>

                       {/* Show as selector */}
                       <div className="space-y-1.5">
                         <label className="text-xs font-medium text-white">Mostrar com</label>
                         <select className="w-full text-xs bg-[#2a2a2a] border border-[#333] rounded-md px-2 py-1.5 text-white">
                           <option value="tags">Etiquetes</option>
                           <option value="checkbox">Casella de verificació</option>
                           <option value="select">Selector</option>
                         </select>
                       </div>
                     </div>

                     {/* Action buttons */}
                     <Separator className="bg-[#333] my-4" />
                     
                     <div className="space-y-1">
                       <div className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-[#2a2a2a] cursor-pointer text-[#b8b8b8] hover:text-white">
                         <Copy className="h-4 w-4" />
                         <span className="text-sm">Duplicar propietat</span>
                       </div>
                       <div className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-[#2a2a2a] cursor-pointer text-red-400 hover:text-red-300">
                         <Trash2 className="h-4 w-4" />
                         <span className="text-sm">Eliminar propietat</span>
                       </div>
                     </div>
                   </>
                 )}
               </div>
             )}

            {currentPropertyView === 'prioritat' && (
              <div className="p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-[#b8b8b8]">Carregant...</div>
                  </div>
                ) : (
                  <>
                    {/* Header with back button */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-[#b8b8b8] hover:bg-[#353535] hover:text-white"
                          onClick={handleBackToMain}
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-[#b8b8b8]" />
                          <input 
                            type="text" 
                            value={editingPropertyName || prioritatProperty?.name || 'Prioritat'}
                            onChange={(e) => setEditingPropertyName(e.target.value)}
                            onBlur={() => {
                              if (prioritatProperty && editingPropertyName && editingPropertyName !== prioritatProperty.name) {
                                handlePropertyNameChange(prioritatProperty.id, editingPropertyName);
                              }
                              setEditingPropertyName('');
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.currentTarget.blur();
                              }
                            }}
                            className="bg-transparent text-sm font-medium text-white border-none outline-none focus:bg-[#2a2a2a] rounded px-1 py-0.5"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-[#b8b8b8] hover:bg-[#353535] hover:text-white"
                        onClick={() => setIsSettingsOpen(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Property type info */}
                    <div className="mb-4">
                      <p className="text-xs text-[#b8b8b8]">Tipus: Select</p>
                    </div>

                    {/* Current priority options */}
                    <div className="space-y-2 mb-4">
                      {prioritatProperty?.options?.map((option) => (
                        <div key={option.id} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-[#2a2a2a] group">
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={getColorForOption(option.color)}
                              onChange={(e) => handleOptionUpdate(option.id, { color: e.target.value })}
                              className="h-3 w-3 rounded-full border-none cursor-pointer"
                              style={{ backgroundColor: getColorForOption(option.color) }}
                            />
                            {editingOptionId === option.id ? (
                              <input 
                                type="text" 
                                value={editingOptionValue}
                                onChange={(e) => setEditingOptionValue(e.target.value)}
                                onBlur={() => {
                                  if (editingOptionValue !== option.label) {
                                    handleOptionUpdate(option.id, { label: editingOptionValue });
                                  }
                                  setEditingOptionId(null);
                                  setEditingOptionValue('');
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    if (editingOptionValue !== option.label) {
                                      handleOptionUpdate(option.id, { label: editingOptionValue });
                                    }
                                    setEditingOptionId(null);
                                    setEditingOptionValue('');
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingOptionId(null);
                                    setEditingOptionValue('');
                                  }
                                }}
                                className="bg-[#353535] text-sm text-white border border-[#555] outline-none rounded px-1 py-0.5"
                                autoFocus
                              />
                            ) : (
                              <span 
                                className="text-sm text-white cursor-pointer"
                                onClick={() => {
                                  setEditingOptionId(option.id);
                                  setEditingOptionValue(option.label);
                                }}
                              >
                                {option.label}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0 text-[#b8b8b8] hover:bg-[#404040]"
                              onClick={() => setEditingOptionId(option.id)}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0 text-red-400 hover:bg-[#404040]"
                              onClick={() => handleDeleteOption(option.id, option.label)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {/* Add new option */}
                      {showAddOption ? (
                        <div className="flex items-center gap-3 py-2 px-3 rounded-md bg-[#2a2a2a]">
                          <Circle className="h-3 w-3 text-[#6366f1]" />
                          <input 
                            type="text" 
                            value={newOptionName}
                            onChange={(e) => setNewOptionName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && prioritatProperty) {
                                handleCreateOption(prioritatProperty.id);
                              }
                              if (e.key === 'Escape') {
                                setShowAddOption(false);
                                setNewOptionName('');
                              }
                            }}
                            placeholder="Nom de l'opció"
                            className="bg-[#353535] text-sm text-white border border-[#555] outline-none rounded px-2 py-1 flex-1"
                            autoFocus
                          />
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-green-400 hover:bg-[#404040]"
                              onClick={() => prioritatProperty && handleCreateOption(prioritatProperty.id)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-[#b8b8b8] hover:bg-[#404040]"
                              onClick={() => {
                                setShowAddOption(false);
                                setNewOptionName('');
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-[#2a2a2a] cursor-pointer text-[#b8b8b8] hover:text-white"
                          onClick={() => setShowAddOption(true)}
                        >
                          <Plus className="h-3 w-3" />
                          <span className="text-sm">Afegir una opció</span>
                        </div>
                      )}
                     </div>

                     {/* Advanced options */}
                     <Separator className="bg-[#333] my-4" />
                     
                     <div className="space-y-3">
                       {/* Toggle option */}
                       <div className="flex items-center justify-between">
                         <span className="text-sm text-white">Ajustar a la vista</span>
                         <div className="w-8 h-4 bg-[#404040] rounded-full relative cursor-pointer">
                           <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform"></div>
                         </div>
                       </div>

                       {/* Show as selector */}
                       <div className="space-y-1.5">
                         <label className="text-xs font-medium text-white">Mostrar com</label>
                         <select className="w-full text-xs bg-[#2a2a2a] border border-[#333] rounded-md px-2 py-1.5 text-white">
                           <option value="tags">Etiquetes</option>
                           <option value="checkbox">Casella de verificació</option>
                           <option value="select">Selector</option>
                         </select>
                       </div>
                     </div>

                     {/* Action buttons */}
                     <Separator className="bg-[#333] my-4" />
                     
                     <div className="space-y-1">
                       <div className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-[#2a2a2a] cursor-pointer text-[#b8b8b8] hover:text-white">
                         <Copy className="h-4 w-4" />
                         <span className="text-sm">Duplicar propietat</span>
                       </div>
                       <div className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-[#2a2a2a] cursor-pointer text-red-400 hover:text-red-300">
                         <Trash2 className="h-4 w-4" />
                         <span className="text-sm">Eliminar propietat</span>
                       </div>
                     </div>
                   </>
                 )}
               </div>
             )}
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