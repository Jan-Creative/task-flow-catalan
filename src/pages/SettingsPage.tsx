import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfileCard } from "@/components/settings/UserProfileCard";
import { SettingsItem } from "@/components/settings/SettingsItem";
import { SettingsGroup } from "@/components/settings/SettingsGroup";
import { ThemeSelector } from "@/components/settings/ThemeSelector";
import { TaskHistorySection } from "@/components/settings/TaskHistorySection";
import { TaskResetSection } from "@/components/settings/TaskResetSection";
import { ReflectionHistorySection } from "@/components/settings/ReflectionHistorySection";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Bell, 
  User, 
  Palette, 
  Shield, 
  Settings, 
  Info,
  ChevronDown,
  ChevronRight,
  Languages,
  Monitor,
  Smartphone,
  Globe,
  HelpCircle
} from "lucide-react";
import { NotificationDebugPanel } from "@/components/NotificationDebugPanel";

const SettingsPage = () => {
  const { user } = useAuth();
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-3xl font-bold text-foreground">Configuració</div>

      {/* Grid Layout - Similar to Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              Perfil d'Usuari
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserProfileCard />
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              Notificacions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingsGroup>
              <SettingsItem
                icon={Bell}
                label="Notificacions globals"
                description="Activar o desactivar totes les notificacions"
              >
                <Switch 
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </SettingsItem>
              
              <SettingsItem
                icon={Smartphone}
                label="Notificacions push"
                description="Notificacions al dispositiu"
              >
                <Switch 
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </SettingsItem>
              
              <SettingsItem
                icon={Globe}
                label="Notificacions per email"
                description="Rebre recordatoris per correu"
              >
                <Switch 
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </SettingsItem>
            </SettingsGroup>

            <Collapsible open={showNotificationPanel} onOpenChange={setShowNotificationPanel}>
              <CollapsibleTrigger asChild>
                <SettingsItem
                  icon={Settings}
                  label="Panel de Control"
                  description="Eines avançades de depuració"
                  onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                >
                  {showNotificationPanel ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </SettingsItem>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <NotificationDebugPanel />
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Appearance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              Aparença
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ThemeSelector />
            <SettingsGroup title="Personalització">
              <SettingsItem
                icon={Monitor}
                label="Fons d'aplicació"
                description="Personalitza el fons principal"
                onClick={() => {}}
              >
                <ChevronRight className="h-4 w-4" />
              </SettingsItem>
            </SettingsGroup>
          </CardContent>
        </Card>

        {/* Privacy & Security Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              Privacitat i Seguretat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingsGroup>
              <SettingsItem
                icon={Shield}
                label="Autenticació de dos factors"
                description="Seguretat addicional per al teu compte"
              >
                <Badge variant="outline" className="text-warning">
                  Pendent
                </Badge>
              </SettingsItem>
              
              <SettingsItem
                icon={Settings}
                label="Sessions actives"
                description="Gestiona els dispositius connectats"
                onClick={() => {}}
              >
                <ChevronRight className="h-4 w-4" />
              </SettingsItem>
            </SettingsGroup>
          </CardContent>
        </Card>

        {/* General Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingsGroup>
              <SettingsItem
                icon={Languages}
                label="Idioma"
                value="Català"
                description="Idioma de la interfície"
                onClick={() => {}}
              >
                <ChevronRight className="h-4 w-4" />
              </SettingsItem>
              
              <SettingsItem
                icon={Settings}
                label="Actualitzacions automàtiques"
                description="Mantenir l'app sempre actualitzada"
              >
                <Switch defaultChecked />
              </SettingsItem>
            </SettingsGroup>
          </CardContent>
        </Card>

        {/* About Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Info className="h-5 w-5 text-primary" />
              </div>
              Sobre l'Aplicació
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingsGroup>
              <SettingsItem
                icon={Info}
                label="Versió"
                value="1.0.0"
                description="Versió actual de l'aplicació"
              />
              
              <SettingsItem
                icon={HelpCircle}
                label="Ajuda i suport"
                description="Obtenir ajuda i contactar suport"
                onClick={() => {}}
              >
                <ChevronRight className="h-4 w-4" />
              </SettingsItem>
              
              <SettingsItem
                icon={Globe}
                label="Política de privacitat"
                description="Llegir la política de privacitat"
                onClick={() => {}}
              >
                <ChevronRight className="h-4 w-4" />
              </SettingsItem>
            </SettingsGroup>
          </CardContent>
        </Card>

        <TaskHistorySection />
        <ReflectionHistorySection />
        <TaskResetSection />
      </div>
    </div>
  );
};

export default SettingsPage;
