import { lazy, Suspense, memo } from 'react';
import { ListSkeleton } from '@/components/ui/skeleton';

// Lazy load heavy components
const TaskDetailPage = lazy(() => import('@/pages/TaskDetailPage'));
const FolderDetailPage = lazy(() => import('@/pages/FolderDetailPage'));
const PomodoroCard = lazy(() => import('@/components/pomodoro/PomodoroCard').then(module => ({ default: module.PomodoroCard })));
const SubtasksCard = lazy(() => import('@/components/task-detail/SubtasksCard').then(module => ({ default: module.SubtasksCard })));
const NotesCard = lazy(() => import('@/components/task-detail/NotesCard').then(module => ({ default: module.NotesCard })));

// Loading fallbacks
const TaskDetailSkeleton = () => (
  <div className="w-full min-h-screen bg-background p-4 space-y-6">
    <div className="flex items-center gap-4 mb-6">
      <div className="w-6 h-6 bg-muted rounded animate-pulse" />
      <div className="h-8 w-64 bg-muted rounded animate-pulse" />
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <div className="h-32 bg-muted rounded-lg animate-pulse" />
        <div className="h-48 bg-muted rounded-lg animate-pulse" />
      </div>
      <div className="space-y-6">
        <div className="h-32 bg-muted rounded-lg animate-pulse" />
        <div className="h-48 bg-muted rounded-lg animate-pulse" />
      </div>
    </div>
  </div>
);

const FolderDetailSkeleton = () => (
  <div className="w-full min-h-screen bg-background p-4">
    <div className="flex items-center gap-4 mb-6">
      <div className="w-6 h-6 bg-muted rounded animate-pulse" />
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
    </div>
    <ListSkeleton count={8} type="task" />
  </div>
);

const CardSkeleton = memo(() => (
  <div className="h-full min-h-[200px] bg-muted/50 rounded-lg animate-pulse relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite] transition-transform duration-300" />
    <div className="p-4 space-y-3">
      <div className="h-6 bg-muted-foreground/20 rounded animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 bg-muted-foreground/15 rounded animate-pulse" />
        <div className="h-4 bg-muted-foreground/15 rounded w-3/4 animate-pulse" />
      </div>
    </div>
  </div>
));

// Wrapper components with Suspense and optimized fallbacks
export const LazyTaskDetailPage = memo((props: any) => (
  <Suspense fallback={<TaskDetailSkeleton />}>
    <TaskDetailPage {...props} />
  </Suspense>
));

export const LazyFolderDetailPage = memo((props: any) => (
  <Suspense fallback={<FolderDetailSkeleton />}>
    <FolderDetailPage {...props} />
  </Suspense>
));

export const LazyPomodoroCard = memo((props: any) => (
  <Suspense fallback={<CardSkeleton />}>
    <PomodoroCard {...props} />
  </Suspense>
));

export const LazySubtasksCard = memo((props: any) => (
  <Suspense fallback={<CardSkeleton />}>
    <SubtasksCard {...props} />
  </Suspense>
));

export const LazyNotesCard = memo((props: any) => (
  <Suspense fallback={<CardSkeleton />}>
    <NotesCard {...props} />
  </Suspense>
));