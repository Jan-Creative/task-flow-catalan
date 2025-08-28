import { useState } from "react";
import { Calendar, Clock, MapPin, Bell, Users, MoreHorizontal, X } from "lucide-react";
import { format } from "date-fns";
import { ca } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface CreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
  onCreateEvent?: (eventData: EventFormData) => void;
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

export const CreateEventModal = ({
  open,
  onOpenChange,
  defaultDate = new Date(),
  onCreateEvent,
}: CreateEventModalProps) => {
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
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    // Combine date and time for start and end dates
    if (!formData.isAllDay) {
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);
      
      const newStartDate = new Date(formData.startDate);
      newStartDate.setHours(startHours, startMinutes, 0, 0);
      
      const newEndDate = new Date(formData.endDate);
      newEndDate.setHours(endHours, endMinutes, 0, 0);
      
      setFormData(prev => ({
        ...prev,
        startDate: newStartDate,
        endDate: newEndDate,
      }));
    }

    onCreateEvent?.(formData);
    onOpenChange(false);
    resetForm();
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
    setStartTime("09:00");
    setEndTime("10:00");
  };

  const updateFormData = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 border-0 bg-gradient-to-br from-card/95 to-card-secondary/90 backdrop-blur-md">
        <div className="relative">
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-glass rounded-xl" />
          
          {/* Content */}
          <div className="relative p-6">
            <DialogHeader className="space-y-3 pb-6">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-semibold text-foreground">
                  Nou esdeveniment
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Input
                  placeholder="Títol de l'esdeveniment"
                  value={formData.title}
                  onChange={(e) => updateFormData("title", e.target.value)}
                  className="text-lg font-medium border-0 bg-secondary/50 backdrop-blur-sm placeholder:text-muted-foreground/70 focus:bg-secondary/70 transition-colors"
                  required
                />
              </div>

              {/* Date and Time */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground">Data i hora</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.isAllDay}
                      onCheckedChange={(checked) => updateFormData("isAllDay", checked)}
                    />
                    <Label className="text-sm text-muted-foreground">Tot el dia</Label>
                  </div>
                </div>

                {/* Start Date/Time */}
                <div className="grid grid-cols-2 gap-3">
                  <Popover open={showStartDatePicker} onOpenChange={setShowStartDatePicker}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal bg-secondary/50 border-0 hover:bg-secondary/70",
                          !formData.startDate && "text-muted-foreground"
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
                      className="bg-secondary/50 border-0 focus:bg-secondary/70"
                    />
                  )}
                </div>

                {/* End Date/Time */}
                <div className="grid grid-cols-2 gap-3">
                  <Popover open={showEndDatePicker} onOpenChange={setShowEndDatePicker}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal bg-secondary/50 border-0 hover:bg-secondary/70",
                          !formData.endDate && "text-muted-foreground"
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
                      className="bg-secondary/50 border-0 focus:bg-secondary/70"
                    />
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">Ubicació</Label>
                <div className="space-y-2">
                  <Select
                    value={formData.locationType}
                    onValueChange={(value: "physical" | "virtual") => updateFormData("locationType", value)}
                  >
                    <SelectTrigger className="bg-secondary/50 border-0 focus:bg-secondary/70">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover/95 backdrop-blur-md border-0">
                      <SelectItem value="physical">
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4" />
                          Presencial
                        </div>
                      </SelectItem>
                      <SelectItem value="virtual">
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4" />
                          Videotrucada
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder={formData.locationType === "physical" ? "Afegeix ubicació" : "Enllaç de videotrucada"}
                    value={formData.location}
                    onChange={(e) => updateFormData("location", e.target.value)}
                    className="bg-secondary/50 border-0 focus:bg-secondary/70"
                  />
                </div>
              </div>

              {/* Reminder and Repeat */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Recordatori</Label>
                  <Select
                    value={formData.reminder}
                    onValueChange={(value) => updateFormData("reminder", value)}
                  >
                    <SelectTrigger className="bg-secondary/50 border-0 focus:bg-secondary/70">
                      <Bell className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover/95 backdrop-blur-md border-0">
                      <SelectItem value="none">Cap</SelectItem>
                      <SelectItem value="5min">5 minuts</SelectItem>
                      <SelectItem value="15min">15 minuts</SelectItem>
                      <SelectItem value="30min">30 minuts</SelectItem>
                      <SelectItem value="1hour">1 hora</SelectItem>
                      <SelectItem value="1day">1 dia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Repetició</Label>
                  <Select
                    value={formData.repeat}
                    onValueChange={(value) => updateFormData("repeat", value)}
                  >
                    <SelectTrigger className="bg-secondary/50 border-0 focus:bg-secondary/70">
                      <MoreHorizontal className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover/95 backdrop-blur-md border-0">
                      <SelectItem value="never">Mai</SelectItem>
                      <SelectItem value="daily">Diari</SelectItem>
                      <SelectItem value="weekly">Setmanal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Descripció</Label>
                <Textarea
                  placeholder="Afegeix una descripció..."
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  className="min-h-[80px] bg-secondary/50 border-0 focus:bg-secondary/70 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 bg-secondary/50 border-0 hover:bg-secondary/70"
                >
                  Cancel·lar
                </Button>
                <Button
                  type="submit"
                  disabled={!formData.title.trim()}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Crear esdeveniment
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};