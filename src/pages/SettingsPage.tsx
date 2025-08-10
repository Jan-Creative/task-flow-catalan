import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Code, Database, Smartphone } from "lucide-react";

const SettingsPage = () => {
  return (
    <div className="p-6 pb-24 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Configuració</h1>
        <p className="text-muted-foreground">Gestiona la configuració de l'aplicació</p>
      </div>

      {/* Development Notice */}
      <Card className="bg-card/60 backdrop-blur-glass border-border/50 shadow-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-warning/20 rounded-lg">
              <Code className="h-5 w-5 text-warning" />
            </div>
            Mode Desenvolupament
            <Badge variant="outline" className="bg-warning/20 text-warning">
              BETA
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Aquesta secció està en desenvolupament. Properament hi trobaràs opcions per personalitzar l'experiència de l'aplicació.
          </p>
        </CardContent>
      </Card>

      {/* App Info */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Informació de l'App</h2>
        
        <div className="grid gap-4">
          <Card className="bg-card/60 backdrop-blur-glass border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Versió</h3>
                  <p className="text-sm text-muted-foreground">v1.0.0 Beta</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-glass border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/20 rounded-lg">
                  <Database className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold">Backend</h3>
                  <p className="text-sm text-muted-foreground">Supabase - Connectat</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Future Features */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Funcionalitats Futures</h2>
        
        <Card className="bg-card/60 backdrop-blur-glass border-border/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Notificacions Push</span>
              <Badge variant="outline" className="text-xs">Pròximament</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Mode Fosc/Clar</span>
              <Badge variant="outline" className="text-xs">Pròximament</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Sincronització Offline</span>
              <Badge variant="outline" className="text-xs">Pròximament</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Exportar Dades</span>
              <Badge variant="outline" className="text-xs">Pròximament</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Subtasques</span>
              <Badge variant="outline" className="text-xs">Pròximament</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Etiquetes</span>
              <Badge variant="outline" className="text-xs">Pròximament</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;