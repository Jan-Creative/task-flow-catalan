import { useState } from "react";
import { Monitor, Moon, Sun, Palette, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SettingsItem } from "./SettingsItem";

export const ThemeSelector = () => {
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>('dark');
  const [previewMode, setPreviewMode] = useState(false);

  const themes = [
    {
      id: 'light' as const,
      name: 'Clar',
      description: 'Tema clar i net',
      icon: Sun,
      preview: 'bg-gradient-to-br from-slate-50 to-slate-100'
    },
    {
      id: 'dark' as const,
      name: 'Fosc',
      description: 'Tema fosc i elegant (recomanat)',
      icon: Moon,
      preview: 'bg-gradient-to-br from-slate-900 to-slate-800'
    },
    {
      id: 'system' as const,
      name: 'Sistema',
      description: 'Segueix la configuració del sistema',
      icon: Monitor,
      preview: 'bg-gradient-to-br from-slate-400 to-slate-600'
    }
  ];

  const handleThemeSelect = (themeId: typeof selectedTheme) => {
    setSelectedTheme(themeId);
    // Here would implement actual theme switching
  };

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Selecció de Tema
        </h4>
        
        <div className="grid gap-3">
          {themes.map((theme) => {
            const Icon = theme.icon;
            const isSelected = selectedTheme === theme.id;
            
            return (
              <div
                key={theme.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-primary/10 border-primary/50 ring-1 ring-primary/30'
                    : 'bg-secondary/20 border-border/30 hover:bg-secondary/30'
                }`}
                onClick={() => handleThemeSelect(theme.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${isSelected ? 'bg-primary/20' : 'bg-accent/20'}`}>
                    <Icon className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-accent-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{theme.name}</span>
                      {isSelected && (
                        <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 text-xs">
                          Actiu
                        </Badge>
                      )}
                      {theme.id === 'dark' && (
                        <Badge variant="outline" className="bg-success/20 text-success border-success/30 text-xs">
                          Recomanat
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{theme.description}</p>
                  </div>
                  <div className={`w-8 h-8 rounded border border-border/50 ${theme.preview}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview Mode */}
      <SettingsItem
        label="Mode Previsualització"
        description="Previsualitza els canvis abans d'aplicar-los"
        icon={Eye}
      >
        <Button
          variant={previewMode ? "default" : "outline"}
          size="sm"
          onClick={() => setPreviewMode(!previewMode)}
        >
          {previewMode ? 'Activat' : 'Desactivat'}
        </Button>
      </SettingsItem>

      {/* Theme Customization Preview */}
      <Card className="bg-gradient-to-br from-card/40 via-card/60 to-card/40 backdrop-blur-glass border-border/50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Previsualització del Tema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm font-medium text-foreground">Element Principal</p>
              <p className="text-xs text-muted-foreground">Accent i colors primaris</p>
            </div>
            <div className="p-3 bg-secondary/20 rounded-lg border border-border/30">
              <p className="text-sm font-medium text-foreground">Element Secundari</p>
              <p className="text-xs text-muted-foreground">Colors de fons i targetes</p>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 p-2 bg-success/20 rounded text-center">
                <p className="text-xs text-success">Èxit</p>
              </div>
              <div className="flex-1 p-2 bg-warning/20 rounded text-center">
                <p className="text-xs text-warning">Avís</p>
              </div>
              <div className="flex-1 p-2 bg-destructive/20 rounded text-center">
                <p className="text-xs text-destructive">Error</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};