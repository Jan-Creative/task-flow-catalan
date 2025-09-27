import { useMemo } from "react";
import { format } from "date-fns";
import { ca } from "date-fns/locale";
import { Sun, Moon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { IPhoneToolbarMenu } from "./IPhoneToolbarMenu";

interface IPhoneHeaderCardProps {
  onOpenReminderConfig: () => void;
  onOpenTimeBlocks: () => void;
  onNavigateToNotifications?: () => void;
}

export const IPhoneHeaderCard = ({
  onOpenReminderConfig,
  onOpenTimeBlocks,
  onNavigateToNotifications
}: IPhoneHeaderCardProps) => {
  const { user } = useAuth();

  // Get user display name
  const userName = useMemo(() => {
    if (!user) return "Usuari";
    
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return "Usuari";
  }, [user]);

  // Dynamic greeting based on time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bon dia";
    if (hour < 18) return "Bona tarda"; 
    return "Bona nit";
  }, []);

  // Greeting icon based on time
  const GreetingIcon = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return Sun;
    if (hour < 18) return Sun;
    return Moon;
  }, []);

  return (
    <div className="bg-card rounded-3xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-organic)] transition-all duration-300 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-2xl">
            <GreetingIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {greeting}, {userName}!
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {format(new Date(), "EEEE, d MMMM", { locale: ca })}
            </p>
          </div>
        </div>
        
        <IPhoneToolbarMenu 
          onOpenReminderConfig={onOpenReminderConfig}
          onOpenTimeBlocks={onOpenTimeBlocks}
          onNavigateToNotifications={onNavigateToNotifications}
        />
      </div>
    </div>
  );
};