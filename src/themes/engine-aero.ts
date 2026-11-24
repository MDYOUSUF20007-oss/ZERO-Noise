import { type ThemeEngineDefinition } from './types';

export const aeroEngine: ThemeEngineDefinition = {
  id: 'aero',
  name: 'Aero Porcelain',
  badge: 'WARM MATTE',
  description: 'Calm, low-fatigue Warm Porcelain canvas with Twilight Indigo structure and soothing Sunset Peach focus accents.',
  swatchBg: '#F3EDE8',
  swatchSurface: '#F8F4F0',
  swatchAccent: '#E69F86',
  swatchAccentSecondary: '#353B5B',
  css: `
    :root, html[data-theme="aero"], html[data-interface-style="aero"] {
      color-scheme: light !important;

      /* 60% Canvas: Warm Porcelain (#F3EDE8) */
      --bg-primary: #F3EDE8;
      --bg-secondary: #EBE4DD;
      --bg-surface: #F8F4F0;
      --surface-tonal: #EDE6DF;
      --bg-surface-hover: #E8E0D7;
      --bg-elevated: #F8F4F0;
      --bg-modal: #F8F4F0;
      --bg-nav: #F8F4F0;
      --bg-input: #EDE6DF;

      --glass-opacity: 0.94;
      --glass-surface-bg: rgba(248, 244, 240, 0.90);
      --glass-specular-opacity: 0.90;
      --glass-inset-bg: #EDE6DF;
      --glass-row-bg: #EFE8E1;
      --glass-dock-bg: #F8F4F0;
      --glass-dial-bg: rgba(248, 244, 240, 0.92);
      --glass-glow-mult: 0.15;

      /* 30% Ink & Structure: Twilight Indigo (#353B5B) */
      --text-primary: #353B5B;
      --text-secondary: rgba(53, 59, 91, 0.75);
      --text-muted: rgba(53, 59, 91, 0.62);
      --text-on-accent: #F3EDE8;

      /* 10% Accent: Sunset Peach (#E69F86) */
      --accent-primary: #E69F86;
      --accent-secondary: #EEB9A4;
      --accent-tertiary: #F3EDE8;
      --accent-soft: rgba(230, 159, 134, 0.15);
      --accent-border: rgba(230, 159, 134, 0.40);
      --accent-hex: #E69F86;
      --accent-rgb: 230, 159, 134;

      /* Hairline Borders: rgba(53, 59, 91, 0.08) */
      --border-subtle: rgba(53, 59, 91, 0.08);
      --border-strong: rgba(53, 59, 91, 0.16);
      --border-specular: rgba(248, 244, 240, 0.95);

      --status-success: #353B5B;
      --status-warning: #E69F86;
      --status-danger: #D87255;

      --app-backdrop-gradient: #F3EDE8;
      --surface-blur: blur(20px) saturate(130%);
      --surface-shadow: 0 18px 40px -12px rgba(53, 59, 91, 0.09), 0 4px 12px -2px rgba(230, 159, 134, 0.12);
      --surface-gradient: #F8F4F0;
      --radius-card: 24px;
      --radius-pill: 9999px;
      --radius-btn: 14px;

      /* Aero structural tokens */
      --aero-sky-gradient: #F3EDE8;
      --aero-sheet-bg: #F8F4F0;
      --aero-sheet-radius: 28px 28px 0 0;
      --aero-sheet-shadow: 0 -12px 35px rgba(53, 59, 91, 0.08);
      --aero-ink-primary: #353B5B;
      --aero-ink-secondary: rgba(53, 59, 91, 0.75);
      --aero-card-bg: #F8F4F0;
      --aero-card-border: 1px solid rgba(53, 59, 91, 0.08);
      --aero-hero-bg: #F8F4F0;
      --aero-hero-border: 1px solid rgba(230, 159, 134, 0.40);
      --aero-aurora-glow: none;

      /* Backwards compatible tokens */
      --zero-bg-primary: #F3EDE8;
      --zero-surface-1: #F8F4F0;
      --zero-surface-2: #EDE6DF;
      --zero-surface-elevated: #F8F4F0;
      --zero-ink-primary: #353B5B;
      --zero-ink-secondary: rgba(53, 59, 91, 0.75);
      --zero-ink-muted: rgba(53, 59, 91, 0.62);
      --zero-border: rgba(53, 59, 91, 0.08);
      --zero-dial-stroke: #E69F86;
      --zero-dial-track: rgba(53, 59, 91, 0.12);
      --zero-accent: #E69F86;
      --zero-accent-glow: rgba(230, 159, 134, 0.18);

      --liquid-accent-tint: #E69F86;
      --liquid-accent-vibrant: #E69F86;
      --liquid-accent-glow: rgba(230, 159, 134, 0.20);
      --liquid-accent-soft-glow: rgba(230, 159, 134, 0.10);
      --liquid-surface-blur: 20px;
    }

    /* Aero Global Root & Body Styles */
    html[data-interface-style="aero"],
    html[data-interface-style="aero"] body,
    html[data-interface-style="aero"] #root {
      background: #F3EDE8 !important;
      color: #353B5B !important;
      font-family: 'Segoe UI Variable', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Inter', system-ui, sans-serif !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    html[data-interface-style="aero"] .zero-app-shell {
      background: transparent !important;
      color: #353B5B !important;
    }

    /* Aero Navigation Dock (Bottom bar) */
    html[data-interface-style="aero"] .liquid-dock {
      background: #F8F4F0 !important;
      border: 1px solid rgba(53, 59, 91, 0.08) !important;
      box-shadow: 0 18px 40px -12px rgba(53, 59, 91, 0.09), 0 4px 12px -2px rgba(230, 159, 134, 0.12) !important;
    }

    html[data-interface-style="aero"] .liquid-dock-item-active {
      background: #353B5B !important;
      border: 1px solid #353B5B !important;
      box-shadow: 0 4px 14px rgba(53, 59, 91, 0.25) !important;
    }

    /* Aero Cards in default glass positions */
    html[data-interface-style="aero"] .glass-card,
    html[data-interface-style="aero"] .obsidian-card,
    html[data-interface-style="aero"] .liquid-glass,
    html[data-interface-style="aero"] .liquid-card,
    html[data-interface-style="aero"] [data-obsidian-card="true"] {
      background-color: #F8F4F0 !important;
      border: 1px solid rgba(53, 59, 91, 0.08) !important;
      box-shadow: 0 18px 40px -12px rgba(53, 59, 91, 0.09), 0 4px 12px -2px rgba(230, 159, 134, 0.12) !important;
      color: #353B5B !important;
    }

    /* Aero Pill Toggles & Squircle Capsules */
    html[data-interface-style="aero"] .liquid-pill-active,
    html[data-interface-style="aero"] .aero-pill-active,
    html[data-interface-style="aero"] .obsidian-pill-active,
    html[data-interface-style="aero"] .theme-pill-active {
      background: #353B5B !important;
      color: #F3EDE8 !important;
      border: 1px solid #353B5B !important;
      border-radius: 9999px !important;
      box-shadow: 0 4px 14px rgba(53, 59, 91, 0.20) !important;
    }

    html[data-interface-style="aero"] .liquid-pill-inactive,
    html[data-interface-style="aero"] .aero-pill-inactive,
    html[data-interface-style="aero"] .obsidian-pill-inactive,
    html[data-interface-style="aero"] .theme-pill {
      background-color: #F8F4F0 !important;
      color: #353B5B !important;
      border: 1px solid rgba(53, 59, 91, 0.08) !important;
      border-radius: 9999px !important;
      font-weight: 600 !important;
    }

    html[data-interface-style="aero"] .aero-capsule {
      background: #F8F4F0;
      border: 1px solid rgba(53, 59, 91, 0.08);
      border-radius: 9999px;
      color: #353B5B;
      box-shadow: 0 2px 8px rgba(53, 59, 91, 0.04);
    }

    /* Aero Insets, Rows, and Inputs */
    html[data-interface-style="aero"] .obsidian-inset,
    html[data-interface-style="aero"] .liquid-inset,
    html[data-interface-style="aero"] .obsidian-inset-neutral,
    html[data-interface-style="aero"] .liquid-row {
      background-color: #EDE6DF !important;
      border: 1px solid rgba(53, 59, 91, 0.08) !important;
      color: #353B5B !important;
    }

    html[data-interface-style="aero"] .obsidian-input {
      background-color: #EDE6DF !important;
      border: 1px solid rgba(53, 59, 91, 0.12) !important;
      color: #353B5B !important;
    }

    html[data-interface-style="aero"] .obsidian-input::placeholder {
      color: rgba(53, 59, 91, 0.45) !important;
    }

    /* Aero Contrast Mapping for Universal Text */
    html[data-interface-style="aero"] .text-zinc-400,
    html[data-interface-style="aero"] .text-neutral-400,
    html[data-interface-style="aero"] .text-zinc-500,
    html[data-interface-style="aero"] .text-neutral-500 {
      color: rgba(53, 59, 91, 0.62) !important;
    }

    html[data-interface-style="aero"] .text-zinc-300,
    html[data-interface-style="aero"] .text-neutral-300 {
      color: rgba(53, 59, 91, 0.75) !important;
    }

    html[data-interface-style="aero"] .text-zinc-200,
    html[data-interface-style="aero"] .text-neutral-200,
    html[data-interface-style="aero"] .text-white {
      color: #353B5B !important;
    }

    /* Retain porcelain text on dark buttons */
    html[data-interface-style="aero"] .obsidian-pill-active,
    html[data-interface-style="aero"] .obsidian-pill-active *,
    html[data-interface-style="aero"] .liquid-pill-active,
    html[data-interface-style="aero"] .liquid-pill-active *,
    html[data-interface-style="aero"] .aero-pill-active,
    html[data-interface-style="aero"] .aero-pill-active *,
    html[data-interface-style="aero"] .zn-dock-ticket-badge,
    html[data-interface-style="aero"] [data-force-white="true"] {
      color: #F3EDE8 !important;
    }

    /* Aero Dock Ticket Preview & Badge */
    html[data-interface-style="aero"] .zn-dock-ticket-svg {
      filter: drop-shadow(0 18px 40px -12px rgba(53, 59, 91, 0.12)) !important;
    }

    html[data-interface-style="aero"] .zn-dock-ticket-badge {
      background: #E69F86 !important;
      color: #353B5B !important;
      border: 2px solid #F8F4F0 !important;
      box-shadow: 0 4px 12px rgba(230, 159, 134, 0.35) !important;
      font-weight: 800 !important;
      font-size: 11px !important;
    }

    html[data-interface-style="aero"] .liquid-track {
      background-color: rgba(53, 59, 91, 0.08) !important;
    }

    html[data-interface-style="aero"] .liquid-metric {
      color: #353B5B !important;
      text-shadow: none !important;
    }

    /* Aero Sheet, Cards & Hero */
    html[data-interface-style="aero"] .aero-sheet {
      background: #F8F4F0 !important;
      color: #353B5B !important;
      border-radius: 28px 28px 0 0 !important;
      box-shadow: 0 -12px 35px rgba(53, 59, 91, 0.08) !important;
    }

    html[data-interface-style="aero"] .aero-card {
      background: #F8F4F0 !important;
      border: 1px solid rgba(53, 59, 91, 0.08) !important;
      color: #353B5B !important;
      box-shadow: 0 18px 40px -12px rgba(53, 59, 91, 0.09) !important;
    }

    html[data-interface-style="aero"] .aero-hero-card {
      background: #F8F4F0 !important;
      border: 1px solid rgba(230, 159, 134, 0.40) !important;
      color: #353B5B !important;
      box-shadow: 0 18px 40px -12px rgba(53, 59, 91, 0.09), 0 4px 12px -2px rgba(230, 159, 134, 0.12) !important;
    }

    /* Smooth Micro-Interactions */
    .liquid-spring {
      transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s ease, background-color 0.15s ease, border-color 0.15s ease !important;
    }
    .liquid-spring:active {
      transform: scale(0.97) !important;
    }
  `,
};
