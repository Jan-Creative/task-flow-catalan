import { useMemo } from 'react';
import { useDeviceType } from './useDeviceType';
import { useScreenSize } from './useScreenSize';
import { useInteractionType } from './useInteractionType';

export type LayoutType = 'mobile' | 'tablet' | 'desktop';
export type NavigationType = 'bottom' | 'sidebar' | 'top';

interface LayoutConfig {
  layout: LayoutType;
  navigation: NavigationType;
  columns: number;
  cardSize: 'small' | 'medium' | 'large';
  spacing: 'compact' | 'normal' | 'spacious';
  showHoverEffects: boolean;
  enableGestures: boolean;
  useCompactMode: boolean;
}

export function useResponsiveLayout(): LayoutConfig {
  const device = useDeviceType();
  const screen = useScreenSize();
  const interaction = useInteractionType();

  const layoutConfig = useMemo((): LayoutConfig => {
    // iPhone Configuration
    if (device.type === 'iphone') {
      return {
        layout: 'mobile',
        navigation: 'bottom',
        columns: 1,
        cardSize: 'small',
        spacing: 'compact',
        showHoverEffects: false,
        enableGestures: true,
        useCompactMode: true
      };
    }

    // iPad Configuration
    if (device.type === 'ipad') {
      const isPortrait = screen.orientation === 'portrait';
      return {
        layout: 'tablet',
        navigation: 'sidebar',
        columns: isPortrait ? 2 : 3,
        cardSize: 'medium',
        spacing: 'normal',
        showHoverEffects: interaction.supportsHover,
        enableGestures: true,
        useCompactMode: false
      };
    }

    // Mac Configuration
    if (device.type === 'mac') {
      let columns = 2;
      if (screen.width >= 1920) columns = 4;
      else if (screen.width >= 1440) columns = 3;
      
      return {
        layout: 'desktop',
        navigation: 'top',
        columns,
        cardSize: 'large',
        spacing: 'spacious',
        showHoverEffects: true,
        enableGestures: false,
        useCompactMode: false
      };
    }

    // Fallback based on screen size
    if (screen.deviceSize === 'mobile') {
      return {
        layout: 'mobile',
        navigation: 'bottom',
        columns: 1,
        cardSize: 'small',
        spacing: 'compact',
        showHoverEffects: interaction.supportsHover,
        enableGestures: interaction.primary === 'touch',
        useCompactMode: true
      };
    }

    if (screen.deviceSize === 'tablet') {
      return {
        layout: 'tablet',
        navigation: 'sidebar',
        columns: 2,
        cardSize: 'medium',
        spacing: 'normal',
        showHoverEffects: interaction.supportsHover,
        enableGestures: interaction.primary !== 'mouse',
        useCompactMode: false
      };
    }

    // Desktop fallback
    return {
      layout: 'desktop',
      navigation: 'top',
      columns: screen.width >= 1440 ? 3 : 2,
      cardSize: 'large',
      spacing: 'spacious',
      showHoverEffects: true,
      enableGestures: false,
      useCompactMode: false
    };
  }, [device, screen, interaction]);

  return layoutConfig;
}