import { type ThemeEngineDefinition } from './types';

export const duskEngine: ThemeEngineDefinition = {
  id: 'dusk',
  name: 'Twilight Dusk',
  badge: 'NIGHT COMFORT',
  description: 'Deep Twilight canvas with Warm Porcelain ink and soothing Sunset Peach focus accents for low-fatigue night sessions.',
  swatchBg: '#24283F',
  swatchSurface: '#2C314C',
  swatchAccent: '#E69F86',
  swatchAccentSecondary: '#F3EDE8',
  css: `
    :root, html[data-theme="dusk"], html[data-interface-style="dusk"] {
      color-scheme: dark !important;

      /* 60% Canvas: Deep Twilight Indigo (#24283F) */
      --bg-primary: #24283F;
      --bg-secondary: #1E2135;
      --bg-surface: #2C314C;
      --surface-tonal: #202438;
      --bg-surface-hover: #333957;
      --bg-elevated: #2C314C;
      --bg-modal: #2C314C;
      --bg-nav: #2C314C;
      --bg-input: #202438;

      --glass-opacity: 0.94;
      --glass-surface-bg: rgba(44, 49, 76, 0.92);
      --glass-specular-opacity: 0.20;
      --glass-inset-bg: #202438;
      --glass-row-bg: #262B43;
      --glass-dock-bg: #2C314C;
      --glass-dial-bg: rgba(44, 49, 76, 0.94);
      --glass-glow-mult: 0.20;

      /* 30% Ink & Structure: Warm Porcelain (#F3EDE8) */
      --text-primary: #F3EDE8;
      --text-secondary: rgba(243, 237, 232, 0.78);
      --text-muted: rgba(243, 237, 232, 0.60);
      --text-on-accent: #24283F;

      /* 10% Accent: Sunset Peach (#E69F86) */
      --accent-primary: #E69F86;
      --accent-secondary: #EEB9A4;
      --accent-tertiary: #F3EDE8;
      --accent-soft: rgba(230, 159, 134, 0.16);
      --accent-border: rgba(230, 159, 134, 0.42);
      --accent-hex: #E69F86;
      --accent-rgb: 230, 159, 134;

      /* Hairline Borders: rgba(243, 237, 232, 0.10) */
      --border-subtle: rgba(243, 237, 232, 0.10);
      --border-strong: rgba(243, 237, 232, 0.18);
      --border-specular: rgba(243, 237, 232, 0.14);

      --status-success: #88A4D3;
      --status-warning: #E69F86;
      --status-danger: #E06D53;

      --app-backdrop-gradient: #24283F;
      --surface-blur: blur(20px) saturate(130%);
      --surface-shadow: 0 18px 40px -12px rgba(15, 18, 30, 0.45), 0 4px 12px -2px rgba(230, 159, 134, 0.10);
      --surface-gradient: #2C314C;
      --radius-card: 24px;
      --radius-pill: 9999px;
      --radius-btn: 14px;

      /* Aero structural tokens for Dusk */
      --aero-sky-gradient: #24283F;
      --aero-sheet-bg: #2C314C;
      --aero-sheet-radius: 28px 28px 0 0;
      --aero-sheet-shadow: 0 -12px 35px rgba(15, 18, 30, 0.50);
      --aero-ink-primary: #F3EDE8;
      --aero-ink-secondary: rgba(243, 237, 232, 0.78);
      --aero-card-bg: #2C314C;
      --aero-card-border: 1px solid rgba(243, 237, 232, 0.10);
      --aero-hero-bg: #2C314C;
      --aero-hero-border: 1px solid rgba(230, 159, 134, 0.40);
      --aero-aurora-glow: none;

      /* Backwards compatible tokens */
      --zero-bg-primary: #24283F;
      --zero-surface-1: #2C314C;
      --zero-surface-2: #202438;
      --zero-surface-elevated: #2C314C;
      --zero-ink-primary: #F3EDE8;
      --zero-ink-secondary: rgba(243, 237, 232, 0.78);
      --zero-ink-muted: rgba(243, 237, 232, 0.60);
      --zero-border: rgba(243, 237, 232, 0.10);
      --zero-dial-stroke: #E69F86;
      --zero-dial-track: rgba(243, 237, 232, 0.12);
      --zero-accent: #E69F86;
      --zero-accent-glow: rgba(230, 159, 134, 0.22);

      --liquid-accent-tint: #E69F86;
      --liquid-accent-vibrant: #E69F86;
      --liquid-accent-glow: rgba(230, 159, 134, 0.22);
      --liquid-accent-soft-glow: rgba(230, 159, 134, 0.12);
      --liquid-surface-blur: 20px;
    }

    /* Dusk Global Root & Body Styles */
    html[data-theme="dusk"],
    html[data-theme="dusk"] body,
    html[data-theme="dusk"] #root,
    html[data-interface-style="dusk"],
    html[data-interface-style="dusk"] body,
    html[data-interface-style="dusk"] #root {
      background: #24283F !important;
      color: #F3EDE8 !important;
      font-family: 'Segoe UI Variable', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Inter', system-ui, sans-serif !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    html[data-theme="dusk"] .zero-app-shell,
    html[data-interface-style="dusk"] .zero-app-shell {
      background: transparent !important;
      color: #F3EDE8 !important;
    }

    /* Dusk Navigation Dock (Bottom bar) */
    html[data-theme="dusk"] .liquid-dock,
    html[data-interface-style="dusk"] .liquid-dock {
      background: #2C314C !important;
      border: 1px solid rgba(243, 237, 232, 0.10) !important;
      box-shadow: 0 18px 40px -12px rgba(15, 18, 30, 0.45), 0 4px 12px -2px rgba(230, 159, 134, 0.10) !important;
    }

    html[data-theme="dusk"] .liquid-dock-item-active,
    html[data-interface-style="dusk"] .liquid-dock-item-active {
      background: #E69F86 !important;
      border: 1px solid #E69F86 !important;
      color: #24283F !important;
      box-shadow: 0 4px 14px rgba(230, 159, 134, 0.30) !important;
    }

    html[data-theme="dusk"] .liquid-dock-item-active *,
    html[data-interface-style="dusk"] .liquid-dock-item-active * {
      color: #24283F !important;
    }

    /* Dusk Cards in default glass positions */
    html[data-theme="dusk"] .glass-card,
    html[data-theme="dusk"] .obsidian-card,
    html[data-theme="dusk"] .liquid-glass,
    html[data-theme="dusk"] .liquid-card,
    html[data-theme="dusk"] [data-obsidian-card="true"],
    html[data-interface-style="dusk"] .glass-card,
    html[data-interface-style="dusk"] .obsidian-card,
    html[data-interface-style="dusk"] .liquid-glass,
    html[data-interface-style="dusk"] .liquid-card,
    html[data-interface-style="dusk"] [data-obsidian-card="true"] {
      background-color: #2C314C !important;
      border: 1px solid rgba(243, 237, 232, 0.10) !important;
      box-shadow: 0 18px 40px -12px rgba(15, 18, 30, 0.45), 0 4px 12px -2px rgba(230, 159, 134, 0.10) !important;
      color: #F3EDE8 !important;
    }

    /* Dusk Pill Toggles & Capsules */
    html[data-theme="dusk"] .liquid-pill-active,
    html[data-theme="dusk"] .aero-pill-active,
    html[data-theme="dusk"] .obsidian-pill-active,
    html[data-theme="dusk"] .theme-pill-active,
    html[data-interface-style="dusk"] .liquid-pill-active,
    html[data-interface-style="dusk"] .aero-pill-active,
    html[data-interface-style="dusk"] .obsidian-pill-active,
    html[data-interface-style="dusk"] .theme-pill-active {
      background: #E69F86 !important;
      color: #24283F !important;
      border: 1px solid #E69F86 !important;
      border-radius: 9999px !important;
      box-shadow: 0 4px 14px rgba(230, 159, 134, 0.25) !important;
    }

    html[data-theme="dusk"] .liquid-pill-active *,
    html[data-theme="dusk"] .aero-pill-active *,
    html[data-theme="dusk"] .obsidian-pill-active *,
    html[data-theme="dusk"] .theme-pill-active *,
    html[data-interface-style="dusk"] .liquid-pill-active *,
    html[data-interface-style="dusk"] .aero-pill-active *,
    html[data-interface-style="dusk"] .obsidian-pill-active *,
    html[data-interface-style="dusk"] .theme-pill-active * {
      color: #24283F !important;
    }

    html[data-theme="dusk"] .liquid-pill-inactive,
    html[data-theme="dusk"] .aero-pill-inactive,
    html[data-theme="dusk"] .obsidian-pill-inactive,
    html[data-theme="dusk"] .theme-pill,
    html[data-interface-style="dusk"] .liquid-pill-inactive,
    html[data-interface-style="dusk"] .aero-pill-inactive,
    html[data-interface-style="dusk"] .obsidian-pill-inactive,
    html[data-interface-style="dusk"] .theme-pill {
      background-color: #202438 !important;
      color: #F3EDE8 !important;
      border: 1px solid rgba(243, 237, 232, 0.10) !important;
      border-radius: 9999px !important;
      font-weight: 600 !important;
    }

    html[data-theme="dusk"] .aero-capsule,
    html[data-interface-style="dusk"] .aero-capsule {
      background: #2C314C;
      border: 1px solid rgba(243, 237, 232, 0.10);
      border-radius: 9999px;
      color: #F3EDE8;
      box-shadow: 0 2px 8px rgba(15, 18, 30, 0.25);
    }

    /* Dusk Insets, Rows, and Inputs */
    html[data-theme="dusk"] .obsidian-inset,
    html[data-theme="dusk"] .liquid-inset,
    html[data-theme="dusk"] .obsidian-inset-neutral,
    html[data-theme="dusk"] .liquid-row,
    html[data-interface-style="dusk"] .obsidian-inset,
    html[data-interface-style="dusk"] .liquid-inset,
    html[data-interface-style="dusk"] .obsidian-inset-neutral,
    html[data-interface-style="dusk"] .liquid-row {
      background-color: #202438 !important;
      border: 1px solid rgba(243, 237, 232, 0.10) !important;
      color: #F3EDE8 !important;
    }

    html[data-theme="dusk"] .obsidian-input,
    html[data-interface-style="dusk"] .obsidian-input {
      background-color: #202438 !important;
      border: 1px solid rgba(243, 237, 232, 0.14) !important;
      color: #F3EDE8 !important;
    }

    html[data-theme="dusk"] .obsidian-input::placeholder,
    html[data-interface-style="dusk"] .obsidian-input::placeholder {
      color: rgba(243, 237, 232, 0.45) !important;
    }

    /* Dusk Dock Ticket Preview & Badge */
    html[data-theme="dusk"] .zn-dock-ticket-badge,
    html[data-interface-style="dusk"] .zn-dock-ticket-badge {
      background: #E69F86 !important;
      color: #24283F !important;
      border: 2px solid #2C314C !important;
      box-shadow: 0 4px 12px rgba(230, 159, 134, 0.35) !important;
      font-weight: 800 !important;
      font-size: 11px !important;
    }

    html[data-theme="dusk"] .liquid-track,
    html[data-interface-style="dusk"] .liquid-track {
      background-color: rgba(243, 237, 232, 0.10) !important;
    }

    html[data-theme="dusk"] .liquid-metric,
    html[data-interface-style="dusk"] .liquid-metric {
      color: #F3EDE8 !important;
      text-shadow: none !important;
    }

    /* Dusk Aero Compatibility: Sheet, Cards & Hero */
    html[data-theme="dusk"] .aero-sheet,
    html[data-interface-style="dusk"] .aero-sheet {
      background: #2C314C !important;
      color: #F3EDE8 !important;
      border-radius: 28px 28px 0 0 !important;
      box-shadow: 0 -12px 35px rgba(15, 18, 30, 0.50) !important;
    }

    html[data-theme="dusk"] .aero-card,
    html[data-interface-style="dusk"] .aero-card {
      background: #2C314C !important;
      border: 1px solid rgba(243, 237, 232, 0.10) !important;
      color: #F3EDE8 !important;
      box-shadow: 0 18px 40px -12px rgba(15, 18, 30, 0.45) !important;
    }

    html[data-theme="dusk"] .aero-hero-card,
    html[data-interface-style="dusk"] .aero-hero-card {
      background: #2C314C !important;
      border: 1px solid rgba(230, 159, 134, 0.40) !important;
      color: #F3EDE8 !important;
      box-shadow: 0 18px 40px -12px rgba(15, 18, 30, 0.45), 0 4px 12px -2px rgba(230, 159, 134, 0.10) !important;
    }
  `,
};
