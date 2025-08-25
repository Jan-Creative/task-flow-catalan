import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FloatingBackgroundButton } from '@/components/backgrounds/FloatingBackgroundButton';
import BottomNavigation from '@/components/BottomNavigation';
import { CustomNotificationCard } from '@/components/notifications/CustomNotificationCard';
import { NotificationBlocksCard } from '@/components/notifications/NotificationBlocksCard';
import { NotificationHistoryCard } from '@/components/notifications/NotificationHistoryCard';
import { UpcomingNotificationsCard } from '@/components/notifications/UpcomingNotificationsCard';
import "@/styles/background-effects.css";

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="relative w-full min-h-screen bg-transparent text-foreground overflow-hidden">
      
      {/* Header amb glassmorphism */}
      <div className="sticky top-0 z-30 bg-background/70 backdrop-blur-md border-b border-border/30">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Tornar
          </Button>
          <h1 className="text-lg font-semibold">Notificacions</h1>
        </div>
      </div>

      {/* Layout de targetes individuals estil TaskDetailPage */}
      <div className="relative z-20 p-4 pb-24">
        <div className="max-w-7xl mx-auto">
          
          {/* Desktop XL Layout - Grid Complex (1440px+) */}
          <div className="hidden 2xl:grid 2xl:grid-cols-6 gap-6 min-h-[600px] auto-rows-fr">
            {/* Custom Notification Card */}
            <div className="col-span-2 row-span-2 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="h-full min-h-[350px]">
                <CustomNotificationCard />
              </div>
            </div>

            {/* Notification Blocks Card */}
            <div className="col-span-2 row-span-2 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="h-full min-h-[350px]">
                <NotificationBlocksCard />
              </div>
            </div>

            {/* History Card */}
            <div className="col-span-2 row-span-3 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="h-full min-h-[450px]">
                <NotificationHistoryCard />
              </div>
            </div>

            {/* Upcoming Notifications Card */}
            <div className="col-span-4 row-span-2 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="h-full min-h-[350px]">
                <UpcomingNotificationsCard />
              </div>
            </div>
          </div>

          {/* Desktop Layout - Grid simplificat (1024px-1440px) */}
          <div className="hidden xl:grid 2xl:hidden xl:grid-cols-4 gap-6 auto-rows-fr">
            {/* Fila superior */}
            <div className="col-span-2 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="h-full min-h-[350px]">
                <CustomNotificationCard />
              </div>
            </div>
            <div className="col-span-2 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="h-full min-h-[350px]">
                <NotificationBlocksCard />
              </div>
            </div>

            {/* Segona fila */}
            <div className="col-span-2 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="h-full min-h-[350px]">
                <NotificationHistoryCard />
              </div>
            </div>
            <div className="col-span-2 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="h-full min-h-[350px]">
                <UpcomingNotificationsCard />
              </div>
            </div>
          </div>

          {/* Tablet Layout - Grid adaptat (768px-1024px) */}
          <div className="hidden lg:grid xl:hidden lg:grid-cols-2 gap-6 auto-rows-fr">
            <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="h-full min-h-[350px]">
                <CustomNotificationCard />
              </div>
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="h-full min-h-[350px]">
                <NotificationBlocksCard />
              </div>
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="h-full min-h-[350px]">
                <NotificationHistoryCard />
              </div>
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="h-full min-h-[350px]">
                <UpcomingNotificationsCard />
              </div>
            </div>
          </div>

          {/* Mobile/Small Tablet Layout - Stack vertical (0-768px) */}
          <div className="grid lg:hidden grid-cols-1 gap-6">
            <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
              <CustomNotificationCard />
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <NotificationBlocksCard />
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
              <NotificationHistoryCard />
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
              <UpcomingNotificationsCard />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Background Configuration Button */}
      <FloatingBackgroundButton />

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab="configuracio"
        onTabChange={(tab) => {
          if (tab === "avui") {
            navigate("/");
          } else if (tab === "carpetes") {
            navigate("/?tab=carpetes");
          } else if (tab === "configuracio") {
            navigate("/?tab=configuracio");
          }
        }}
        onCreateTask={() => setShowCreateDialog(true)}
      />

      {/* Create Task Modal */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">Crear Nova Tasca</h2>
            <p className="text-muted-foreground text-sm">
              Per crear una nova tasca, navega a la pàgina principal.
            </p>
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
                className="flex-1"
              >
                Cancel·lar
              </Button>
              <Button 
                onClick={() => {
                  setShowCreateDialog(false);
                  navigate("/");
                }}
                className="flex-1"
              >
                Anar a l'inici
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;