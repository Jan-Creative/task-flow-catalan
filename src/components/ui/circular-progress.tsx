import React from 'react';
import { cn } from '@/lib/utils';

interface CircularProgressProps {
  value: number; // 0-100
  size?: number | 'responsive';
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
  isActive?: boolean;
}

export const CircularProgress = ({ 
  value, 
  size = 'responsive', 
  strokeWidth, 
  className,
  children,
  isActive = false
}: CircularProgressProps) => {
  // Mides responsives
  const getResponsiveSize = () => {
    if (typeof size === 'number') return size;
    // Mides responsives basades en la mida de pantalla
    return 'responsive';
  };

  const getStrokeWidth = () => {
    if (strokeWidth) return strokeWidth;
    // Stroke width responsiu
    if (typeof size === 'number') {
      return Math.max(3, size / 25); // Proporcional a la mida
    }
    return 4; // Valor per defecte per mode responsiu
  };

  const actualSize = getResponsiveSize();
  const actualStrokeWidth = getStrokeWidth();
  
  // Per al mode responsiu, utilitzem variables CSS
  const isResponsive = actualSize === 'responsive';
  const containerSize = isResponsive ? undefined : actualSize;
  const radius = isResponsive ? 'calc(var(--size) / 2 - var(--stroke-width))' : (actualSize as number - actualStrokeWidth) / 2;
  const circumference = isResponsive ? 'calc(2 * 3.14159 * var(--radius))' : (radius as number) * 2 * Math.PI;
  
  // Calcular stroke-dashoffset
  const getStrokeDashoffset = () => {
    if (isResponsive) {
      return `calc(var(--circumference) - (${value} / 100) * var(--circumference))`;
    }
    return (circumference as number) - (value / 100) * (circumference as number);
  };

  const containerStyle = isResponsive ? {
    '--size': 'clamp(120px, 15vw, 160px)',
    '--stroke-width': 'clamp(3px, 0.5vw, 5px)',
    '--radius': 'calc((var(--size) - var(--stroke-width)) / 2)',
    '--circumference': 'calc(2 * 3.14159 * var(--radius))'
  } as React.CSSProperties : {};

  return (
    <div 
      className={cn("relative inline-flex items-center justify-center", className)}
      style={containerStyle}
    >
      <svg
        width={containerSize || 'var(--size)'}
        height={containerSize || 'var(--size)'}
        className="transform -rotate-90"
        style={{ 
          filter: isActive ? 'drop-shadow(0 0 8px hsl(var(--primary) / 0.3))' : 'none',
          transition: 'filter 0.3s ease'
        }}
      >
        {/* Background circle */}
        <circle
          cx={isResponsive ? 'calc(var(--size) / 2)' : (containerSize as number) / 2}
          cy={isResponsive ? 'calc(var(--size) / 2)' : (containerSize as number) / 2}
          r={radius}
          stroke="hsl(var(--border))"
          strokeWidth={isResponsive ? 'var(--stroke-width)' : actualStrokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <circle
          cx={isResponsive ? 'calc(var(--size) / 2)' : (containerSize as number) / 2}
          cy={isResponsive ? 'calc(var(--size) / 2)' : (containerSize as number) / 2}
          r={radius}
          stroke="hsl(var(--primary))"
          strokeWidth={isResponsive ? 'var(--stroke-width)' : actualStrokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={getStrokeDashoffset()}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
          style={{
            filter: 'drop-shadow(0 0 4px hsl(var(--primary) / 0.4))'
          }}
        />
      </svg>
      
      {/* Content in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};