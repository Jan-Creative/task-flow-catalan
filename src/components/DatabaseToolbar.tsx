import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { List, LayoutGrid, Filter, SortAsc, Plus, ChevronDown, Settings, X, Eye, Table, ArrowUpDown, Group, Palette, Link, Lock, FileText, Bot, MoreHorizontal, CheckSquare, AlertTriangle, ArrowLeft, Circle, Edit3, Copy, Trash2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useProperties } from "@/hooks/useProperties";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SimpleIconPicker } from '@/components/ui/simple-icon-picker';
import { getIconByName, getDefaultIconForProperty } from '@/lib/iconLibrary';

interface DatabaseToolbarProps {
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
}
const DatabaseToolbar = ({ 
  viewMode, 
  onViewModeChange, 
  filterStatus, 
  onFilterStatusChange, 
  filterPriority, 
  onFilterPriorityChange,
  sortBy = "none",
  sortOrder = "asc",
  onSortChange,
  onNavigateToSettings 
}: DatabaseToolbarProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentSortView, setCurrentSortView] = useState<'main' | 'prioritat' | 'estat'>('main');
  const [currentPropertyView, setCurrentPropertyView] = useState<'main' | 'nova_propietat' | string>('main');
  const [editingPropertyName, setEditingPropertyName] = useState<string>('');
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editingOptionValue, setEditingOptionValue] = useState<string>('');
  const [newOptionName, setNewOptionName] = useState('');
  const [showAddOption, setShowAddOption] = useState(false);
  
  // Nueva propietat states
  const [newPropertyName, setNewPropertyName] = useState('');
  const [newPropertyOptions, setNewPropertyOptions] = useState<{id: string, label: string, color: string}[]>([]);
  const [newOptionInput, setNewOptionInput] = useState('');
  const [showNewOptionInput, setShowNewOptionInput] = useState(false);
  const [isCreatingProperty, setIsCreatingProperty] = useState(false);

  // Icon picker states
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconTarget, setIconTarget] = useState<{ type: 'property' | 'option'; id: string } | null>(null);
  
  const { properties, getPropertyByName, updatePropertyOption, createPropertyOption, deletePropertyOption, deletePropertyDefinition, updatePropertyDefinition, loading, ensureSystemProperties, fetchProperties } = useProperties();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get current property data
  const estatProperty = getPropertyByName('Estat');
  const prioritatProperty = getPropertyByName('Prioritat');
  
  // Get current property for editing
  const currentProperty = currentPropertyView === 'main' || currentPropertyView === 'nova_propietat' 
    ? null 
    : properties.find(p => p.id === currentPropertyView) || null;
  
  // Separate system and custom properties
  const systemProperties = properties.filter(p => p.is_system);
  const customProperties = properties.filter(p => !p.is_system);

  // Auto-create system properties - Stable dependency array
  useEffect(() => {
    if (!loading && ensureSystemProperties) {
      ensureSystemProperties();
    }
  }, [loading]); // Only depend on loading to prevent infinite loop

  const handleAdvancedSettingsClick = () => {
    onNavigateToSettings?.();
    setIsSettingsOpen(false);
  };

  const handleBackToMain = () => {
    setCurrentPropertyView('main');
  };

  const handlePropertyClick = (propertyId: string) => {
    setCurrentPropertyView(propertyId);
  };

  const handleNovaPropietatClick = () => {
    setCurrentPropertyView('nova_propietat');
  };

  // Property name editing functions
  const handlePropertyNameChange = async (propertyId: string, newName: string) => {
    if (!newName.trim()) return;
    
    // Check for duplicate names
    const existingProperty = properties.find(p => p.name.toLowerCase() === newName.trim().toLowerCase() && p.id !== propertyId);
    if (existingProperty) {
      toast({
        title: "Error",
        description: "Ja existeix una propietat amb aquest nom.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await updatePropertyDefinition(propertyId, { name: newName.trim() });
      
      // Clear editing state
      setEditingPropertyName('');
      
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

  // Icon handling functions
  const handleIconSelect = async (iconName: string) => {
    console.log('🎯 DatabaseToolbar: handleIconSelect called with:', iconName);
    console.log('🎯 DatabaseToolbar: iconTarget:', iconTarget);
    
    if (!iconTarget) {
      console.log('🎯 DatabaseToolbar: No iconTarget, returning');
      return;
    }
    
    try {
      if (iconTarget.type === 'property') {
        console.log('🎯 DatabaseToolbar: Updating property icon');
        await updatePropertyDefinition(iconTarget.id, { icon: iconName });
        toast({
          title: "Icona actualitzada",
          description: "La icona de la propietat s'ha actualitzat correctament.",
        });
      } else {
        console.log('🎯 DatabaseToolbar: Updating option icon');
        await updatePropertyOption(iconTarget.id, { icon: iconName });
        toast({
          title: "Icona actualitzada",
          description: "La icona de l'opció s'ha actualitzat correctament.",
        });
      }
      
      // Refresh data to show updated icon
      console.log('🎯 DatabaseToolbar: Refreshing properties');
      await fetchProperties();
      console.log('🎯 DatabaseToolbar: Icon update completed successfully');
      
    } catch (error) {
      console.error('🎯 DatabaseToolbar: Icon update error:', error);
      toast({
        title: "Error",
        description: "Hi ha hagut un error actualitzant la icona.",
        variant: "destructive",
      });
      throw error; // Re-throw to be handled by the popover
    }
  };

  const handlePropertyIconClick = (e: React.MouseEvent, propertyId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIconTarget({ type: 'property', id: propertyId });
    setShowIconPicker(true);
  };

  const handleOptionIconClick = (e: React.MouseEvent, optionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIconTarget({ type: 'option', id: optionId });
    setShowIconPicker(true);
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
      const propertyForOption = properties.find(p => p.id === propertyId);
      const currentOptions = propertyForOption?.options || [];
      
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

  // Delete property function
  const handleDeleteProperty = async (propertyId: string, propertyName: string) => {
    // Only allow deleting custom properties (not system properties)
    const property = properties.find(p => p.id === propertyId);
    if (property?.is_system) {
      toast({
        title: "Error",
        description: "No es poden eliminar les propietats del sistema",
        variant: "destructive",
      });
      return;
    }

    if (confirm(`Estàs segur que vols eliminar la propietat "${propertyName}"? Totes les tasques que la tinguin assignada perdran aquesta informació.`)) {
      try {
        await deletePropertyDefinition(propertyId);
        await fetchProperties();
        setCurrentPropertyView('main');
        toast({
          title: "Propietat eliminada",
          description: `S'ha eliminat la propietat "${propertyName}"`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No s'ha pogut eliminar la propietat",
          variant: "destructive",
        });
      }
    }
  };

  // Nueva propietat functions
  const handleAddNewOption = () => {
    if (!newOptionInput.trim()) return;
    
    const newOption = {
      id: `temp_${Date.now()}`,
      label: newOptionInput,
      color: '#6366f1'
    };
    
    setNewPropertyOptions([...newPropertyOptions, newOption]);
    setNewOptionInput('');
    setShowNewOptionInput(false);
  };

  const handleRemoveNewOption = (optionId: string) => {
    setNewPropertyOptions(newPropertyOptions.filter(opt => opt.id !== optionId));
  };

  const handleUpdateNewOptionColor = (optionId: string, color: string) => {
    setNewPropertyOptions(newPropertyOptions.map(opt => 
      opt.id === optionId ? { ...opt, color } : opt
    ));
  };

  const handleCreateNewProperty = async () => {
    if (!newPropertyName.trim() || newPropertyOptions.length === 0) {
      toast({
        title: "Error",
        description: "La propietat ha de tenir un nom i almenys una opció",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingProperty(true);
    
    try {
      // Create the property definition directly via Supabase
      const { data: newPropertyData, error: propError } = await supabase
        .from('property_definitions')
        .insert({
          name: newPropertyName,
          type: 'select' as const,
          is_system: false,
          user_id: user?.id
        })
        .select()
        .single();

      if (propError) throw propError;

      // Create the options for the new property
      for (const [index, option] of newPropertyOptions.entries()) {
        await createPropertyOption(newPropertyData.id, {
          label: option.label,
          value: option.label.toLowerCase().replace(/\s+/g, '_'),
          color: option.color,
          sort_order: index,
          is_default: index === 0
        });
      }

      // Reset form
      setNewPropertyName('');
      setNewPropertyOptions([]);
      setNewOptionInput('');
      setShowNewOptionInput(false);
      
      // Refresh properties to show the new one
      await fetchProperties();
      
      // Navigate back to main view
      setCurrentPropertyView('main');
      
      toast({
        title: "Propietat creada",
        description: `S'ha creat la propietat "${newPropertyName}" amb ${newPropertyOptions.length} opcions`,
      });
      
    } catch (error) {
      console.error('Error creating property:', error);
      toast({
        title: "Error",
        description: "No s'ha pogut crear la propietat",
        variant: "destructive",
      });
    } finally {
      setIsCreatingProperty(false);
    }
  };

  const resetNewPropertyForm = () => {
    setNewPropertyName('');
    setNewPropertyOptions([]);
    setNewOptionInput('');
    setShowNewOptionInput(false);
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

  const handleSortSelection = (sortBy: string, sortOrder: "asc" | "desc") => {
    onSortChange?.(sortBy, sortOrder);
    setIsSortOpen(false);
    setCurrentSortView('main');
  };

  const handleBackToSortMain = () => {
    setCurrentSortView('main');
  };

  const handlePrioritatSortClick = () => {
    setCurrentSortView('prioritat');
  };

  const handleEstatSortClick = () => {
    if (viewMode !== "kanban") {
      setCurrentSortView('estat');
    }
  };

  const isSortActive = () => {
    return sortBy !== "none";
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

        {/* Sort button with menu */}
        <Popover open={isSortOpen} onOpenChange={setIsSortOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-[#b8b8b8] hover:bg-[#353535] hover:text-white rounded-md relative">
              <ArrowUpDown className="h-3.5 w-3.5" />
              {isSortActive() && <div className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0 bg-[#1f1f1f] border border-[#333]" align="end">
            {currentSortView === 'main' && (
              <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Ordenar per</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-[#b8b8b8] hover:bg-[#353535] hover:text-white"
                    onClick={() => setIsSortOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Sort options */}
                <div className="space-y-1">
                  {/* Sense ordenació */}
                  <div 
                    className={cn(
                      "flex items-center justify-between py-2 px-3 rounded-md hover:bg-[#2a2a2a] cursor-pointer",
                      sortBy === "none" && "bg-[#2a2a2a]"
                    )}
                    onClick={() => handleSortSelection("none", "asc")}
                  >
                    <div className="flex items-center gap-3">
                      <Circle className="h-4 w-4 text-[#b8b8b8]" />
                      <span className="text-sm text-white">Sense ordenació</span>
                    </div>
                    {sortBy === "none" && <div className="h-2 w-2 bg-blue-500 rounded-full" />}
                  </div>

                  {/* Prioritat */}
                  <div 
                    className={cn(
                      "flex items-center justify-between py-2 px-3 rounded-md hover:bg-[#2a2a2a] cursor-pointer",
                      sortBy === "prioritat" && "bg-[#2a2a2a]"
                    )}
                    onClick={handlePrioritatSortClick}
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-[#b8b8b8]" />
                      <span className="text-sm text-white">Prioritat</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {sortBy === "prioritat" && <div className="h-2 w-2 bg-blue-500 rounded-full" />}
                      <ChevronDown className="h-3 w-3 text-[#b8b8b8] rotate-[-90deg]" />
                    </div>
                  </div>

                  {/* Estat */}
                  <div 
                    className={cn(
                      "flex items-center justify-between py-2 px-3 rounded-md",
                      viewMode === "kanban" 
                        ? "cursor-not-allowed opacity-50" 
                        : "hover:bg-[#2a2a2a] cursor-pointer",
                      sortBy === "estat" && viewMode !== "kanban" && "bg-[#2a2a2a]"
                    )}
                    onClick={handleEstatSortClick}
                  >
                    <div className="flex items-center gap-3">
                      <CheckSquare className="h-4 w-4 text-[#b8b8b8]" />
                      <span className="text-sm text-white">Estat</span>
                      {viewMode === "kanban" && (
                        <span className="text-xs text-[#b8b8b8]/70 ml-2">
                          (No disponible en vista tauler)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {sortBy === "estat" && viewMode !== "kanban" && <div className="h-2 w-2 bg-blue-500 rounded-full" />}
                      {viewMode !== "kanban" && <ChevronDown className="h-3 w-3 text-[#b8b8b8] rotate-[-90deg]" />}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentSortView === 'prioritat' && (
              <div className="p-4">
                {/* Header with back button */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-[#b8b8b8] hover:bg-[#353535] hover:text-white"
                      onClick={handleBackToSortMain}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-[#b8b8b8]" />
                      <span className="text-sm font-medium text-white">Prioritat</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-[#b8b8b8] hover:bg-[#353535] hover:text-white"
                    onClick={() => setIsSortOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Sort direction options */}
                <div className="space-y-1">
                  <div 
                    className={cn(
                      "flex items-center justify-between py-2 px-3 rounded-md hover:bg-[#2a2a2a] cursor-pointer",
                      sortBy === "prioritat" && sortOrder === "asc" && "bg-[#2a2a2a]"
                    )}
                    onClick={() => handleSortSelection("prioritat", "asc")}
                  >
                    <div className="flex items-center gap-3">
                      <SortAsc className="h-4 w-4 text-[#b8b8b8]" />
                      <span className="text-sm text-white">Ascendent</span>
                    </div>
                    {sortBy === "prioritat" && sortOrder === "asc" && <div className="h-2 w-2 bg-blue-500 rounded-full" />}
                  </div>
                  
                  <div 
                    className={cn(
                      "flex items-center justify-between py-2 px-3 rounded-md hover:bg-[#2a2a2a] cursor-pointer",
                      sortBy === "prioritat" && sortOrder === "desc" && "bg-[#2a2a2a]"
                    )}
                    onClick={() => handleSortSelection("prioritat", "desc")}
                  >
                    <div className="flex items-center gap-3">
                      <SortAsc className="h-4 w-4 text-[#b8b8b8] rotate-180" />
                      <span className="text-sm text-white">Descendent</span>
                    </div>
                    {sortBy === "prioritat" && sortOrder === "desc" && <div className="h-2 w-2 bg-blue-500 rounded-full" />}
                  </div>
                </div>
              </div>
            )}

            {currentSortView === 'estat' && (
              <div className="p-4">
                {/* Header with back button */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-[#b8b8b8] hover:bg-[#353535] hover:text-white"
                      onClick={handleBackToSortMain}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-[#b8b8b8]" />
                      <span className="text-sm font-medium text-white">Estat</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-[#b8b8b8] hover:bg-[#353535] hover:text-white"
                    onClick={() => setIsSortOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Sort direction options */}
                <div className="space-y-1">
                  <div 
                    className={cn(
                      "flex items-center justify-between py-2 px-3 rounded-md hover:bg-[#2a2a2a] cursor-pointer",
                      sortBy === "estat" && sortOrder === "asc" && "bg-[#2a2a2a]"
                    )}
                    onClick={() => handleSortSelection("estat", "asc")}
                  >
                    <div className="flex items-center gap-3">
                      <SortAsc className="h-4 w-4 text-[#b8b8b8]" />
                      <span className="text-sm text-white">Ascendent</span>
                    </div>
                    {sortBy === "estat" && sortOrder === "asc" && <div className="h-2 w-2 bg-blue-500 rounded-full" />}
                  </div>
                  
                  <div 
                    className={cn(
                      "flex items-center justify-between py-2 px-3 rounded-md hover:bg-[#2a2a2a] cursor-pointer",
                      sortBy === "estat" && sortOrder === "desc" && "bg-[#2a2a2a]"
                    )}
                    onClick={() => handleSortSelection("estat", "desc")}
                  >
                    <div className="flex items-center gap-3">
                      <SortAsc className="h-4 w-4 text-[#b8b8b8] rotate-180" />
                      <span className="text-sm text-white">Descendent</span>
                    </div>
                    {sortBy === "estat" && sortOrder === "desc" && <div className="h-2 w-2 bg-blue-500 rounded-full" />}
                  </div>
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Settings button with menu */}
        <Popover 
          open={isSettingsOpen} 
          onOpenChange={(open) => {
            // Don't close if icon picker is open
            if (!open && showIconPicker) return;
            setIsSettingsOpen(open);
          }}
        >
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
                  {/* System Properties */}
                  {systemProperties.map((property) => {
                    const Icon = property.name === 'Estat' ? CheckSquare : 
                                property.name === 'Prioritat' ? AlertTriangle : 
                                Circle;
                    
                    return (
                      <div 
                        key={property.id}
                        className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-[#2a2a2a] cursor-pointer"
                        onClick={() => handlePropertyClick(property.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-[#b8b8b8]" />
                          <span className="text-sm text-white">{property.name}</span>
                        </div>
                        <ChevronDown className="h-3 w-3 text-[#b8b8b8] rotate-[-90deg]" />
                      </div>
                    );
                  })}
                  
                  {/* Custom Properties */}
                  {customProperties.map((property) => (
                    <div 
                      key={property.id}
                      className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-[#2a2a2a] cursor-pointer"
                      onClick={() => handlePropertyClick(property.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Circle className="h-4 w-4 text-[#b8b8b8]" />
                        <span className="text-sm text-white">{property.name}</span>
                      </div>
                      <ChevronDown className="h-3 w-3 text-[#b8b8b8] rotate-[-90deg]" />
                    </div>
                  ))}

                  {/* Noves propietats */}
                  <div 
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-[#2a2a2a] cursor-pointer transition-all duration-200 hover:text-blue-400"
                    onClick={handleNovaPropietatClick}
                  >
                    <div className="flex items-center gap-3">
                      <Plus className="h-4 w-4 text-[#b8b8b8] group-hover:text-blue-400 transition-colors" />
                      <span className="text-sm text-white group-hover:text-blue-400 transition-colors">Noves propietats</span>
                    </div>
                    <ChevronDown className="h-3 w-3 text-[#b8b8b8] rotate-[-90deg] group-hover:text-blue-400 transition-colors" />
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

            {currentProperty && (
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
                           {currentProperty.icon && (() => {
                             const iconDef = getIconByName(currentProperty.icon);
                             if (iconDef) {
                               const IconComponent = iconDef.icon;
                               return (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => handlePropertyIconClick(e, currentProperty.id)}
                                    className="h-6 w-6 p-0 text-white hover:bg-[#353535] hover:text-white/80 pointer-events-auto"
                                    title="Canviar icona"
                                  >
                                   <IconComponent className="h-4 w-4" />
                                 </Button>
                               );
                             }
                             return null;
                           })()}
                           {!currentProperty.icon && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handlePropertyIconClick(e, currentProperty.id)}
                                className="h-6 w-6 p-0 text-[#b8b8b8] hover:bg-[#353535] hover:text-white pointer-events-auto"
                                title="Afegir icona"
                              >
                               <ImageIcon className="h-4 w-4" />
                             </Button>
                           )}
                          <input 
                            type="text" 
                            value={editingPropertyName || currentProperty?.name || ''}
                            onChange={(e) => setEditingPropertyName(e.target.value)}
                            onBlur={() => {
                              if (currentProperty && editingPropertyName && editingPropertyName !== currentProperty.name) {
                                handlePropertyNameChange(currentProperty.id, editingPropertyName);
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

                    {/* Current property options */}
                    <div className="space-y-2 mb-4">
                      {currentProperty?.options?.map((option) => (
                        <div key={option.id} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-[#2a2a2a] group">
                           <div className="flex items-center gap-3">
                             {option.icon && (() => {
                               const iconDef = getIconByName(option.icon);
                               if (iconDef) {
                                 const IconComponent = iconDef.icon;
                                 return (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => handleOptionIconClick(e, option.id)}
                                      className="h-5 w-5 p-0 text-white hover:bg-[#353535] hover:text-white/80 pointer-events-auto"
                                      title="Canviar icona"
                                    >
                                     <IconComponent className="h-3 w-3" />
                                   </Button>
                                 );
                               }
                               return null;
                             })()}
                             {!option.icon && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => handleOptionIconClick(e, option.id)}
                                  className="h-5 w-5 p-0 text-[#b8b8b8] hover:bg-[#353535] hover:text-white pointer-events-auto"
                                  title="Afegir icona"
                                >
                                 <ImageIcon className="h-3 w-3" />
                               </Button>
                             )}
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
                              if (e.key === 'Enter' && currentProperty) {
                                handleCreateOption(currentProperty.id);
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
                              onClick={() => currentProperty && handleCreateOption(currentProperty.id)}
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
                        <div 
                          className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-[#2a2a2a] cursor-pointer text-red-400 hover:text-red-300"
                          onClick={() => currentProperty && handleDeleteProperty(currentProperty.id, currentProperty.name)}
                        >
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
                        <div 
                          className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-[#2a2a2a] cursor-pointer text-red-400 hover:text-red-300"
                          onClick={() => currentProperty && handleDeleteProperty(currentProperty.id, currentProperty.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="text-sm">Eliminar propietat</span>
                        </div>
                     </div>
                    </>
                  )}
                </div>
              )}

            {currentPropertyView === 'nova_propietat' && (
              <div className="p-4">
                {/* Header with back button */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-[#b8b8b8] hover:bg-[#353535] hover:text-white"
                      onClick={() => {
                        handleBackToMain();
                        resetNewPropertyForm();
                      }}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4 text-[#b8b8b8]" />
                      <span className="text-sm font-medium text-white">Nova propietat</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-[#b8b8b8] hover:bg-[#353535] hover:text-white"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      resetNewPropertyForm();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Property name input */}
                <div className="mb-4">
                  <input
                    type="text"
                    value={newPropertyName}
                    onChange={(e) => setNewPropertyName(e.target.value)}
                    placeholder="Nom de la propietat"
                    className="w-full bg-transparent text-sm font-medium text-white border-none outline-none focus:bg-[#2a2a2a] rounded px-2 py-1.5 placeholder-[#b8b8b8]"
                    autoFocus
                  />
                </div>

                {/* Property type info */}
                <div className="mb-4">
                  <p className="text-xs text-[#b8b8b8]">Tipus: Select</p>
                </div>

                {/* Options list */}
                <div className="space-y-2 mb-4">
                  {newPropertyOptions.map((option) => (
                    <div key={option.id} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-[#2a2a2a] group">
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={option.color}
                          onChange={(e) => handleUpdateNewOptionColor(option.id, e.target.value)}
                          className="h-3 w-3 rounded-full border-none cursor-pointer"
                          style={{ backgroundColor: option.color }}
                        />
                        <span className="text-sm text-white">{option.label}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 text-red-400 hover:bg-[#404040]"
                          onClick={() => handleRemoveNewOption(option.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Add new option */}
                  {showNewOptionInput ? (
                    <div className="flex items-center gap-3 py-2 px-3 rounded-md bg-[#2a2a2a]">
                      <Circle className="h-3 w-3 text-[#6366f1]" />
                      <input
                        type="text"
                        value={newOptionInput}
                        onChange={(e) => setNewOptionInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddNewOption();
                          }
                          if (e.key === 'Escape') {
                            setShowNewOptionInput(false);
                            setNewOptionInput('');
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
                          onClick={handleAddNewOption}
                        >
                          <CheckSquare className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-[#b8b8b8] hover:bg-[#404040]"
                          onClick={() => {
                            setShowNewOptionInput(false);
                            setNewOptionInput('');
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-[#2a2a2a] cursor-pointer text-[#b8b8b8] hover:text-white"
                      onClick={() => setShowNewOptionInput(true)}
                    >
                      <Plus className="h-3 w-3" />
                      <span className="text-sm">Afegir una opció</span>
                    </div>
                  )}
                </div>

                {/* Create button */}
                <div className="mt-6">
                  <Button
                    onClick={handleCreateNewProperty}
                    disabled={!newPropertyName.trim() || newPropertyOptions.length === 0 || isCreatingProperty}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingProperty ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creant...
                      </>
                    ) : (
                      'Crear propietat'
                    )}
                  </Button>
                </div>
              </div>
            )}
           </PopoverContent>
        </Popover>

        {/* Simple Icon Picker - New simple system */}
        <SimpleIconPicker
          open={showIconPicker}
          onOpenChange={(open) => {
            setShowIconPicker(open);
            // Keep main popover open when icon picker closes
            if (!open && isSettingsOpen) {
              setTimeout(() => setIsSettingsOpen(true), 0);
            }
          }}
          onIconSelect={handleIconSelect}
          selectedIcon={iconTarget?.type === 'property' 
            ? properties.find(p => p.id === iconTarget?.id)?.icon 
            : properties.flatMap(p => p.options || []).find(o => o.id === iconTarget?.id)?.icon
          }
          title={iconTarget?.type === 'property' ? 'Seleccionar Icona de Propietat' : 'Seleccionar Icona d\'Opció'}
        />

      </div>
    </div>;
};
export default DatabaseToolbar;
