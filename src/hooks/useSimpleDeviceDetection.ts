/**
 * Hook simple per detectar només iPhone
 * Versió ultra simplificada sense complexitat
 */

import { useState, useEffect } from 'react';

interface SimpleDeviceInfo {
  isIPhone: boolean;
}

export const useSimpleDeviceDetection = (): SimpleDeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<SimpleDeviceInfo>({ 
    isIPhone: false 
  });

  useEffect(() => {
    const detectDevice = () => {
      const isIPhone = /iPhone/i.test(navigator.userAgent);
      setDeviceInfo({ isIPhone });
    };

    detectDevice();
  }, []);

  return deviceInfo;
};