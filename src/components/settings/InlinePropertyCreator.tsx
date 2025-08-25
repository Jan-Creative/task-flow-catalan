import { useState } from "react";
import { Plus, X, Check, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ColorPicker } from "./ColorPicker";
import { useToast } from "@/lib/toastUtils";
import { SettingsItem } from "./SettingsItem";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PropertyOption {
  id: string;
  value: string;
  color: string;
}

interface InlinePropertyCreatorProps {
  onCreateProperty: (data: {
    name: string;
    description?: string;
    options: Omit<PropertyOption, 'id'>[];
  }) => void;
}

export const InlinePropertyCreator = ({ onCreateProperty }: InlinePropertyCreatorProps) => {
  const { toast } = useToast();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [propertyName, setPropertyName] = useState("");
  const [options, setOptions] = useState<PropertyOption[]>([]);
  const [newOptionValue, setNewOptionValue] = useState("");
  const [newOptionColor, setNewOptionColor] = useState("#3b82f6");

  const resetForm = () => {
    setPropertyName("");
    setOptions([]);
    setNewOptionValue("");
    setNewOptionColor("#3b82f6");
    setIsCreating(false);
  };

  const handleCreateProperty = async () => {
    if (!propertyName.trim()) {
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
        name: propertyName.trim(),
        options: options.map(opt => ({ value: opt.value, color: opt.color }))
      });
      
      toast({
        title: "Propietat creada",
        description: `La propietat "${propertyName}" s'ha creat correctament.`,
      });
      
      resetForm();
      setIsExpanded(false);
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

  const handleCancel = () => {
    resetForm();
    setIsExpanded(false);
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger asChild>
        <SettingsItem
          label="Noves Propietats"
          description="Crear una nova propietat personalitzada"
          icon={Plus}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
              Crear Nova
            </Badge>
          </div>
        </SettingsItem>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-0">
        <div className="ml-12 mr-4 py-4 space-y-4 border-l-2 border-primary/20 pl-4">
          {/* Property Name Input */}
          <div className="space-y-2">
            <Input
              placeholder="Nom de la propietat (ex: Àmbit, Client, Urgència...)"
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              className="bg-background/80 border-border/50 focus:border-primary transition-colors"
              disabled={isCreating}
            />
          </div>

          {/* Options Section */}
          {propertyName.trim() && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Opcions de "{propertyName}"</span>
              </div>

              {/* Existing Options */}
              {options.length > 0 && (
                <div className="space-y-2">
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

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isCreating}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel·lar
            </Button>
            <Button
              size="sm"
              onClick={handleCreateProperty}
              disabled={!propertyName.trim() || options.length === 0 || isCreating}
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
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
