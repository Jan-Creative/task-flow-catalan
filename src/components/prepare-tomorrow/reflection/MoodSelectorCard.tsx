import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Sparkles } from 'lucide-react';

interface MoodSelectorCardProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const moodOptions = [
  { value: 1, emoji: '😔', label: 'Molt dolent', color: 'hsl(0 84% 60%)' },
  { value: 2, emoji: '😞', label: 'Dolent', color: 'hsl(20 84% 60%)' },
  { value: 3, emoji: '😐', label: 'Regular', color: 'hsl(40 84% 60%)' },
  { value: 4, emoji: '🙂', label: 'Bé', color: 'hsl(60 84% 60%)' },
  { value: 5, emoji: '😊', label: 'Força bé', color: 'hsl(80 84% 60%)' },
  { value: 6, emoji: '😄', label: 'Molt bé', color: 'hsl(100 84% 60%)' },
  { value: 7, emoji: '😁', label: 'Genial', color: 'hsl(120 84% 60%)' },
  { value: 8, emoji: '🤩', label: 'Increïble', color: 'hsl(140 84% 60%)' },
  { value: 9, emoji: '🥳', label: 'Espectacular', color: 'hsl(160 84% 60%)' },
  { value: 10, emoji: '✨', label: 'Perfecte', color: 'hsl(180 100% 50%)' }
];

export function MoodSelectorCard({ value, onChange, disabled }: MoodSelectorCardProps) {
  const [hoveredMood, setHoveredMood] = useState<number | null>(null);
  const selectedMood = moodOptions.find(m => m.value === value);

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-card/80 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Heart className="h-5 w-5 text-primary" />
          Com t'has sentit avui?
          <Sparkles className="h-4 w-4 text-primary-glow animate-pulse" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selected mood display */}
        {selectedMood && (
          <div className="text-center p-6 rounded-2xl bg-secondary/30 border border-border/30">
            <div 
              className="text-6xl mb-3 animate-bounce"
              style={{
                filter: `drop-shadow(0 0 20px ${selectedMood.color}40)`,
                textShadow: `0 0 30px ${selectedMood.color}60`
              }}
            >
              {selectedMood.emoji}
            </div>
            <div className="text-lg font-medium text-foreground">{selectedMood.label}</div>
            <div className="text-sm text-muted-foreground">Puntuació: {selectedMood.value}/10</div>
          </div>
        )}

        {/* Mood grid */}
        <div className="grid grid-cols-5 gap-3">
          {moodOptions.map((mood) => {
            const isSelected = mood.value === value;
            const isHovered = hoveredMood === mood.value;
            const shouldGlow = isSelected || isHovered;

            return (
              <button
                key={mood.value}
                onClick={() => !disabled && onChange(mood.value)}
                onMouseEnter={() => setHoveredMood(mood.value)}
                onMouseLeave={() => setHoveredMood(null)}
                disabled={disabled}
                className={`
                  relative p-3 rounded-xl transition-all duration-300 ease-out
                  ${isSelected 
                    ? 'bg-primary/20 border-2 border-primary scale-110' 
                    : 'bg-secondary/20 border border-border/30 hover:bg-secondary/40'
                  }
                  ${shouldGlow ? 'transform scale-105' : ''}
                  disabled:opacity-50 disabled:cursor-not-allowed
                  group
                `}
                style={{
                  boxShadow: shouldGlow 
                    ? `0 0 20px ${mood.color}30, 0 8px 25px rgba(0,0,0,0.3)` 
                    : '0 2px 10px rgba(0,0,0,0.2)'
                }}
              >
                <div 
                  className={`
                    text-2xl transition-all duration-300
                    ${shouldGlow ? 'animate-pulse' : ''}
                  `}
                  style={{
                    filter: shouldGlow ? `drop-shadow(0 0 15px ${mood.color}50)` : 'none',
                    textShadow: shouldGlow ? `0 0 20px ${mood.color}40` : 'none'
                  }}
                >
                  {mood.emoji}
                </div>
                
                {/* Tooltip on hover */}
                <div className={`
                  absolute -top-12 left-1/2 transform -translate-x-1/2
                  px-2 py-1 rounded-lg bg-popover text-popover-foreground text-xs
                  border border-border/50 backdrop-blur-sm
                  transition-all duration-200
                  ${isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'}
                `}>
                  {mood.label}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover"></div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center">
          <div className="flex items-center gap-1">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${i < value 
                    ? 'bg-primary shadow-sm' 
                    : 'bg-muted'
                  }
                `}
                style={{
                  boxShadow: i < value ? `0 0 8px ${selectedMood?.color}40` : 'none'
                }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}