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

      {/* Dashboard Grid */}
      <div className="p-4 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Task Details Card */}
          <div className="lg:col-span-1">
            <TaskDetailsCard task={task} folderName={folder?.name} />
          </div>

          {/* Pomodoro Card */}
          <div className="lg:col-span-1">
            <PomodoroCard taskId={task.id} />
          </div>

          {/* Subtasks Card */}
          <div className="lg:col-span-1">
            <SubtasksCard taskId={task.id} />
          </div>

          {/* Notes Card - Full width on large screens */}
          <div className="lg:col-span-2 xl:col-span-3">
            <NotesCard taskId={task.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;