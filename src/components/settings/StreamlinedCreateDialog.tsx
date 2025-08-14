import { useState } from "react";
import { Plus, X, Check, Type, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ColorPicker } from "./ColorPicker";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface PropertyOption {
  id: string;
  value: string;
  color: string;
}

interface StreamlinedCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProperty: (data: {
    name: string;
    description?: string;
    options: Omit<PropertyOption, 'id'>[];
  }) => void;
}

export const StreamlinedCreateDialog = ({
  open,
  onOpenChange,
  onCreateProperty,
}: StreamlinedCreateDialogProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [options, setOptions] = useState<PropertyOption[]>([]);
  const [newOptionValue, setNewOptionValue] = useState("");
  const [newOptionColor, setNewOptionColor] = useState("#3b82f6");
  const [isCreating, setIsCreating] = useState(false);

  const resetForm = () => {
    setName("");
    setOptions([]);
    setNewOptionValue("");
    setNewOptionColor("#3b82f6");
    setIsCreating(false);
  };

  const handleAddOption = () => {
    if (!newOptionValue.trim()) {
      toast({
        title: "Error",
        description: "El valor de l'opció és obligatori",
        variant: "destructive",
      });
      return;
    }

    const isDuplicate = options.some(opt => 
      opt.value.toLowerCase() === newOptionValue.trim().toLowerCase()
    );

    if (isDuplicate) {
      toast({
        title: "Error",
        description: "Aquesta opció ja existeix",
        variant: "destructive",
      });
      return;
    }

    const newOption: PropertyOption = {
      id: Date.now().toString(),
      value: newOptionValue.trim(),
      color: newOptionColor
    };

    setOptions([...options, newOption]);
    setNewOptionValue("");
    setNewOptionColor("#3b82f6");
  };

  const handleRemoveOption = (id: string) => {
    setOptions(options.filter(opt => opt.id !== id));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "El nom de la propietat és obligatori",
        variant: "destructive",
      });
      return;
    }

    if (options.length === 0) {
      toast({
        title: "Error", 
        description: "Cal afegir almenys una opció",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    try {
      await onCreateProperty({
        name: name.trim(),
        options: options.map(opt => ({ value: opt.value, color: opt.color }))
      });
      
      toast({
        title: "Propietat creada",
        description: `La propietat "${name}" s'ha creat correctament.`,
      });
      
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No s'ha pogut crear la propietat. Torna-ho a intentar.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Type className="h-5 w-5 text-primary" />
            Nova Propietat
          </DialogTitle>
          <DialogDescription>
            Crea una nova propietat personalitzada seguint l'estil de "Estat" i "Prioritat"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto max-h-[50vh]">
          {/* Property Name */}
          <div className="space-y-2">
            <Label htmlFor="property-name">Nom de la Propietat</Label>
            <Input
              id="property-name"
              placeholder="Ex: Àmbit, Client, Urgència..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background/80 border-border/50 focus:border-primary"
              disabled={isCreating}
            />
          </div>

          {/* Options Section */}
          {name.trim() && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Opcions de "{name}"</Label>
                <span className="text-xs text-muted-foreground">{options.length} opcions</span>
              </div>

              {/* Existing Options */}
              {options.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center justify-between p-2 bg-accent/20 rounded-lg border border-border/30"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: option.color }}
                        />
                        <span className="text-sm text-foreground">{option.value}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOption(option.id)}
                        className="text-destructive hover:bg-destructive/10 h-6 w-6 p-0"
                        disabled={isCreating}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Option */}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Nova opció..."
                  value={newOptionValue}
                  onChange={(e) => setNewOptionValue(e.target.value)}
                  className="flex-1 bg-background/80 border-border/50 focus:border-primary text-sm"
                  disabled={isCreating}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
                />
                <ColorPicker
                  color={newOptionColor}
                  onChange={setNewOptionColor}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  disabled={!newOptionValue.trim() || isCreating}
                  className="text-primary hover:bg-primary/10 border-primary/30"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Preview */}
          {name && options.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/30">
              <Label className="text-sm font-medium">Vista Prèvia</Label>
              <div className="p-3 bg-accent/10 rounded-lg border border-accent/30">
                <div className="space-y-2">
                  <span className="text-sm font-medium">{name}</span>
                  <div className="flex flex-wrap gap-2">
                    {options.map((option) => (
                      <Badge
                        key={option.id}
                        variant="outline"
                        className="border text-xs"
                        style={{
                          backgroundColor: option.color + '20',
                          borderColor: option.color + '50',
                          color: option.color
                        }}
                      >
                        <div
                          className="w-2 h-2 rounded-full mr-1"
                          style={{ backgroundColor: option.color }}
                        />
                        {option.value}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isCreating}>
            Cancel·lar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!name.trim() || options.length === 0 || isCreating}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isCreating ? (
              <>Creant...</>
            ) : (
              <>
                <Check className="h-3 w-3 mr-1" />
                Crear Propietat
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
