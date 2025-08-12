import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Timer, Play, Pause, RotateCcw, Settings, Coffee } from "lucide-react";

interface PomodoroSession {
  id: string;
  type: 'work' | 'break';
  duration: number;
  startTime: Date;
  endTime?: Date;
}

interface PomodoroCardProps {
  taskId: string;
}

export const PomodoroCard = ({ taskId }: PomodoroCardProps) => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [currentType, setCurrentType] = useState<'work' | 'break'>('work');
  const [sessionsToday, setSessionsToday] = useState(0);
  const [totalTimeToday, setTotalTimeToday] = useState(0);

  const totalDuration = currentType === 'work' ? workDuration * 60 : breakDuration * 60;
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Session completed
      setIsActive(false);
      setSessionsToday(prev => prev + 1);
      setTotalTimeToday(prev => prev + totalDuration);
      
      // Switch between work and break
      if (currentType === 'work') {
        setCurrentType('break');
        setTimeLeft(breakDuration * 60);
      } else {
        setCurrentType('work');
        setTimeLeft(workDuration * 60);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, currentType, workDuration, breakDuration, totalDuration]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsActive(true);
  const handlePause = () => setIsActive(false);
  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(currentType === 'work' ? workDuration * 60 : breakDuration * 60);
  };

  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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
          <Badge variant={currentType === 'work' ? 'default' : 'secondary'}>
            {currentType === 'work' ? 'Feina' : 'Descans'}
          </Badge>
          {currentType === 'break' && <Coffee className="h-4 w-4 text-orange-500" />}
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
              <Button onClick={handleStart} className="gap-2">
                <Play className="h-4 w-4" />
                Iniciar
              </Button>
            ) : (
              <Button onClick={handlePause} variant="outline" className="gap-2">
                <Pause className="h-4 w-4" />
                Pausar
              </Button>
            )}
            <Button onClick={handleReset} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reiniciar
            </Button>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Estadístiques d'avui</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{sessionsToday}</div>
              <div className="text-muted-foreground">Sessions</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {formatTotalTime(totalTimeToday)}
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