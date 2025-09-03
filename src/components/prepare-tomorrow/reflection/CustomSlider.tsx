import { useState } from 'react';

interface CustomSliderProps {
  value: number;
  onChange: (value: number) => void;
  color: string;
  disabled?: boolean;
  inverted?: boolean;
}

export function CustomSlider({ value, onChange, color, disabled, inverted }: CustomSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  
  const percentage = ((value - 1) / 9) * 100;
  
  const getGradientColor = (percentage: number) => {
    if (inverted) {
      // For stress: green (low) to red (high)
      if (percentage <= 30) return 'hsl(120 60% 50%)';
      if (percentage <= 60) return 'hsl(60 60% 50%)';
      return 'hsl(0 60% 50%)';
    } else {
      // For satisfaction/energy: red (low) to green (high)
      if (percentage <= 30) return 'hsl(0 60% 50%)';
      if (percentage <= 60) return 'hsl(60 60% 50%)';
      return 'hsl(120 60% 50%)';
    }
  };

  const trackColor = getGradientColor(percentage);

  return (
    <div className="relative w-full">
      <div 
        className="relative h-3 bg-secondary/50 rounded-full overflow-hidden cursor-pointer"
        onClick={(e) => {
          if (disabled) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const newPercentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
          const newValue = Math.round((newPercentage / 100) * 9) + 1;
          onChange(newValue);
        }}
      >
        {/* Track gradient */}
        <div 
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${trackColor}40 0%, ${trackColor} 100%)`,
            boxShadow: `0 0 15px ${trackColor}30`
          }}
        />
        
        {/* Thumb */}
        <div 
          className={`
            absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2
            w-6 h-6 rounded-full border-2 border-background
            transition-all duration-200 cursor-grab
            ${isDragging ? 'scale-125 cursor-grabbing' : 'hover:scale-110'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          style={{
            left: `${percentage}%`,
            backgroundColor: trackColor,
            boxShadow: `0 2px 8px rgba(0,0,0,0.3), 0 0 20px ${trackColor}40`
          }}
          onMouseDown={() => !disabled && setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        >
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-background"
          />
        </div>
      </div>
      
      {/* Value markers */}
      <div className="flex justify-between mt-2 px-1">
        {Array.from({ length: 10 }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => !disabled && onChange(i + 1)}
            disabled={disabled}
            className={`
              text-xs transition-all duration-200 rounded px-1 py-0.5
              ${value === i + 1 
                ? 'text-foreground font-semibold scale-110' 
                : 'text-muted-foreground hover:text-foreground'
              }
              ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-secondary/30'}
            `}
            style={{
              color: value === i + 1 ? trackColor : undefined
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}