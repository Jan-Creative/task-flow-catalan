import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MiniCalendarCardProps {
  currentDate: Date;
  onDateSelect?: (date: Date) => void;
}

const MiniCalendarCard = ({ currentDate, onDateSelect }: MiniCalendarCardProps) => {
  const today = new Date();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  
  const getDaysInMonth = () => {
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
  const daysOfWeek = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

  return (
    <Card className="h-full bg-background/40 backdrop-blur-md border-border/20 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Navegació Ràpida</CardTitle>
        <CardDescription>
          {currentDate.toLocaleDateString('ca-ES', { month: 'long', year: 'numeric' })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {/* Days of week header */}
          {daysOfWeek.map((day, i) => (
            <div key={i} className="text-center text-xs font-semibold text-muted-foreground py-1">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((day, i) => {
            const isToday = day.toDateString() === today.toDateString();
            const isCurrentMonth = day.getMonth() === month;
            const isSelected = day.toDateString() === currentDate.toDateString();
            
            return (
              <div
                key={i}
                onClick={() => onDateSelect?.(day)}
                className={cn(
                  "aspect-square flex items-center justify-center rounded-lg text-xs cursor-pointer transition-all duration-200 hover:scale-110",
                  isCurrentMonth
                    ? isToday
                      ? "bg-primary text-primary-foreground font-bold shadow-md"
                      : isSelected
                      ? "bg-primary/20 text-primary font-semibold border border-primary/30"
                      : "hover:bg-background/30 text-foreground"
                    : "text-muted-foreground/30 hover:text-muted-foreground/60"
                )}
              >
                {day.getDate()}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MiniCalendarCard;