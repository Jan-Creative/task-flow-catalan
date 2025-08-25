import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { UserProfileCard } from "@/components/settings/UserProfileCard";

import { Bell, User } from "lucide-react";
import { NotificationSetupCard } from "@/components/notifications/NotificationSetupCard";

const SettingsPage = () => {
  const { user } = useAuth();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Title */}
      <div className="text-3xl font-bold">Configuració</div>

      {/* User Profile */}
      <SettingsSection
        icon={User}
        title="Perfil"
        description="Gestiona la teva informació personal"
      >
        <UserProfileCard />
      </SettingsSection>

      {/* Notificacions */}
      <SettingsSection 
        icon={Bell} 
        title="Notificacions" 
        description="Configura les teves preferències de notificacions"
      >
        <NotificationSetupCard />
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
