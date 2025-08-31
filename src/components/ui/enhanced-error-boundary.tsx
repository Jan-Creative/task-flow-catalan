import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Bug, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  context?: string; // Context específic per debugejar millor
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  allowNavigation?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: '',
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { 
      hasError: true, 
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    const context = this.props.context || 'Unknown';
    console.group(`🚨 Error capturado en ${context}`);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // Log estructurat per analytics
    const errorReport = {
      id: this.state.errorId,
      context,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Cridar callback personalitzat si existeix
    this.props.onError?.(error, errorInfo);
    
    // TODO: Enviar a servei de monitorització
    if (process.env.NODE_ENV === 'production') {
      // Aquí podríem enviar l'error a Sentry, LogRocket, etc.
      console.warn('Error report ready for monitoring service:', errorReport);
    }
  }

  private handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: ''
    });
  };

  private handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const context = this.props.context;
      const isProductionError = !this.props.showDetails && process.env.NODE_ENV === 'production';

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle>
                {context ? `Error en ${context}` : 'Alguna cosa ha anat malament'}
              </CardTitle>
              <CardDescription>
                S'ha produït un error inesperat. Pots intentar les següents opcions:
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Error details (només en development o si showDetails=true) */}
              {(this.props.showDetails || process.env.NODE_ENV === 'development') && this.state.error && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                    <Bug className="h-4 w-4" />
                    Detalls de l'error
                  </div>
                  
                  <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-md">
                    <p className="text-sm font-mono text-destructive mb-2">
                      {this.state.error.message}
                    </p>
                    
                    {this.state.error.stack && (
                      <details className="text-xs text-muted-foreground">
                        <summary className="cursor-pointer hover:text-foreground">
                          Stack trace
                        </summary>
                        <pre className="mt-2 p-2 bg-muted/50 rounded text-xs overflow-auto max-h-32">
                          {this.state.error.stack}
                        </pre>
                      </details>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    ID d'error: <code className="px-1 py-0.5 bg-muted rounded">{this.state.errorId}</code>
                  </div>
                </div>
              )}

              {isProductionError && (
                <div className="p-3 bg-muted/50 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    ID d'error: <code className="px-1 py-0.5 bg-muted rounded">{this.state.errorId}</code>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Proporciona aquest ID si contactes amb suport tècnic.
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button onClick={this.handleRetry} className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tornar a intentar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                    className="flex-1"
                  >
                    Recarregar pàgina
                  </Button>
                </div>
                
                {this.props.allowNavigation && (
                  <Button 
                    variant="ghost" 
                    onClick={this.handleGoBack}
                    className="w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Tornar enrere
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC per context específics
export const withErrorBoundary = (
  WrappedComponent: React.ComponentType<any>,
  context: string,
  options: Partial<Props> = {}
) => {
  const WithErrorBoundaryComponent = (props: any) => (
    <EnhancedErrorBoundary context={context} {...options}>
      <WrappedComponent {...props} />
    </EnhancedErrorBoundary>
  );
  
  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithErrorBoundaryComponent;
};

// Error boundaries específics per context
export const TaskErrorBoundary = ({ children }: { children: ReactNode }) => (
  <EnhancedErrorBoundary context="Gestió de Tasques" allowNavigation>
    {children}
  </EnhancedErrorBoundary>
);

export const CalendarErrorBoundary = ({ children }: { children: ReactNode }) => (
  <EnhancedErrorBoundary context="Calendari" allowNavigation>
    {children}
  </EnhancedErrorBoundary>
);

export const NotificationErrorBoundary = ({ children }: { children: ReactNode }) => (
  <EnhancedErrorBoundary context="Notificacions" showDetails={false}>
    {children}
  </EnhancedErrorBoundary>
);