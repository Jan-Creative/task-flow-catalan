import { useState, useMemo } from "react";
import { format, isToday } from "date-fns";
import { ca } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { PropertyBadge } from "@/components/ui/property-badge";
import { useAuth } from "@/hooks/useAuth";
import { useDadesApp } from "@/hooks/useDadesApp";
import { useEvents } from "@/hooks/useEvents";
import { useOptimizedPropertyLabels } from "@/hooks/useOptimizedPropertyLabels";
import MiniCalendarCard from "@/components/calendar/MiniCalendarCard";
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

interface DashboardPageProps {
  onEditTask: (task: any) => void;
  onNavigateToTasks?: () => void;
  onNavigateToCalendar?: () => void;
}

const DashboardPage = ({ onEditTask, onNavigateToTasks, onNavigateToCalendar }: DashboardPageProps) => {
  const { user } = useAuth();
  const { todayTasks, updateTaskStatus, taskStats } = useDadesApp();
  const { events } = useEvents();
  const { getStatusLabel, getPriorityColor } = useOptimizedPropertyLabels();
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  // Handle task status toggle
  const handleTaskToggle = async (task: any) => {
    const newStatus = task.status === 'completat' ? 'pendent' : 'completat';
    await updateTaskStatus(task.id, newStatus);
  };

  return (
    <div className="w-full max-w-full p-4 pb-24 space-y-6">
      {/* Personalized Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-primary/20 rounded-2xl backdrop-blur-sm">
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

        {/* Executive Summary */}
        <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl shadow-[var(--shadow-elevated)] border border-border/30 hover:shadow-[var(--shadow-organic)] transition-all duration-300 p-6 before:absolute before:inset-0 before:bg-gradient-to-br before:from-orange-500/15 before:to-pink-500/15 before:rounded-2xl before:pointer-events-none">
          <div className="relative z-10 grid grid-cols-3 gap-6 text-center">
            <div className="p-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all duration-200 border border-white/10">
              <div className="text-3xl font-bold text-warning mb-1">
                {dashboardTasks.length}
              </div>
              <div className="text-sm text-muted-foreground">Tasques pendents</div>
            </div>
            <div className="p-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all duration-200 border border-white/10">
              <div className="text-3xl font-bold text-primary mb-1">
                {todayEvents.length}
              </div>
              <div className="text-sm text-muted-foreground">Esdeveniments avui</div>
            </div>
            <div className="p-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all duration-200 border border-white/10">
              <div className="text-3xl font-bold text-destructive mb-1">
                {urgentTasks.length}
              </div>
              <div className="text-sm text-muted-foreground">Tasques urgents</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks Card */}
        <div className="relative bg-card/70 backdrop-blur-xl rounded-2xl shadow-[var(--shadow-elevated)] border border-border/30 hover:shadow-[var(--shadow-organic)] transition-all duration-300 p-6 before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-500/12 before:to-cyan-500/12 before:rounded-2xl before:pointer-events-none hover:before:from-blue-500/18 hover:before:to-cyan-500/18">
          <div className="relative z-10 flex flex-row items-center justify-between pb-3">
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
          <div className="relative z-10 pt-0">
            {dashboardTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No tens tasques pendents per avui</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors border-0"
                  >
                    <input
                      type="checkbox"
                      checked={task.status === 'completat'}
                      onChange={() => handleTaskToggle(task)}
                      className="rounded border-gray-300 bg-transparent"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm truncate",
                        task.status === 'completat' ? "line-through text-muted-foreground" : "text-foreground"
                      )}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {task.priority && (
                          <PriorityBadge priority={task.priority} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Today's Events Card */}
        <div className="relative bg-card/70 backdrop-blur-xl rounded-2xl shadow-[var(--shadow-elevated)] border border-border/30 hover:shadow-[var(--shadow-organic)] transition-all duration-300 p-6 before:absolute before:inset-0 before:bg-gradient-to-br before:from-purple-500/12 before:to-blue-500/12 before:rounded-2xl before:pointer-events-none hover:before:from-purple-500/18 hover:before:to-blue-500/18">
          <div className="relative z-10 flex flex-row items-center justify-between pb-3">
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
          <div className="relative z-10 pt-0">
            {todayEvents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No tens esdeveniments programats per avui</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors border-0"
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
        <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl shadow-[var(--shadow-elevated)] border border-border/30 hover:shadow-[var(--shadow-organic)] transition-all duration-300 p-6 before:absolute before:inset-0 before:bg-gradient-to-br before:from-red-500/15 before:to-orange-500/15 before:rounded-2xl before:pointer-events-none hover:before:from-red-500/20 hover:before:to-orange-500/20">
          <div className="relative z-10 pb-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Tasques urgents
            </h3>
          </div>
          <div className="relative z-10 pt-0">
            {urgentTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No tens tasques urgents</p>
              </div>
            ) : (
              <div className="space-y-3">
                {urgentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors border-0"
                  >
                    <input
                      type="checkbox"
                      checked={task.status === 'completat'}
                      onChange={() => handleTaskToggle(task)}
                      className="rounded border-gray-300 bg-transparent"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm truncate",
                        task.status === 'completat' ? "line-through text-muted-foreground" : "text-foreground"
                      )}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <PriorityBadge priority={task.priority} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mini Weekly Calendar Card */}
        <div className="relative bg-card/70 backdrop-blur-xl rounded-2xl shadow-[var(--shadow-elevated)] border border-border/30 hover:shadow-[var(--shadow-organic)] transition-all duration-300 p-6 before:absolute before:inset-0 before:bg-gradient-to-br before:from-green-500/10 before:to-emerald-500/10 before:rounded-2xl before:pointer-events-none hover:before:from-green-500/15 hover:before:to-emerald-500/15">
          <div className="relative z-10 pb-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Calendar className="h-5 w-5 text-primary" />
              Calendari setmanal
            </h3>
          </div>
          <div className="relative z-10 pt-0">
            <MiniCalendarCard currentDate={selectedDate} onDateSelect={setSelectedDate} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;