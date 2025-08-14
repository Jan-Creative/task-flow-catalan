import { useState } from "react";
import { User, Mail, Lock, Palette, Settings2, LogOut, Moon, Sun, Monitor, Smartphone, Database } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { SettingsGroup } from "@/components/settings/SettingsGroup";
import { SettingsRow } from "@/components/settings/SettingsRow";
import { EditableField } from "@/components/settings/EditableField";
import { ToggleRow } from "@/components/settings/ToggleRow";
import { PasswordChangeModal } from "@/components/settings/PasswordChangeModal";
import { useToast } from "@/hooks/use-toast";
import { usePropertyDialog } from "@/contexts/PropertyDialogContext";
import { StreamlinedCreateDialog } from "@/components/settings/StreamlinedCreateDialog";

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { isCreateDialogOpen, closeCreateDialog } = usePropertyDialog();
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPropertyManager, setShowPropertyManager] = useState(false);

  const getInitials = (email: string) => {
    return email?.slice(0, 2).toUpperCase() || "??";
  };

  const getDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Usuari";
  };

  const handleNameChange = async (newName: string) => {
    toast({
      title: "Pròximament",
      description: "La funcionalitat de canvi de nom estarà disponible aviat",
      variant: "default",
    });
  };

  const handleEmailChange = async (newEmail: string) => {
    toast({
      title: "Pròximament",
      description: "La funcionalitat de canvi d'email estarà disponible aviat",
      variant: "default",
    });
  };

  const handleCreateProperty = async (data: any) => {
    console.log('🎯 SettingsPage: Creating property with data:', data);
    // TODO: Implement actual property creation with backend
    toast({
      title: "Propietat creada!",
      description: `S'ha creat la propietat "${data.name}" amb ${data.options.length} opcions.`,
    });
    closeCreateDialog();
  };

  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === "dark";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-4 py-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configuració</h1>
          <p className="text-muted-foreground text-sm">Personalitza l'experiència de l'aplicació</p>
        </div>

        {/* User Profile Section */}
        <div className="flex items-center gap-4 py-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/20 text-primary text-lg font-medium">
              {getInitials(user?.email || "")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground truncate">
              {getDisplayName()}
            </h2>
            <p className="text-muted-foreground text-sm truncate">
              {user?.email}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                Connectat
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Account Settings */}
        <SettingsGroup title="Compte">
          <SettingsRow
            icon={User}
            label="Nom"
          >
            <EditableField
              value={getDisplayName()}
              onSave={handleNameChange}
              placeholder="Introdueix el teu nom"
            />
          </SettingsRow>
          <Separator className="ml-12" />
          <SettingsRow
            icon={Mail}
            label="Email"
          >
            <EditableField
              value={user?.email || ""}
              onSave={handleEmailChange}
              placeholder="Introdueix el teu email"
              type="email"
              disabled={true}
            />
          </SettingsRow>
          <Separator className="ml-12" />
          <SettingsRow
            icon={Lock}
            label="Contrasenya"
            value="••••••••"
            onClick={() => setShowPasswordModal(true)}
            showChevron
          />
        </SettingsGroup>

        {/* Appearance Settings */}
        <SettingsGroup title="Aparença">
          <ToggleRow
            icon={isDarkMode ? Moon : Sun}
            label="Mode fosc"
            description="Activa o desactiva el tema fosc"
            checked={isDarkMode}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </SettingsGroup>

        {/* Properties Settings */}
        <SettingsGroup title="Propietats">
          {!showPropertyManager ? (
            <SettingsRow
              icon={Settings2}
              label="Gestionar propietats"
              description="Configura propietats personalitzades"
              showChevron
              onClick={() => setShowPropertyManager(true)}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Gestió de Propietats</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPropertyManager(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ← Tornar
                </Button>
              </div>
              {/* PropertyManager component is temporarily removed for inline creation approach */}
            </div>
          )}
        </SettingsGroup>

        {/* App Info */}
        <SettingsGroup title="Informació">
          <SettingsRow
            icon={Smartphone}
            label="Versió"
            value="v1.0.0 Beta"
          />
          <Separator className="ml-12" />
          <SettingsRow
            icon={Database}
            label="Backend"
            value="Supabase - Connectat"
          />
        </SettingsGroup>

        {/* Logout */}
        <SettingsGroup>
          <SettingsRow
            icon={LogOut}
            label="Tancar sessió"
            onClick={signOut}
            className="text-destructive"
          />
        </SettingsGroup>
      </div>

      {/* Password Change Modal */}
      <PasswordChangeModal
        open={showPasswordModal}
        onOpenChange={setShowPasswordModal}
      />

      {/* Global Create Property Dialog - Streamlined Version */}
      <StreamlinedCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={closeCreateDialog}
        onCreateProperty={handleCreateProperty}
      />
    </div>
  );
};

export default SettingsPage;