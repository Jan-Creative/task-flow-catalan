import { useState, useEffect } from 'react';

/**
 * Hook to detect iOS devices using the same logic as main.tsx
 * This ensures consistency between iOS detection and CSS class application
 */
export function useIOSDetection() {
  const [isIOS, setIsIOS] = useState(() => {
    if (typeof window === 'undefined') return false;
    
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  });

  useEffect(() => {
    // Check if the ios class was added by main.tsx
    const hasIOSClass = document.documentElement.classList.contains('ios');
    setIsIOS(hasIOSClass);
  }, []);

  return isIOS;
}