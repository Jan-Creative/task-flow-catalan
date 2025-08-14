import { useState } from "react";
import { Plus, Edit, Trash2, Tag, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProperties } from "@/hooks/useProperties";
import { useToast } from "@/hooks/use-toast";
import { SettingsItem } from "./SettingsItem";
import { CreatePropertyDialog } from "./CreatePropertyDialog";
import { EditPropertyDialog } from "./EditPropertyDialog";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";

export const PropertyManager = () => {
  const { properties, loading } = useProperties();
  const { toast } = useToast();
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'property' | 'option';
    id: string;
    name: string;
    propertyId?: string;
  } | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Debug function to track button clicks
  const debugClick = (action: string, data?: any) => {
    console.log(`🔍 PropertyManager Debug - ${action}:`, {
      timestamp: new Date().toISOString(),
      action,
      data,
      createDialogOpen,
      loading,
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-secondary/50 rounded w-1/3 mb-2"></div>
          <div className="h-8 bg-secondary/50 rounded"></div>
        </div>
      </div>
    );
  }

  const systemProperties = properties.filter(p => ['Estat', 'Prioritat'].includes(p.name));
  const customProperties = properties.filter(p => !['Estat', 'Prioritat'].includes(p.name));

  const toggleProperty = (propertyId: string) => {
    setExpandedProperty(expandedProperty === propertyId ? null : propertyId);
  };

  const handleCreateProperty = async (data: any) => {
    debugClick('handleCreateProperty', data);
    setIsCreating(true);
    
    try {
      // TODO: Implement backend integration
      console.log('Creating property:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Propietat creada",
        description: `La propietat "${data.name}" s'ha creat correctament.`,
      });
      
      setCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating property:', error);
      toast({
        title: "Error",
        description: "No s'ha pogut crear la propietat. Torna-ho a intentar.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenCreateDialog = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    debugClick('handleOpenCreateDialog');
    setCreateDialogOpen(true);
  };

  const handleEditProperty = (property: any) => {
    setSelectedProperty(property);
    setEditDialogOpen(true);
  };

  const handleUpdateProperty = async (data: any) => {
    try {
      // TODO: Implement backend integration
      console.log('Updating property:', selectedProperty?.id, data);
      toast({
        title: "Propietat actualitzada",
        description: `La propietat "${data.name}" s'ha actualitzat correctament.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No s'ha pogut actualitzar la propietat. Torna-ho a intentar.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProperty = (property: any) => {
    setDeleteTarget({
      type: 'property',
      id: property.id,
      name: property.name,
    });
    setDeleteDialogOpen(true);
  };

  const handleDeleteOption = (propertyId: string, option: any) => {
    setDeleteTarget({
      type: 'option',
      id: option.id,
      name: option.value,
      propertyId,
    });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === 'property') {
        // TODO: Implement backend integration
        console.log('Deleting property:', deleteTarget.id);
        toast({
          title: "Propietat eliminada",
          description: `La propietat "${deleteTarget.name}" s'ha eliminat correctament.`,
        });
      } else {
        // TODO: Implement backend integration
        console.log('Deleting option:', deleteTarget.id, 'from property:', deleteTarget.propertyId);
        toast({
          title: "Opció eliminada",
          description: `L'opció "${deleteTarget.name}" s'ha eliminat correctament.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No s'ha pogut eliminar l'element. Torna-ho a intentar.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* System Properties */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          Propietats del Sistema
        </h4>
        <div className="space-y-2">
          {systemProperties.map((property) => (
            <SettingsItem
              key={property.id}
              label={property.name}
              description={`${property.options?.length || 0} opcions disponibles`}
              icon={Tag}
              className="cursor-pointer"
              onClick={() => toggleProperty(property.id)}
            >
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-warning/20 text-warning border-warning/30">
                  Sistema
                </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditProperty(property);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
              </div>
            </SettingsItem>
          ))}
        </div>
      </div>

      {/* Custom Properties */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Propietats Personalitzades
          </h4>
          <Button
            variant="outline"
            size="sm"
            className="text-primary hover:bg-primary/10 transition-all duration-200 hover:scale-105 relative z-10"
            onClick={handleOpenCreateDialog}
            disabled={isCreating}
            aria-label="Crear nova propietat personalitzada"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isCreating ? "Creant..." : "Nova Propietat"}
          </Button>
        </div>
        
        {customProperties.length === 0 ? (
          <Card className="bg-secondary/20 border-border/30">
            <CardContent className="p-6 text-center">
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-3">
                No tens propietats personalitzades
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Crea propietats per organitzar millor les teves tasques
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleOpenCreateDialog}
                disabled={isCreating}
                className="transition-all duration-200 hover:scale-105"
                aria-label="Crear la teva primera propietat personalitzada"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCreating ? "Creant..." : "Crear Primera Propietat"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {customProperties.map((property) => (
              <SettingsItem
                key={property.id}
                label={property.name}
                description={`${property.options?.length || 0} opcions disponibles`}
                icon={Tag}
                className="cursor-pointer"
                onClick={() => toggleProperty(property.id)}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                    Personalitzada
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditProperty(property);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProperty(property);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </SettingsItem>
            ))}
          </div>
        )}
      </div>

      {/* Property Options Expansion */}
      {expandedProperty && (
        <Card className="bg-accent/10 border-accent/30">
          <CardHeader>
            <CardTitle className="text-sm">
              Opcions de {properties.find(p => p.id === expandedProperty)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {properties
                .find(p => p.id === expandedProperty)
                ?.options?.map((option, index) => (
                  <div
                    key={option.id}
                    className="flex items-center justify-between p-2 bg-secondary/20 rounded border border-border/20"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: option.color || '#6b7280' }}
                      />
                      <span className="text-sm">{option.value}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          // TODO: Implement inline option editing
                          console.log('Edit option:', option.id);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteOption(expandedProperty, option)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => {
                  // TODO: Implement add option functionality
                  console.log('Add option to property:', expandedProperty);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Afegir Opció
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <CreatePropertyDialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          debugClick('createDialogOpenChange', { open });
          setCreateDialogOpen(open);
        }}
        onCreateProperty={handleCreateProperty}
      />

      <EditPropertyDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        property={selectedProperty}
        onUpdateProperty={handleUpdateProperty}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={deleteTarget?.type === 'property' ? "Eliminar Propietat" : "Eliminar Opció"}
        description={
          deleteTarget?.type === 'property'
            ? "Estàs segur que vols eliminar aquesta propietat? Totes les tasques que la tinguin assignada perdran aquesta informació."
            : "Estàs segur que vols eliminar aquesta opció? Totes les tasques que la tinguin assignada perdran aquesta informació."
        }
        itemName={deleteTarget?.name || ""}
        onConfirm={handleConfirmDelete}
        isDestructive={true}
      />
    </div>
  );
};