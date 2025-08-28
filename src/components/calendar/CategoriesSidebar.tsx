import { useState } from "react";
import { Calendar, Users, Briefcase, Heart, Star, Settings, Plus, ArrowLeft, X, Edit2, Trash2, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SimpleIconPicker } from "@/components/ui/simple-icon-picker";
import { getIconByName } from "@/lib/iconLibrary";
import { useToast } from "@/lib/toastUtils";

interface Category {
  id: string;
  name: string;
  color: string;
  icon: any;
  count: number;
  enabled: boolean;
}

const CategoriesSidebar = () => {
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<Category[]>([
    { 
      id: '1', 
      name: 'Personal', 
      color: 'hsl(var(--primary))', 
      icon: Heart, 
      count: 8, 
      enabled: true 
    },
    { 
      id: '2', 
      name: 'Feina', 
      color: 'hsl(var(--destructive))', 
      icon: Briefcase, 
      count: 12, 
      enabled: true 
    },
    { 
      id: '3', 
      name: 'Social', 
      color: 'hsl(var(--muted-foreground))', 
      icon: Users, 
      count: 5, 
      enabled: false 
    },
    { 
      id: '4', 
      name: 'Important', 
      color: 'hsl(var(--warning))', 
      icon: Star, 
      count: 3, 
      enabled: true 
    }
  ]);

  // Configuration state
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'nova_categoria'>('main');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [iconEditPopoverId, setIconEditPopoverId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: 'hsl(var(--primary))',
    icon: 'Heart'
  });

  const toggleCategory = (categoryId: string) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, enabled: !cat.enabled }
          : cat
      )
    );
  };

  // Configuration handlers
  const handleDeleteCategory = (categoryId: string) => {
    const categoryToDelete = categories.find(cat => cat.id === categoryId);
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    toast({
      title: "Categoria eliminada",
      description: `La categoria "${categoryToDelete?.name}" s'ha eliminat correctament.`,
    });
  };

  const handleDuplicateCategory = (categoryId: string) => {
    const categoryToDuplicate = categories.find(cat => cat.id === categoryId);
    if (categoryToDuplicate) {
      const newId = Date.now().toString();
      const duplicatedCategory = {
        ...categoryToDuplicate,
        id: newId,
        name: `${categoryToDuplicate.name} (copia)`,
        count: 0
      };
      setCategories(prev => [...prev, duplicatedCategory]);
      toast({
        title: "Categoria duplicada",
        description: `S'ha creat una copia de "${categoryToDuplicate.name}".`,
      });
    }
  };

  const handleEditCategoryName = (categoryId: string, newName: string) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, name: newName }
          : cat
      )
    );
    setEditingCategoryId(null);
  };

  const handleColorChange = (categoryId: string, newColor: string) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, color: newColor }
          : cat
      )
    );
  };

  const handleIconChange = (categoryId: string, newIconName: string) => {
    // Use the icon library to get the correct icon component
    const iconDefinition = getIconByName(newIconName);
    
    if (!iconDefinition) {
      console.warn(`Icon "${newIconName}" not found in library, using fallback`);
      return;
    }
    
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, icon: iconDefinition.icon }
          : cat
      )
    );
    
    console.log(`✅ Updated category ${categoryId} with icon: ${newIconName}`);
  };

  const handleCreateCategory = () => {
    if (!newCategory.name.trim()) return;
    
    // Use the icon library to get the correct icon component
    const iconDefinition = getIconByName(newCategory.icon);
    
    if (!iconDefinition) {
      console.warn(`Icon "${newCategory.icon}" not found in library, using fallback`);
      return;
    }

    const categoryToCreate = {
      id: Date.now().toString(),
      name: newCategory.name,
      color: newCategory.color,
      icon: iconDefinition.icon,
      count: 0,
      enabled: true
    };

    setCategories(prev => [...prev, categoryToCreate]);
    setNewCategory({ name: '', color: 'hsl(var(--primary))', icon: 'Heart' });
    setCurrentView('main');
    
    toast({
      title: "Categoria creada",
      description: `La categoria "${categoryToCreate.name}" s'ha creat correctament.`,
    });
    
    console.log(`✅ Created new category with icon: ${newCategory.icon}`);
  };

  const resetConfigState = () => {
    setCurrentView('main');
    setEditingCategoryId(null);
    // Don't close icon picker from here - let it manage its own state
    setIconEditPopoverId(null);
    setNewCategory({ name: '', color: 'hsl(var(--primary))', icon: 'Heart' });
  };

  const activeCategories = categories.filter(cat => cat.enabled);
  const totalVisibleEvents = activeCategories.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <Card className="h-[240px] flex flex-col bg-card shadow-[var(--shadow-card)] overflow-hidden">
      <CardHeader className="pb-3 px-6">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
          <Calendar className="h-4 w-4 text-primary" />
          Categories
          <Badge variant="secondary" className="ml-auto text-xs">
            {activeCategories.length}/{categories.length}
          </Badge>
          <Popover open={isConfigOpen} onOpenChange={(open) => {
            setIsConfigOpen(open);
            if (!open && !isIconPickerOpen) {
              resetConfigState();
            }
          }}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 hover:bg-accent ml-1"
              >
                <Settings className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-80 p-0 bg-[#1f1f1f] border-[#333] text-white"
              align="end"
              sideOffset={8}
            >
              {currentView === 'main' ? (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-white">Configurar Categories</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-[#353535] text-[#b8b8b8]"
                      onClick={() => setIsConfigOpen(false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {categories.map((category) => {
                      const IconComponent = category.icon;
                       return (
                         <div key={category.id} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-[#2a2a2a] transition-colors">
                           {/* Icon with color - clickable to open customization popover */}
                           <Popover 
                             open={iconEditPopoverId === category.id} 
                             onOpenChange={(open) => setIconEditPopoverId(open ? category.id : null)}
                           >
                             <PopoverTrigger asChild>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 className="h-6 w-6 p-0 hover:bg-[#353535] transition-colors"
                               >
                                 <IconComponent 
                                   className="h-4 w-4" 
                                   style={{ color: category.color.includes('hsl') ? '#3b82f6' : category.color }}
                                 />
                               </Button>
                             </PopoverTrigger>
                             <PopoverContent 
                               className="w-64 p-3 bg-[#1f1f1f] border-[#333] text-white"
                               align="start"
                               sideOffset={8}
                             >
                               <div className="space-y-3">
                                 <h4 className="text-sm font-medium text-white">Personalitzar categoria</h4>
                                 
                                  {/* Color picker */}
                                  <div>
                                    <label className="text-xs text-[#b8b8b8] mb-2 block">Color</label>
                                    <input
                                      type="color"
                                      value={category.color.includes('hsl') ? '#3b82f6' : category.color}
                                      onChange={(e) => handleColorChange(category.id, e.target.value)}
                                      className="w-8 h-8 rounded border-none cursor-pointer"
                                    />
                                  </div>
                                 
                                 {/* Icon selection */}
                                 <div>
                                   <label className="text-xs text-[#b8b8b8] mb-2 block">Icona</label>
                                   <Button
                                     variant="outline"
                                     size="sm"
                                     className="w-full justify-start bg-[#333] border-[#444] text-[#b8b8b8] hover:bg-[#353535]"
                                       onClick={() => {
                                         setEditingCategoryId(category.id);
                                         setIconEditPopoverId(null);
                                         setTimeout(() => setIsIconPickerOpen(true), 100);
                                       }}
                                   >
                                     <IconComponent className="h-4 w-4 mr-2" style={{ color: category.color.includes('hsl') ? '#3b82f6' : category.color }} />
                                     Canviar icona
                                   </Button>
                                 </div>
                               </div>
                             </PopoverContent>
                           </Popover>
                           
                           {/* Name */}
                           {editingCategoryId === category.id ? (
                             <Input
                               value={category.name}
                               onChange={(e) => handleEditCategoryName(category.id, e.target.value)}
                               onBlur={() => setEditingCategoryId(null)}
                               onKeyDown={(e) => {
                                 if (e.key === 'Enter') setEditingCategoryId(null);
                                 if (e.key === 'Escape') setEditingCategoryId(null);
                               }}
                               className="flex-1 h-6 text-xs bg-[#333] border-[#444] text-white"
                               autoFocus
                             />
                           ) : (
                             <span 
                               className="flex-1 text-xs text-[#b8b8b8] cursor-pointer"
                               onClick={() => setEditingCategoryId(category.id)}
                             >
                               {category.name}
                             </span>
                           )}
                           
                           {/* Actions */}
                           <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Button
                               variant="ghost"
                               size="sm"
                               className="h-6 w-6 p-0 hover:bg-[#353535]"
                               onClick={() => setEditingCategoryId(category.id)}
                             >
                               <Edit2 className="h-3 w-3 text-[#b8b8b8]" />
                             </Button>
                             <Button
                               variant="ghost"
                               size="sm"
                               className="h-6 w-6 p-0 hover:bg-[#353535]"
                               onClick={() => handleDeleteCategory(category.id)}
                             >
                               <Trash2 className="h-3 w-3 text-red-400" />
                             </Button>
                           </div>
                         </div>
                      );
                    })}
                  </div>
                  
                  <Separator className="my-4 bg-[#333]" />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8 hover:bg-[#2a2a2a] text-[#b8b8b8]"
                    onClick={() => setCurrentView('nova_categoria')}
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Nova categoria
                  </Button>
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-[#353535] text-[#b8b8b8]"
                        onClick={() => setCurrentView('main')}
                      >
                        <ArrowLeft className="h-3 w-3" />
                      </Button>
                      <h3 className="text-sm font-medium text-white">Nova categoria</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-[#353535] text-[#b8b8b8]"
                      onClick={() => setIsConfigOpen(false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-[#b8b8b8] mb-2 block">Nom de la categoria</label>
                      <Input
                        value={newCategory.name}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nom de la categoria"
                        className="bg-[#333] border-[#444] text-white text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs text-[#b8b8b8] mb-2 block">Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={newCategory.color.includes('hsl') ? '#3b82f6' : newCategory.color}
                          onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                          className="w-8 h-8 rounded border-none cursor-pointer"
                        />
                        <div 
                          className="w-8 h-8 rounded border border-[#444]"
                          style={{ backgroundColor: newCategory.color }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-[#b8b8b8] mb-2 block">Icona</label>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-[#333] border-[#444] text-[#b8b8b8] hover:bg-[#353535]"
                        onClick={() => setIsIconPickerOpen(true)}
                      >
                        {newCategory.icon} - Seleccionar icona
                      </Button>
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-[#333] border-[#444] text-[#b8b8b8] hover:bg-[#353535]"
                        onClick={() => setCurrentView('main')}
                      >
                        Cancel·lar
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={handleCreateCategory}
                        disabled={!newCategory.name.trim()}
                      >
                        Crear categoria
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </CardTitle>
        
        <SimpleIconPicker
          open={isIconPickerOpen}
          onOpenChange={(open) => {
            setIsIconPickerOpen(open);
            if (!open) {
              setIconEditPopoverId(null);
              setEditingCategoryId(null);
            }
          }}
          onIconSelect={(iconName) => {
            if (editingCategoryId) {
              handleIconChange(editingCategoryId, iconName);
            } else {
              setNewCategory(prev => ({ ...prev, icon: iconName }));
            }
            setIsIconPickerOpen(false);
            setIconEditPopoverId(null);
          }}
          selectedIcon={editingCategoryId ? 
            categories.find(cat => cat.id === editingCategoryId)?.icon?.name || 'Heart' : 
            newCategory.icon
          }
          title="Seleccionar icona per a la categoria"
        />
      </CardHeader>
      
      <CardContent className="flex-1 p-0 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-2 px-6 pb-3">
            {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <div key={category.id} className="flex items-center justify-between group hover:bg-accent/50 rounded-lg p-1 transition-colors">
                 <div className="flex items-center gap-2 flex-1 min-w-0">
                   <IconComponent 
                     className="h-4 w-4 flex-shrink-0" 
                     style={{ color: category.color.includes('hsl') ? '#3b82f6' : category.color }}
                   />
                   <span className="text-sm text-foreground truncate">{category.name}</span>
                   <Badge variant="outline" className="text-xs ml-auto border-muted">
                     {category.count}
                   </Badge>
                 </div>
                <Switch
                  checked={category.enabled}
                  onCheckedChange={() => toggleCategory(category.id)}
                  className="ml-2 scale-75"
                />
              </div>
            );
          })}
          </div>
        </ScrollArea>
        
        <div className="px-6 py-3 border-t border-border bg-muted/30">
          <div className="text-xs text-muted-foreground text-center">
            <span className="font-medium text-foreground">{totalVisibleEvents}</span> esdeveniments visibles
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoriesSidebar;