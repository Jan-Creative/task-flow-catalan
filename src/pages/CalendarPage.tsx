import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { FloatingBackgroundButton } from "@/components/backgrounds/FloatingBackgroundButton";
import CalendarMainCard from "@/components/calendar/CalendarMainCard";

import EnhancedMiniCalendarCard from "@/components/calendar/EnhancedMiniCalendarCard";
import CategoriesCard from "@/components/calendar/CategoriesCard";
import TasksCalendarCard from "@/components/calendar/TasksCalendarCard";
import "@/styles/background-effects.css";

type CalendarView = "month" | "week" | "day" | "agenda";

const CalendarPage = () => {
  const [currentView, setCurrentView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date());

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
          
          {/* Left Column - Side Cards Stack with Intelligent Layout */}
          <div className="col-span-4 xl:col-span-3 flex flex-col gap-3 h-full">
            
            {/* Enhanced MiniCalendar Card - Fixed optimal height */}
            <div className="animate-fade-in flex-shrink-0" style={{
              animationDelay: '0.2s', 
              height: '300px'
            }}>
              <EnhancedMiniCalendarCard 
                currentDate={currentDate}
                onDateSelect={setCurrentDate}
              />
            </div>

            {/* Categories Card - Flexible, grows to use available space */}
            <div className="animate-fade-in flex-grow overflow-y-auto min-h-0" style={{
              animationDelay: '0.3s'
            }}>
              <CategoriesCard />
            </div>

            {/* Tasks Calendar Card - Fixed minimum height for 4-5 tasks */}
            <div className="animate-fade-in flex-shrink-0 overflow-y-auto" style={{
              animationDelay: '0.4s', 
              height: '200px'
            }}>
              <TasksCalendarCard />
            </div>
          </div>

          {/* Right Column - Main Calendar */}
          <div className="col-span-8 xl:col-span-9 animate-fade-in h-full pb-4" style={{animationDelay: '0.1s'}}>
            <CalendarMainCard 
              currentDate={currentDate} 
              onDateChange={setCurrentDate}
            />
          </div>
        </div>

        {/* Mobile Layout - Full Screen Stack (sm only) */}
        <div className="lg:hidden h-full overflow-y-auto">
          <div className="grid grid-cols-1 gap-4 p-4 min-h-full">
            <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
              <CalendarMainCard 
                currentDate={currentDate} 
                onDateChange={setCurrentDate}
              />
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <EnhancedMiniCalendarCard 
                currentDate={currentDate}
                onDateSelect={setCurrentDate}
              />
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
              <CategoriesCard />
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
              <TasksCalendarCard />
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