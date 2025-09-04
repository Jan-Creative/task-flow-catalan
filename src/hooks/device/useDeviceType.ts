import { useState, useEffect } from 'react';

export type DeviceType = 'iphone' | 'ipad' | 'mac' | 'android' | 'windows' | 'unknown';

interface DeviceInfo {
  type: DeviceType;
  isTouch: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  os: string;
}

export function useDeviceType(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    type: 'unknown',
    isTouch: false,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    os: 'unknown'
  });

  useEffect(() => {
    const detectDevice = (): DeviceInfo => {
      // Safety check for SSR/Node environment
      if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return {
          type: 'unknown',
          isTouch: false,
          isMobile: false,
          isTablet: false,
          isDesktop: true,
          os: 'unknown'
        };
      }

      const userAgent = navigator.userAgent;
      const isTouch = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
      
      // iOS Detection
      if (/iPad/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
        return {
          type: 'ipad',
          isTouch: true,
          isMobile: false,
          isTablet: true,
          isDesktop: false,
          os: 'iOS'
        };
      }
      
      if (/iPhone/.test(userAgent)) {
        return {
          type: 'iphone',
          isTouch: true,
          isMobile: true,
          isTablet: false,
          isDesktop: false,
          os: 'iOS'
        };
      }
      
      // Mac Detection
      if (/Mac/.test(userAgent) && !isTouch) {
        return {
          type: 'mac',
          isTouch: false,
          isMobile: false,
          isTablet: false,
          isDesktop: true,
          os: 'macOS'
        };
      }
      
      // Android Detection
      if (/Android/.test(userAgent)) {
        const isTablet = window.innerWidth >= 768;
        return {
          type: 'android',
          isTouch: true,
          isMobile: !isTablet,
          isTablet,
          isDesktop: false,
          os: 'Android'
        };
      }
      
      // Windows Detection
      if (/Windows/.test(userAgent)) {
        return {
          type: 'windows',
          isTouch,
          isMobile: false,
          isTablet: false,
          isDesktop: true,
          os: 'Windows'
        };
      }
      
      // Fallback
      const screenWidth = window.innerWidth;
      return {
        type: 'unknown',
        isTouch,
        isMobile: screenWidth < 768,
        isTablet: screenWidth >= 768 && screenWidth < 1024,
        isDesktop: screenWidth >= 1024,
        os: 'unknown'
      };
    };

    setDeviceInfo(detectDevice());

    // Update on resize for responsive behavior
    const handleResize = () => {
      setDeviceInfo(detectDevice());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceInfo;
}