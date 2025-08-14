import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SimpleIconPicker } from "@/components/ui/simple-icon-picker";
import { ColorPicker } from "@/components/settings/ColorPicker";
import { Check, X } from "lucide-react";
import { getIconByName } from "@/lib/iconLibrary";

interface FolderCustomizationPopoverProps {
  folderId: string;
  currentIcon?: string;
  currentColor: string;
  onUpdate: (updates: { icon?: string; color: string }) => Promise<void>;
  children: React.ReactNode;
}

export function FolderCustomizationPopover({
  folderId,
  currentIcon,
  currentColor,
  onUpdate,
  children
}: FolderCustomizationPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(currentIcon || "");
  const [selectedColor, setSelectedColor] = useState(currentColor);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onUpdate({
        icon: selectedIcon || undefined,
        color: selectedColor
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating folder:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedIcon(currentIcon || "");
    setSelectedColor(currentColor);
    setIsOpen(false);
  };

  const handleIconSelect = (iconName: string) => {
    setSelectedIcon(iconName);
    setIsIconPickerOpen(false);
  };

  const IconComponent = selectedIcon ? getIconByName(selectedIcon)?.icon : null;

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          {children}
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Personalitzar carpeta</h4>
            
            {/* Icon Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Icona</label>
              <Button
                variant="outline"
                onClick={() => setIsIconPickerOpen(true)}
                className="w-full justify-start h-10"
              >
                {IconComponent ? (
                  <IconComponent className="h-4 w-4 mr-2" />
                ) : (
                  <div className="h-4 w-4 mr-2 rounded bg-muted" />
                )}
                {selectedIcon ? "Canviar icona" : "Seleccionar icona"}
              </Button>
            </div>

            {/* Color Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <ColorPicker
                color={selectedColor}
                onChange={setSelectedColor}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                size="sm"
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-1" />
                Guardar
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel·lar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <SimpleIconPicker
        open={isIconPickerOpen}
        onOpenChange={setIsIconPickerOpen}
        onIconSelect={handleIconSelect}
        selectedIcon={selectedIcon}
        title="Seleccionar icona de carpeta"
      />
    </>
  );
}