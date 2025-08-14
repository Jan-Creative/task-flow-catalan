import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { 
  iconLibrary, 
  iconCategories, 
  getIconsByCategory, 
  searchIcons, 
  type IconDefinition 
} from '@/lib/iconLibrary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface IconPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIconSelect: (iconName: string) => void;
  selectedIcon?: string;
  title?: string;
}

export const IconPicker: React.FC<IconPickerProps> = ({
  open,
  onOpenChange,
  onIconSelect,
  selectedIcon,
  title = "Seleccionar Icona"
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredIcons = useMemo(() => {
    return searchIcons(searchQuery, selectedCategory === 'all' ? undefined : selectedCategory);
  }, [searchQuery, selectedCategory]);

  const handleIconSelect = (iconName: string) => {
    onIconSelect(iconName);
    onOpenChange(false);
    setSearchQuery('');
    setSelectedCategory('all');
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const IconPreview: React.FC<{ icon: IconDefinition; isSelected: boolean }> = ({ icon, isSelected }) => {
    const IconComponent = icon.icon;
    
    return (
      <button
        onClick={() => handleIconSelect(icon.name)}
        className={cn(
          "group relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200",
          "hover:bg-accent hover:border-accent-foreground/20 hover:scale-105",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border"
        )}
        title={`${icon.name} - ${icon.keywords.join(', ')}`}
      >
        <IconComponent 
          className={cn(
            "h-5 w-5 mb-1 transition-colors",
            isSelected ? "text-primary-foreground" : "text-foreground group-hover:text-accent-foreground"
          )} 
        />
        <span className={cn(
          "text-xs font-medium truncate max-w-full transition-colors",
          isSelected ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground"
        )}>
          {icon.name}
        </span>
        {isSelected && (
          <div className="absolute inset-0 rounded-lg ring-2 ring-primary ring-offset-2" />
        )}
      </button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cercar icones per nom o paraula clau..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {iconCategories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "secondary"}
                className={cn(
                  "cursor-pointer transition-colors",
                  selectedCategory === category.id 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "hover:bg-secondary/80"
                )}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Badge>
            ))}
          </div>

          {/* Icons Grid */}
          <ScrollArea className="h-96 w-full">
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 p-1">
              {filteredIcons.map((icon) => (
                <IconPreview
                  key={icon.name}
                  icon={icon}
                  isSelected={selectedIcon === icon.name}
                />
              ))}
            </div>
            
            {filteredIcons.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Cap icona trobada
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  No s'han trobat icones que coincideixin amb la teva cerca. 
                  Prova amb altres paraules clau o canvia la categoria.
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={clearSearch}
                    className="mt-4"
                  >
                    Netejar cerca
                  </Button>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Results count */}
          {filteredIcons.length > 0 && (
            <div className="text-sm text-muted-foreground text-center">
              {filteredIcons.length} {filteredIcons.length === 1 ? 'icona trobada' : 'icones trobades'}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};