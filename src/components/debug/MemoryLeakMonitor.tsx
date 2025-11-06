/**
 * FASE 5: PANELL VISUAL per Memory Leak Detector
 * Component que mostra estadístiques en temps real de memory leaks
 */

import { useMemoryLeakDetector } from '@/hooks/useMemoryLeakDetector';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Activity, Wifi, Timer, MousePointer, BarChart3 } from 'lucide-react';

export const MemoryLeakMonitor = () => {
  const { stats, isEnabled, toggle, getHistory } = useMemoryLeakDetector();

  // No mostrar si no està en mode ?leakcheck=1
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('leakcheck') !== '1') {
    return null;
  }

  const totalListeners = stats.eventListeners.window + 
                        stats.eventListeners.document + 
                        stats.eventListeners.visualViewport;

  const hasWarnings = stats.warnings.length > 0;
  const history = getHistory();
  const trend = history.length > 1 
    ? stats.realtimeChannels - history[history.length - 2].realtimeChannels 
    : 0;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-md">
      <Card className="bg-background/95 backdrop-blur-sm border-2 shadow-2xl">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary animate-pulse" />
              <h3 className="font-bold text-lg">Memory Leak Monitor</h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={hasWarnings ? "destructive" : "default"}>
                {hasWarnings ? '⚠️ Warnings' : '✅ OK'}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={toggle}
              >
                {isEnabled ? 'Pause' : 'Resume'}
              </Button>
            </div>
          </div>

          {/* Warnings */}
          {hasWarnings && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {stats.warnings.map((warning, idx) => (
                    <div key={idx} className="text-xs font-mono">
                      {warning}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Supabase Channels */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium text-muted-foreground">
                  Supabase Channels
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${
                  stats.realtimeChannels > 20 ? 'text-destructive' : 'text-foreground'
                }`}>
                  {stats.realtimeChannels}
                </span>
                {trend !== 0 && (
                  <span className={`text-xs ${trend > 0 ? 'text-destructive' : 'text-green-500'}`}>
                    {trend > 0 ? '+' : ''}{trend}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Limit: 20
              </div>
            </div>

            {/* Active Timers */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-orange-500" />
                <span className="text-xs font-medium text-muted-foreground">
                  Active Timers
                </span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {stats.activeTimers}
              </div>
              <div className="text-xs text-muted-foreground">
                Limit: 50
              </div>
            </div>

            {/* Active Intervals */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-medium text-muted-foreground">
                  Active Intervals
                </span>
              </div>
              <div className={`text-2xl font-bold ${
                stats.activeIntervals > 10 ? 'text-destructive' : 'text-foreground'
              }`}>
                {stats.activeIntervals}
              </div>
              <div className="text-xs text-muted-foreground">
                Limit: 10
              </div>
            </div>

            {/* Event Listeners */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-2">
                <MousePointer className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium text-muted-foreground">
                  Event Listeners
                </span>
              </div>
              <div className={`text-2xl font-bold ${
                totalListeners > 30 ? 'text-destructive' : 'text-foreground'
              }`}>
                {totalListeners}
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <div>Window: {stats.eventListeners.window}</div>
                <div>Document: {stats.eventListeners.document}</div>
                <div>Viewport: {stats.eventListeners.visualViewport}</div>
              </div>
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Last updated: {stats.timestamp.toLocaleTimeString()}
          </div>

          {/* Footer */}
          <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
            💡 <strong>Tip:</strong> Use <code className="bg-background px-1 rounded">?leakcheck=1</code> to enable this monitor
          </div>
        </div>
      </Card>
    </div>
  );
};
