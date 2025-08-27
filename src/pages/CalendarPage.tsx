import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { FloatingBackgroundButton } from "@/components/backgrounds/FloatingBackgroundButton";
import CalendarMainCard from "@/components/calendar/CalendarMainCard";
import EnhancedMiniCalendarCard from "@/components/calendar/EnhancedMiniCalendarCard";
import CategoriesCard from "@/components/calendar/CategoriesCard";
import TasksCalendarCard from "@/components/calendar/TasksCalendarCard";
import AdaptiveSidebarContainer from "@/components/calendar/AdaptiveSidebarContainer";
import { SidebarCard } from "@/hooks/useAdaptiveSidebar";
import "@/styles/background-effects.css";

type CalendarView = "month" | "week" | "day" | "agenda";

const CalendarPage = () => {
  const [currentView, setCurrentView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Define sidebar cards with intelligent configuration
  const sidebarCards: SidebarCard[] = [
    {
      id: 'mini-calendar',
      component: (
        <EnhancedMiniCalendarCard 
          currentDate={currentDate}
          onDateSelect={setCurrentDate}
        />
      ),
      priority: 'high',
      minHeight: 220,
      maxHeight: 280,
      preferredHeight: 250,
      canCollapse: false
    },
    {
      id: 'categories',
      component: <CategoriesCard />,
      priority: 'low',
      minHeight: 160,
      maxHeight: 400,
      preferredHeight: 280,
      canCollapse: true
    },
    {
      id: 'tasks',
      component: <TasksCalendarCard />,
      priority: 'medium',
      minHeight: 140,
      maxHeight: 240,
      preferredHeight: 190,
      canCollapse: false
    }
  ];

  return (
    <div className="relative w-full h-screen bg-transparent text-foreground overflow-hidden flex flex-col">
      
      {/* Header amb glassmorphism */}
      <div className="sticky top-0 z-30 bg-background/70 backdrop-blur-md border-b border-border/30">
        <div className="flex items-center gap-4 p-4">
          <CalendarIcon className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Calendari</h1>
        </div>
      </div>

      {/* Layout amb marges globals */}
      <div className="relative z-20 flex-1 overflow-hidden p-6" style={{ height: 'calc(100vh - 134px)' }}>
        
        {/* Desktop & Tablet Layout - Grid compacte */}
        <div className="hidden lg:grid lg:grid-cols-10 h-full gap-4">
          
          {/* Left Column - Barra lateral més petita */}
          <div className="col-span-3 xl:col-span-2 h-full">
            <AdaptiveSidebarContainer cards={sidebarCards} />
          </div>

          {/* Right Column - Calendari principal més prominent */}
          <div className="col-span-7 xl:col-span-8 animate-fade-in h-full" style={{animationDelay: '0.1s'}}>
            <CalendarMainCard 
              currentDate={currentDate} 
              onDateChange={setCurrentDate}
            />
          </div>
        </div>

        {/* Mobile Layout - Amb marges */}
        <div className="lg:hidden h-full">
          <div className="h-full space-y-4">
            <div className="h-2/3">
              <CalendarMainCard 
                currentDate={currentDate} 
                onDateChange={setCurrentDate}
              />
            </div>
            <div className="h-1/3">
              <AdaptiveSidebarContainer cards={sidebarCards} />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Background Configuration Button */}
      <FloatingBackgroundButton />
    </div>
  );
};


export default CalendarPage;