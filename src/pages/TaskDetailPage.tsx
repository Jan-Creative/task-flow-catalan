import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOptimizedData } from "@/hooks/useOptimizedData";
import { TaskDetailsCard } from "@/components/task-detail/TaskDetailsCard";
import { SubtasksCard } from "@/components/task-detail/SubtasksCard";
import { NotesCard } from "@/components/task-detail/NotesCard";
import { PomodoroCard } from "@/components/task-detail/PomodoroCard";

const TaskDetailPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { tasks, folders, loading } = useOptimizedData();

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-background text-foreground">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const task = tasks.find(t => t.id === taskId);
  const folder = task?.folder_id ? folders.find(f => f.id === task.folder_id) : null;

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
    <div className="w-full min-h-screen bg-background text-foreground">
      {/* Header with back button */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50">
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

      {/* Dashboard Grid - Sistema avançat de targetes de diferents mides */}
      <div className="p-4 pb-24">
        <div className="max-w-7xl mx-auto">
          {/* Desktop Layout - Grid Complex */}
          <div className="hidden xl:grid xl:grid-cols-6 xl:grid-rows-4 gap-6 h-[600px]">
            {/* Task Details Card - Quadrada mitjana (2x2) */}
            <div className="col-span-2 row-span-2 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="h-full">
                <TaskDetailsCard task={task} folderName={folder?.name} />
              </div>
            </div>

            {/* Pomodoro Card - Quadrada gran (2x2) */}
            <div className="col-span-2 row-span-2 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="h-full">
                <PomodoroCard taskId={task.id} />
              </div>
            </div>

            {/* Subtasks Card - Rectangular vertical (2x4) */}
            <div className="col-span-2 row-span-4 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="h-full">
                <SubtasksCard taskId={task.id} />
              </div>
            </div>

            {/* Notes Card - Rectangular horitzontal gran (4x2) */}
            <div className="col-span-4 row-span-2 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="h-full">
                <NotesCard taskId={task.id} />
              </div>
            </div>
          </div>

          {/* Tablet Layout - Grid adaptat */}
          <div className="hidden md:grid xl:hidden md:grid-cols-4 md:grid-rows-3 gap-6 h-[500px]">
            {/* Task Details Card */}
            <div className="col-span-2 row-span-1 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="h-full">
                <TaskDetailsCard task={task} folderName={folder?.name} />
              </div>
            </div>

            {/* Pomodoro Card */}
            <div className="col-span-2 row-span-1 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="h-full">
                <PomodoroCard taskId={task.id} />
              </div>
            </div>

            {/* Subtasks Card */}
            <div className="col-span-2 row-span-2 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="h-full">
                <SubtasksCard taskId={task.id} />
              </div>
            </div>

            {/* Notes Card */}
            <div className="col-span-2 row-span-2 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="h-full">
                <NotesCard taskId={task.id} />
              </div>
            </div>
          </div>

          {/* Mobile Layout - Stack vertical */}
          <div className="grid md:hidden grid-cols-1 gap-6">
            <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
              <TaskDetailsCard task={task} folderName={folder?.name} />
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <PomodoroCard taskId={task.id} />
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
              <SubtasksCard taskId={task.id} />
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
              <NotesCard taskId={task.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;