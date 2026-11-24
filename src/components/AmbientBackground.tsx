import React, { memo } from 'react';
import { useInterfaceStyle } from '../context/InterfaceStyleContext';

/**
 * Ambient Background Mesh
 * Fluent Glass: Deep charcoal grey canvas with luminous cyan celestial glow & slate depth.
 * Aero: Solid porcelain canvas.
 * Dusk: Solid twilight canvas.
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
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#08090c] zero-ambient-canvas"
      style={{ contain: 'strict' }}
    >
      {/* Node 1: Celestial Cyan Anchor (Upper Left Corner) */}
      <div
        className="ambient-mesh-node-1 absolute -top-28 -left-24 w-[480px] h-[480px] sm:w-[620px] sm:h-[620px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 45% 45%, var(--accent-primary, #00f0ff) 0%, var(--accent-soft, rgba(0, 240, 255, 0.16)) 32%, transparent 70%)',
          opacity: 'calc(var(--ambient-glow-opacity, 0.35) * 0.90)',
        }}
      />
      {/* Node 2: Slate Grey Ambient Depth (Lower Right Corner) */}
      <div
        className="ambient-mesh-node-2 absolute -bottom-28 -right-24 w-[460px] h-[460px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 75% 75%, rgba(148, 163, 184, 0.10) 0%, transparent 65%)',
          opacity: 'var(--ambient-glow-opacity, 0.35)',
        }}
      />
    </div>
  );
});

AmbientBackground.displayName = 'AmbientBackground';
