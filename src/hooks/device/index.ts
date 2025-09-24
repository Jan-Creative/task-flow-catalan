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

export { usePhoneDetection } from './usePhoneDetection';
export type { PhoneSize } from './usePhoneDetection';

export { useKeyboardHeight } from './useKeyboardHeight';
export type { KeyboardState } from './useKeyboardHeight';

export { useSwipeGestures } from './useSwipeGestures';
export type { SwipeGestureConfig, SwipeGestureReturn } from './useSwipeGestures';

// Legacy mobile hook (maintained for backward compatibility)
export { useIsMobile } from '../use-mobile';