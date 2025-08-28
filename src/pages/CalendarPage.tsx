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
    <div className="min-h-screen bg-transparent text-foreground">
      
      {/* Main content optimized for full screen usage */}
      <div className="h-screen overflow-auto px-4 md:px-6 xl:px-8 pt-4 md:pt-6 pb-[calc(1rem+96px)] lg:pb-6">
        
        {/* Desktop & Tablet Layout - Full screen optimized */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-4 h-[calc(100vh-3rem)]">
          
          {/* Left Column - Optimized sidebar */}
          <div className="col-span-3 xl:col-span-2 max-w-[340px] min-h-0 flex flex-col gap-3">
            <MiniCalendarSidebar 
              currentDate={currentDate} 
              onDateSelect={setCurrentDate}
            />
            <CategoriesSidebar />
            <div className="flex-1 min-h-[200px]">
              <TasksSidebar />
            </div>
          </div>

          {/* Right Column - Main calendar with reserved top space */}
          <div className="col-span-9 xl:col-span-10 h-full flex flex-col">
            {/* Reserved space for future controls */}
            <div className="h-16 flex items-center justify-end mb-2">
              {/* Future: filters, view options, actions */}
            </div>
            <div className="flex-1 min-h-0 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <CalendarMainCard 
                currentDate={currentDate} 
                onDateChange={setCurrentDate}
                currentView={currentView}
                onViewChange={setCurrentView}
              />
            </div>
          </div>
        </div>

        {/* Mobile Layout - Optimized for full screen */}
        <div className="lg:hidden h-[calc(100vh-2rem)] flex flex-col gap-4">
          {/* Reserved space for future controls */}
          <div className="h-12 flex items-center justify-end">
            {/* Future: mobile filters, options */}
          </div>
          <div className="flex-[3] min-h-0">
            <CalendarMainCard 
              currentDate={currentDate} 
              onDateChange={setCurrentDate}
              currentView={currentView}
              onViewChange={setCurrentView}
            />
          </div>
          <div className="flex-1 min-h-0 space-y-3">
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