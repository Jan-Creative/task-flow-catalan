import React from 'react';
import { PomodoroWidget } from '@/components/pomodoro/PomodoroWidget';
import { usePomodoroWidgetLogic } from '@/hooks/usePomodoroWidgetLogic';

/**
 * Component que coordina la visibilitat del widget flotant de Pomodoro
 * Ha d'estar dins del context del Router per poder usar useLocation
 */
export const PomodoroWidgetCoordinator = () => {
  const { showFloatingWidget } = usePomodoroWidgetLogic();

  return showFloatingWidget ? <PomodoroWidget /> : null;
};