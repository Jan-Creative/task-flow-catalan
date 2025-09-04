/**
 * Device detection hooks - Multi-device optimization
 */

export { useDeviceType } from './useDeviceType';
export type { DeviceType } from './useDeviceType';

export { useScreenSize } from './useScreenSize';
export type { ScreenBreakpoint, DeviceSize } from './useScreenSize';

export { useInteractionType } from './useInteractionType';
export type { InteractionType, InputCapability } from './useInteractionType';

export { useResponsiveLayout } from './useResponsiveLayout';
export type { LayoutType, NavigationType } from './useResponsiveLayout';

// Legacy mobile hook (maintained for backward compatibility)
export { useIsMobile } from '../use-mobile';