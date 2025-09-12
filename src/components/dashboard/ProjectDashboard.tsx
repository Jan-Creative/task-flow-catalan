import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { format } from "date-fns";
import { ca } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { useProject } from "@/hooks/useProject";
import { useProjectTasks } from "@/hooks/useProjectTasks";
import { useDadesApp } from "@/hooks/useDadesApp";
import { useOptimizedPropertyLabels } from "@/hooks/useOptimizedPropertyLabels";
import TaskChecklistItem from "@/components/TaskChecklistItem";
import { 
  CheckSquare, 
  AlertTriangle, 
  Target,
  TrendingUp,
  Briefcase,
  Settings
} from "lucide-react";

interface ProjectDashboardProps {
  projectId: string;
  onEditTask: (task: any) => void;
  onNavigateToTasks?: () => void;
}

const ProjectDashboard = ({ projectId, onEditTask, onNavigateToTasks }: ProjectDashboardProps) => {
  const { project, isLoading: projectLoading } = useProject(projectId);
  const { projectTasks, todayTasks, urgentTasks, taskStats, loading: tasksLoading } = useProjectTasks(projectId);
  const { updateTaskStatus, deleteTask } = useDadesApp();
  const { getStatusLabel, getPriorityColor } = useOptimizedPropertyLabels();
  
  // State for 3-second delay system
  const [completingTasks, setCompletingTasks] = useState<Set<string>>(new Set());
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Today's tasks for dashboard (max 6)
  const dashboardTasks = useMemo(() => {
    return todayTasks
      .filter(task => task.status !== 'completat')
      .slice(0, 6);
  }, [todayTasks]);

  // Unified 3-second delay status change handler
  const handleStatusChange = useCallback((taskId: string, newStatus: any) => {
    if (newStatus === 'completat') {
      // Clear any existing timeout for this task
      const existingTimeout = timeoutsRef.current.get(taskId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Mark task as completing (optimistic UI)
      setCompletingTasks(prev => new Set(prev).add(taskId));

      // Set timeout for actual status change
      const timeoutId = setTimeout(async () => {
        try {
          await updateTaskStatus(taskId, newStatus);
        } catch (error) {
          console.error('Error updating task status:', error);
        } finally {
          // Remove from completing state
          setCompletingTasks(prev => {
            const newSet = new Set(prev);
            newSet.delete(taskId);
            return newSet;
          });
          timeoutsRef.current.delete(taskId);
        }
      }, 3000);

      timeoutsRef.current.set(taskId, timeoutId);
    } else {
      // For non-completion status changes, update immediately
      updateTaskStatus(taskId, newStatus);
    }
  }, [updateTaskStatus]);

  const handleDelete = useCallback((taskId: string) => {
    deleteTask(taskId);
  }, [deleteTask]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, []);

  if (projectLoading || tasksLoading) {
    return (
      <div className="w-full max-w-full p-4 pb-24 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-muted rounded-2xl"></div>
          <div className="h-32 bg-muted rounded-2xl"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-muted rounded-2xl"></div>
            <div className="h-64 bg-muted rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="w-full max-w-full p-4 pb-24 space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Projecte no trobat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full p-4 pb-24 space-y-6">
      {/* Project Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl" style={{ backgroundColor: `${project.color}20` }}>
              <Briefcase className="h-6 w-6" style={{ color: project.color }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {project.name}
              </h1>
              <p className="text-muted-foreground">
                {project.description || "Projecte actiu"}
              </p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Project Stats Summary */}
        <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-organic)] transition-all duration-300 p-6">
          <div className="grid grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-accent hover:bg-accent/80 transition-all duration-200">
              <div className="text-3xl font-bold text-primary mb-1">
                {taskStats.total}
              </div>
              <div className="text-sm text-muted-foreground">Total tasques</div>
            </div>
            <div className="p-4 rounded-xl bg-accent hover:bg-accent/80 transition-all duration-200">
              <div className="text-3xl font-bold text-success mb-1">
                {taskStats.completed}
              </div>
              <div className="text-sm text-muted-foreground">Completades</div>
            </div>
            <div className="p-4 rounded-xl bg-accent hover:bg-accent/80 transition-all duration-200">
              <div className="text-3xl font-bold text-warning mb-1">
                {taskStats.pending}
              </div>
              <div className="text-sm text-muted-foreground">Pendents</div>
            </div>
            <div className="p-4 rounded-xl bg-accent hover:bg-accent/80 transition-all duration-200">
              <div className="text-3xl font-bold text-primary mb-1">
                {taskStats.completionPercentage}%
              </div>
              <div className="text-sm text-muted-foreground">Progrés</div>
            </div>
          </div>
        </div>

        {/* Project Objective */}
        {project.objective && (
          <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Objectiu del projecte</span>
            </div>
            <p className="text-sm text-muted-foreground">{project.objective}</p>
          </div>
        )}
      </div>

      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Project Tasks Card */}
        <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-organic)] transition-all duration-300 p-6">
          <div className="flex flex-row items-center justify-between pb-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <CheckSquare className="h-5 w-5 text-primary" />
              Tasques d'avui
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateToTasks?.()}
              className="text-xs text-muted-foreground hover:text-foreground border-0 bg-transparent"
            >
              Veure totes
            </Button>
          </div>
          <div className="pt-0">
            {dashboardTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No tens tasques pendents per avui en aquest projecte</p>
              </div>
            ) : (
              <div className="space-y-2">
                {dashboardTasks.map((task) => (
                  <TaskChecklistItem
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onEdit={onEditTask}
                    onDelete={handleDelete}
                    viewMode="list"
                    completingTasks={completingTasks}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Project Progress Card */}
        <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-organic)] transition-all duration-300 p-6">
          <div className="pb-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <TrendingUp className="h-5 w-5 text-primary" />
              Progrés del projecte
            </h3>
          </div>
          <div className="pt-0 space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Completat</span>
                <span>{taskStats.completionPercentage}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${taskStats.completionPercentage}%`,
                    backgroundColor: project.color
                  }}
                />
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 rounded-lg bg-accent">
                <div className="font-semibold text-lg">{taskStats.inProgress}</div>
                <div className="text-muted-foreground">En procés</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-accent">
                <div className="font-semibold text-lg">{urgentTasks.length}</div>
                <div className="text-muted-foreground">Urgents</div>
              </div>
            </div>
          </div>
        </div>

        {/* Urgent Project Tasks Card */}
        <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-organic)] transition-all duration-300 p-6">
          <div className="pb-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Tasques urgents
            </h3>
          </div>
          <div className="pt-0">
            {urgentTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No tens tasques urgents en aquest projecte</p>
              </div>
            ) : (
              <div className="space-y-2">
                {urgentTasks.slice(0, 4).map((task) => (
                  <TaskChecklistItem
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onEdit={onEditTask}
                    onDelete={handleDelete}
                    viewMode="list"
                    completingTasks={completingTasks}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-organic)] transition-all duration-300 p-6">
          <div className="pb-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <CheckSquare className="h-5 w-5 text-primary" />
              Activitat recent
            </h3>
          </div>
          <div className="pt-0">
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">Activitat recent del projecte es mostrarà aquí</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;