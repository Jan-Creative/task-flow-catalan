import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { FloatingBackgroundButton } from "@/components/backgrounds/FloatingBackgroundButton";
import CalendarMainCard from "@/components/calendar/CalendarMainCard";
import ViewSwitcherCard from "@/components/calendar/ViewSwitcherCard";
import MiniCalendarCard from "@/components/calendar/MiniCalendarCard";
import CalendarStatsCard from "@/components/calendar/CalendarStatsCard";
import CalendarFiltersCard from "@/components/calendar/CalendarFiltersCard";
import "@/styles/background-effects.css";

type CalendarView = "month" | "week" | "day" | "agenda";

const CalendarPage = () => {
  const [currentView, setCurrentView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  return (
    <div className="relative w-full min-h-screen bg-transparent text-foreground overflow-hidden">
      
      {/* Header amb glassmorphism */}
      <div className="sticky top-0 z-30 bg-background/70 backdrop-blur-md border-b border-border/30">
        <div className="flex items-center gap-4 p-4">
          <CalendarIcon className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Calendari</h1>
        </div>
      </div>

      {/* Layout de targetes individuals estil NotificationsPage */}
      <div className="relative z-20 p-4 pb-24">
        <div className="max-w-7xl mx-auto">
          
          {/* Desktop XL Layout - Grid Complex (1440px+) */}
          <div className="hidden 2xl:grid 2xl:grid-cols-6 gap-6 min-h-[600px] auto-rows-fr">
            {/* Calendar Main Card */}
            <div className="col-span-4 row-span-3 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="h-full min-h-[500px]">
                <CalendarMainCard 
                  currentDate={currentDate} 
                  onDateChange={setCurrentDate}
                />
              </div>
            </div>

            {/* View Switcher Card */}
            <div className="col-span-2 row-span-1 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="h-full min-h-[200px]">
                <ViewSwitcherCard 
                  currentView={currentView}
                  onViewChange={setCurrentView}
                />
              </div>
            </div>

            {/* Mini Calendar Card */}
            <div className="col-span-1 row-span-1 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="h-full min-h-[200px]">
                <MiniCalendarCard 
                  currentDate={currentDate}
                  onDateSelect={setCurrentDate}
                />
              </div>
            </div>

            {/* Stats Card */}
            <div className="col-span-1 row-span-1 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="h-full min-h-[200px]">
                <CalendarStatsCard />
              </div>
            </div>

            {/* Filters Card */}
            <div className="col-span-2 row-span-1 animate-fade-in" style={{animationDelay: '0.5s'}}>
              <div className="h-full min-h-[200px]">
                <CalendarFiltersCard />
              </div>
            </div>
          </div>

          {/* Desktop Layout - Grid simplificat (1024px-1440px) */}
          <div className="hidden xl:grid 2xl:hidden xl:grid-cols-4 gap-6 auto-rows-fr">
            {/* Fila superior */}
            <div className="col-span-3 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="h-full min-h-[500px]">
                <CalendarMainCard 
                  currentDate={currentDate} 
                  onDateChange={setCurrentDate}
                />
              </div>
            </div>
            <div className="col-span-1 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="h-full min-h-[500px]">
                <ViewSwitcherCard 
                  currentView={currentView}
                  onViewChange={setCurrentView}
                />
              </div>
            </div>

            {/* Segona fila */}
            <div className="col-span-1 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="h-full min-h-[300px]">
                <MiniCalendarCard 
                  currentDate={currentDate}
                  onDateSelect={setCurrentDate}
                />
              </div>
            </div>
            <div className="col-span-1 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="h-full min-h-[300px]">
                <CalendarStatsCard />
              </div>
            </div>
            <div className="col-span-2 animate-fade-in" style={{animationDelay: '0.5s'}}>
              <div className="h-full min-h-[300px]">
                <CalendarFiltersCard />
              </div>
            </div>
          </div>

          {/* Tablet Layout - Grid adaptat (768px-1024px) */}
          <div className="hidden lg:grid xl:hidden lg:grid-cols-2 gap-6 auto-rows-fr">
            <div className="col-span-2 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="h-full min-h-[500px]">
                <CalendarMainCard 
                  currentDate={currentDate} 
                  onDateChange={setCurrentDate}
                />
              </div>
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="h-full min-h-[300px]">
                <ViewSwitcherCard 
                  currentView={currentView}
                  onViewChange={setCurrentView}
                />
              </div>
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="h-full min-h-[300px]">
                <MiniCalendarCard 
                  currentDate={currentDate}
                  onDateSelect={setCurrentDate}
                />
              </div>
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="h-full min-h-[300px]">
                <CalendarStatsCard />
              </div>
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.5s'}}>
              <div className="h-full min-h-[300px]">
                <CalendarFiltersCard />
              </div>
            </div>
          </div>

          {/* Mobile/Small Tablet Layout - Stack vertical (0-768px) */}
          <div className="grid lg:hidden grid-cols-1 gap-6">
            <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
              <CalendarMainCard 
                currentDate={currentDate} 
                onDateChange={setCurrentDate}
              />
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <ViewSwitcherCard 
                currentView={currentView}
                onViewChange={setCurrentView}
              />
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
              <MiniCalendarCard 
                currentDate={currentDate}
                onDateSelect={setCurrentDate}
              />
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
              <CalendarStatsCard />
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.5s'}}>
              <CalendarFiltersCard />
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