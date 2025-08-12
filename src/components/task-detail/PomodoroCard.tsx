import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "@/components/ui/circular-progress";
import { PomodoroConfigDialog } from "@/components/ui/pomodoro-config-dialog";
import { Timer, Play, Pause, RotateCcw, Coffee, Target, Clock } from "lucide-react";
import { usePomodoroTimer } from "@/hooks/usePomodoroTimer";

interface PomodoroCardProps {
  taskId: string;
}

export const PomodoroCard = ({ taskId }: PomodoroCardProps) => {
  const {
    isActive,
    timeLeft,
    isBreak,
    workDuration,
    breakDuration,
    completedSessions,
    totalWorkTime,
    loading,
    formatTime,
    startTimer,
    pauseTimer,
    resetTimer,
    setWorkDuration,
    setBreakDuration
  } = usePomodoroTimer(taskId);

  const totalDuration = isBreak ? breakDuration * 60 : workDuration * 60;
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  const formatTotalTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Card className="animate-fade-in bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Timer className="h-5 w-5 text-primary" />
            Pomodoro
          </CardTitle>
          <PomodoroConfigDialog
            workDuration={workDuration}
            breakDuration={breakDuration}
            onWorkDurationChange={setWorkDuration}
            onBreakDurationChange={setBreakDuration}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Main timer with circular progress */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <CircularProgress 
              value={progress} 
              size={180} 
              strokeWidth={6}
              isActive={isActive}
            >
              <div className="text-center">
                <div className="text-3xl font-mono font-bold tracking-tight mb-1">
                  {formatTime(timeLeft)}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Badge 
                    variant={!isBreak ? 'default' : 'secondary'} 
                    className="text-xs px-2 py-1"
                  >
                    {!isBreak ? 'Feina' : 'Descans'}
                  </Badge>
                  {isBreak && <Coffee className="h-3 w-3 text-orange-400" />}
                </div>
              </div>
            </CircularProgress>
          </div>
          
          {/* Control buttons */}
          <div className="flex items-center gap-3">
            {!isActive ? (
              <Button 
                onClick={startTimer} 
                size="lg"
                className="gap-2 px-8 h-12 text-base font-medium"
                disabled={loading}
              >
                <Play className="h-5 w-5" />
                Iniciar
              </Button>
            ) : (
              <Button 
                onClick={pauseTimer} 
                variant="outline" 
                size="lg"
                className="gap-2 px-8 h-12 text-base font-medium"
              >
                <Pause className="h-5 w-5" />
                Pausar
              </Button>
            )}
            <Button 
              onClick={resetTimer} 
              variant="ghost" 
              size="lg"
              className="gap-2 h-12 w-12 p-0"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground text-center">
            Estadístiques d'avui
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-4 bg-muted/30 rounded-2xl border border-border/30">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-4 w-4 text-primary mr-1" />
              </div>
              <div className="text-xl font-bold text-primary mb-1">
                {completedSessions}
              </div>
              <div className="text-xs text-muted-foreground">Sessions</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-2xl border border-border/30">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-4 w-4 text-primary mr-1" />
              </div>
              <div className="text-xl font-bold text-primary mb-1">
                {formatTotalTime(totalWorkTime)}
              </div>
              <div className="text-xs text-muted-foreground">Temps total</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};