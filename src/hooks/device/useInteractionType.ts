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
    // Safety check for SSR environment
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return {
        primary: 'mouse',
        capabilities: ['mouse', 'keyboard'],
        supportsHover: true,
        supportsPressure: false,
        maxTouchPoints: 0,
        hasPhysicalKeyboard: true
      };
    }

    const capabilities: InputCapability[] = [];
    
    // Touch detection with safety checks
    const hasTouch = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
    if (hasTouch) {
      capabilities.push('touch');
    }
    
    // Mouse detection (assume mouse if not pure touch device)
    const hasMouse = window.matchMedia('(hover: hover)').matches;
    if (hasMouse) {
      capabilities.push('mouse');
    }
    
    // Keyboard detection (assume keyboard unless pure mobile)
    const hasKeyboard = !(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) || window.innerWidth >= 768;
    if (hasKeyboard) {
      capabilities.push('keyboard');
    }
    
    // Stylus detection (basic check for devices that commonly support stylus)
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
    
    // Hover support with safety check
    const supportsHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
    
    // Pressure support (basic detection) - safely check for TouchEvent
    const supportsPressure = typeof TouchEvent !== 'undefined' && 
      ('force' in TouchEvent.prototype || 'webkitForce' in TouchEvent.prototype);
    
    return {
      primary,
      capabilities,
      supportsHover,
      supportsPressure,
      maxTouchPoints: (navigator.maxTouchPoints && navigator.maxTouchPoints) || 0,
      hasPhysicalKeyboard: hasKeyboard
    };
  }

  useEffect(() => {
    // Re-detect on focus (in case external devices are connected)
    const handleFocus = () => {
      setInteractionInfo(detectInteractionCapabilities());
    };

    window.addEventListener('focus', handleFocus);

    // Re-detect on media query changes with safety check
    if (window.matchMedia) {
      const hoverQuery = window.matchMedia('(hover: hover)');
      const handleHoverChange = () => {
        setInteractionInfo(detectInteractionCapabilities());
      };

      hoverQuery.addEventListener('change', handleHoverChange);
      
      return () => {
        window.removeEventListener('focus', handleFocus);
        hoverQuery.removeEventListener('change', handleHoverChange);
      };
    } else {
      return () => {
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, []);

  return interactionInfo;
}