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
    <Card className="animate-fade-in h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
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
      
      <CardContent className="flex-1 flex flex-col justify-between p-4 pt-0">
        {/* Main timer with circular progress */}
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="relative mb-3">
            <CircularProgress 
              value={progress} 
              size={140} 
              strokeWidth={5}
              isActive={isActive}
            >
              <div className="text-center">
                <div className="text-2xl font-mono font-bold tracking-tight mb-1">
                  {formatTime(timeLeft)}
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Badge 
                    variant={!isBreak ? 'default' : 'secondary'} 
                    className="text-xs px-1.5 py-0.5"
                  >
                    {!isBreak ? 'Feina' : 'Descans'}
                  </Badge>
                  {isBreak && <Coffee className="h-3 w-3 text-orange-400" />}
                </div>
              </div>
            </CircularProgress>
          </div>
          
          {/* Control buttons */}
          <div className="flex items-center gap-2">
            {!isActive ? (
              <Button 
                onClick={startTimer} 
                size="sm"
                className="gap-1 px-4 h-8 text-sm"
                disabled={loading}
              >
                <Play className="h-3 w-3" />
                Iniciar
              </Button>
            ) : (
              <Button 
                onClick={pauseTimer} 
                variant="outline" 
                size="sm"
                className="gap-1 px-4 h-8 text-sm"
              >
                <Pause className="h-3 w-3" />
                Pausar
              </Button>
            )}
            <Button 
              onClick={resetTimer} 
              variant="ghost" 
              size="sm"
              className="gap-1 h-8 w-8 p-0"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Statistics - Compactes dins dels límits de la targeta */}
        <div className="border-t border-border/30 pt-2 mt-2">
          <div className="grid grid-cols-2 gap-2 px-1">
            <div className="text-center py-1">
              <div className="flex items-center justify-center mb-1">
                <Target className="h-3 w-3 text-primary mr-1" />
              </div>
              <div className="text-base font-bold text-primary leading-none">
                {completedSessions}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Sessions</div>
            </div>
            <div className="text-center py-1">
              <div className="flex items-center justify-center mb-1">
                <Clock className="h-3 w-3 text-primary mr-1" />
              </div>
              <div className="text-base font-bold text-primary leading-none">
                {formatTotalTime(totalWorkTime)}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Temps total</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};