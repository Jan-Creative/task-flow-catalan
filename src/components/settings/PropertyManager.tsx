import { useState } from "react";
import { Plus, Edit, Trash2, Tag, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProperties } from "@/hooks/useProperties";
import { SettingsItem } from "./SettingsItem";

export const PropertyManager = () => {
  const { properties, loading } = useProperties();
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null);

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
                    toggleProperty(property.id);
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
            className="text-primary hover:bg-primary/10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Propietat
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
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Propietat
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
                      toggleProperty(property.id);
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
                      // Handle delete
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
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
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
              >
                <Plus className="h-4 w-4 mr-2" />
                Afegir Opció
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};