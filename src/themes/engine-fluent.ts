import { type ThemeEngineDefinition } from './types';
import { BASE_ENGINE_BRIDGE_CSS } from './base-bridge';

export const fluentEngine: ThemeEngineDefinition = {
  id: 'fluent',
  name: 'Fluent Glass',
  badge: 'ACRYLIC',
  description: 'Translucent multi-layer acrylic glass with backdrop blur, specular top highlights, neutral grey surfaces and electric cyan focus.',
  swatchBg: '#08090c',
  swatchSurface: '#161a23',
  swatchAccent: '#00f0ff',
  swatchAccentSecondary: '#94a3b8',
  css: `
    :root, html[data-theme="fluent"] {
      color-scheme: dark !important;

      /* Neutral Dark Grey Canvas */
      --bg-primary: #08090c;
      --bg-secondary: #0f1217;
      --bg-surface: rgba(20, 24, 32, 0.50);
      --surface-tonal: rgba(28, 34, 46, 0.60);
      --bg-surface-hover: rgba(32, 38, 52, 0.52);
      --bg-elevated: rgba(26, 31, 42, 0.55);
      --bg-modal: rgba(12, 15, 20, 0.94);
      --bg-nav: rgba(10, 13, 18, 0.82);
      --bg-input: rgba(18, 22, 30, 0.72);

      /* Authentic Acrylic Glass Parameters */
      --glass-opacity: 0.50;
      --glass-surface-bg: rgba(20, 24, 32, 0.50);
      --glass-specular-opacity: 0.50;
      --glass-inset-bg: rgba(26, 32, 44, 0.42);
      --glass-row-bg: rgba(16, 20, 28, 0.36);
      --glass-dock-bg: rgba(12, 16, 24, 0.68);
      --glass-dial-bg: rgba(16, 21, 30, 0.45);
      --glass-glow-mult: 0.60;

      /* Clean Grey & Crisp White Typography */
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --text-on-accent: #021a1f;

      /* Electric Cyan Accent */
      --accent-primary: #00f0ff;
      --accent-secondary: #38bdf8;
      --accent-soft: rgba(0, 240, 255, 0.16);
      --accent-border: rgba(0, 240, 255, 0.50);
      --accent-glow: rgba(0, 240, 255, 0.35);
      --accent-hex: #00f0ff;
      --accent-rgb: 0, 240, 255;

      /* Frosted Specular & Subtle Hairline Borders */
      --border-subtle: rgba(255, 255, 255, 0.09);
      --border-strong: rgba(255, 255, 255, 0.18);
      --border-specular: rgba(255, 255, 255, 0.28);

      --status-success: #00f0ff;
      --status-warning: #94a3b8;
      --status-danger: #f87171;

      /* Grey & Cyan Backdrop Depth */
      --app-backdrop-gradient: radial-gradient(circle at 18% 12%, rgba(0, 240, 255, 0.12) 0%, transparent 48%), radial-gradient(circle at 82% 82%, rgba(148, 163, 184, 0.06) 0%, transparent 50%);
      --surface-blur: blur(18px) saturate(140%);
      --surface-shadow: 0 10px 32px -4px rgba(0, 0, 0, 0.65);
      --surface-gradient: linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.0) 100%);
      --radius-card: 20px;
      --radius-pill: 9999px;
      --radius-btn: 14px;

      /* Backwards compatible tokens */
      --zero-bg-primary: #08090c;
      --zero-surface-1: rgba(20, 24, 32, 0.60);
      --zero-surface-2: rgba(26, 31, 42, 0.75);
      --zero-surface-3: rgba(30, 36, 48, 0.70);
      --zero-border: rgba(255, 255, 255, 0.09);
      --zero-ink-primary: #f8fafc;
      --zero-ink-muted: #94a3b8;
      --zero-accent: #00f0ff;
      --zero-dial-stroke: #00f0ff;
      --liquid-accent-glow: rgba(0, 240, 255, 0.35);
      --liquid-accent-soft-glow: rgba(0, 240, 255, 0.16);
      --liquid-accent-vibrant: #00f0ff;
      --liquid-accent-tint: #38bdf8;
      --liquid-surface-blur: 18px;
    }
    ${BASE_ENGINE_BRIDGE_CSS}
  `,
};
