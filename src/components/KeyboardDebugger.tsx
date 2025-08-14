// ============= COMPONENT DE DEBUG PER DRECERES DE TECLAT =============

import React, { useState } from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { keyboardService } from '@/services/keyboardService';
import { formatShortcutKeys } from '@/utils/shortcutDefaults';

export const KeyboardDebugger: React.FC = () => {
  const { shortcuts, isEnabled } = useKeyboardShortcuts();
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('');
  const [keyDetection, setKeyDetection] = useState<any>(null);

  // Detector de tecles visual
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const combination = {
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        key: event.key.toLowerCase()
      };
      
      setKeyDetection(combination);
      setLastKeyPressed(formatShortcutKeys([
        ...(combination.ctrlKey ? ['ctrl'] : []),
        ...(combination.metaKey ? ['meta'] : []),
        ...(combination.shiftKey ? ['shift'] : []),
        ...(combination.altKey ? ['alt'] : []),
        combination.key
      ]));
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const testCreateTaskShortcut = () => {
    console.log('🧪 Testing create task shortcut manually');
    const success = keyboardService.executeShortcut('createTask');
    console.log('🧪 Manual execution result:', success);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🔍 Debug Dreceres de Teclat</CardTitle>
        <CardDescription>
          Informació de debug per diagnosticar problemes amb les dreceres
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estat general */}
        <div>
          <h3 className="font-semibold mb-2">Estat General</h3>
          <div className="flex gap-2">
            <Badge variant={isEnabled ? "default" : "secondary"}>
              Sistema: {isEnabled ? 'Activat' : 'Desactivat'}
            </Badge>
            <Badge variant="outline">
              Dreceres registrades: {Object.keys(shortcuts).length}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Detector de tecles */}
        <div>
          <h3 className="font-semibold mb-2">Detector de Tecles</h3>
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">
              Prem qualsevol combinació de tecles:
            </div>
            <div className="font-mono text-lg">
              {lastKeyPressed || 'Esperant tecles...'}
            </div>
            {keyDetection && (
              <div className="text-xs text-muted-foreground mt-2">
                Raw: {JSON.stringify(keyDetection)}
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Dreceres registrades */}
        <div>
          <h3 className="font-semibold mb-2">Dreceres Registrades</h3>
          <div className="space-y-2">
            {Object.values(shortcuts).map((shortcut) => (
              <div key={shortcut.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <div className="font-medium">{shortcut.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatShortcutKeys(shortcut.keys)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={shortcut.enabled ? "default" : "secondary"}>
                    {shortcut.enabled ? 'Activada' : 'Desactivada'}
                  </Badge>
                  {shortcut.id === 'createTask' && (
                    <Button size="sm" onClick={testCreateTaskShortcut}>
                      Test
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Informació del navegador */}
        <div>
          <h3 className="font-semibold mb-2">Informació del Navegador</h3>
          <div className="text-sm space-y-1">
            <div>User Agent: {navigator.userAgent}</div>
            <div>Platform: {navigator.platform}</div>
            <div>Mac detected: {/Mac|iPad|iPhone/.test(navigator.platform) ? 'Sí' : 'No'}</div>
          </div>
        </div>

        {/* Instruccions */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h4 className="font-medium mb-2">Com provar:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Obre la consola del navegador (F12)</li>
            <li>Prova la drecera Cmd/Ctrl + N</li>
            <li>Revisa els logs que comencen amb 🔍</li>
            <li>Utilitza el botó "Test" per provar manualment</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};