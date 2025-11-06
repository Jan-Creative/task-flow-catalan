import { useState, useEffect, useCallback, useRef } from 'react';

export type DeviceType = 'iphone' | 'ipad' | 'mac' | 'android' | 'windows' | 'unknown';

interface DeviceInfo {
  type: DeviceType;
  isTouch: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  os: string;
}

// FASE 2: ESTABILITZAR EVENT LISTENERS - Eliminar memory leaks
export function useDeviceType(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    type: 'unknown',
    isTouch: false,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    os: 'unknown'
  });
  
  const listenerAttachedRef = useRef(false); // ✅ GUARD contra duplicació

  // ✅ SEPARAR detectDevice fora del useEffect per estabilitat
  const detectDevice = useCallback((): DeviceInfo => {
    const userAgent = navigator.userAgent;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
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
  }, []);

  // ✅ ESTABLE: useCallback per handleResize
  const handleResize = useCallback(() => {
    setDeviceInfo(detectDevice());
  }, [detectDevice]);

  useEffect(() => {
    // Initial detection
    setDeviceInfo(detectDevice());

    // ✅ GUARD: Skip si ja està attached (prevé duplicats en StrictMode)
    if (listenerAttachedRef.current) {
      console.warn('⚠️ useDeviceType: resize listener already attached, skipping');
      return;
    }

    listenerAttachedRef.current = true;
    console.log('📱 Attaching resize listener for device detection');

    window.addEventListener('resize', handleResize);
    
    return () => {
      console.log('🧹 Removing resize listener for device detection');
      window.removeEventListener('resize', handleResize);
      listenerAttachedRef.current = false;
    };
  }, [detectDevice, handleResize]); // ✅ Stable callbacks

  return deviceInfo;
}