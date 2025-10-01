import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  isPWA?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export class PWAErrorBoundary extends Component<Props, State> {
  private errorLog: Array<{ error: Error; timestamp: Date }> = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to storage for PWA debugging
    this.errorLog.push({ error, timestamp: new Date() });
    
    try {
      const logEntry = {
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        isPWA: this.props.isPWA,
        displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser'
      };
      
      localStorage.setItem('pwa_last_error', JSON.stringify(logEntry));
      
      const existingLogs = localStorage.getItem('pwa_error_log');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(logEntry);
      localStorage.setItem('pwa_error_log', JSON.stringify(logs.slice(-10)));
    } catch (e) {
      console.error('Failed to log error:', e);
    }

    this.setState(prev => ({
      errorInfo,
      errorCount: prev.errorCount + 1
    }));
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleEmergencyReset = async () => {
    try {
      // Clear all caches
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(name => caches.delete(name)));
      }

      // Unregister service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }

      // Clear storage
      localStorage.clear();
      sessionStorage.clear();

      // Reload
      window.location.href = window.location.origin;
    } catch (e) {
      console.error('Emergency reset failed:', e);
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDev = import.meta.env.DEV;

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                {this.props.isPWA ? 'PWA Error Detected' : 'Application Error'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The application encountered an error. This has been logged for debugging.
              </p>

              {isDev && this.state.error && (
                <div className="bg-destructive/10 p-3 rounded text-xs font-mono overflow-auto max-h-32">
                  {this.state.error.toString()}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button onClick={this.handleReset} variant="default" className="w-full">
                  Try Again
                </Button>
                
                <Button 
                  onClick={this.handleEmergencyReset} 
                  variant="outline" 
                  className="w-full"
                >
                  Emergency Reset (Clear All Data)
                </Button>

                {this.props.isPWA && (
                  <Button 
                    onClick={() => window.open(window.location.origin, '_blank')} 
                    variant="secondary" 
                    className="w-full"
                  >
                    Open in Browser
                  </Button>
                )}
              </div>

              {this.state.errorCount > 2 && (
                <p className="text-xs text-muted-foreground text-center">
                  Multiple errors detected. Consider using Emergency Reset.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
