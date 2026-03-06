'use client';

import { Wrench } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '360px', margin: '0 auto' }}>
            {/* Icon */}
            <div
              style={{
                width: 72,
                height: 72,
                backgroundColor: '#F5F5F5',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}
            >
              <Wrench style={{ width: 36, height: 36, color: '#DB021D' }} strokeWidth={1.5} />
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: 22,
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                color: '#1A1A1A',
                marginBottom: 12,
              }}
            >
              Erreur critique
            </h1>

            {/* Message */}
            <p
              style={{
                color: '#6B7280',
                fontSize: 14,
                lineHeight: 1.6,
                marginBottom: 32,
              }}
            >
              Une erreur inattendue est survenue. Veuillez recharger la page.
            </p>

            {/* Reset button */}
            <button
              onClick={reset}
              style={{
                backgroundColor: '#DB021D',
                color: '#ffffff',
                border: 'none',
                borderRadius: 12,
                padding: '12px 28px',
                fontSize: 13,
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
              }}
            >
              Recharger la page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
