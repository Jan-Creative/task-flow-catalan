import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { FloatingBackgroundButton } from "@/components/backgrounds/FloatingBackgroundButton";
import CalendarMainCard from "@/components/calendar/CalendarMainCard";
import MiniCalendarSidebar from "@/components/calendar/MiniCalendarSidebar";
import CategoriesSidebar from "@/components/calendar/CategoriesSidebar";
import TasksSidebar from "@/components/calendar/TasksSidebar";
import CalendarViewSelector, { CalendarView } from "@/components/calendar/CalendarViewSelector";
import "@/styles/background-effects.css";

const CalendarPage = () => {
  const [currentView, setCurrentView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date());

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
      <div className="flex-1 min-h-0 overflow-auto px-6 md:px-8 xl:px-10 pt-6 md:pt-8 pb-[calc(1.5rem+96px)] lg:pb-8">
        
        {/* Desktop & Tablet Layout - Fixed sidebar layout */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)] lg:h-[calc(100vh-10rem)]">
          
          {/* Left Column - Fixed sidebar with optimized cards */}
          <div className="col-span-3 xl:col-span-2 max-w-[360px] min-h-0 flex flex-col gap-4">
            <MiniCalendarSidebar 
              currentDate={currentDate} 
              onDateSelect={setCurrentDate}
            />
            <CategoriesSidebar />
            <div className="flex-1 min-h-[180px]">
              <TasksSidebar />
            </div>
          </div>

          {/* Right Column - Main calendar */}
          <div className="col-span-9 xl:col-span-10 h-full animate-fade-in" style={{animationDelay: '0.1s'}}>
            <CalendarMainCard 
              currentDate={currentDate} 
              onDateChange={setCurrentDate}
              currentView={currentView}
              onViewChange={setCurrentView}
            />
          </div>
        </div>

        {/* Mobile Layout - Stack with proper spacing */}
        <div className="lg:hidden h-full flex flex-col gap-6">
          <div className="flex-[2] min-h-0">
            <CalendarMainCard 
              currentDate={currentDate} 
              onDateChange={setCurrentDate}
              currentView={currentView}
              onViewChange={setCurrentView}
            />
          </div>
          <div className="flex-1 min-h-0 space-y-4">
            <MiniCalendarSidebar 
              currentDate={currentDate} 
              onDateSelect={setCurrentDate}
            />
            <CategoriesSidebar />
            <TasksSidebar />
          </div>
        </div>
      </div>

      {/* Floating Background Configuration Button */}
      <FloatingBackgroundButton />
    </div>
  );
};


export default CalendarPage;