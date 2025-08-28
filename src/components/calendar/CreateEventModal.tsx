import React, { useState } from "react";
import { Calendar, Clock, MapPin, Bell, Users, MoreHorizontal, X } from "lucide-react";
import { format } from "date-fns";
import { ca } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useEvents } from "@/hooks/useEvents";

interface CreateEventPopoverProps {
  children?: React.ReactNode;
  defaultDate?: Date;
  defaultTime?: string;
  onCreateEvent?: (eventData: EventFormData) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  useHiddenTrigger?: boolean;
}

interface EventFormData {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  location?: string;
  locationType: "physical" | "virtual";
  reminder: string;
  availability: "free" | "busy";
  repeat: string;
  guests?: string;
}

export const CreateEventPopover = ({
  children,
  defaultDate = new Date(),
  defaultTime,
  onCreateEvent,
  open: controlledOpen,
  onOpenChange,
  useHiddenTrigger = false,
}: CreateEventPopoverProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  
  const { createEvent, isCreating } = useEvents();
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    startDate: defaultDate,
    endDate: new Date(defaultDate.getTime() + 60 * 60 * 1000), // 1 hour later
    isAllDay: false,
    location: "",
    locationType: "physical",
    reminder: "15min",
    availability: "busy",
    repeat: "never",
    guests: "",
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startTime, setStartTime] = useState(defaultTime || "09:00");
  const [endTime, setEndTime] = useState(defaultTime ? getEndTime(defaultTime) : "10:00");

  // Helper function to calculate end time (1 hour later)
  function getEndTime(startTime: string): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHour = hours + 1;
    return `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      // Combine date and time for start and end dates
      let startDate = new Date(formData.startDate);
      let endDate = new Date(formData.endDate);

      if (!formData.isAllDay) {
        const [startHours, startMinutes] = startTime.split(":").map(Number);
        const [endHours, endMinutes] = endTime.split(":").map(Number);
        
        startDate.setHours(startHours, startMinutes, 0, 0);
        endDate.setHours(endHours, endMinutes, 0, 0);
      } else {
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        start_datetime: startDate,
        end_datetime: endDate,
        is_all_day: formData.isAllDay,
        location: formData.location,
        location_type: formData.locationType,
        color: "#6366f1", // Default color
        reminder_time: formData.reminder !== "none" ? parseInt(formData.reminder.replace('min', '').replace('hour', '60').replace('day', '1440')) : undefined,
      };

      // Use the useEvents hook to create the event
      await createEvent(eventData);

      // Also call the optional callback if provided
      if (onCreateEvent) {
        onCreateEvent(formData);
      }

      if (onOpenChange) {
        onOpenChange(false);
      } else {
        setInternalOpen(false);
      }
      resetForm();
    } catch (error) {
      console.error("Error creating event:", error);
      // Error toast is handled by the useEvents hook
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      startDate: defaultDate,
      endDate: new Date(defaultDate.getTime() + 60 * 60 * 1000),
      isAllDay: false,
      location: "",
      locationType: "physical",
      reminder: "15min",
      availability: "busy",
      repeat: "never",
      guests: "",
    });
    setStartTime(defaultTime || "09:00");
    setEndTime(defaultTime ? getEndTime(defaultTime) : "10:00");
  };

  const updateFormData = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Safe trigger element to avoid React.Children.only error
  const triggerElement = useHiddenTrigger || !children ? (
    <button 
      style={{ 
        position: 'absolute', 
        opacity: 0,
        pointerEvents: 'none',
        width: 1,
        height: 1
      }}
      tabIndex={-1}
      aria-hidden="true"
    />
  ) : (
    React.Children.count(children) === 1 ? children : <span>{children}</span>
  );

  return (
    <Popover open={open} onOpenChange={onOpenChange || setInternalOpen}>
      <PopoverTrigger asChild>
        {triggerElement}
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 p-0 border-0 bg-gradient-to-br from-card/95 to-card-secondary/90 backdrop-blur-md shadow-2xl"
        align="start"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="relative">
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-glass rounded-xl" />
          
          {/* Content */}
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Nou esdeveniment
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (onOpenChange) {
                    onOpenChange(false);
                  } else {
                    setInternalOpen(false);
                  }
                }}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <Input
                  placeholder="Títol de l'esdeveniment"
                  value={formData.title}
                  onChange={(e) => updateFormData("title", e.target.value)}
                  className="text-base font-medium border-0 bg-[hsl(var(--input-primary))] backdrop-blur-sm placeholder:text-muted-foreground/80 focus:bg-[hsl(var(--input-focus))] hover:bg-[hsl(var(--input-hover))] transition-all duration-200"
                  required
                />
              </div>

              {/* Date and Time */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-foreground/90">Data i hora</Label>
                  <div className="flex items-center space-x-1.5">
                    <Switch
                      checked={formData.isAllDay}
                      onCheckedChange={(checked) => updateFormData("isAllDay", checked)}
                      className="scale-75 data-[state=checked]:bg-primary"
                    />
                    <Label className="text-xs text-muted-foreground/80">Tot el dia</Label>
                  </div>
                </div>

                {/* Start Date/Time */}
                <div className="grid grid-cols-2 gap-2">
                  <Popover open={showStartDatePicker} onOpenChange={setShowStartDatePicker}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal bg-[hsl(var(--input-secondary))] border-0 hover:bg-[hsl(var(--input-hover))] transition-all duration-200",
                          !formData.startDate && "text-muted-foreground/80"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.startDate ? format(formData.startDate, "dd/MM", { locale: ca }) : "Data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-popover/95 backdrop-blur-md border-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => {
                          if (date) updateFormData("startDate", date);
                          setShowStartDatePicker(false);
                        }}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>

                  {!formData.isAllDay && (
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="bg-[hsl(var(--input-secondary))] border-0 focus:bg-[hsl(var(--input-focus))] transition-all duration-200"
                    />
                  )}
                </div>

                {/* End Date/Time */}
                <div className="grid grid-cols-2 gap-2">
                  <Popover open={showEndDatePicker} onOpenChange={setShowEndDatePicker}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal bg-[hsl(var(--input-secondary))] border-0 hover:bg-[hsl(var(--input-hover))] transition-all duration-200",
                          !formData.endDate && "text-muted-foreground/80"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.endDate ? format(formData.endDate, "dd/MM", { locale: ca }) : "Data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-popover/95 backdrop-blur-md border-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => {
                          if (date) updateFormData("endDate", date);
                          setShowEndDatePicker(false);
                        }}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>

                  {!formData.isAllDay && (
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="bg-[hsl(var(--input-secondary))] border-0 focus:bg-[hsl(var(--input-focus))] transition-all duration-200"
                    />
                  )}
                </div>
              </div>

              {/* Location and Options - Compact layout */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-foreground/90">Ubicació</Label>
                  <Select
                    value={formData.locationType}
                    onValueChange={(value: "physical" | "virtual") => updateFormData("locationType", value)}
                  >
                    <SelectTrigger className="bg-[hsl(var(--input-compact))] border-0 focus:bg-[hsl(var(--input-focus))] h-8 text-xs transition-all duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover/95 backdrop-blur-md border-0">
                      <SelectItem value="physical">
                        <div className="flex items-center">
                          <MapPin className="mr-1.5 h-3 w-3" />
                          <span className="text-xs">Presencial</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="virtual">
                        <div className="flex items-center">
                          <Users className="mr-1.5 h-3 w-3" />
                          <span className="text-xs">Virtual</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-foreground/90">Recordatori</Label>
                  <Select
                    value={formData.reminder}
                    onValueChange={(value) => updateFormData("reminder", value)}
                  >
                    <SelectTrigger className="bg-[hsl(var(--input-compact))] border-0 focus:bg-[hsl(var(--input-focus))] h-8 text-xs transition-all duration-200">
                      <Bell className="mr-1 h-3 w-3 text-primary/70" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover/95 backdrop-blur-md border-0">
                      <SelectItem value="none">Cap</SelectItem>
                      <SelectItem value="5min">5 min</SelectItem>
                      <SelectItem value="15min">15 min</SelectItem>
                      <SelectItem value="30min">30 min</SelectItem>
                      <SelectItem value="1hour">1 h</SelectItem>
                      <SelectItem value="1day">1 dia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location Input */}
              <div>
                <Input
                  placeholder={formData.locationType === "physical" ? "Afegeix ubicació" : "Enllaç de videotrucada"}
                  value={formData.location}
                  onChange={(e) => updateFormData("location", e.target.value)}
                  className="bg-[hsl(var(--input-secondary))] border-0 focus:bg-[hsl(var(--input-focus))] h-8 text-sm placeholder:text-muted-foreground/80 transition-all duration-200"
                />
              </div>

              {/* Description - Simplified */}
              <div>
                <Textarea
                  placeholder="Descripció (opcional)..."
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  className="min-h-[60px] bg-[hsl(var(--input-secondary))] border-0 focus:bg-[hsl(var(--input-focus))] resize-none text-sm placeholder:text-muted-foreground/80 transition-all duration-200"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (onOpenChange) {
                      onOpenChange(false);
                    } else {
                      setInternalOpen(false);
                    }
                  }}
                  className="flex-1 bg-[hsl(var(--input-compact))] border-0 hover:bg-[hsl(var(--input-hover))] h-8 text-sm transition-all duration-200"
                >
                  Cancel·lar
                </Button>
                <Button
                  type="submit"
                  disabled={!formData.title.trim() || isCreating}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-8 text-sm shadow-sm shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all duration-200"
                >
                  {isCreating ? "Creant..." : "Crear"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};