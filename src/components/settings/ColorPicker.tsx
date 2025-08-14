import { useState } from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const PRESET_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#22c55e", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#f97316", // orange
  "#6366f1", // indigo
  "#14b8a6", // teal
  "#a855f7", // purple
  "#64748b", // slate
  "#dc2626", // red-600
  "#16a34a", // green-600
  "#ca8a04", // yellow-600
];

export const ColorPicker = ({ color, onChange }: ColorPickerProps) => {
  const [customColor, setCustomColor] = useState(color);
  const [open, setOpen] = useState(false);

  const handlePresetColorSelect = (selectedColor: string) => {
    onChange(selectedColor);
    setCustomColor(selectedColor);
    setOpen(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    onChange(newColor);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-10 h-10 p-0 border-2"
          style={{ backgroundColor: color }}
        >
          <Palette className="h-4 w-4 text-white drop-shadow-sm" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Selecciona un Color</h4>
          
          {/* Preset Colors Grid */}
          <div className="grid grid-cols-8 gap-2">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                  presetColor === color ? 'border-foreground ring-2 ring-primary/50' : 'border-border'
                }`}
                style={{ backgroundColor: presetColor }}
                onClick={() => handlePresetColorSelect(presetColor)}
                title={presetColor}
              />
            ))}
          </div>

          {/* Custom Color Input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Color Personalitzat
            </label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-12 h-8 p-0 border-0"
              />
              <Input
                type="text"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                    onChange(e.target.value);
                  }
                }}
                placeholder="#3b82f6"
                className="flex-1 text-xs"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};