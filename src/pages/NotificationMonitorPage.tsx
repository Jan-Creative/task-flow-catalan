/**
 * Pàgina de monitorització del sistema de notificacions
 * Accessible des de configuració per debugar i monitoritzar
 */

import React from 'react';
import { NotificationMonitor } from '@/components/notifications/NotificationMonitor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const NotificationMonitorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Tornar a Configuració
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="h-8 w-8" />
            Monitor de Notificacions
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitorització en temps real del sistema centralitzat de notificacions
          </p>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Sistema Centralitzat de Notificacions</CardTitle>
          <CardDescription>
            Aquest monitor mostra l'estat en temps real del nou sistema centralitzat que gestiona 
            totes les notificacions de l'aplicació de manera unificada i robusta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Característiques</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Gestió centralitzada</li>
                <li>• Sistema de cua amb prioritats</li>
                <li>• Reintents automàtics</li>
                <li>• Circuit breaker</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Monitorització</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Estat del sistema en temps real</li>
                <li>• Estadístiques de rendiment</li>
                <li>• Historial d'events</li>
                <li>• Contingut de la cua</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Debugging</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Logs detallats</li>
                <li>• Tracking de fallades</li>
                <li>• Correlation IDs</li>
                <li>• Health checks</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monitor Component */}
      <NotificationMonitor />
    </div>
  );
};