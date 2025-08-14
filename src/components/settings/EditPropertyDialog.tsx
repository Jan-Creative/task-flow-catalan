import { useState, useEffect } from "react";
import { Plus, X, Type, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ColorPicker } from "./ColorPicker";
import { Badge } from "@/components/ui/badge";
import { PropertyWithOptions } from "@/hooks/useProperties";

interface PropertyOption {
  id: string;
  value: string;
  color: string;
}

interface EditPropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: PropertyWithOptions | null;
  onUpdateProperty: (data: {
    name: string;
    description?: string;
    options: Omit<PropertyOption, 'id'>[];
  }) => void;
}

export const EditPropertyDialog = ({
  open,
  onOpenChange,
  property,
  onUpdateProperty,
}: EditPropertyDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<PropertyOption[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (property) {
      setName(property.name || "");
      setDescription(""); // Description not available in current property type
      setOptions(
        property.options?.map((opt, index) => ({
          id: opt.id || index.toString(),
          value: opt.value,
          color: opt.color || "#3b82f6",
        })) || [{ id: "1", value: "", color: "#3b82f6" }]
      );
    }
  }, [property]);

  const isSystemProperty = property && ['Estat', 'Prioritat'].includes(property.name);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "El nom de la propietat és obligatori";
    }

    const validOptions = options.filter(opt => opt.value.trim());
    if (validOptions.length === 0) {
      newErrors.options = "Cal afegir almenys una opció";
    }

    const duplicateValues = validOptions.filter((opt, index) => 
      validOptions.findIndex(o => o.value.toLowerCase() === opt.value.toLowerCase()) !== index
    );
    if (duplicateValues.length > 0) {
      newErrors.options = "Les opcions no poden ser duplicades";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddOption = () => {
    const newOption: PropertyOption = {
      id: Date.now().toString(),
      value: "",
      color: "#3b82f6"
    };
    setOptions([...options, newOption]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length > 1) {
      setOptions(options.filter(opt => opt.id !== id));
    }
  };

  const handleOptionChange = (id: string, field: 'value' | 'color', value: string) => {
    setOptions(options.map(opt => 
      opt.id === id ? { ...opt, [field]: value } : opt
    ));
    if (field === 'value' && errors.options) {
      setErrors({ ...errors, options: "" });
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const validOptions = options
      .filter(opt => opt.value.trim())
      .map(opt => ({ value: opt.value.trim(), color: opt.color }));

    onUpdateProperty({
      name: name.trim(),
      description: description.trim() || undefined,
      options: validOptions,
    });

    onOpenChange(false);
  };

  const handleCancel = () => {
    if (property) {
      setName(property.name || "");
      setDescription(""); // Description not available in current property type
      setOptions(
        property.options?.map((opt, index) => ({
          id: opt.id || index.toString(),
          value: opt.value,
          color: opt.color || "#3b82f6",
        })) || [{ id: "1", value: "", color: "#3b82f6" }]
      );
    }
    setErrors({});
    onOpenChange(false);
  };

  if (!property) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Type className="h-5 w-5 text-primary" />
            Editar Propietat: {property.name}
          </DialogTitle>
          <DialogDescription>
            {isSystemProperty 
              ? "Pots editar les opcions d'aquesta propietat del sistema"
              : "Edita aquesta propietat personalitzada"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Property Name - disabled for system properties */}
          <div className="space-y-2">
            <Label htmlFor="property-name">Nom de la Propietat *</Label>
            <Input
              id="property-name"
              placeholder="Ex: Àmbit, Urgència, Client..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              disabled={isSystemProperty}
              className={errors.name ? "border-destructive" : ""}
            />
            {isSystemProperty && (
              <p className="text-xs text-muted-foreground">
                El nom de les propietats del sistema no es pot modificar
              </p>
            )}
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Property Description */}
          <div className="space-y-2">
            <Label htmlFor="property-description">Descripció (opcional)</Label>
            <Textarea
              id="property-description"
              placeholder="Descripció de com s'utilitzarà aquesta propietat..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Options Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base">Opcions de la Propietat *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                className="text-primary hover:bg-primary/10"
              >
                <Plus className="h-4 w-4 mr-1" />
                Afegir Opció
              </Button>
            </div>

            <div className="space-y-3">
              {options.map((option, index) => (
                <Card key={option.id} className="bg-secondary/20 border-border/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder={`Opció ${index + 1}`}
                          value={option.value}
                          onChange={(e) => handleOptionChange(option.id, 'value', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <ColorPicker
                          color={option.color}
                          onChange={(color) => handleOptionChange(option.id, 'color', color)}
                        />
                        
                        {options.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveOption(option.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {errors.options && (
              <p className="text-sm text-destructive">{errors.options}</p>
            )}
          </div>

          {/* Preview */}
          {name && options.some(opt => opt.value.trim()) && (
            <div className="space-y-2">
              <Label className="text-base">Vista Prèvia</Label>
              <Card className="bg-accent/10 border-accent/30">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">{name}</h4>
                    <div className="flex flex-wrap gap-2">
                      {options
                        .filter(opt => opt.value.trim())
                        .map((option) => (
                          <Badge
                            key={option.id}
                            variant="outline"
                            className="border"
                            style={{
                              backgroundColor: option.color + '20',
                              borderColor: option.color + '50',
                              color: option.color
                            }}
                          >
                            <div
                              className="w-2 h-2 rounded-full mr-2"
                              style={{ backgroundColor: option.color }}
                            />
                            {option.value}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel·lar
          </Button>
          <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Actualitzar Propietat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};