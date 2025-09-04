import { useState, useEffect } from 'react';

export type ScreenBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type DeviceSize = 'mobile' | 'tablet' | 'desktop' | 'ultrawide';

interface ScreenInfo {
  width: number;
  height: number;
  breakpoint: ScreenBreakpoint;
  deviceSize: DeviceSize;
  orientation: 'portrait' | 'landscape';
  isRetina: boolean;
  aspectRatio: number;
}

const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

export function useScreenSize(): ScreenInfo {
  const [screenInfo, setScreenInfo] = useState<ScreenInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 0,
        height: 0,
        breakpoint: 'md',
        deviceSize: 'desktop',
        orientation: 'landscape',
        isRetina: false,
        aspectRatio: 16/9
      };
    }

    return calculateScreenInfo();
  });

  function calculateScreenInfo(): ScreenInfo {
    // Safety check for SSR environment
    if (typeof window === 'undefined') {
      return {
        width: 1920,
        height: 1080,
        breakpoint: 'xl',
        deviceSize: 'desktop',
        orientation: 'landscape',
        isRetina: false,
        aspectRatio: 16/9
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = width / height;
    const isRetina = window.devicePixelRatio && window.devicePixelRatio > 1;
    
    // Determine breakpoint
    let breakpoint: ScreenBreakpoint = 'xs';
    if (width >= BREAKPOINTS['2xl']) breakpoint = '2xl';
    else if (width >= BREAKPOINTS.xl) breakpoint = 'xl';
    else if (width >= BREAKPOINTS.lg) breakpoint = 'lg';
    else if (width >= BREAKPOINTS.md) breakpoint = 'md';
    else if (width >= BREAKPOINTS.sm) breakpoint = 'sm';
    
    // Determine device size
    let deviceSize: DeviceSize = 'mobile';
    if (width >= 1920) deviceSize = 'ultrawide';
    else if (width >= 1024) deviceSize = 'desktop';
    else if (width >= 768) deviceSize = 'tablet';
    
    // Determine orientation
    const orientation = width > height ? 'landscape' : 'portrait';
    
    return {
      width,
      height,
      breakpoint,
      deviceSize,
      orientation,
      isRetina,
      aspectRatio
    };
  }

  useEffect(() => {
    const handleResize = () => {
      setScreenInfo(calculateScreenInfo());
    };

    const handleOrientationChange = () => {
      // Small delay to ensure dimensions are updated
      setTimeout(() => {
        setScreenInfo(calculateScreenInfo());
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return screenInfo;
}