import React, { useState } from 'react';
import { useBackground, BackgroundType } from '@/contexts/BackgroundContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Waves, Sparkles, X, Check, RotateCcw, Shapes, Zap, Binary } from 'lucide-react';

const backgroundOptions = [
  { value: 'dark-veil', label: 'Dark Veil', icon: Waves },
  { value: 'mesh-gradient', label: 'Mesh Gradient', icon: Palette },
  { value: 'particles', label: 'Particles', icon: Sparkles },
  { value: 'geometric', label: 'Geometric', icon: Shapes },
  { value: 'wave', label: 'Wave', icon: Waves },
  { value: 'neon', label: 'Neon', icon: Zap },
  { value: 'matrix', label: 'Matrix', icon: Binary },
  { value: 'none', label: 'None', icon: X },
] as const;

interface BackgroundConfigPopoverProps {
  children: React.ReactNode;
}

export const BackgroundConfigPopover: React.FC<BackgroundConfigPopoverProps> = ({ children }) => {
  const { settings, updateSettings, setBackgroundType } = useBackground();
  console.log('BackgroundConfigPopover - current settings:', settings);
  const [isOpen, setIsOpen] = useState(false);
  
  const handleReset = () => {
    updateSettings({ intensity: 0.5, speed: 1.0, hueShift: 0.0 });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end" side="top">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <h4 className="font-medium text-sm">Configuració de fons</h4>
          </div>
          
          {/* Background Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipus de fons</label>
            <Select value={settings.type} onValueChange={(value: BackgroundType) => {
              console.log('Changing background type to:', value);
              setBackgroundType(value);
            }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {backgroundOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {settings.type !== 'none' && (
            <>
              {/* Intensity */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Intensitat</label>
                <div className="space-y-1">
                  <Slider
                    value={[settings.intensity]}
                    onValueChange={([value]) => updateSettings({ intensity: value })}
                    max={1}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground text-center">
                    {Math.round(settings.intensity * 100)}%
                  </div>
                </div>
              </div>

              {/* Speed */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Velocitat</label>
                <div className="space-y-1">
                  <Slider
                    value={[settings.speed]}
                    onValueChange={([value]) => updateSettings({ speed: value })}
                    max={3}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground text-center">
                    {settings.speed.toFixed(1)}x
                  </div>
                </div>
              </div>

              {/* Hue Shift */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Canvi de color</label>
                <div className="space-y-1">
                  <Slider
                    value={[settings.hueShift]}
                    onValueChange={([value]) => updateSettings({ hueShift: value })}
                    max={1}
                    min={0}
                    step={0.05}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground text-center">
                    {Math.round(settings.hueShift * 360)}°
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Restaurar valors per defecte
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};