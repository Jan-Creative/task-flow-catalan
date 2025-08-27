import { useState } from "react";
import { cn } from "@/lib/utils";

interface WeekViewProps {
  currentDate: Date;
}

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
}

const WeekView = ({ currentDate }: WeekViewProps) => {
  const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8:00 to 22:00
  const daysOfWeek = ["Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres", "Dissabte", "Diumenge"];
  
  // Get the start of the week (Monday)
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    startOfWeek.setDate(diff);
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

  const weekDays = getWeekDays();
  const today = new Date();

  // Mock events for demonstration
  const generateMockEvents = (dayIndex: number): Event[] => {
    const events: Event[] = [];
    
    // Add some variety based on day
    if (dayIndex === 0) { // Monday
      events.push({
        id: "1",
        title: "Reunió d'equip",
        start: "09:00",
        end: "10:30",
        color: "bg-primary"
      });
      events.push({
        id: "2",
        title: "Revisió de projecte",
        start: "14:00",
        end: "15:00",
        color: "bg-success"
      });
    }
    
    if (dayIndex === 2) { // Wednesday
      events.push({
        id: "3",
        title: "Presentació client",
        start: "11:00",
        end: "12:30",
        color: "bg-warning"
      });
    }
    
    if (dayIndex === 4) { // Friday
      events.push({
        id: "4",
        title: "Sessió de brainstorming",
        start: "10:00",
        end: "11:00",
        color: "bg-secondary"
      });
      events.push({
        id: "5",
        title: "Retrospectiva setmanal",
        start: "16:00",
        end: "17:00",
        color: "bg-primary"
      });
    }
    
    return events;
  };

  const getEventPosition = (start: string, end: string) => {
    const startHour = parseInt(start.split(':')[0]);
    const startMinutes = parseInt(start.split(':')[1]);
    const endHour = parseInt(end.split(':')[0]);
    const endMinutes = parseInt(end.split(':')[1]);
    
    const startPosition = ((startHour - 8) * 60 + startMinutes) / 60; // Hours from 8:00
    const duration = ((endHour - startHour) * 60 + (endMinutes - startMinutes)) / 60;
    
    return {
      top: `${startPosition * 4}rem`, // 4rem per hour
      height: `${duration * 4}rem`
    };
  };

  return (
    <div className="flex flex-col h-full">
      {/* Week Days Header */}
      <div className="grid grid-cols-8 gap-2 mb-3">
        {/* Empty cell for time column */}
        <div className="bg-card p-3 rounded-lg"></div>
        
        {/* Day headers */}
        {weekDays.map((day, index) => {
          const isToday = day.toDateString() === today.toDateString();
          
          return (
            <div
              key={index}
              className={cn(
                "bg-card p-3 text-center transition-colors rounded-lg border-2 border-black",
                isToday && "bg-primary/10 border-primary"
              )}
            >
              <div className="text-xs font-medium text-muted-foreground mb-1">
                {daysOfWeek[index]}
              </div>
              <div className={cn(
                "text-lg font-bold",
                isToday 
                  ? "text-primary" 
                  : "text-foreground"
              )}>
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline and Events */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8 gap-2">
          {/* Time column */}
          <div className="bg-card rounded-lg border-2 border-black">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-16 px-3 py-2 text-xs text-muted-foreground border-t-2 border-black flex items-start first:border-t-0"
              >
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIndex) => {
            const events = generateMockEvents(dayIndex);
            
            return (
              <div key={dayIndex} className="bg-card relative rounded-lg border-2 border-black">
                {/* Hour slots */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-16 border-t-2 border-black hover:bg-accent/20 transition-colors cursor-pointer first:border-t-0"
                  />
                ))}
                
                {/* Events */}
                {events.map((event) => {
                  const position = getEventPosition(event.start, event.end);
                  
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "absolute left-1 right-1 rounded-xl p-2 text-xs font-medium transition-all duration-200 hover:scale-105 cursor-pointer shadow-lg border-2 border-black",
                        event.color,
                        "text-white overflow-hidden"
                      )}
                      style={position}
                    >
                      <div className="font-semibold truncate">{event.title}</div>
                      <div className="text-white/80 text-[10px]">
                        {event.start} - {event.end}
                      </div>
                      
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50 rounded-xl" />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeekView;