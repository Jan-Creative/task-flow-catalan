import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PomodoroConfigDialogProps {
  workDuration: number;
  breakDuration: number;
  onWorkDurationChange: (duration: number) => void;
  onBreakDurationChange: (duration: number) => void;
  disabled?: boolean;
}

const PRESETS = [
  { work: 25, break: 5, label: "Clàssic" },
  { work: 15, break: 5, label: "Curt" },
  { work: 45, break: 15, label: "Llarg" },
  { work: 50, break: 10, label: "Focus intens" }
];

export const PomodoroConfigDialog = ({
  workDuration,
  breakDuration,
  onWorkDurationChange,
  onBreakDurationChange,
  disabled = false
}: PomodoroConfigDialogProps) => {
  const [tempWork, setTempWork] = useState(workDuration);
  const [tempBreak, setTempBreak] = useState(breakDuration);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    onWorkDurationChange(tempWork);
    onBreakDurationChange(tempBreak);
    setOpen(false);
  };

  const handlePreset = (preset: typeof PRESETS[0]) => {
    setTempWork(preset.work);
    setTempBreak(preset.break);
  };

  const adjustValue = (
    value: number, 
    delta: number, 
    min: number, 
    max: number, 
    setter: (val: number) => void
  ) => {
    const newValue = Math.min(Math.max(value + delta, min), max);
    setter(newValue);
  };

  // Reset temp values when opening
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setTempWork(workDuration);
      setTempBreak(breakDuration);
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          disabled={disabled}
          title={disabled ? "No es pot configurar mentre el timer està actiu" : "Configuració Pomodoro"}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Configuració Pomodoro
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Presets */}
          <div>
            <h4 className="text-sm font-medium mb-3">Configuracions predefinides</h4>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreset(preset)}
                  className={cn(
                    "h-auto p-3 flex flex-col items-center gap-1",
                    tempWork === preset.work && tempBreak === preset.break && 
                    "border-primary bg-primary/10"
                  )}
                >
                  <span className="font-medium text-xs">{preset.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {preset.work}min / {preset.break}min
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Custom controls */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Configuració personalitzada</h4>
            
            {/* Work duration */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Temps de feina</label>
              <div className="flex items-center justify-between bg-muted/30 rounded-xl p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => adjustValue(tempWork, -5, 5, 120, setTempWork)}
                  disabled={tempWork <= 5}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-mono font-bold">{tempWork}</span>
                  <span className="text-sm text-muted-foreground">min</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => adjustValue(tempWork, 5, 5, 120, setTempWork)}
                  disabled={tempWork >= 120}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Break duration */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Temps de descans</label>
              <div className="flex items-center justify-between bg-muted/30 rounded-xl p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => adjustValue(tempBreak, -1, 1, 30, setTempBreak)}
                  disabled={tempBreak <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-mono font-bold">{tempBreak}</span>
                  <span className="text-sm text-muted-foreground">min</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => adjustValue(tempBreak, 1, 1, 30, setTempBreak)}
                  disabled={tempBreak >= 30}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel·lar
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};