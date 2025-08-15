import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskDetailsCard } from "@/components/task-detail/TaskDetailsCard";
import { LazySubtasksCard, LazyNotesCard, LazyPomodoroCard } from "@/components/LazyComponents";
import { memo, Suspense, useEffect } from "react";
import { TaskProvider, useTaskContext } from "@/contexts/TaskContext";
import { CachedRoute } from "@/components/ui/route-cache";
import { useTaskCache } from "@/hooks/useTaskCache";
import { DarkVeilBackground } from "@/components/backgrounds/DarkVeilBackground";
import { FloatingBackgroundButton } from "@/components/backgrounds/FloatingBackgroundButton";
import "@/styles/background-effects.css";

const TaskDetailContent = memo(() => {
  const navigate = useNavigate();
  const { task, folder, loading, preloadAdjacentTasks } = useTaskContext();
  const { preloadAdjacentTasks: cachePreload } = useTaskCache();

  // Preload adjacent tasks for smooth navigation
  useEffect(() => {
    if (task?.id) {
      preloadAdjacentTasks();
      cachePreload(task.id);
    }
  }, [task?.id, preloadAdjacentTasks, cachePreload]);

  if (loading && !task) {
    return (
      <div className="w-full min-h-screen bg-background text-foreground">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="w-full min-h-screen bg-background text-foreground">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Tasca no trobada</h2>
            <p className="text-muted-foreground">La tasca que busques no existeix.</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Tornar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-background text-foreground overflow-hidden">
      {/* Dark Veil Background Effect */}
      <DarkVeilBackground 
        speed={0.5}
        hueShift={20}
        noiseIntensity={0.1}
        scanlineIntensity={0.05}
      />
      
      {/* Header with back button */}
      <div className="sticky top-0 z-30 bg-background/70 backdrop-blur-md border-b border-border/30">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Tornar
          </Button>
          <h1 className="text-lg font-semibold truncate">{task.title}</h1>
        </div>
      </div>

      {/* Dashboard Grid - Sistema responsiu fluid sense altures fixes */}
      <div className="relative z-20 p-4 pb-24">
        <div className="max-w-7xl mx-auto task-detail-grid">
          {/* Desktop XL Layout - Grid Complex (1440px+) */}
          <div className="hidden 2xl:grid 2xl:grid-cols-6 gap-6 min-h-[600px] auto-rows-fr">
            {/* Task Details Card - Quadrada mitjana */}
            <div className="col-span-2 row-span-2 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="h-full min-h-[280px]">
                <TaskDetailsCard task={task} folderName={folder?.name} />
              </div>
            </div>

            {/* Pomodoro Card - Quadrada gran */}
            <div className="col-span-2 row-span-2 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="h-full min-h-[280px]">
                <LazyPomodoroCard taskId={task.id} />
              </div>
            </div>

            {/* Subtasks Card - Rectangular vertical */}
            <div className="col-span-2 row-span-4 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="h-full min-h-[580px]">
                <LazySubtasksCard taskId={task.id} />
              </div>
            </div>

            {/* Notes Card - Rectangular horitzontal gran */}
            <div className="col-span-4 row-span-2 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="h-full min-h-[280px]">
                <LazyNotesCard taskId={task.id} />
              </div>
            </div>
          </div>

          {/* Desktop Layout - Grid simplificat (1024px-1440px) */}
          <div className="hidden xl:grid 2xl:hidden xl:grid-cols-4 gap-6 auto-rows-fr">
            {/* Fila superior amb Task Details i Pomodoro */}
            <div className="col-span-2 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="h-full min-h-[300px]">
                <TaskDetailsCard task={task} folderName={folder?.name} />
              </div>
            </div>
            <div className="col-span-2 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="h-full min-h-[300px]">
               <LazyPomodoroCard taskId={task.id} />
              </div>
            </div>

            {/* Fila inferior amb Subtasks i Notes */}
            <div className="col-span-2 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="h-full min-h-[350px]">
                <LazySubtasksCard taskId={task.id} />
              </div>
            </div>
            <div className="col-span-2 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="h-full min-h-[350px]">
                <LazyNotesCard taskId={task.id} />
              </div>
            </div>
          </div>

          {/* Tablet Layout - Grid adaptat (768px-1024px) */}
          <div className="hidden lg:grid xl:hidden lg:grid-cols-2 gap-6 auto-rows-fr">
            {/* Fila 1: Task Details i Pomodoro */}
            <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="h-full min-h-[280px]">
                <TaskDetailsCard task={task} folderName={folder?.name} />
              </div>
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="h-full min-h-[280px]">
                <LazyPomodoroCard taskId={task.id} />
              </div>
            </div>

            {/* Fila 2: Subtasks i Notes */}
            <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="h-full min-h-[400px]">
                <LazySubtasksCard taskId={task.id} />
              </div>
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="h-full min-h-[400px]">
                <LazyNotesCard taskId={task.id} />
              </div>
            </div>
          </div>

          {/* Mobile/Small Tablet Layout - Stack vertical (0-768px) */}
          <div className="grid lg:hidden grid-cols-1 gap-6">
            <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
              <TaskDetailsCard task={task} folderName={folder?.name} />
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <LazyPomodoroCard taskId={task.id} />
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
              <LazySubtasksCard taskId={task.id} />
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
              <LazyNotesCard taskId={task.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Background Configuration Button */}
      <FloatingBackgroundButton />
    </div>
  );
});

const TaskDetailPage = memo(() => {
  return (
    <TaskProvider>
      <Suspense fallback={
        <div className="w-full min-h-screen bg-background text-foreground">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      }>
        <CachedRoute path={window.location.pathname} enabled={true}>
          <TaskDetailContent />
        </CachedRoute>
      </Suspense>
    </TaskProvider>
  );
});

export default TaskDetailPage;