import { useState, useEffect } from 'react';

export type DeviceType = 'iphone' | 'ipad' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

interface DeviceInfo {
  type: DeviceType;
  orientation: Orientation;
  width: number;
  height: number;
  isTouch: boolean;
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        type: 'desktop',
        orientation: 'landscape',
        width: 1024,
        height: 768,
        isTouch: false
      };
    }
    return getDeviceInfo();
  });

  function getDeviceInfo(): DeviceInfo {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const userAgent = navigator.userAgent;
    
    // Detect orientation
    const orientation: Orientation = width > height ? 'landscape' : 'portrait';
    
    // Detect device type
    let type: DeviceType = 'desktop';
    
    // iPad detection (including iPad Pro and new iPads that report as Mac)
    const isIPad = /iPad/.test(userAgent) || 
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
                   (isTouch && width >= 768 && width <= 1366);
    
    // iPhone detection
    const isIPhone = /iPhone/.test(userAgent) || 
                     (isTouch && width < 768);
    
    if (isIPad) {
      type = 'ipad';
    } else if (isIPhone) {
      type = 'iphone';
    } else {
      type = 'desktop';
    }
    
    return {
      type,
      orientation,
      width,
      height,
      isTouch
    };
  }

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(getDeviceInfo());
    };

    const handleOrientationChange = () => {
      // Small delay to ensure dimensions are updated after orientation change
      setTimeout(() => {
        setDeviceInfo(getDeviceInfo());
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return deviceInfo;
}