import React, { memo } from 'react';
import { useInterfaceStyle } from '../context/interfaceStyleStore';

/**
 * GPU-Optimized Ambient Drift Background
 * Fluent Glass: Deep obsidian canvas with 2 pre-feathered radial mesh layers
 * (zero heavy blur shaders — pure transform: translate3d GPU compositing).
 * Aero: Warm porcelain canvas.
 * Dusk: Deep twilight canvas.
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
      style={{ contain: 'strict' }}
    >
      {/* Layer 1: Primary Accent Atmospheric Drift (pre-feathered gradient — 0 blur-filter cost) */}
      <div
        className="ambient-mesh-node-1 absolute -top-36 -left-28 w-[540px] h-[540px] sm:w-[700px] sm:h-[700px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 46% 46%, var(--accent-soft, rgba(244, 63, 94, 0.22)) 0%, rgba(var(--accent-rgb, 244, 63, 94), 0.10) 34%, rgba(var(--accent-rgb, 244, 63, 94), 0.03) 56%, transparent 74%)',
          opacity: 'calc(var(--ambient-glow-opacity, 0.35) * 1.45)',
        }}
      />
      {/* Layer 2: Secondary Cool Slate Counterbalance Drift */}
      <div
        className="ambient-mesh-node-2 absolute -bottom-40 -right-28 w-[500px] h-[500px] sm:w-[640px] sm:h-[640px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 60% 60%, rgba(148, 163, 184, 0.14) 0%, rgba(99, 102, 241, 0.07) 36%, rgba(15, 23, 42, 0.03) 58%, transparent 74%)',
          opacity: 'calc(var(--ambient-glow-opacity, 0.35) * 1.25)',
        }}
      />
    </div>
  );
});

AmbientBackground.displayName = 'AmbientBackground';
