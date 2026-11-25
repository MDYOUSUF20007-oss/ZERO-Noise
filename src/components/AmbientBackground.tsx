import React, { memo } from 'react';
import { useInterfaceStyle } from '../context/interfaceStyleStore';

/**
 * Ambient Background Mesh
 * Fluent Glass: Deep charcoal/obsidian canvas with luminous active accent drift,
 * deep slate foundation, and a delicate floating harmonic core.
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
      {/* Node 1: Primary Celestial Anchor (Upper Left / Dynamic Theme Accent) */}
      <div
        className="ambient-mesh-node-1 absolute -top-32 -left-28 w-[520px] h-[520px] sm:w-[680px] sm:h-[680px] rounded-full pointer-events-none blur-3xl sm:blur-[80px]"
        style={{
          background:
            'radial-gradient(circle at 45% 45%, var(--accent-primary, #f43f5e) 0%, var(--accent-soft, rgba(244, 63, 94, 0.18)) 35%, transparent 72%)',
          opacity: 'calc(var(--ambient-glow-opacity, 0.35) * 0.95)',
        }}
      />
      {/* Node 2: Deep Slate / Cosmic Atmospheric Depth (Lower Right Corner) */}
      <div
        className="ambient-mesh-node-2 absolute -bottom-36 -right-28 w-[480px] h-[480px] sm:w-[600px] sm:h-[600px] rounded-full pointer-events-none blur-3xl sm:blur-[70px]"
        style={{
          background:
            'radial-gradient(circle at 75% 75%, rgba(148, 163, 184, 0.14) 0%, rgba(99, 102, 241, 0.06) 42%, transparent 70%)',
          opacity: 'var(--ambient-glow-opacity, 0.35)',
        }}
      />
      {/* Node 3: Ethereal Harmonic Floating Core (Center-Right Specular Respiration) */}
      <div
        className="ambient-mesh-node-3 absolute top-1/3 -right-20 w-[360px] h-[360px] rounded-full pointer-events-none blur-3xl sm:blur-[60px]"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, var(--accent-soft, rgba(244, 63, 94, 0.12)) 0%, rgba(255, 255, 255, 0.03) 45%, transparent 68%)',
          opacity: 'calc(var(--ambient-glow-opacity, 0.35) * 0.75)',
        }}
      />
    </div>
  );
});

AmbientBackground.displayName = 'AmbientBackground';
