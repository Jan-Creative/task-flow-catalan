import { useState, useEffect } from 'react';

export type PhoneSize = 'mini' | 'standard' | 'plus' | 'pro-max' | 'none';

interface PhoneInfo {
  isPhone: boolean;
  size: PhoneSize;
  availableWidth: number;
  safeAreaBottom: number;
  canFitTabs: number;
  orientation: 'portrait' | 'landscape';
}

export function usePhoneDetection(): PhoneInfo {
  const [phoneInfo, setPhoneInfo] = useState<PhoneInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        isPhone: false,
        size: 'none',
        availableWidth: 0,
        safeAreaBottom: 0,
        canFitTabs: 6,
        orientation: 'portrait'
      };
    }
    return detectPhoneInfo();
  });

  function detectPhoneInfo(): PhoneInfo {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const userAgent = navigator.userAgent;
    
    // Detect orientation
    const orientation = width > height ? 'landscape' : 'portrait';
    
    // Only consider it a phone if it's touch-enabled and narrow
    const isPhone = isTouch && width < 768;
    
    if (!isPhone) {
      return {
        isPhone: false,
        size: 'none',
        availableWidth: width,
        safeAreaBottom: 0,
        canFitTabs: 6,
        orientation
      };
    }
    
    // Determine phone size category
    let size: PhoneSize = 'standard';
    let canFitTabs = 4;
    
    if (width <= 375) {
      // iPhone SE, 12 mini, 13 mini
      size = 'mini';
      canFitTabs = 4;
    } else if (width <= 390) {
      // iPhone 12, 13, 14, 15
      size = 'standard';
      canFitTabs = 4;
    } else if (width <= 414) {
      // iPhone Plus models
      size = 'plus';
      canFitTabs = 5;
    } else {
      // iPhone Pro Max models
      size = 'pro-max';
      canFitTabs = 5;
    }
    
    // Calculate safe area (estimate)
    const safeAreaBottom = /iPhone/.test(userAgent) ? 34 : 0;
    
    // Calculate available width (accounting for padding and margins)
    const availableWidth = width - 32; // 16px padding on each side
    
    return {
      isPhone,
      size,
      availableWidth,
      safeAreaBottom,
      canFitTabs,
      orientation
    };
  }

  useEffect(() => {
    const handleResize = () => {
      setPhoneInfo(detectPhoneInfo());
    };

    const handleOrientationChange = () => {
      setTimeout(() => {
        setPhoneInfo(detectPhoneInfo());
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return phoneInfo;
}