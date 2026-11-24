import React, { memo } from 'react';
import { useInterfaceStyle } from '../context/InterfaceStyleContext';

/**
 * Ambient Background (Minimalist Solid Material Canvas)
 * Pure solid Warm Porcelain (Day) & Deep Twilight (Night) with zero gradient or orb overhead.
 */
export const AmbientBackground: React.FC = memo(() => {
  const { isAero } = useInterfaceStyle();

  if (isAero) {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundColor: '#F3EDE8',
          contain: 'strict',
        }}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        backgroundColor: '#24283F',
        contain: 'strict',
      }}
    />
  );
});

AmbientBackground.displayName = 'AmbientBackground';
