import { useState } from "react";
import { User, Settings2, Palette, Database, Smartphone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserProfileCard } from "@/components/settings/UserProfileCard";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { PropertyManager } from "@/components/settings/PropertyManager";
import { ThemeSelector } from "@/components/settings/ThemeSelector";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("user");

  return (
    <div className="p-6 pb-24 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Configuració</h1>
        <p className="text-muted-foreground">Personalitza l'experiència de l'aplicació</p>
      </div>

      {/* User Profile Card - Always visible */}
      <UserProfileCard />

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-secondary/20 backdrop-blur-glass">
          <TabsTrigger 
            value="user" 
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
          >
            <User className="h-4 w-4 mr-2" />
            Usuari
          </TabsTrigger>
          <TabsTrigger 
            value="properties"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
          >
            <Settings2 className="h-4 w-4 mr-2" />
            Propietats
          </TabsTrigger>
          <TabsTrigger 
            value="appearance"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
          >
            <Palette className="h-4 w-4 mr-2" />
            Aparença
          </TabsTrigger>
        </TabsList>

        {/* User Settings Tab */}
        <TabsContent value="user" className="space-y-6 mt-6">
          <SettingsSection
            title="Gestió del Compte"
            description="Configura la informació del teu perfil i compte"
            icon={User}
          >
            <div className="space-y-4">
              <div className="p-4 bg-secondary/20 rounded-lg border border-border/30">
                <h4 className="font-medium text-foreground mb-2">Configuració del Perfil</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Gestiona la informació bàsica del teu compte
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Canviar nom d'usuari</span>
                    <Badge variant="outline" className="text-xs">Pròximament</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Actualitzar email</span>
                    <Badge variant="outline" className="text-xs">Pròximament</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Canviar contrasenya</span>
                    <Badge variant="outline" className="text-xs">Pròximament</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avatar personalitzat</span>
                    <Badge variant="outline" className="text-xs">Pròximament</Badge>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-secondary/20 rounded-lg border border-border/30">
                <h4 className="font-medium text-foreground mb-2">Seguretat</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Configuracions de seguretat i privacitat
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Autenticació en dos factors</span>
                    <Badge variant="outline" className="text-xs">Pròximament</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sessions actives</span>
                    <Badge variant="outline" className="text-xs">Pròximament</Badge>
                  </div>
                </div>
              </div>
            </div>
          </SettingsSection>
        </TabsContent>

        {/* Properties Settings Tab */}
        <TabsContent value="properties" className="space-y-6 mt-6">
          <SettingsSection
            title="Gestió de Propietats"
            description="Configura les propietats personalitzades per organitzar les teves tasques"
            icon={Settings2}
          >
            <PropertyManager />
          </SettingsSection>
        </TabsContent>

        {/* Appearance Settings Tab */}
        <TabsContent value="appearance" className="space-y-6 mt-6">
          <SettingsSection
            title="Personalització Visual"
            description="Configura l'aparença i el tema de l'aplicació"
            icon={Palette}
          >
            <ThemeSelector />
          </SettingsSection>
        </TabsContent>
      </Tabs>

      {/* App Info - At the bottom */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Informació de l'App</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
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
    </div>
  );
};

export default SettingsPage;