import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ 
          minHeight: '100vh', 
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            backgroundColor: '#2a2a2a',
            borderRadius: '8px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid #3a3a3a'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <AlertTriangle style={{ 
                height: '48px', 
                width: '48px', 
                color: '#ef4444',
                margin: '0 auto 1rem'
              }} />
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Error de l'aplicació
              </h1>
              <p style={{ color: '#9ca3af' }}>
                S'ha produït un error inesperat. Si us plau, intenta recarregar la pàgina.
              </p>
            </div>
            
            {this.state.error && (
              <div style={{
                backgroundColor: '#1a1a1a',
                padding: '1rem',
                borderRadius: '4px',
                marginBottom: '1.5rem',
                border: '1px solid #3a3a3a'
              }}>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: '#d1d5db',
                  fontFamily: 'monospace',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error.message}
                </p>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={this.handleRetry}
                style={{
                  flex: 1,
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Tornar a intentar
              </button>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  flex: 1,
                  backgroundColor: '#374151',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  border: '1px solid #4b5563',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Recarregar pàgina
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}