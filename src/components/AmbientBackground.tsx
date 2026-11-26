import React, { memo } from 'react';
import { useInterfaceStyle } from '../context/interfaceStyleStore';

/**
 * Clean Tinted Canvas Background
 * Neutral surface foundation tinted subtly to each theme's world — zero floating blobs or neon glow clutter.
 */
export const AmbientBackground: React.FC = memo(() => {
  const { isAero, isDusk } = useInterfaceStyle();

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

  if (isDusk) {
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
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#090A0E] zero-ambient-canvas"
      style={{
        contain: 'strict',
        backgroundImage:
          'radial-gradient(ellipse 80% 45% at 50% 0%, rgba(255, 255, 255, 0.035) 0%, transparent 70%)',
      }}
    />
  );
});

AmbientBackground.displayName = 'AmbientBackground';
