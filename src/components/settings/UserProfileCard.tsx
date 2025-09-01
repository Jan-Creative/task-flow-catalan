import { User, Mail, Calendar, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { EditableField } from "./EditableField";

export const UserProfileCard = () => {
  const { user, signOut } = useAuth();
  const { profile, updateDisplayName, updateEmail } = useProfile();

  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase();
  };

  const getJoinDate = () => {
    if (!user?.created_at) return "No disponible";
    return new Date(user.created_at).toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-secondary/20 rounded-lg">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback className="bg-primary/20 text-primary-foreground text-lg font-semibold">
            {user?.email ? getInitials(user.email) : "??"}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div>
            <label className="text-xs text-muted-foreground">Nom d'usuari</label>
            <EditableField
              value={profile?.display_name || user?.user_metadata?.full_name || "Usuari"}
              onSave={updateDisplayName}
              placeholder="Introdueix el teu nom"
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground">Email</label>
            <EditableField
              value={user?.email || ""}
              onSave={updateEmail}
              placeholder="Introdueix el teu email"
              type="email"
              className="mt-1"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Membre des de {getJoinDate()}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Badge variant="outline" className="bg-success/20 text-success">
            Connectat
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-secondary/30 rounded-lg">
          <div className="text-xl font-bold text-foreground">12</div>
          <div className="text-xs text-muted-foreground">Tasques actives</div>
        </div>
        <div className="p-3 bg-secondary/30 rounded-lg">
          <div className="text-xl font-bold text-foreground">45</div>
          <div className="text-xs text-muted-foreground">Completades</div>
        </div>
        <div className="p-3 bg-secondary/30 rounded-lg">
          <div className="text-xl font-bold text-foreground">3</div>
          <div className="text-xs text-muted-foreground">Carpetes</div>
        </div>
      </div>
    </div>
  );
};