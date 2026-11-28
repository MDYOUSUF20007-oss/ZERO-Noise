import { type ThemeEngineDefinition } from './types';

/**
 * Material Dusk (Material Design 3)
 * Unified M3 tonal surface & semantic role system merging:
 * - Day (Porcelain): Warm Porcelain (#F3EDE8) + Twilight Indigo (#353B5B) + Sunset Peach (#E69F86)
 * - Night (Twilight): Deep Twilight (#24283F) + Warm Porcelain (#F3EDE8) + Sunset Peach (#E69F86)
 */
export const materialEngine: ThemeEngineDefinition = {
  id: 'material',
  name: 'Material Dusk',
  badge: 'MATERIAL 3',
  description:
    'Material Design 3 tonal surfaces pairing Aero Porcelain (Day) and Twilight Dusk (Night) with Sunset Peach accents.',
  swatchBg: '#24283F',
  swatchSurface: '#F3EDE8',
  swatchAccent: '#E69F86',
  swatchAccentSecondary: '#353B5B',
  css: `
    /* =======================================================================
       MATERIAL DUSK — DAY MODE (AERO PORCELAIN PALETTE)
       ======================================================================= */
    :root,
    html[data-theme="material"][data-material-mode="light"],
    html[data-theme="aero"],
    html[data-interface-style="aero"] {
      color-scheme: light !important;

      /* M3 Core Semantic Roles (Porcelain Light) */
      --md-sys-color-surface: #F3EDE8;
      --md-sys-color-surface-dim: #E7DFD7;
      --md-sys-color-surface-bright: #FAF7F4;
      --md-sys-color-surface-container-lowest: #FFFFFF;
      --md-sys-color-surface-container-low: #F8F4F0;
      --md-sys-color-surface-container: #EFE8E1;
      --md-sys-color-surface-container-high: #E7DFD6;
      --md-sys-color-surface-container-highest: #DFD5CB;
      --md-sys-color-on-surface: #262B44;
      --md-sys-color-on-surface-variant: #4F5573;

      --md-sys-color-primary: #353B5B;
      --md-sys-color-on-primary: #F3EDE8;
      --md-sys-color-primary-container: #F4D5C8;
      --md-sys-color-on-primary-container: #2F1D17;

      --md-sys-color-secondary: #585D7A;
      --md-sys-color-on-secondary: #FFFFFF;
      --md-sys-color-secondary-container: #E3E0EC;
      --md-sys-color-on-secondary-container: #262B44;

      --md-sys-color-tertiary: #A8543B;
      --md-sys-color-on-tertiary: #FFFFFF;
      --md-sys-color-tertiary-container: #E69F86;
      --md-sys-color-on-tertiary-container: #2A1610;

      --md-sys-color-outline: rgba(53, 59, 91, 0.24);
      --md-sys-color-outline-variant: rgba(53, 59, 91, 0.12);

      --md-sys-color-error: #BA3B2E;
      --md-sys-color-on-error: #FFFFFF;
      --md-sys-color-error-container: #FADCD8;
      --md-sys-color-on-error-container: #5F1810;

      /* App Semantic Tokens Mapped to M3 Roles */
      --bg-primary: var(--md-sys-color-surface);
      --bg-secondary: var(--md-sys-color-surface-container);
      --bg-surface: var(--md-sys-color-surface-container-low);
      --surface-tonal: var(--md-sys-color-surface-container);
      --bg-surface-hover: var(--md-sys-color-surface-container-high);
      --bg-elevated: var(--md-sys-color-surface-container-low);
      --bg-modal: var(--md-sys-color-surface-container-low);
      --bg-nav: var(--md-sys-color-surface-container);
      --bg-input: var(--md-sys-color-surface-container);

      --glass-opacity: 1;
      --glass-surface-bg: var(--md-sys-color-surface-container-low);
      --glass-specular-opacity: 0;
      --glass-inset-bg: var(--md-sys-color-surface-container);
      --glass-row-bg: var(--md-sys-color-surface-container);
      --glass-dock-bg: var(--md-sys-color-surface-container);
      --glass-dial-bg: var(--md-sys-color-surface-container-low);
      --glass-glow-mult: 0;

      --text-primary: var(--md-sys-color-on-surface);
      --text-secondary: var(--md-sys-color-on-surface-variant);
      --text-muted: rgba(53, 59, 91, 0.66);
      --text-on-accent: var(--md-sys-color-on-primary);

      --accent-primary: var(--md-sys-color-primary);
      --accent-secondary: #E69F86;
      --accent-tertiary: var(--md-sys-color-tertiary);
      --accent-soft: var(--md-sys-color-primary-container);
      --accent-border: var(--md-sys-color-outline);
      --accent-hex: #E69F86;
      --accent-rgb: 230, 159, 134;

      --border-subtle: var(--md-sys-color-outline-variant);
      --border-strong: var(--md-sys-color-outline);
      --border-specular: transparent;

      --status-success: #2F5D4E;
      --status-warning: #A8543B;
      --status-danger: #BA3B2E;

      --surface-blur: none;
      --surface-shadow: 0 1px 2px rgba(38, 43, 68, 0.05);
      --surface-gradient: none;
      --radius-card: 20px;
      --radius-pill: 9999px;
      --radius-btn: 12px;

      /* Backwards-compatible tokens */
      --zero-bg-primary: #F3EDE8;
      --zero-surface-1: #F8F4F0;
      --zero-surface-2: #EDE6DF;
      --zero-surface-elevated: #F8F4F0;
      --zero-ink-primary: #262B44;
      --zero-ink-secondary: #4F5573;
      --zero-ink-muted: rgba(53, 59, 91, 0.66);
      --zero-border: rgba(53, 59, 91, 0.12);
      --zero-dial-stroke: #E69F86;
      --zero-dial-track: rgba(53, 59, 91, 0.12);
      --zero-accent: #E69F86;
      --zero-accent-glow: none;
      --liquid-accent-tint: #E69F86;
      --liquid-accent-vibrant: #353B5B;
      --liquid-accent-glow: none;
      --liquid-accent-soft-glow: none;
      --liquid-surface-blur: 0px;
    }

    /* =======================================================================
       MATERIAL DUSK — NIGHT MODE (TWILIGHT DUSK PALETTE)
       ======================================================================= */
    html[data-theme="material"][data-material-mode="dark"],
    html[data-theme="dusk"],
    html[data-interface-style="dusk"] {
      color-scheme: dark !important;

      /* M3 Core Semantic Roles (Twilight Dark) */
      --md-sys-color-surface: #24283F;
      --md-sys-color-surface-dim: #1C1F33;
      --md-sys-color-surface-bright: #343A59;
      --md-sys-color-surface-container-lowest: #191C2E;
      --md-sys-color-surface-container-low: #282D47;
      --md-sys-color-surface-container: #2C314C;
      --md-sys-color-surface-container-high: #343A59;
      --md-sys-color-surface-container-highest: #3E4568;
      --md-sys-color-on-surface: #F3EDE8;
      --md-sys-color-on-surface-variant: #CAC4C0;

      --md-sys-color-primary: #E69F86;
      --md-sys-color-on-primary: #24283F;
      --md-sys-color-primary-container: #4E3B42;
      --md-sys-color-on-primary-container: #FCE2D8;

      --md-sys-color-secondary: #B8C0E0;
      --md-sys-color-on-secondary: #24283F;
      --md-sys-color-secondary-container: #383E5E;
      --md-sys-color-on-secondary-container: #ECE7E3;

      --md-sys-color-tertiary: #EEB9A4;
      --md-sys-color-on-tertiary: #2C160E;
      --md-sys-color-tertiary-container: #563C38;
      --md-sys-color-on-tertiary-container: #FDE5DC;

      --md-sys-color-outline: rgba(243, 237, 232, 0.22);
      --md-sys-color-outline-variant: rgba(243, 237, 232, 0.11);

      --md-sys-color-error: #F28B82;
      --md-sys-color-on-error: #3B0B08;
      --md-sys-color-error-container: #5C2421;
      --md-sys-color-on-error-container: #FADCD8;

      /* App Semantic Tokens Mapped to M3 Roles */
      --bg-primary: var(--md-sys-color-surface);
      --bg-secondary: var(--md-sys-color-surface-container-low);
      --bg-surface: var(--md-sys-color-surface-container);
      --surface-tonal: var(--md-sys-color-surface-container-high);
      --bg-surface-hover: var(--md-sys-color-surface-container-high);
      --bg-elevated: var(--md-sys-color-surface-container);
      --bg-modal: var(--md-sys-color-surface-container);
      --bg-nav: var(--md-sys-color-surface-container);
      --bg-input: var(--md-sys-color-surface-container-lowest);

      --glass-opacity: 1;
      --glass-surface-bg: var(--md-sys-color-surface-container);
      --glass-specular-opacity: 0;
      --glass-inset-bg: var(--md-sys-color-surface-container-low);
      --glass-row-bg: var(--md-sys-color-surface-container-low);
      --glass-dock-bg: var(--md-sys-color-surface-container);
      --glass-dial-bg: var(--md-sys-color-surface-container);
      --glass-glow-mult: 0;

      --text-primary: var(--md-sys-color-on-surface);
      --text-secondary: var(--md-sys-color-on-surface-variant);
      --text-muted: rgba(243, 237, 232, 0.64);
      --text-on-accent: var(--md-sys-color-on-primary);

      --accent-primary: var(--md-sys-color-primary);
      --accent-secondary: #EEB9A4;
      --accent-tertiary: #F3EDE8;
      --accent-soft: var(--md-sys-color-primary-container);
      --accent-border: var(--md-sys-color-outline);
      --accent-hex: #E69F86;
      --accent-rgb: 230, 159, 134;

      --border-subtle: var(--md-sys-color-outline-variant);
      --border-strong: var(--md-sys-color-outline);
      --border-specular: transparent;

      --status-success: #86D4B3;
      --status-warning: #E69F86;
      --status-danger: #F28B82;

      --surface-blur: none;
      --surface-shadow: 0 2px 6px rgba(14, 17, 29, 0.35);
      --surface-gradient: none;
      --radius-card: 20px;
      --radius-pill: 9999px;
      --radius-btn: 12px;

      /* Backwards-compatible tokens */
      --zero-bg-primary: #24283F;
      --zero-surface-1: #2C314C;
      --zero-surface-2: #202438;
      --zero-surface-elevated: #2C314C;
      --zero-ink-primary: #F3EDE8;
      --zero-ink-secondary: #CAC4C0;
      --zero-ink-muted: rgba(243, 237, 232, 0.64);
      --zero-border: rgba(243, 237, 232, 0.11);
      --zero-dial-stroke: #E69F86;
      --zero-dial-track: rgba(243, 237, 232, 0.12);
      --zero-accent: #E69F86;
      --zero-accent-glow: none;
      --liquid-accent-tint: #EEB9A4;
      --liquid-accent-vibrant: #E69F86;
      --liquid-accent-glow: none;
      --liquid-accent-soft-glow: none;
      --liquid-surface-blur: 0px;
    }

    /* =======================================================================
       MATERIAL SEED PALETTE OVERRIDES (Porcelain + Twilight Seed Choices)
       ======================================================================= */
    html[data-material-mode="light"][data-aero-palette="espresso"] {
      --md-sys-color-primary: #353B5B;
      --md-sys-color-on-primary: #F3EDE8;
      --md-sys-color-primary-container: #DCE0F2;
      --md-sys-color-on-primary-container: #1E233A;
      --accent-hex: #353B5B;
    }
    html[data-material-mode="dark"][data-aero-palette="espresso"] {
      --md-sys-color-primary: #B8C0E0;
      --md-sys-color-on-primary: #202438;
      --md-sys-color-primary-container: #373D5E;
      --md-sys-color-on-primary-container: #E9ECF8;
      --accent-hex: #B8C0E0;
    }
    html[data-material-mode="light"][data-aero-palette="terracotta"] {
      --md-sys-color-primary: #A84A32;
      --md-sys-color-on-primary: #FFFFFF;
      --md-sys-color-primary-container: #F5CFC5;
      --md-sys-color-on-primary-container: #3D140B;
      --accent-hex: #D87255;
    }
    html[data-material-mode="dark"][data-aero-palette="terracotta"] {
      --md-sys-color-primary: #ED967D;
      --md-sys-color-on-primary: #2E1510;
      --md-sys-color-primary-container: #57332C;
      --md-sys-color-on-primary-container: #FDE0D8;
      --accent-hex: #ED967D;
    }

    /* =======================================================================
       SHARED MATERIAL 3 ROOT, TYPOGRAPHY & SURFACE STYLES
       ======================================================================= */
    html[data-theme="material"],
    html[data-theme="material"] body,
    html[data-theme="material"] #root,
    html[data-theme="aero"],
    html[data-theme="aero"] body,
    html[data-theme="aero"] #root,
    html[data-theme="dusk"],
    html[data-theme="dusk"] body,
    html[data-theme="dusk"] #root {
      background: var(--md-sys-color-surface) !important;
      color: var(--md-sys-color-on-surface) !important;
      font-family: 'Space Grotesk Variable', 'Space Grotesk', system-ui, -apple-system, sans-serif !important;
      font-weight: 400;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    html[data-theme="material"] h1,
    html[data-theme="material"] h2,
    html[data-theme="material"] h3,
    html[data-theme="material"] h4,
    html[data-theme="material"] .font-display,
    html[data-theme="material"] .font-heading,
    html[data-theme="material"] .liquid-metric,
    html[data-theme="aero"] h1,
    html[data-theme="aero"] h2,
    html[data-theme="aero"] h3,
    html[data-theme="aero"] h4,
    html[data-theme="aero"] .font-display,
    html[data-theme="aero"] .liquid-metric,
    html[data-theme="dusk"] h1,
    html[data-theme="dusk"] h2,
    html[data-theme="dusk"] h3,
    html[data-theme="dusk"] h4,
    html[data-theme="dusk"] .font-display,
    html[data-theme="dusk"] .liquid-metric {
      font-family: 'Bricolage Grotesque Variable', 'Bricolage Grotesque', 'Space Grotesk Variable', sans-serif !important;
      letter-spacing: -0.02em;
    }

    html[data-theme="material"] .font-mono,
    html[data-theme="aero"] .font-mono,
    html[data-theme="dusk"] .font-mono {
      font-family: 'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace !important;
      font-variant-numeric: tabular-nums;
    }

    html[data-theme="material"] .zero-app-shell,
    html[data-theme="aero"] .zero-app-shell,
    html[data-theme="dusk"] .zero-app-shell {
      background: transparent !important;
      color: var(--md-sys-color-on-surface) !important;
    }

    /* M3 Tonal Cards (No glass blur, no decorative glows — pure tonal container separation) */
    html[data-theme="material"] .glass-card,
    html[data-theme="material"] .obsidian-card,
    html[data-theme="material"] .liquid-glass,
    html[data-theme="material"] .liquid-card,
    html[data-theme="material"] .theme-card,
    html[data-theme="material"] .settings-card,
    html[data-theme="material"] [data-obsidian-card="true"],
    html[data-theme="aero"] .glass-card,
    html[data-theme="aero"] .obsidian-card,
    html[data-theme="aero"] .liquid-glass,
    html[data-theme="aero"] [data-obsidian-card="true"],
    html[data-theme="dusk"] .glass-card,
    html[data-theme="dusk"] .obsidian-card,
    html[data-theme="dusk"] .liquid-glass,
    html[data-theme="dusk"] [data-obsidian-card="true"] {
      background-color: var(--md-sys-color-surface-container-low) !important;
      background-image: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      border: 1px solid var(--md-sys-color-outline-variant) !important;
      border-radius: 20px !important;
      box-shadow: var(--surface-shadow) !important;
      color: var(--md-sys-color-on-surface) !important;
    }

    /* M3 Navigation Bar (Docked Bottom Material Bar) */
    html[data-theme="material"] .liquid-dock,
    html[data-theme="aero"] .liquid-dock,
    html[data-theme="dusk"] .liquid-dock {
      background-color: var(--md-sys-color-surface-container) !important;
      background-image: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      border: 1px solid var(--md-sys-color-outline-variant) !important;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08) !important;
    }

    html[data-theme="material"] .liquid-dock-item-active,
    html[data-theme="aero"] .liquid-dock-item-active,
    html[data-theme="dusk"] .liquid-dock-item-active {
      background-color: var(--md-sys-color-primary-container) !important;
      border: none !important;
      box-shadow: none !important;
    }

    /* M3 Filter Chips & Tonal Buttons */
    html[data-theme="material"] .liquid-pill-active,
    html[data-theme="material"] .aero-pill-active,
    html[data-theme="material"] .obsidian-pill-active,
    html[data-theme="material"] .theme-pill-active,
    html[data-theme="aero"] .liquid-pill-active,
    html[data-theme="aero"] .obsidian-pill-active,
    html[data-theme="dusk"] .liquid-pill-active,
    html[data-theme="dusk"] .obsidian-pill-active {
      background-color: var(--md-sys-color-primary-container) !important;
      color: var(--md-sys-color-on-primary-container) !important;
      border: 1px solid var(--md-sys-color-outline) !important;
      border-radius: 8px !important;
      box-shadow: none !important;
      font-weight: 600 !important;
    }

    html[data-theme="material"] .liquid-pill-active *,
    html[data-theme="material"] .obsidian-pill-active *,
    html[data-theme="material"] .theme-pill-active *,
    html[data-theme="aero"] .liquid-pill-active *,
    html[data-theme="aero"] .obsidian-pill-active *,
    html[data-theme="dusk"] .liquid-pill-active *,
    html[data-theme="dusk"] .obsidian-pill-active * {
      color: var(--md-sys-color-on-primary-container) !important;
    }

    html[data-theme="material"] .liquid-pill-inactive,
    html[data-theme="material"] .aero-pill-inactive,
    html[data-theme="material"] .obsidian-pill-inactive,
    html[data-theme="material"] .theme-pill,
    html[data-theme="aero"] .liquid-pill-inactive,
    html[data-theme="aero"] .obsidian-pill-inactive,
    html[data-theme="dusk"] .liquid-pill-inactive,
    html[data-theme="dusk"] .obsidian-pill-inactive {
      background-color: var(--md-sys-color-surface-container) !important;
      color: var(--md-sys-color-on-surface-variant) !important;
      border: 1px solid var(--md-sys-color-outline-variant) !important;
      border-radius: 8px !important;
      font-weight: 500 !important;
    }

    /* M3 Tonal Insets, List Rows, Inputs & Modals */
    html[data-theme="material"] .obsidian-inset,
    html[data-theme="material"] .liquid-inset,
    html[data-theme="material"] .obsidian-inset-neutral,
    html[data-theme="material"] .liquid-row,
    html[data-theme="aero"] .obsidian-inset,
    html[data-theme="aero"] .liquid-inset,
    html[data-theme="aero"] .obsidian-inset-neutral,
    html[data-theme="aero"] .liquid-row,
    html[data-theme="dusk"] .obsidian-inset,
    html[data-theme="dusk"] .liquid-inset,
    html[data-theme="dusk"] .obsidian-inset-neutral,
    html[data-theme="dusk"] .liquid-row {
      background-color: var(--md-sys-color-surface-container) !important;
      border: 1px solid var(--md-sys-color-outline-variant) !important;
      color: var(--md-sys-color-on-surface) !important;
      border-radius: 12px !important;
    }

    html[data-theme="material"] .liquid-squircle,
    html[data-theme="material"] .obsidian-icon-box,
    html[data-theme="aero"] .liquid-squircle,
    html[data-theme="aero"] .obsidian-icon-box,
    html[data-theme="dusk"] .liquid-squircle,
    html[data-theme="dusk"] .obsidian-icon-box {
      background-color: var(--md-sys-color-primary-container) !important;
      background-image: none !important;
      border: 1px solid var(--md-sys-color-outline-variant) !important;
      color: var(--md-sys-color-on-primary-container) !important;
      box-shadow: none !important;
    }

    html[data-theme="material"] .obsidian-input,
    html[data-theme="aero"] .obsidian-input,
    html[data-theme="dusk"] .obsidian-input {
      background-color: var(--md-sys-color-surface-container-highest) !important;
      border: 1px solid var(--md-sys-color-outline) !important;
      color: var(--md-sys-color-on-surface) !important;
      border-radius: 12px !important;
    }

    html[data-theme="material"] .obsidian-input::placeholder,
    html[data-theme="aero"] .obsidian-input::placeholder,
    html[data-theme="dusk"] .obsidian-input::placeholder {
      color: var(--md-sys-color-on-surface-variant) !important;
      opacity: 0.7;
    }

    html[data-theme="material"] .modal-glass,
    html[data-theme="material"] [data-modal-glass="true"],
    html[data-theme="material"] .zero-modal-card {
      background-color: var(--md-sys-color-surface-container-low) !important;
      background-image: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      border: 1px solid var(--md-sys-color-outline-variant) !important;
      color: var(--md-sys-color-on-surface) !important;
    }

    /* Universal Tailwind Neutral Text Role Adaptation Inside Material Dusk */
    html[data-theme="material"] .text-white,
    html[data-theme="material"] .text-neutral-50,
    html[data-theme="material"] .text-zinc-50,
    html[data-theme="material"] .text-neutral-100,
    html[data-theme="material"] .text-zinc-100,
    html[data-theme="aero"] .text-white,
    html[data-theme="aero"] .text-neutral-50,
    html[data-theme="aero"] .text-zinc-50,
    html[data-theme="aero"] .text-neutral-100,
    html[data-theme="aero"] .text-zinc-100,
    html[data-theme="dusk"] .text-white,
    html[data-theme="dusk"] .text-neutral-50,
    html[data-theme="dusk"] .text-neutral-100 {
      color: var(--md-sys-color-on-surface) !important;
    }
    html[data-theme="material"] .text-zinc-200,
    html[data-theme="material"] .text-neutral-200,
    html[data-theme="material"] .text-zinc-300,
    html[data-theme="material"] .text-neutral-300,
    html[data-theme="material"] .text-cyan-200,
    html[data-theme="material"] .text-cyan-300,
    html[data-theme="aero"] .text-zinc-200,
    html[data-theme="aero"] .text-zinc-300,
    html[data-theme="dusk"] .text-zinc-200,
    html[data-theme="dusk"] .text-zinc-300 {
      color: var(--md-sys-color-on-surface-variant) !important;
    }
    html[data-theme="material"] .text-zinc-400,
    html[data-theme="material"] .text-neutral-400,
    html[data-theme="material"] .text-zinc-500,
    html[data-theme="material"] .text-neutral-500,
    html[data-theme="aero"] .text-zinc-400,
    html[data-theme="aero"] .text-zinc-500,
    html[data-theme="dusk"] .text-zinc-400,
    html[data-theme="dusk"] .text-zinc-500 {
      color: var(--text-muted) !important;
    }

    html[data-theme="material"] [data-force-white="true"] {
      color: var(--md-sys-color-on-primary) !important;
    }

    /* Material Dial Instrument Face */
    html[data-theme="material"] .zero-dial-surface,
    html[data-theme="aero"] .zero-dial-surface,
    html[data-theme="dusk"] .zero-dial-surface {
      background-color: var(--md-sys-color-surface-container-low) !important;
      background-image: none !important;
      border: 1px solid var(--md-sys-color-outline-variant) !important;
      box-shadow: var(--surface-shadow) !important;
      touch-action: none !important;
    }

    html[data-theme="material"] .liquid-track,
    html[data-theme="aero"] .liquid-track,
    html[data-theme="dusk"] .liquid-track {
      background-color: var(--md-sys-color-surface-container-highest) !important;
    }

    html[data-theme="material"] .liquid-metric,
    html[data-theme="aero"] .liquid-metric,
    html[data-theme="dusk"] .liquid-metric {
      color: var(--md-sys-color-on-surface) !important;
      text-shadow: none !important;
    }

    html[data-theme="material"] .zn-dock-ticket-badge,
    html[data-theme="aero"] .zn-dock-ticket-badge,
    html[data-theme="dusk"] .zn-dock-ticket-badge {
      background: var(--md-sys-color-tertiary-container) !important;
      color: var(--md-sys-color-on-tertiary-container) !important;
      border: 2px solid var(--md-sys-color-surface-container) !important;
      font-weight: 700 !important;
      font-size: 11px !important;
    }

    /* M3 Semantic Helper Utilities */
    html[data-theme="material"] .theme-bg-primary { background-color: var(--md-sys-color-surface) !important; color: var(--md-sys-color-on-surface) !important; }
    html[data-theme="material"] .theme-bg-secondary { background-color: var(--md-sys-color-surface-container) !important; color: var(--md-sys-color-on-surface) !important; }
    html[data-theme="material"] .theme-text-primary { color: var(--md-sys-color-on-surface) !important; }
    html[data-theme="material"] .theme-text-secondary { color: var(--md-sys-color-on-surface-variant) !important; }
    html[data-theme="material"] .theme-text-muted { color: var(--text-muted) !important; }
    html[data-theme="material"] .theme-text-accent { color: var(--md-sys-color-primary) !important; }
    html[data-theme="material"] .theme-border { border-color: var(--md-sys-color-outline-variant) !important; }

    /* M3 Emphasized Decelerate Interaction Physics */
    .liquid-spring {
      transition:
        transform 0.22s cubic-bezier(0.05, 0.7, 0.1, 1),
        opacity 0.18s ease,
        background-color 0.18s ease,
        border-color 0.18s ease !important;
    }
    @media (hover: hover) {
      .liquid-spring:hover {
        transform: perspective(900px) translate3d(0, -1.5px, 0);
      }
    }
    .liquid-spring:active {
      transform: scale(0.974) !important;
    }
  `,
};
