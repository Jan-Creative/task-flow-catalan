import { useState, useMemo } from "react";
import { format, isToday } from "date-fns";
import { ca } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { useDadesApp } from "@/hooks/useDadesApp";
import { useEvents } from "@/hooks/useEvents";
import { useOptimizedPropertyLabels } from "@/hooks/useOptimizedPropertyLabels";
import MiniCalendarCard from "@/components/calendar/MiniCalendarCard";
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
  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    await updateTaskStatus(taskId, completed ? 'completat' : 'pendent');
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
        <Card className="bg-gradient-to-br from-orange-400/20 to-pink-400/20 backdrop-blur-md border-border/20 shadow-xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="p-4 rounded-xl bg-background/20 hover:bg-background/30 transition-all duration-200">
                <div className="text-3xl font-bold text-warning mb-1">
                  {dashboardTasks.length}
                </div>
                <div className="text-sm text-muted-foreground">Tasques pendents</div>
              </div>
              <div className="p-4 rounded-xl bg-background/20 hover:bg-background/30 transition-all duration-200">
                <div className="text-3xl font-bold text-primary mb-1">
                  {todayEvents.length}
                </div>
                <div className="text-sm text-muted-foreground">Esdeveniments avui</div>
              </div>
              <div className="p-4 rounded-xl bg-background/20 hover:bg-background/30 transition-all duration-200">
                <div className="text-3xl font-bold text-destructive mb-1">
                  {urgentTasks.length}
                </div>
                <div className="text-sm text-muted-foreground">Tasques urgents</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks Card */}
        <Card className="bg-gradient-to-br from-blue-400/10 to-cyan-400/10 backdrop-blur-md border-border/20 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckSquare className="h-5 w-5 text-primary" />
              Tasques d'avui
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateToTasks}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardTasks.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hi ha tasques per avui</p>
            ) : (
              dashboardTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                  onClick={() => onEditTask(task)}
                >
                  <Checkbox
                    checked={task.status === 'completat'}
                    onCheckedChange={(checked) => handleTaskToggle(task.id, !!checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className="text-xs"
                        style={{ backgroundColor: getPriorityColor(task.priority) + '20' }}
                      >
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {getStatusLabel(task.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Today's Events Card */}
        <Card className="bg-gradient-to-br from-purple-400/10 to-blue-400/10 backdrop-blur-md border-border/20 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Esdeveniments d'avui
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateToCalendar}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayEvents.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hi ha esdeveniments avui</p>
            ) : (
              todayEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {event.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(event.startDateTime), "HH:mm")} - {format(new Date(event.endDateTime), "HH:mm")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Urgent Tasks Card */}
        <Card className="bg-gradient-to-br from-red-400/10 to-orange-400/10 backdrop-blur-md border-border/20 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Tasques urgents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {urgentTasks.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hi ha tasques urgents</p>
            ) : (
              urgentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                  onClick={() => onEditTask(task)}
                >
                  <Checkbox
                    checked={task.status === 'completat'}
                    onCheckedChange={(checked) => handleTaskToggle(task.id, !!checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="destructive"
                        className="text-xs"
                      >
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {getStatusLabel(task.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Mini Weekly Calendar Card */}
        <Card className="bg-gradient-to-br from-green-400/10 to-emerald-400/10 backdrop-blur-md border-border/20 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Calendari setmanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MiniCalendarCard
              currentDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;