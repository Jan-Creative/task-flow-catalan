import React, { useEffect, useState } from 'react';
import { useProviderStatus } from '@/contexts/ProviderStatusContext';

/**
 * FASE 1: Diagnosis Overlay - Visual feedback for provider mounting
 * Activat amb /?diagnosis=1
 */
export const DiagnosisOverlay: React.FC = () => {
  const { providers } = useProviderStatus();
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mounted':
        return 'bg-emerald-500';
      case 'loading':
        return 'bg-amber-500 animate-pulse';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mounted':
        return '✅';
      case 'loading':
        return '⏳';
      case 'failed':
        return '❌';
      default:
        return '⚪';
    }
  };

  const sortedProviders = Object.entries(providers).sort(
    ([, a], [, b]) => a.phase - b.phase
  );

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        maxWidth: '400px',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: 'rgba(0, 0, 0, 0.95)',
        color: '#fff',
        padding: '16px',
        fontFamily: 'ui-monospace, monospace',
        fontSize: '12px',
        borderRadius: '8px',
        zIndex: 2147483647,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div style={{ marginBottom: '12px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
          🔍 Mode Diagnosis
        </div>
        <div style={{ opacity: 0.7, fontSize: '11px' }}>
          Temps transcorregut: {(elapsed / 1000).toFixed(2)}s
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sortedProviders.map(([name, info]) => (
          <div
            key={name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '4px',
              borderLeft: `3px solid ${
                info.status === 'mounted'
                  ? '#10b981'
                  : info.status === 'loading'
                  ? '#f59e0b'
                  : '#ef4444'
              }`,
            }}
          >
            <div style={{ fontSize: '16px' }}>{getStatusIcon(info.status)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                {name}
              </div>
              <div style={{ fontSize: '10px', opacity: 0.7 }}>
                Fase {info.phase} •{' '}
                {info.mountTime ? `${info.mountTime.toFixed(0)}ms` : 'Carregant...'}
              </div>
              {info.error && (
                <div
                  style={{
                    fontSize: '10px',
                    color: '#fca5a5',
                    marginTop: '4px',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  Error: {info.error.message}
                </div>
              )}
            </div>
            <div
              className={getStatusColor(info.status)}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
              }}
            />
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: '12px',
          paddingTop: '8px',
          borderTop: '1px solid #333',
          fontSize: '10px',
          opacity: 0.5,
        }}
      >
        Total providers: {sortedProviders.length} •{' '}
        {sortedProviders.filter(([, p]) => p.status === 'mounted').length} muntats
      </div>
    </div>
  );
};
