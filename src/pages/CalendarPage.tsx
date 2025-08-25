import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Grid3X3, List, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CalendarView = "month" | "week" | "day" | "agenda";

const CalendarPage = () => {
  const [currentView, setCurrentView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  const viewOptions = [
    { id: "month", label: "Mes", icon: Grid3X3 },
    { id: "week", label: "Setmana", icon: CalendarIcon },
    { id: "day", label: "Dia", icon: Clock },
    { id: "agenda", label: "Agenda", icon: List },
  ];

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    "Gener", "Febrer", "Març", "Abril", "Maig", "Juny",
    "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"
  ];

  const getCurrentMonthYear = () => {
    return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-background/50 pt-4 pb-24">
      {/* Header */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Calendari</h1>
          </div>
          
          {/* View Switcher */}
          <div className="bg-card/80 backdrop-blur-[var(--backdrop-blur-organic)] rounded-[20px] shadow-[var(--shadow-organic)] p-1 flex">
            {viewOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView(option.id as CalendarView)}
                  className={cn(
                    "rounded-[16px] transition-all duration-200 px-3 py-2",
                    currentView === option.id
                      ? "bg-primary/20 text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Icon className="h-4 w-4 mr-1.5" />
                  <span className="text-sm font-medium">{option.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth("prev")}
              className="h-10 w-10 rounded-full bg-card/60 backdrop-blur-sm hover:bg-card/80 hover:scale-105 transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h2 className="text-xl font-semibold text-foreground min-w-[180px] text-center">
              {getCurrentMonthYear()}
            </h2>
            
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => navigateMonth("next")}
              className="h-10 w-10 rounded-full bg-card/60 backdrop-blur-sm hover:bg-card/80 hover:scale-105 transition-all duration-200"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="rounded-[16px] bg-card/60 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-200"
          >
            Avui
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Main View */}
        <div className="lg:col-span-3">
          <Card className="bg-card/60 backdrop-blur-[var(--backdrop-blur-organic)] border-border/50 shadow-[var(--shadow-organic)] rounded-[24px] overflow-hidden">
            <div className="p-6">
              {currentView === "month" && <MonthView currentDate={currentDate} />}
              {currentView === "week" && <WeekView />}
              {currentView === "day" && <DayView />}
              {currentView === "agenda" && <AgendaView />}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Mini Calendar */}
          <Card className="bg-card/60 backdrop-blur-[var(--backdrop-blur-organic)] border-border/50 shadow-[var(--shadow-organic)] rounded-[20px] p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Navegació Ràpida</h3>
            <MiniCalendar currentDate={currentDate} />
          </Card>

          {/* Calendar Stats */}
          <Card className="bg-card/60 backdrop-blur-[var(--backdrop-blur-organic)] border-border/50 shadow-[var(--shadow-organic)] rounded-[20px] p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Resum</h3>
            <CalendarStats />
          </Card>

          {/* Filters */}
          <Card className="bg-card/60 backdrop-blur-[var(--backdrop-blur-organic)] border-border/50 shadow-[var(--shadow-organic)] rounded-[20px] p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Filtres</h3>
            <CalendarFilters />
          </Card>
        </div>
      </div>
    </div>
  );
};

