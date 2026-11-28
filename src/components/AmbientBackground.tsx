import React, { memo } from 'react';
import { useInterfaceStyle } from '../context/interfaceStyleStore';

/**
 * Background Canvas:
 * - Material Dusk (Day / Porcelain): Warm Porcelain #F3EDE8 M3 surface
 * - Material Dusk (Night / Twilight): Deep Twilight #24283F M3 surface
 * - Fluent Glass: Deep obsidian canvas with 2 GPU-optimized radial mesh layers
 */
export const AmbientBackground: React.FC = memo(() => {
  const { isMaterial, materialMode, isAero, isDusk } = useInterfaceStyle();

  if (isMaterial || isAero || isDusk) {
    const isLight = isMaterial ? materialMode === 'light' : isAero;
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 pointer-events-none transition-colors duration-200"
        style={{
          backgroundColor: isLight ? '#F3EDE8' : '#24283F',
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
      {/* Layer 1: Primary Accent Atmospheric Drift (pre-feathered gradient — 0 blur-filter cost) */}
      <div
        className="ambient-mesh-node-1 absolute -top-36 -left-28 w-[560px] h-[560px] sm:w-[740px] sm:h-[740px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 46% 46%, var(--accent-soft, rgba(244, 63, 94, 0.22)) 0%, rgba(var(--accent-rgb, 244, 63, 94), 0.12) 34%, rgba(var(--accent-rgb, 244, 63, 94), 0.04) 56%, transparent 74%)',
          opacity: 'calc(var(--ambient-glow-opacity, 0.35) * 1.60)',
        }}
      />
      {/* Layer 2: Secondary Cool Silicate Counterbalance Drift */}
      <div
        className="ambient-mesh-node-2 absolute -bottom-40 -right-28 w-[520px] h-[520px] sm:w-[680px] sm:h-[680px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 58% 58%, rgba(186, 210, 255, 0.14) 0%, rgba(99, 102, 241, 0.09) 36%, rgba(15, 23, 42, 0.04) 58%, transparent 74%)',
          opacity: 'calc(var(--ambient-glow-opacity, 0.35) * 1.35)',
        }}
      />
      {/* Layer 3: Center Optical Specular Halo behind dial & frosted cards */}
      <div
        className="ambient-mesh-node-3 absolute top-1/3 left-1/2 -translate-x-1/2 w-[420px] h-[420px] sm:w-[520px] sm:h-[520px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.07) 0%, rgba(var(--accent-rgb, 244, 63, 94), 0.07) 38%, transparent 72%)',
          opacity: 'calc(var(--ambient-glow-opacity, 0.35) * 1.15)',
        }}
      />
    </div>
  );
});

AmbientBackground.displayName = 'AmbientBackground';
