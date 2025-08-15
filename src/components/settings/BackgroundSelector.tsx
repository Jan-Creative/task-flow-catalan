import React from 'react';
import { useBackground, BackgroundType } from '@/contexts/BackgroundContext';
import { SettingsSection } from './SettingsSection';
import { SettingsItem } from './SettingsItem';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Waves, Sparkles, X } from 'lucide-react';

const backgroundOptions = [
  { value: 'dark-veil', label: 'Dark Veil', icon: Waves },
  { value: 'mesh-gradient', label: 'Mesh Gradient', icon: Palette },
  { value: 'particles', label: 'Particles', icon: Sparkles },
  { value: 'none', label: 'None', icon: X },
] as const;

export const BackgroundSelector: React.FC = () => {
  const { settings, updateSettings, setBackgroundType } = useBackground();

  return (
    <SettingsSection
      title="Background Effects"
      description="Customize your app's background appearance"
      icon={Palette}
    >
      <SettingsItem
        label="Background Type"
        description="Choose your preferred background effect"
      >
        <Select value={settings.type} onValueChange={(value: BackgroundType) => setBackgroundType(value)}>
          <SelectTrigger className="w-48">
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
      </SettingsItem>

      {settings.type !== 'none' && (
        <>
          <SettingsItem
            label="Intensity"
            description="Adjust the visual intensity of the background"
          >
            <div className="w-48">
              <Slider
                value={[settings.intensity]}
                onValueChange={([value]) => updateSettings({ intensity: value })}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground text-center mt-1">
                {Math.round(settings.intensity * 100)}%
              </div>
            </div>
          </SettingsItem>

          <SettingsItem
            label="Animation Speed"
            description="Control how fast the background animates"
          >
            <div className="w-48">
              <Slider
                value={[settings.speed]}
                onValueChange={([value]) => updateSettings({ speed: value })}
                max={3}
                min={0.1}
                step={0.1}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground text-center mt-1">
                {settings.speed.toFixed(1)}x
              </div>
            </div>
          </SettingsItem>

          <SettingsItem
            label="Color Shift"
            description="Shift the hue of the background colors"
          >
            <div className="w-48">
              <Slider
                value={[settings.hueShift]}
                onValueChange={([value]) => updateSettings({ hueShift: value })}
                max={1}
                min={0}
                step={0.05}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground text-center mt-1">
                {Math.round(settings.hueShift * 360)}°
              </div>
            </div>
          </SettingsItem>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateSettings({ intensity: 0.5, speed: 1.0, hueShift: 0.0 })}
            >
              Reset to Defaults
            </Button>
          </div>
        </>
      )}
    </SettingsSection>
  );
};