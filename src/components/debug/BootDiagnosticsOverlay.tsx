import React, { useEffect, useMemo, useState } from 'react';
import { bootTracer, BootEvent } from '@/lib/bootTracer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Trash2 } from 'lucide-react';

interface BootDiagnosticsOverlayProps {
  onClose?: () => void;
}

const LevelBadge = ({ level }: { level: BootEvent['level'] }) => {
  const variant = level === 'error' ? 'destructive' : level === 'mark' ? 'secondary' : 'default';
  return <Badge variant={variant as any}>{level}</Badge>;
};

export const BootDiagnosticsOverlay: React.FC<BootDiagnosticsOverlayProps> = ({ onClose }) => {
  const [events, setEvents] = useState<BootEvent[]>(() => bootTracer.getTrace());

  useEffect(() => {
    const id = setInterval(() => setEvents(bootTracer.getTrace()), 400);
    return () => clearInterval(id);
  }, []);

  const firstTime = events.length ? events[0].t : Date.now();
  const items = useMemo(() =>
    events.map((e, idx) => ({
      key: `${e.t}-${idx}`,
      ...e,
      dt: `${(e.t - firstTime).toString().padStart(4, ' ')}ms`,
    })),
  [events, firstTime]);

  const handleCompleteReset = async () => {
    if (!confirm('Això esborrarà el Service Worker, caches, localStorage i sessionStorage. Continuar?')) {
      return;
    }
    
    try {
      // Unregister all service workers
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(reg => reg.unregister()));
      }
      
      // Clear all caches
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(name => caches.delete(name)));
      }
      
      // Clear storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirect to minimal mode
      window.location.href = '/?minimal=1&bootdebug=1&no-sw=1';
    } catch (error) {
      console.error('Error during reset:', error);
      alert('Error durant el reset: ' + error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-end p-4 pointer-events-none">
      <Card className="w-[420px] max-h-[80vh] pointer-events-auto shadow-xl border bg-background/95 backdrop-blur">
        <CardHeader className="flex items-center justify-between space-y-0">
          <CardTitle className="text-base">Boot diagnostics</CardTitle>
          <div className="ml-auto flex gap-2">
            <Button size="icon" variant="ghost" onClick={() => { bootTracer.clear(); setEvents([]); }} aria-label="Clear">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          <ScrollArea className="h-[58vh]">
            <div className="divide-y">
              {items.length === 0 && (
                <div className="p-4 text-sm text-muted-foreground">No events yet. Interact with the app to collect trace.</div>
              )}
              {items.map((e) => (
                <div key={e.key} className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <LevelBadge level={e.level} />
                    <span className="text-xs text-muted-foreground">{e.dt}</span>
                    <span className="text-sm font-medium">{e.phase}</span>
                  </div>
                  {e.msg && <div className="mt-1 text-xs text-muted-foreground">{e.msg}</div>}
                  {e.data && (
                    <pre className="mt-2 text-[10px] leading-snug bg-muted/40 rounded p-2 overflow-auto max-h-24">
                      {JSON.stringify(e.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <Separator />
          <div className="p-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => window.location.search += (window.location.search ? '&' : '?') + 'minimal=1'}>Minimal</Button>
            <Button size="sm" variant="outline" onClick={() => window.location.search += (window.location.search ? '&' : '?') + 'probe=1'}>Probe</Button>
            <Button size="sm" variant="outline" onClick={() => window.location.search += (window.location.search ? '&' : '?') + 'safe=1'}>Safe</Button>
            <Button size="sm" variant="secondary" onClick={() => window.location.reload()}>Reload</Button>
            <Button size="sm" variant="destructive" onClick={handleCompleteReset}>🔄 Reset Complet</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BootDiagnosticsOverlay;
