import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SettingsSection } from "@/components/SettingsSection";
import { UserProfile } from "@/components/UserProfile";
import { NotificationDisplay } from "@/components/NotificationDisplay";
import { Bell, Bug } from "lucide-react";

import { NotificationDebugPanel } from "@/components/NotificationDebugPanel";

const SettingsPage = () => {
  const { user } = useAuth();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Title */}
      <div className="text-3xl font-bold">Configuració</div>

      {/* User Profile */}
      <SettingsSection
        icon="user"
        title="Perfil"
        description="Gestiona la teva informació personal"
      >
        <UserProfile
          user={user}
          onOpenDialog={() => setIsProfileDialogOpen(true)}
          isDialogOpen={isProfileDialogOpen}
          setIsDialogOpen={setIsProfileDialogOpen}
        />
      </SettingsSection>

      {/* Notificacions */}
      <SettingsSection 
        icon={Bell} 
        title="Notificacions" 
        description="Configura les teves preferències de notificacions"
      >
        <NotificationDisplay />
      </SettingsSection>

      {/* Debug Panel - només en desenvolupament o per usuaris avançats */}
      <SettingsSection 
        icon={Bug} 
        title="Debug" 
        description="Informació tècnica per resoldre problemes"
      >
        <NotificationDebugPanel />
      </SettingsSection>

      {/* Appearance */}
      {/* <SettingsSection
        icon="sun"
        title="Aparença"
        description="Personalitza l'aspecte de l'aplicació"
      >
        <div>Aparença</div>
      </SettingsSection> */}

      {/* About */}
      {/* <SettingsSection
        icon="info"
        title="Sobre"
        description="Informació sobre l'aplicació"
      >
        <div>Sobre</div>
      </SettingsSection> */}
    </div>
  );
};

export default SettingsPage;
