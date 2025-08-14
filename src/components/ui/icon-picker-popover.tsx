import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { 
  iconLibrary, 
  iconCategories, 
  searchIcons, 
  type IconDefinition 
} from '@/lib/iconLibrary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface IconPickerPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIconSelect: (iconName: string) => void;
  selectedIcon?: string;
  title?: string;
  position?: { x: number; y: number };
  triggerRef?: React.RefObject<HTMLElement>;
}

export const IconPickerPopover: React.FC<IconPickerPopoverProps> = ({
  open,
  onOpenChange,
  onIconSelect,
  selectedIcon,
  title = "Seleccionar Icona",
  position,
  triggerRef
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [pendingIcon, setPendingIcon] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredIcons = useMemo(() => {
    return searchIcons(searchQuery, selectedCategory === 'all' ? undefined : selectedCategory);
  }, [searchQuery, selectedCategory]);

  const handleIconClick = (iconName: string) => {
    setPendingIcon(iconName);
  };

  const handleConfirmSelection = async () => {
    if (!pendingIcon) return;
    
    setIsLoading(true);
    try {
      await onIconSelect(pendingIcon);
      onOpenChange(false);
      setSearchQuery('');
      setSelectedCategory('all');
      setPendingIcon(null);
    } catch (error) {
      console.error('Error saving icon:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPendingIcon(null);
    onOpenChange(false);
    setSearchQuery('');
    setSelectedCategory('all');
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const IconPreview: React.FC<{ icon: IconDefinition; isSelected: boolean; isPending: boolean }> = ({ icon, isSelected, isPending }) => {
    const IconComponent = icon.icon;
    
    return (
      <button
        onClick={() => handleIconClick(icon.name)}
        disabled={isLoading}
        className={cn(
          "group relative flex flex-col items-center justify-center p-2 rounded-md border transition-colors duration-200",
          "hover:bg-[#353535] hover:border-[#555]",
          "focus:outline-none focus:ring-1 focus:ring-blue-500",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isPending ? "bg-orange-600 text-white border-orange-500" : 
          isSelected ? "bg-blue-600 text-white border-blue-500" : "bg-[#2a2a2a] border-[#444] text-[#b8b8b8]"
        )}
        title={`${icon.name} - ${icon.keywords.join(', ')}`}
      >
        <IconComponent 
          className={cn(
            "h-3.5 w-3.5 mb-1 transition-colors",
            isPending || isSelected ? "text-white" : "text-[#b8b8b8] group-hover:text-white"
          )} 
        />
        <span className={cn(
          "text-[10px] font-medium truncate max-w-full transition-colors",
          isPending || isSelected ? "text-white" : "text-[#888] group-hover:text-white"
        )}>
          {icon.name}
        </span>
        {(isSelected || isPending) && (
          <div className={cn(
            "absolute inset-0 rounded-md ring-1",
            isPending ? "ring-orange-400" : "ring-blue-400"
          )} />
        )}
      </button>
    );
  };

  if (!open) return <div style={{ display: 'none' }} />;

  return (
    <div
      className="fixed z-[9999] w-80 bg-[#1f1f1f] border border-[#333] rounded-lg shadow-xl"
      style={{ 
        maxHeight: '70vh',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#333] bg-[#2a2a2a] rounded-t-lg">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpenChange(false)}
          className="h-6 w-6 p-0 text-[#888] hover:text-white hover:bg-[#404040]"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

        <div className="p-3 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-[#888]" />
            <Input
              placeholder="Cercar icones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-8 h-8 text-xs bg-[#2a2a2a] border-[#444] text-white placeholder:text-[#888] focus:border-blue-500"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-[#888] hover:text-white"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-1">
            {iconCategories.slice(0, 6).map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "secondary"}
                className={cn(
                  "cursor-pointer transition-colors text-xs px-2 py-1",
                  selectedCategory === category.id 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "bg-[#2a2a2a] text-[#b8b8b8] border-[#444] hover:bg-[#353535] hover:text-white"
                )}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Badge>
            ))}
          </div>

          {/* Icons Grid */}
          <ScrollArea className="h-64 w-full scroll-area">
            <div className="grid grid-cols-8 gap-1 p-1">
              {filteredIcons.slice(0, 64).map((icon) => (
                <IconPreview
                  key={icon.name}
                  icon={icon}
                  isSelected={selectedIcon === icon.name}
                  isPending={pendingIcon === icon.name}
                />
              ))}
            </div>
            
            {filteredIcons.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Search className="h-8 w-8 text-[#666] mb-2" />
                <p className="text-xs text-[#888]">
                  Cap icona trobada
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSearch}
                    className="mt-2 h-7 text-xs bg-[#2a2a2a] border-[#444] text-[#b8b8b8] hover:bg-[#353535] hover:text-white"
                  >
                    Netejar cerca
                  </Button>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Results count */}
          {filteredIcons.length > 0 && (
            <div className="text-xs text-[#888] text-center">
              {Math.min(filteredIcons.length, 64)} de {filteredIcons.length} icones
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 mt-3 pt-3 border-t border-[#333]">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 h-8 text-xs bg-[#2a2a2a] border-[#444] text-[#b8b8b8] hover:bg-[#353535] hover:text-white"
            >
              Cancel·lar
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmSelection}
              disabled={!pendingIcon || isLoading}
              className="flex-1 h-8 text-xs bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Guardant..." : "Confirmar"}
            </Button>
          </div>
        </div>
      </div>
  );
};