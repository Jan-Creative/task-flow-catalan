import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Timer, Play, Pause, RotateCcw, Settings, Coffee } from "lucide-react";
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
    resetTimer
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
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            Pomodoro
          </CardTitle>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Badge variant={!isBreak ? 'default' : 'secondary'}>
            {!isBreak ? 'Feina' : 'Descans'}
          </Badge>
          {isBreak && <Coffee className="h-4 w-4 text-orange-500" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-4xl font-mono font-bold mb-2">
            {formatTime(timeLeft)}
          </div>
          <Progress value={progress} className="h-2 mb-4" />
          
          <div className="flex justify-center gap-2">
            {!isActive ? (
              <Button onClick={startTimer} className="gap-2" disabled={loading}>
                <Play className="h-4 w-4" />
                Iniciar
              </Button>
            ) : (
              <Button onClick={pauseTimer} variant="outline" className="gap-2">
                <Pause className="h-4 w-4" />
                Pausar
              </Button>
            )}
            <Button onClick={resetTimer} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reiniciar
            </Button>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Estadístiques d'avui</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{completedSessions}</div>
              <div className="text-muted-foreground">Sessions</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {formatTotalTime(totalWorkTime)}
              </div>
              <div className="text-muted-foreground">Temps total</div>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Configuració: {workDuration}min feina, {breakDuration}min descans
        </div>
      </CardContent>
    </Card>
  );
};