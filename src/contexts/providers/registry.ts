import { ProviderConfig } from '@/components/ui/provider-engine';

// Context Providers (imported lazily where possible)
import { PropertyDialogProvider } from '@/contexts/PropertyDialogContext';
import { BackgroundProvider } from '@/contexts/BackgroundContext';
import { SecurityProvider } from '@/contexts/SecurityContext';
import { OfflineProvider } from '@/contexts/OfflineContext';
import { UnifiedTaskProvider } from '@/contexts/UnifiedTaskContext';
import { NotificationProvider } from '@/contexts/NotificationContextV2';
import { PomodoroProvider } from '@/contexts/PomodoroContext';
import { KeyboardShortcutsProvider } from '@/contexts/KeyboardShortcutsContext';
import { KeyboardNavigationProvider } from '@/contexts/KeyboardNavigationContext';
import { MacNavigationProvider } from '@/contexts/MacNavigationContext';
import { IPadNavigationProvider } from '@/contexts/IPadNavigationContext';

/**
 * Centralized provider registry
 * Order: Innermost → Outermost (same as current effective order)
 * 
 * Phases:
 * - Phase 1: Critical, lightweight providers (Security, Background)
 * - Phase 2: UI-related providers (PropertyDialog, KeyboardShortcuts)
 * - Phase 3: Heavy data providers (UnifiedTask, Notification)
 * - Phase 4: Platform-specific and optional providers (Offline, Navigation, Pomodoro)
 */
export const PROVIDER_REGISTRY: ProviderConfig[] = [
  // ===== PHASE 1: Critical & Lightweight =====
  {
    name: 'Security',
    Component: SecurityProvider,
    phase: 1,
    enabledByDefault: true,
    mountAfterPaint: false, // Mount immediately
  },
  {
    name: 'Background',
    Component: BackgroundProvider,
    phase: 1,
    enabledByDefault: true,
    mountAfterPaint: false,
  },

  // ===== PHASE 2: UI & Interaction =====
  {
    name: 'PropertyDialog',
    Component: PropertyDialogProvider,
    phase: 2,
    enabledByDefault: true,
    mountAfterPaint: true, // After first paint
  },
  {
    name: 'KeyboardShortcuts',
    Component: KeyboardShortcutsProvider,
    phase: 2,
    enabledByDefault: true,
    mountAfterPaint: true,
  },

  // ===== PHASE 3: Heavy Data Providers =====
  {
    name: 'UnifiedTask',
    Component: UnifiedTaskProvider,
    phase: 3,
    enabledByDefault: true,
    mountAfterPaint: true, // After next tick
  },
  {
    name: 'Notification',
    Component: NotificationProvider,
    phase: 3,
    enabledByDefault: true,
    mountAfterPaint: true,
  },

  // ===== PHASE 4: Platform-Specific & Optional =====
  {
    name: 'Offline',
    Component: OfflineProvider,
    phase: 4,
    enabledByDefault: true,
    mountAfterPaint: true, // Delayed mount
  },
  {
    name: 'Pomodoro',
    Component: PomodoroProvider,
    phase: 4,
    enabledByDefault: true,
    mountAfterPaint: true,
  },
  {
    name: 'KeyboardNavigation',
    Component: KeyboardNavigationProvider,
    phase: 4,
    enabledByDefault: true,
    mountAfterPaint: true,
  },
  {
    name: 'MacNavigation',
    Component: MacNavigationProvider,
    phase: 4,
    enabledByDefault: true,
    mountAfterPaint: true,
  },
  {
    name: 'IPadNavigation',
    Component: IPadNavigationProvider,
    phase: 4,
    enabledByDefault: true,
    mountAfterPaint: true,
  },
];

/**
 * Get providers for a specific phase
 */
export const getProvidersByPhase = (phase: number): ProviderConfig[] => {
  return PROVIDER_REGISTRY.filter(p => p.phase === phase);
};

/**
 * Get all providers up to a specific phase
 */
export const getProvidersUpToPhase = (maxPhase: number): ProviderConfig[] => {
  return PROVIDER_REGISTRY.filter(p => p.phase <= maxPhase);
};
