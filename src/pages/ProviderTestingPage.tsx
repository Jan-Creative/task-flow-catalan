/**
 * FASE 7: Provider Testing Page
 * Interactive testing interface for all provider scenarios
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Play,
  RotateCcw,
  FileText,
  Activity,
  Zap,
  Shield,
  Database
} from 'lucide-react';
import { useProviderStatus } from '@/contexts/ProviderStatusContext';

interface TestScenario {
  id: string;
  title: string;
  description: string;
  url: string;
  expected: string[];
  icon: React.ReactNode;
  severity: 'info' | 'warning' | 'critical';
}

export const ProviderTestingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const { getMountedProviders, getFailedProviders, getDisabledProviders } = useProviderStatus();

  const testScenarios: TestScenario[] = [
    {
      id: 'all-disabled',
      title: 'Test 1: Tots els Providers Desactivats',
      description: 'Verifica que l\'app funciona sense cap provider',
      url: '/?disable=Security,Background,PropertyDialog,KeyboardShortcuts,UnifiedTask,Notification,Offline,Pomodoro,KeyboardNavigation,MacNavigation,IPadNavigation',
      expected: [
        'App renderitza sense pantalles negres',
        'Tots els providers mostren estat "disabled"',
        'Funcionalitat bàsica disponible'
      ],
      icon: <XCircle className="h-5 w-5" />,
      severity: 'critical'
    },
    {
      id: 'unified-task-disabled',
      title: 'Test 2: UnifiedTask Desactivat',
      description: 'Simula Supabase down - només deshabilita UnifiedTask',
      url: '/?disable=UnifiedTask',
      expected: [
        'Empty task context actiu',
        'Features de tasques no disponibles',
        'Resta de l\'app funciona correctament'
      ],
      icon: <Database className="h-5 w-5" />,
      severity: 'warning'
    },
    {
      id: 'notification-disabled',
      title: 'Test 3: Notification Desactivat',
      description: 'Simula permissions de notificacions denegades',
      url: '/?disable=Notification',
      expected: [
        'Empty notification context actiu',
        'Notificacions no disponibles',
        'Resta de l\'app funciona correctament'
      ],
      icon: <AlertTriangle className="h-5 w-5" />,
      severity: 'warning'
    },
    {
      id: 'phase-1-only',
      title: 'Test 4: Només Phase 1',
      description: 'Carrega només providers crítics (Security, Background)',
      url: '/?maxPhase=1',
      expected: [
        'Només 2 providers mounted',
        'App amb funcionalitat mínima',
        'Performance òptim'
      ],
      icon: <Zap className="h-5 w-5" />,
      severity: 'info'
    },
    {
      id: 'phase-2-only',
      title: 'Test 5: Phase 1 + 2',
      description: 'Carrega providers crítics + UI',
      url: '/?maxPhase=2',
      expected: [
        'Phase 1-2 providers mounted',
        'UI interactiva disponible',
        'Data providers no carregats'
      ],
      icon: <Activity className="h-5 w-5" />,
      severity: 'info'
    },
    {
      id: 'boot-debug',
      title: 'Test 6: Boot Diagnostics',
      description: 'Mostra overlay de diagnòstic de boot',
      url: '/?bootDebug=true',
      expected: [
        'BootDiagnosticsOverlay visible',
        'Timing de cada phase mostrat',
        'Performance metrics disponibles'
      ],
      icon: <FileText className="h-5 w-5" />,
      severity: 'info'
    }
  ];

  const runTest = (scenario: TestScenario) => {
    setCurrentTest(scenario.id);
    // Navigate to the test URL
    window.location.href = scenario.url;
  };

  const resetApp = () => {
    window.location.href = '/';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'default';
      default:
        return 'secondary';
    }
  };

  // Current status
  const mounted = getMountedProviders();
  const failed = getFailedProviders();
  const disabled = getDisabledProviders();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Provider Testing Suite
        </h1>
        <p className="text-muted-foreground mt-2">
          Test exhaustiu del sistema de providers refactoritzat (Fase 1-7)
        </p>
      </div>

      {/* Current Status */}
      <Alert>
        <Activity className="h-4 w-4" />
        <AlertTitle>Estat Actual del Sistema</AlertTitle>
        <AlertDescription className="mt-2">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-sm">
                {mounted.length} Providers Actius
              </span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm">
                {failed.length} Providers Fallats
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm">
                {disabled.length} Providers Desactivats
              </span>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Test Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testScenarios.map((scenario) => (
          <Card key={scenario.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {scenario.icon}
                  <CardTitle className="text-lg">{scenario.title}</CardTitle>
                </div>
                <Badge variant={getSeverityColor(scenario.severity) as any}>
                  {scenario.severity}
                </Badge>
              </div>
              <CardDescription>{scenario.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Resultats Esperats:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {scenario.expected.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3 w-3 mt-1 text-success" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => runTest(scenario)}
                  className="flex-1"
                  variant={currentTest === scenario.id ? 'secondary' : 'default'}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Executar Test
                </Button>
              </div>
              
              <div className="text-xs font-mono bg-muted p-2 rounded overflow-x-auto">
                {scenario.url}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Accions del Sistema</CardTitle>
          <CardDescription>
            Eines addicionals per testing i diagnòstic
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            onClick={resetApp}
            variant="outline"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset App (Estat Normal)
          </Button>
          
          <Button
            onClick={() => navigate('/settings?debug=providers')}
            variant="outline"
          >
            <Activity className="h-4 w-4 mr-2" />
            Provider Dashboard
          </Button>
          
          <Button
            onClick={() => window.open('/PROVIDER_TESTING_GUIDE.md', '_blank')}
            variant="outline"
          >
            <FileText className="h-4 w-4 mr-2" />
            Guia de Testing
          </Button>
        </CardContent>
      </Card>

      {/* Documentation Link */}
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertTitle>Documentació Completa</AlertTitle>
        <AlertDescription>
          Consulta <code>PROVIDER_TESTING_GUIDE.md</code> per instruccions detallades de cada test,
          validacions de performance, i escenaris de fallada crítics.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ProviderTestingPage;
