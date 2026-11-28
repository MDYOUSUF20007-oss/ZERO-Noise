import { type ThemeEngineDefinition } from './types';
import { BASE_ENGINE_BRIDGE_CSS } from './base-bridge';

export const fluentEngine: ThemeEngineDefinition = {
  id: 'fluent',
  name: 'Fluent Glass',
  badge: 'LIQUID',
  description: 'Apple VisionOS-inspired translucent silicate glass with Fresnel grazing rims, optical refraction vibrancy, neutral dark slate surfaces and tactile liquid controls.',
  swatchBg: '#08090c',
  swatchSurface: '#161b26',
  swatchAccent: '#f43f5e',
  swatchAccentSecondary: '#e2e8f0',
  css: `
    :root, html[data-theme="fluent"] {
      color-scheme: dark !important;

      /* Deep Silicate Night Canvas */
      --bg-primary: #08090c;
      --bg-secondary: #0f1219;
      --bg-surface: rgba(18, 22, 32, 0.385);
      --surface-tonal: rgba(26, 32, 46, 0.44);
      --bg-surface-hover: rgba(30, 38, 54, 0.41);
      --bg-elevated: rgba(24, 30, 44, 0.44);
      --bg-modal: rgba(11, 14, 22, 0.84);
      --bg-nav: rgba(10, 14, 22, 0.72);
      --bg-input: rgba(16, 20, 30, 0.72);

      /* Apple VisionOS Optical Liquid Glass Tokens */
      --glass-opacity: 0.50;
      --glass-surface-bg: rgba(18, 22, 32, 0.385);
      --glass-specular-opacity: 0.525;
      --glass-fresnel-top: rgba(255, 255, 255, 0.27);
      --glass-fresnel-edge: rgba(255, 255, 255, 0.125);
      --glass-fresnel-bottom: rgba(255, 255, 255, 0.06);
      --glass-sheen-top: rgba(255, 255, 255, 0.10);
      --glass-sheen-mid: rgba(196, 220, 255, 0.033);
      --glass-inset-bg: rgba(24, 30, 44, 0.38);
      --glass-row-bg: rgba(15, 19, 28, 0.30);
      --glass-dock-bg: rgba(12, 16, 26, 0.59);
      --glass-dock-blur: blur(21px) saturate(188%) brightness(1.05);
      --glass-dial-bg: rgba(14, 18, 28, 0.44);
      --glass-pill-bg: rgba(255, 255, 255, 0.075);
      --glass-pill-hover-bg: rgba(255, 255, 255, 0.13);
      --glass-glow-mult: 0.58;
      --glass-modal-bg: rgba(11, 14, 22, 0.84);
      --glass-modal-blur: blur(24px) saturate(190%) brightness(1.04);

      /* High-Legibility Optical Typography */
      --text-primary: #f8fafc;
      --text-secondary: #cbd5e1;
      --text-muted: #94a3b8;
      --text-on-accent: #ffffff;

      /* Rose Coral & Radiant Liquid Accent */
      --accent-primary: #f43f5e;
      --accent-secondary: #fb7185;
      --accent-soft: rgba(244, 63, 94, 0.18);
      --accent-border: rgba(244, 63, 94, 0.55);
      --accent-glow: rgba(244, 63, 94, 0.40);
      --accent-hex: #f43f5e;
      --accent-rgb: 244, 63, 94;

      /* Fresnel & Grazing Edge Borders */
      --border-subtle: rgba(255, 255, 255, 0.105);
      --border-strong: rgba(255, 255, 255, 0.22);
      --border-specular: rgba(255, 255, 255, 0.24);

      --status-success: #10b981;
      --status-warning: #cbd5e1;
      --status-danger: #f87171;

      /* Liquid Glass Backdrop Depth */
      --app-backdrop-gradient: radial-gradient(circle at 18% 12%, rgba(244, 63, 94, 0.14) 0%, transparent 48%), radial-gradient(circle at 82% 82%, rgba(148, 163, 184, 0.08) 0%, transparent 50%);
      --surface-blur: blur(19px) saturate(172%) brightness(1.05);
      --surface-shadow: 0 14px 36px -10px rgba(0, 0, 0, 0.60);
      --surface-gradient: linear-gradient(155deg, rgba(255, 255, 255, 0.10) 0%, rgba(196, 220, 255, 0.03) 38%, rgba(8, 10, 16, 0.14) 100%);
      --radius-card: 22px;
      --radius-pill: 9999px;
      --radius-btn: 14px;

      /* Backwards compatible tokens */
      --zero-bg-primary: #08090c;
      --zero-surface-1: rgba(18, 22, 32, 0.52);
      --zero-surface-2: rgba(24, 30, 44, 0.70);
      --zero-surface-3: rgba(30, 36, 52, 0.70);
      --zero-border: rgba(255, 255, 255, 0.10);
      --zero-ink-primary: #f8fafc;
      --zero-ink-muted: #cbd5e1;
      --zero-accent: #f43f5e;
      --zero-dial-stroke: #f43f5e;
      --liquid-accent-glow: rgba(244, 63, 94, 0.40);
      --liquid-accent-soft-glow: rgba(244, 63, 94, 0.18);
      --liquid-accent-vibrant: #f43f5e;
      --liquid-accent-tint: #fb7185;
      --liquid-surface-blur: 19px;
    }
    ${BASE_ENGINE_BRIDGE_CSS}
  `,
};
