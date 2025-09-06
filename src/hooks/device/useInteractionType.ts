import { useState, useEffect } from 'react';

export type InteractionType = 'touch' | 'mouse' | 'mixed';
export type InputCapability = 'touch' | 'mouse' | 'keyboard' | 'stylus';

interface InteractionInfo {
  primary: InteractionType;
  capabilities: InputCapability[];
  supportsHover: boolean;
  supportsPressure: boolean;
  maxTouchPoints: number;
  hasPhysicalKeyboard: boolean;
}

export function useInteractionType(): InteractionInfo {
  const [interactionInfo, setInteractionInfo] = useState<InteractionInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        primary: 'mouse',
        capabilities: ['mouse', 'keyboard'],
        supportsHover: true,
        supportsPressure: false,
        maxTouchPoints: 0,
        hasPhysicalKeyboard: true
      };
    }

    return detectInteractionCapabilities();
  });

  function detectInteractionCapabilities(): InteractionInfo {
    const capabilities: InputCapability[] = [];
    
    // Safe touch detection
    const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (hasTouch) {
      capabilities.push('touch');
    }
    
    // Mouse detection (reliable hover support indicates mouse)
    const hasMouse = window.matchMedia('(hover: hover)').matches;
    if (hasMouse) {
      capabilities.push('mouse');
    }
    
    // Keyboard detection - more reliable approach
    const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasKeyboard = !isMobileDevice || window.innerWidth >= 768;
    if (hasKeyboard) {
      capabilities.push('keyboard');
    }
    
    // Stylus detection for devices that commonly support it
    const supportsStylus = /iPad|Android/i.test(navigator.userAgent) && hasTouch;
    if (supportsStylus) {
      capabilities.push('stylus');
    }
    
    // Determine primary interaction type
    let primary: InteractionType = 'mouse';
    if (hasTouch && !hasMouse) {
      primary = 'touch';
    } else if (hasTouch && hasMouse) {
      primary = 'mixed';
    }
    
    // Hover support
    const supportsHover = window.matchMedia('(hover: hover)').matches;
    
    // Safe pressure support detection
    let supportsPressure = false;
    if (typeof TouchEvent !== 'undefined') {
      try {
        supportsPressure = 'force' in TouchEvent.prototype || 'webkitForce' in TouchEvent.prototype;
      } catch (e) {
        // TouchEvent not available or accessible, pressure not supported
        supportsPressure = false;
      }
    }
    
    return {
      primary,
      capabilities,
      supportsHover,
      supportsPressure,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      hasPhysicalKeyboard: hasKeyboard
    };
  }

  useEffect(() => {
    // Re-detect on focus (in case external devices are connected)
    const handleFocus = () => {
      setInteractionInfo(detectInteractionCapabilities());
    };

    // Re-detect on media query changes
    const hoverQuery = window.matchMedia('(hover: hover)');
    const handleHoverChange = () => {
      setInteractionInfo(detectInteractionCapabilities());
    };

    window.addEventListener('focus', handleFocus);
    hoverQuery.addEventListener('change', handleHoverChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      hoverQuery.removeEventListener('change', handleHoverChange);
    };
  }, []);

  return interactionInfo;
}