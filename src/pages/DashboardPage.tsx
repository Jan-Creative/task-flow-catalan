import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { format, isToday } from "date-fns";
import { ca } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { PropertyBadge } from "@/components/ui/property-badge";
import { useAuth } from "@/hooks/useAuth";
import { useDadesApp } from "@/hooks/useDadesApp";
import { useEvents } from "@/hooks/useEvents";
import { useOptimizedPropertyLabels } from "@/hooks/useOptimizedPropertyLabels";
import { usePrepareTomorrowVisibility } from "@/hooks/usePrepareTomorrowVisibility";
import WeeklyCalendarCard from "@/components/calendar/WeeklyCalendarCard";
import TaskChecklistItem from "@/components/TaskChecklistItem";
import { cn } from "@/lib/utils";
import { 
  CheckSquare, 
  Calendar, 
  AlertTriangle, 
  Clock,
  ChevronRight,
  Sun,
  Moon,
  Sunset
} from "lucide-react";
import { ConfigurationMenu } from "@/components/dashboard/ConfigurationMenu";
import { DailyReminderConfigModal } from "@/components/prepare-tomorrow/DailyReminderConfigModal";
import { TodayTimeBlocksModal } from "@/components/dashboard/TodayTimeBlocksModal";
interface DashboardPageProps {
  onEditTask: (task: any) => void;
  onNavigateToTasks?: () => void;
  onNavigateToCalendar?: () => void;
}

const DashboardPage = ({ onEditTask, onNavigateToTasks, onNavigateToCalendar }: DashboardPageProps) => {
  const { user } = useAuth();
  const { todayTasks, updateTaskStatus, deleteTask, taskStats } = useDadesApp();
  const { events } = useEvents();
  const { getStatusLabel, getPriorityColor } = useOptimizedPropertyLabels();
  const { isVisible: showPrepareTomorrow } = usePrepareTomorrowVisibility();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Dashboard-level modals
  const [showReminderConfig, setShowReminderConfig] = useState(false);
  const [showTimeBlocks, setShowTimeBlocks] = useState(false);
  
  // State for 3-second delay system
  const [completingTasks, setCompletingTasks] = useState<Set<string>>(new Set());
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Get user display name
  const userName = useMemo(() => {
    if (!user) return "Usuari";
    
    // Try user metadata first
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    
    // Fallback to email prefix
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return "Usuari";
  }, [user]);

  // Dynamic greeting based on time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bon dia";
    if (hour < 18) return "Bona tarda"; 
    return "Bona nit";
  }, []);

  // Greeting icon based on time
  const GreetingIcon = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return Sun;
    if (hour < 18) return Sun;
    return Moon;
  }, []);

  // Today's tasks (max 6 for dashboard)
  const dashboardTasks = useMemo(() => {
    return (todayTasks || [])
      .filter(task => task.status !== 'completat')
      .slice(0, 6);
  }, [todayTasks]);

  // Urgent tasks (high priority, not completed)
  const urgentTasks = useMemo(() => {
    return (todayTasks || [])
      .filter(task => task.priority === 'alta' && task.status !== 'completat')
      .slice(0, 4);
  }, [todayTasks]);

  // Today's events
  const todayEvents = useMemo(() => {
    return (events || [])
      .filter(event => isToday(new Date(event.startDateTime)))
      .slice(0, 4);
  }, [events]);

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

  return (
    <div className="w-full max-w-full p-4 pb-24 space-y-6">
      {/* Personalized Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-2xl">
              <GreetingIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {greeting}, {userName}!
              </h1>
              <p className="text-muted-foreground">
                {format(new Date(), "EEEE, d MMMM yyyy", { locale: ca })}
              </p>
            </div>
          </div>
          
          <ConfigurationMenu 
            onNavigateToPrepareTomorrow={() => window.location.href = '/prepare-tomorrow'}
            onOpenReminderConfig={() => setShowReminderConfig(true)}
            onOpenTodayTimeBlocks={() => setShowTimeBlocks(true)}
          />
        </div>

        {/* Executive Summary */}
        <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-organic)] transition-all duration-300 p-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="p-4 rounded-xl bg-accent hover:bg-accent/80 transition-all duration-200">
              <div className="text-3xl font-bold text-warning mb-1">
                {dashboardTasks.length}
              </div>
              <div className="text-sm text-muted-foreground">Tasques pendents</div>
            </div>
            <div className="p-4 rounded-xl bg-accent hover:bg-accent/80 transition-all duration-200">
              <div className="text-3xl font-bold text-primary mb-1">
                {todayEvents.length}
              </div>
              <div className="text-sm text-muted-foreground">Esdeveniments avui</div>
            </div>
            <div className="p-4 rounded-xl bg-accent hover:bg-accent/80 transition-all duration-200">
              <div className="text-3xl font-bold text-destructive mb-1">
                {urgentTasks.length}
              </div>
              <div className="text-sm text-muted-foreground">Tasques urgents</div>
            </div>
          </div>
        </div>

        {/* Prepare Tomorrow Button */}
        {showPrepareTomorrow && (
          <Button 
            onClick={() => window.location.href = '/prepare-tomorrow'}
            className="w-full mt-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground py-3 h-auto"
          >
            <Moon className="h-5 w-5 mr-2" />
            🌙 Preparar el dia de demà
          </Button>
        )}
      </div>

      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks Card */}
        <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-organic)] transition-all duration-300 p-6">
          <div className="flex flex-row items-center justify-between pb-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <CheckSquare className="h-5 w-5 text-primary" />
              Tasques d'avui
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateToTasks()}
              className="text-xs text-muted-foreground hover:text-foreground border-0 bg-transparent"
            >
              Veure totes
            </Button>
          </div>
          <div className="pt-0">
            {dashboardTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No tens tasques pendents per avui</p>
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

        {/* Today's Events Card */}
        <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-organic)] transition-all duration-300 p-6">
          <div className="flex flex-row items-center justify-between pb-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Calendar className="h-5 w-5 text-primary" />
              Esdeveniments d'avui
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateToCalendar()}
              className="text-xs text-muted-foreground hover:text-foreground border-0 bg-transparent"
            >
              Veure calendari
            </Button>
          </div>
          <div className="pt-0">
            {todayEvents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No tens esdeveniments programats per avui</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.startDateTime), 'HH:mm', { locale: ca })} - {format(new Date(event.endDateTime), 'HH:mm', { locale: ca })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Urgent Tasks Card */}
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
                <p className="text-muted-foreground text-sm">No tens tasques urgents</p>
              </div>
            ) : (
              <div className="space-y-2">
                {urgentTasks.map((task) => (
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

        {/* Mini Weekly Calendar Card */}
        <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-organic)] transition-all duration-300 p-6">
          <div className="pb-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Calendar className="h-5 w-5 text-primary" />
              Calendari setmanal
            </h3>
          </div>
          <div className="pt-0">
            <WeeklyCalendarCard currentDate={selectedDate} onDateSelect={setSelectedDate} />
          </div>
        </div>
      </div>
      {/* Global modals */}
      <DailyReminderConfigModal open={showReminderConfig} onOpenChange={(o) => { console.debug('DailyReminderConfigModal onOpenChange', o); setShowReminderConfig(o); }} />
      <TodayTimeBlocksModal open={showTimeBlocks} onClose={() => setShowTimeBlocks(false)} />
    </div>
  );
};

export default DashboardPage;