// Month View Component
const MonthView = ({ currentDate }: { currentDate: Date }) => {
  const daysOfWeek = ["Dl", "Dm", "Dc", "Dj", "Dv", "Ds", "Dg"];
  
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1);
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const days = getDaysInMonth();
  const today = new Date();
  const currentMonth = currentDate.getMonth();

  return (
    <div className="space-y-4">
      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const isToday = day.toDateString() === today.toDateString();
          const isCurrentMonth = day.getMonth() === currentMonth;
          
          return (
            <div
              key={index}
              className={cn(
                "aspect-square p-2 rounded-[12px] border transition-all duration-200 cursor-pointer group",
                isCurrentMonth
                  ? "bg-card/40 border-border/30 hover:bg-card/60 hover:border-border/50"
                  : "bg-transparent border-transparent text-muted-foreground/50",
                isToday && "bg-primary/20 border-primary/30 text-primary font-semibold"
              )}
            >
              <div className="flex flex-col h-full">
                <span className={cn(
                  "text-sm font-medium mb-1",
                  isToday ? "text-primary" : isCurrentMonth ? "text-foreground" : "text-muted-foreground/50"
                )}>
                  {day.getDate()}
                </span>
                
                {/* Sample Events */}
                {isCurrentMonth && Math.random() > 0.7 && (
                  <div className="flex-1 space-y-1">
                    <div className="h-1.5 bg-primary/60 rounded-full"></div>
                    {Math.random() > 0.5 && (
                      <div className="h-1.5 bg-secondary/60 rounded-full"></div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Week View Placeholder
const WeekView = () => (
  <div className="flex items-center justify-center h-64 text-muted-foreground">
    <div className="text-center">
      <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>Vista setmanal - Proper desenvolupament</p>
    </div>
  </div>
);

// Day View Placeholder  
const DayView = () => (
  <div className="flex items-center justify-center h-64 text-muted-foreground">
    <div className="text-center">
      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>Vista diària - Proper desenvolupament</p>
    </div>
  </div>
);

// Agenda View Placeholder
const AgendaView = () => (
  <div className="flex items-center justify-center h-64 text-muted-foreground">
    <div className="text-center">
      <List className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>Vista agenda - Proper desenvolupament</p>
    </div>
  </div>
);

// Mini Calendar Component
const MiniCalendar = ({ currentDate }: { currentDate: Date }) => {
  const today = new Date();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  
  return (
    <div className="text-center">
      <div className="text-xs text-muted-foreground mb-2">
        {currentDate.toLocaleDateString('ca-ES', { month: 'long', year: 'numeric' })}
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="text-muted-foreground font-medium py-1">
            {['D', 'L', 'M', 'X', 'J', 'V', 'S'][i]}
          </div>
        ))}
        {Array.from({ length: 35 }, (_, i) => {
          const day = i - 6; // Adjust for calendar start
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          
          return (
            <div
              key={i}
              className={cn(
                "aspect-square flex items-center justify-center rounded text-xs cursor-pointer transition-colors",
                day > 0 && day <= 31
                  ? isToday
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "hover:bg-accent text-foreground"
                  : "text-transparent"
              )}
            >
              {day > 0 && day <= 31 ? day : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Calendar Stats Component
const CalendarStats = () => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">Tasques avui</span>
      <span className="text-sm font-semibold text-foreground">5</span>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">Aquesta setmana</span>
      <span className="text-sm font-semibold text-foreground">23</span>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">Pendents</span>
      <span className="text-sm font-semibold text-destructive">12</span>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">Completades</span>
      <span className="text-sm font-semibold text-green-400">11</span>
    </div>
  </div>
);

// Calendar Filters Component
const CalendarFilters = () => (
  <div className="space-y-4">
    <div>
      <h4 className="text-xs font-semibold text-muted-foreground mb-2">CARPETES</h4>
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="rounded text-primary" defaultChecked />
          <span className="text-foreground">Totes</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="rounded text-primary" />
          <span className="text-foreground">Personal</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="rounded text-primary" />
          <span className="text-foreground">Feina</span>
        </label>
      </div>
    </div>
    
    <div>
      <h4 className="text-xs font-semibold text-muted-foreground mb-2">PRIORITATS</h4>
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="rounded text-primary" defaultChecked />
          <span className="text-foreground">Alta</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="rounded text-primary" defaultChecked />
          <span className="text-foreground">Mitjana</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="rounded text-primary" defaultChecked />
          <span className="text-foreground">Baixa</span>
        </label>
      </div>
    </div>
  </div>
);

export default CalendarPage;