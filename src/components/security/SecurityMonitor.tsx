/**
 * Security Monitoring Component - Shows security status in development
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useSecurity } from '@/contexts/SecurityContext';
import { config } from '@/config/appConfig';

export const SecurityMonitor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { isSecure, securityIssues, rateLimitStatus, refreshSecurityStatus } = useSecurity();

  useEffect(() => {
    // Only show in development
    if (config.environment.NODE_ENV !== 'development') return;

    // Show/hide with keyboard shortcut
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        setIsVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  if (config.environment.NODE_ENV !== 'development' || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-80">
      <Card className="bg-background/95 backdrop-blur border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security Monitor
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              <EyeOff className="h-3 w-3" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3 pt-0">
          {/* Security Status */}
          <div className="flex items-center gap-2">
            <Badge variant={isSecure ? 'default' : 'destructive'} className="text-xs">
              {isSecure ? 'Secure' : 'Issues Detected'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshSecurityStatus}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>

          {/* Security Issues */}
          {securityIssues.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Security Issues:
              </div>
              <div className="max-h-20 overflow-y-auto space-y-1">
                {securityIssues.map((issue, index) => (
                  <div key={index} className="text-xs text-muted-foreground p-1 bg-destructive/10 rounded">
                    {issue}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rate Limit Status */}
          {rateLimitStatus && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Rate Limit:</div>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant={rateLimitStatus.allowed ? 'default' : 'destructive'} className="text-xs">
                  {rateLimitStatus.allowed ? 'OK' : 'Limited'}
                </Badge>
                <span className="text-muted-foreground">
                  {rateLimitStatus.remaining} remaining
                </span>
              </div>
            </div>
          )}

          {/* Configuration Status */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">Configuration:</div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs px-1 py-0">
                  {config.environment.NODE_ENV}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs px-1 py-0">
                  {config.environment.BUILD_MODE}
                </Badge>
              </div>
            </div>
          </div>

          {/* Feature Flags */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">Features:</div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(config.features)
                .filter(([, enabled]) => enabled)
                .map(([feature]) => (
                  <Badge key={feature} variant="secondary" className="text-xs px-1 py-0">
                    {feature.replace('enable', '').replace(/([A-Z])/g, ' $1').trim()}
                  </Badge>
                ))}
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            Press Ctrl+Shift+S to toggle
          </div>
        </CardContent>
      </Card>
    </div>
  );
};