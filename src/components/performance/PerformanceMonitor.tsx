/**
 * Performance monitoring component for development
 */

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Database, Zap, Trash2 } from 'lucide-react';
import { logger, LogEntry } from '@/lib/debugUtils';
import { useQueryClient } from '@tanstack/react-query';

interface PerformanceStats {
  renderCount: number;
  memoryUsage: number;
  queryCount: number;
  errorCount: number;
}

export const PerformanceMonitor = () => {
  const [stats, setStats] = useState<PerformanceStats>({
    renderCount: 0,
    memoryUsage: 0,
    queryCount: 0,
    errorCount: 0
  });
  
  const [recentLogs, setRecentLogs] = useState<LogEntry[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const queryClient = useQueryClient();
  const intervalRef = useRef<number | null>(null);

  // Performance monitoring - ONLY when visible
  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    // Only activate interval when visible
    if (isVisible) {
      console.log('📊 PerformanceMonitor: Starting monitoring interval');
      
      intervalRef.current = window.setInterval(() => {
        const queries = queryClient.getQueryCache().getAll();
        const errors = logger.getRecentLogs('error');
        
        setStats(prev => ({
          renderCount: prev.renderCount + 1,
          memoryUsage: 'memory' in performance ? 
            Math.round(((performance as any).memory?.usedJSHeapSize || 0) / 1024 / 1024) : 0,
          queryCount: queries.length,
          errorCount: errors.length
        }));

        setRecentLogs(logger.getRecentLogs().slice(0, 5));
      }, 2000);
    }

    return () => {
      console.log('🧹 PerformanceMonitor: Cleaning up monitoring interval');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isVisible, queryClient]);

  // Keyboard shortcut handler
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const clearCache = () => {
    queryClient.clear();
    setStats(prev => ({ ...prev, queryCount: 0 }));
  };

  const clearLogs = () => {
    logger.clearLogs();
    setRecentLogs([]);
    setStats(prev => ({ ...prev, errorCount: 0 }));
  };

  if (process.env.NODE_ENV !== 'development' || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-background/95 backdrop-blur border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance Monitor
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3 pt-0">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3" />
              <span>Renders: {stats.renderCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-3 w-3" />
              <span>Queries: {stats.queryCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3" />
              <span>Memory: {stats.memoryUsage}MB</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-500">⚠</span>
              <span>Errors: {stats.errorCount}</span>
            </div>
          </div>

          {/* Recent logs */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">Recent Logs:</div>
            <div className="max-h-24 overflow-y-auto space-y-1">
              {recentLogs.length === 0 ? (
                <div className="text-xs text-muted-foreground">No recent logs</div>
              ) : (
                recentLogs.map((log, index) => (
                  <div key={index} className="text-xs flex items-center gap-2">
                    <Badge variant={
                      log.level === 'error' ? 'destructive' :
                      log.level === 'warn' ? 'secondary' : 'outline'
                    } className="text-xs px-1 py-0">
                      {log.level}
                    </Badge>
                    <span className="truncate flex-1">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearCache}
              className="flex-1 text-xs h-7"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear Cache
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearLogs}
              className="flex-1 text-xs h-7"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear Logs
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            Press Ctrl+Shift+P to toggle
          </div>
        </CardContent>
      </Card>
    </div>
  );
};