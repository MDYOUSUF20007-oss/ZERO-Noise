import React, { memo } from 'react';
import { useInterfaceStyle } from '../context/InterfaceStyleContext';

/**
 * Ambient Background Mesh (Strict 3-Color Ceramic & Twilight Core)
 * Warm Porcelain (Day) & Twilight Dusk (Night) soft low-fatigue glows.
 */
export const AmbientBackground: React.FC = memo(() => {
  const { isAero } = useInterfaceStyle();

  if (isAero) {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #F3EDE8 0%, #EDE6DF 40%, #F8F4F0 100%)',
          contain: 'strict',
        }}
      >
        {/* Soft Porcelain Surface Light (Upper Left) */}
        <div
          className="absolute -top-16 -left-12 w-[480px] h-[480px] rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 40% 40%, rgba(248, 244, 240, 0.95) 0%, rgba(243, 237, 232, 0.50) 45%, transparent 72%)',
            filter: 'blur(36px)',
          }}
        />
        {/* Soothing Sunset Peach Depth (Lower Right) */}
        <div
          className="absolute -bottom-24 -right-20 w-[440px] h-[440px] rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 75% 75%, rgba(230, 159, 134, 0.14) 0%, rgba(243, 237, 232, 0.20) 45%, transparent 70%)',
            filter: 'blur(48px)',
          }}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #24283F 0%, #1E2135 40%, #2C314C 100%)',
        contain: 'strict',
      }}
    >
      {/* Twilight Indigo Anchor (Upper Left) */}
      <div
        className="absolute -top-28 -left-24 w-[480px] h-[480px] sm:w-[620px] sm:h-[620px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 45% 45%, rgba(53, 59, 91, 0.40) 0%, rgba(36, 40, 63, 0.20) 45%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      {/* Soothing Sunset Peach Glow (Lower Right) */}
      <div
        className="absolute -bottom-28 -right-24 w-[460px] h-[460px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 75% 75%, rgba(230, 159, 134, 0.15) 0%, transparent 65%)',
          filter: 'blur(44px)',
        }}
      />
    </div>
  );
});

AmbientBackground.displayName = 'AmbientBackground';
