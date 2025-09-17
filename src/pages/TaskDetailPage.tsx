import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskDetailsCard } from "@/components/task-detail/TaskDetailsCard";
import { TaskRemindersCard } from "@/components/task-detail/TaskRemindersCard";
import { TaskTimeBlockCard } from "@/components/task-detail/TaskTimeBlockCard";
import { LazySubtasksCard, LazyNotesCard, LazyPomodoroCard } from "@/components/LazyComponents";
import { memo, Suspense, useEffect, useState } from "react";
import { TaskProvider, useTaskContext } from "@/contexts/TaskContext";
import { CachedRoute } from "@/components/ui/route-cache";
import { useTaskCache } from "@/hooks/useTaskCache";
import { FloatingBackgroundButton } from "@/components/backgrounds/FloatingBackgroundButton";
import BottomNavigation from "@/components/BottomNavigation";
import "@/styles/background-effects.css";

const TaskDetailContent = memo(() => {
  const navigate = useNavigate();
  const { task, folder, loading, preloadAdjacentTasks } = useTaskContext();
  const { preloadAdjacentTasks: cachePreload } = useTaskCache();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Preload adjacent tasks for smooth navigation
  useEffect(() => {
    if (task?.id) {
      preloadAdjacentTasks();
      cachePreload(task.id);
    }
  }, [task?.id, preloadAdjacentTasks, cachePreload]);

  if (loading && !task) {
    return (
      <div className="w-full min-h-screen bg-transparent text-foreground">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="w-full min-h-screen bg-transparent text-foreground">
        <div className="flex items-center justify-center h-64">
          <div className="text-center bg-background/70 backdrop-blur-md p-6 rounded-lg border border-border/30">
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
    <div className="relative w-full min-h-screen bg-transparent text-foreground overflow-hidden">
      
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

            {/* Reminders Card - Quadrada mitjana */}
            <div className="col-span-2 row-span-2 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="h-full min-h-[280px]">
                <TaskRemindersCard taskId={task.id} taskTitle={task.title} />
              </div>
            </div>

            {/* Subtasks Card - Rectangular vertical */}
            <div className="col-span-2 row-span-4 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="h-full min-h-[580px]">
                <LazySubtasksCard taskId={task.id} />
              </div>
            </div>

            {/* Time Block Card - Quadrada mitjana */}
            <div className="col-span-2 row-span-2 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="h-full min-h-[280px]">
                <TaskTimeBlockCard />
              </div>
            </div>

            {/* Pomodoro Card - Quadrada mitjana */}
            <div className="col-span-2 row-span-2 animate-fade-in" style={{animationDelay: '0.5s'}}>
              <div className="h-full min-h-[280px]">
                <LazyPomodoroCard taskId={task.id} />
              </div>
            </div>

            {/* Notes Card - Rectangular horitzontal gran */}
            <div className="col-span-4 row-span-2 animate-fade-in" style={{animationDelay: '0.6s'}}>
              <div className="h-full min-h-[280px]">
                <LazyNotesCard taskId={task.id} />
              </div>
            </div>
          </div>

          {/* Desktop Layout - Grid simplificat (1024px-1440px) */}
          <div className="hidden xl:grid 2xl:hidden xl:grid-cols-4 gap-6 auto-rows-fr">
            {/* Fila superior amb Task Details i Reminders */}
            <div className="col-span-2 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="h-full min-h-[300px]">
                <TaskDetailsCard task={task} folderName={folder?.name} />
              </div>
            </div>
            <div className="col-span-2 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="h-full min-h-[300px]">
                <TaskRemindersCard taskId={task.id} taskTitle={task.title} />
              </div>
            </div>

            {/* Segona fila amb Time Block i Pomodoro */}
            <div className="col-span-2 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="h-full min-h-[300px]">
                <TaskTimeBlockCard />
              </div>
            </div>
            <div className="col-span-2 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="h-full min-h-[300px]">
                <LazyPomodoroCard taskId={task.id} />
              </div>
            </div>

            {/* Tercera fila amb Subtasks */}
            <div className="col-span-4 animate-fade-in" style={{animationDelay: '0.5s'}}>
              <div className="h-full min-h-[350px]">
                <LazySubtasksCard taskId={task.id} />
              </div>
            </div>

            {/* Quarta fila amb Notes */}
            <div className="col-span-4 animate-fade-in" style={{animationDelay: '0.6s'}}>
              <div className="h-full min-h-[350px]">
                <LazyNotesCard taskId={task.id} />
              </div>
            </div>
          </div>

          {/* Tablet Layout - Grid adaptat (768px-1024px) */}
          <div className="hidden lg:grid xl:hidden lg:grid-cols-2 gap-6 auto-rows-fr">
            {/* Fila 1: Task Details i Reminders */}
            <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="h-full min-h-[280px]">
                <TaskDetailsCard task={task} folderName={folder?.name} />
              </div>
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="h-full min-h-[280px]">
                <TaskRemindersCard taskId={task.id} taskTitle={task.title} />
              </div>
            </div>

            {/* Fila 2: Time Block i Pomodoro */}
            <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="h-full min-h-[280px]">
                <TaskTimeBlockCard />
              </div>
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="h-full min-h-[350px]">
                <LazyPomodoroCard taskId={task.id} />
              </div>
            </div>

            {/* Fila 3: Subtasks */}
            <div className="col-span-2 animate-fade-in" style={{animationDelay: '0.5s'}}>
              <div className="h-full min-h-[350px]">
                <LazySubtasksCard taskId={task.id} />
              </div>
            </div>

            {/* Fila 4: Notes */}
            <div className="col-span-2 animate-fade-in" style={{animationDelay: '0.6s'}}>
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
              <TaskRemindersCard taskId={task.id} taskTitle={task.title} />
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
              <TaskTimeBlockCard />
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
              <LazyPomodoroCard taskId={task.id} />
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.5s'}}>
              <LazySubtasksCard taskId={task.id} />
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.6s'}}>
              <LazyNotesCard taskId={task.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Background Configuration Button */}
      <FloatingBackgroundButton />

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab="avui" // Per defecte marcar "Avui"
        onTabChange={(tab) => {
          if (tab === "avui") {
            navigate("/");
          } else if (tab === "carpetes") {
            navigate("/?tab=carpetes");
          } else if (tab === "configuracio") {
            navigate("/?tab=configuracio");
          }
        }}
        onCreateTask={() => setShowCreateDialog(true)}
      />

      {/* Create Task Modal */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">Crear Nova Tasca</h2>
            <p className="text-muted-foreground text-sm">
              Per crear una nova tasca, navega a la pàgina principal.
            </p>
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
                className="flex-1"
              >
                Cancel·lar
              </Button>
              <Button 
                onClick={() => {
                  setShowCreateDialog(false);
                  navigate("/");
                }}
                className="flex-1"
              >
                Anar a l'inici
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

const TaskDetailPage = memo(() => {
  return (
    <TaskProvider>
      <Suspense fallback={
        <div className="w-full min-h-screen bg-transparent text-foreground">
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