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
  const progress = totalDuration > 0 ? Math.min(Math.max(((totalDuration - timeLeft) / totalDuration) * 100, 0), 100) : 0;

  const formatTotalTime = (minutes: number) => {
    if (!minutes || isNaN(minutes)) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Card className={`animate-fade-in h-full flex flex-col transition-all duration-300 ${isActive ? 'ring-2 ring-primary/20 shadow-lg shadow-primary/10' : ''}`}>
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Timer className={`h-5 w-5 transition-colors duration-300 ${isActive ? 'text-primary' : 'text-primary'}`} />
            Pomodoro
            {isActive && (
              <Badge variant="secondary" className="ml-2">
                Actiu
              </Badge>
            )}
          </CardTitle>
          <PomodoroConfigDialog
            workDuration={workDuration}
            breakDuration={breakDuration}
            onWorkDurationChange={setWorkDuration}
            onBreakDurationChange={setBreakDuration}
          />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-between p-4 pt-0 space-y-4">
        {/* Main timer amb circular progress responsiu */}
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="relative mb-4 w-full flex justify-center">
            <CircularProgress 
              value={isNaN(progress) ? 0 : progress} 
              size="responsive"
              isActive={isActive}
              className="transition-all duration-500"
            >
              <div className="text-center px-2">
                <div className={`font-mono font-bold tracking-tight mb-1 transition-colors duration-300 ${
                  isActive ? 'text-primary' : 'text-foreground'
                } text-xl sm:text-2xl lg:text-3xl`}>
                  {formatTime ? formatTime(timeLeft || 0) : '00:00'}
                </div>
                <div className="flex items-center justify-center gap-1 flex-wrap">
                  <Badge 
                    variant={!isBreak ? 'default' : 'secondary'} 
                    className="text-xs px-1.5 py-0.5 whitespace-nowrap"
                  >
                    {!isBreak ? 'Feina' : 'Descans'}
                  </Badge>
                  {isBreak && <Coffee className="h-3 w-3 text-orange-400 flex-shrink-0" />}
                </div>
              </div>
            </CircularProgress>
          </div>
          
          {/* Control buttons optimitzats */}
          <div className="flex items-center gap-3 w-full justify-center">
            {!isActive ? (
              <Button 
                onClick={startTimer} 
                size="sm"
                className="gap-1.5 px-6 h-9 text-sm font-medium transition-all duration-200 hover:scale-105 shadow-sm"
                disabled={loading}
              >
                <Play className="h-3.5 w-3.5" />
                Iniciar
              </Button>
            ) : (
              <Button 
                onClick={pauseTimer} 
                variant="outline" 
                size="sm"
                className="gap-1.5 px-6 h-9 text-sm font-medium transition-all duration-200 hover:scale-105"
              >
                <Pause className="h-3.5 w-3.5" />
                Pausar
              </Button>
            )}
            <Button 
              onClick={resetTimer} 
              variant="ghost" 
              size="sm"
              className="gap-1 h-9 w-9 p-0 transition-all duration-200 hover:scale-105"
              title="Reiniciar timer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Statistics optimitzades */}
        <div className="border-t border-border/30 pt-3 mt-auto">
          <div className="grid grid-cols-2 gap-3 px-1">
            <div className="text-center py-2 space-y-1">
              <div className="flex items-center justify-center">
                <Target className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="text-lg font-bold text-primary leading-none">
                {completedSessions || 0}
              </div>
              <div className="text-xs text-muted-foreground">Sessions</div>
            </div>
            <div className="text-center py-2 space-y-1">
              <div className="flex items-center justify-center">
                <Clock className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="text-lg font-bold text-primary leading-none">
                {formatTotalTime(totalWorkTime || 0)}
              </div>
              <div className="text-xs text-muted-foreground">Temps total</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};