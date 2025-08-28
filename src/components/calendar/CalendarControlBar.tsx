import React from "react";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CalendarControlBarProps {
  className?: string;
  onCreateEvent?: () => void;
}

const CalendarControlBar: React.FC<CalendarControlBarProps> = ({
  className,
  onCreateEvent
}) => {
  return (
    <Card 
      className={cn(
        "border-0 shadow-glass",
        "px-4 py-3 flex items-center justify-end gap-3",
        "animate-fade-in",
        className
      )}
    >
      <Button
        onClick={onCreateEvent}
        className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-sm transition-all duration-200 hover:shadow-md"
        size="sm"
      >
        <CalendarPlus className="h-4 w-4 mr-2" />
        Nou esdeveniment
      </Button>
    </Card>
  );
};

export default CalendarControlBar;