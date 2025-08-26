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
      minHeight: 280,
      maxHeight: 350,
      preferredHeight: 320,
      canCollapse: false
    },
    {
      id: 'categories',
      component: <CategoriesCard />,
      priority: 'low',
      minHeight: 200,
      maxHeight: 500,
      preferredHeight: 350,
      canCollapse: true
    },
    {
      id: 'tasks',
      component: <TasksCalendarCard />,
      priority: 'medium',
      minHeight: 180,
      maxHeight: 300,
      preferredHeight: 250,
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

      {/* Full Screen Layout - 2 Columns */}
      <div className="relative z-20 flex-1 overflow-hidden" style={{ height: 'calc(100vh - 134px)' }}>
        
        {/* Desktop & Tablet Layout - 2 Columns (lg+) */}
        <div className="hidden lg:grid lg:grid-cols-12 h-full gap-3 p-3">
          
          {/* Left Column - Intelligent Adaptive Sidebar */}
          <div className="col-span-4 xl:col-span-3 h-full">
            <AdaptiveSidebarContainer cards={sidebarCards} />
          </div>

          {/* Right Column - Main Calendar */}
          <div className="col-span-8 xl:col-span-9 animate-fade-in h-full pb-4" style={{animationDelay: '0.1s'}}>
            <CalendarMainCard 
              currentDate={currentDate} 
              onDateChange={setCurrentDate}
            />
          </div>
        </div>

        {/* Mobile Layout - Adaptive Stack */}
        <div className="lg:hidden h-full">
          <div className="p-4 h-full">
            <div className="mb-4">
              <CalendarMainCard 
                currentDate={currentDate} 
                onDateChange={setCurrentDate}
              />
            </div>
            <AdaptiveSidebarContainer cards={sidebarCards} />
          </div>
        </div>
      </div>

      {/* Floating Background Configuration Button */}
      <FloatingBackgroundButton />
    </div>
  );
};


export default CalendarPage;