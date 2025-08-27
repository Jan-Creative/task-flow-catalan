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

  // Temporarily empty cards array to validate layout structure
  const sidebarCards: SidebarCard[] = [];

  return (
    <div className="min-h-screen bg-transparent text-foreground flex flex-col">
      
      {/* Header amb glassmorphism */}
      <div className="sticky top-0 z-30 bg-background/70 backdrop-blur-md border-b border-border/30">
        <div className="flex items-center gap-4 p-4">
          <CalendarIcon className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Calendari</h1>
        </div>
      </div>

      {/* Main content with global margins and proper spacing */}
      <div className="flex-1 min-h-0 overflow-auto px-6 md:px-8 xl:px-10 py-6 md:py-8 pb-[calc(env(safe-area-inset-bottom)+96px)] lg:pb-28">
        
        {/* Desktop & Tablet Layout - New compact grid */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6 h-full">
          
          {/* Left Column - Compact sidebar */}
          <div className="col-span-3 xl:col-span-2 max-w-[360px] min-h-0">
            <AdaptiveSidebarContainer cards={sidebarCards} />
          </div>

          {/* Right Column - Main calendar with proper proportions */}
          <div className="col-span-9 xl:col-span-10 min-h-0 animate-fade-in" style={{animationDelay: '0.1s'}}>
            <CalendarMainCard 
              currentDate={currentDate} 
              onDateChange={setCurrentDate}
            />
          </div>
        </div>

        {/* Mobile Layout - Stack with proper spacing */}
        <div className="lg:hidden h-full flex flex-col gap-6">
          <div className="flex-[2] min-h-0">
            <CalendarMainCard 
              currentDate={currentDate} 
              onDateChange={setCurrentDate}
            />
          </div>
          <div className="flex-1 min-h-0">
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