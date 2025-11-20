/**
 * Task management hooks
 */

// ✅ REFACTORED: Sistema de tasques simplificat
export { useTasksCore } from './useTasksCore';
export { useCreateTaskForm } from './useCreateTaskForm';
export { useMacTaskForm, type MacTaskFormReturn } from './useMacTaskForm';
export { useiPadTaskForm, type iPadTaskFormReturn } from './useiPadTaskForm';
export { useQuickCaptureForm, type QuickCaptureFormReturn } from './useQuickCaptureForm';
export { useTaskForm } from '../useTaskForm';
export { useTaskSubtasks } from '../useTaskSubtasks';
export { useTaskHistory } from '../useTaskHistory';
export { useTaskProperties } from '../useTaskProperties';
export { useTasksSubtasksProgress } from '../useTasksSubtasksProgress';