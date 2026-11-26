export const BASE_ENGINE_BRIDGE_CSS = `
  html, body, #root {
    background-color: #000000 !important;
    color: #f0f9ff !important;
    font-family: 'Space Grotesk Variable', 'Space Grotesk', system-ui, -apple-system, sans-serif !important;
    font-weight: 500;
    background-image: none !important;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* -------------------------------------------------------------
     Dynamic Accent Palette Overrides: [data-accent="..."]
     ------------------------------------------------------------- */
  /* Amber Accent (Golden Sun / Ember Focus) */
  [data-accent="amber"],
  html[data-accent="amber"] {
    --accent-primary: #f59e0b !important;
    --accent-secondary: #fbbf24 !important;
    --accent-soft: rgba(245, 158, 11, 0.18) !important;
    --accent-border: rgba(245, 158, 11, 0.55) !important;
    --text-on-accent: #000000 !important;
    --zero-accent: #f59e0b !important;
    --zero-dial-stroke: #f59e0b !important;
    --accent-hex: #f59e0b !important;
    --accent-rgb: 245, 158, 11 !important;
    --liquid-accent-glow: rgba(245, 158, 11, 0.40) !important;
    --liquid-accent-soft-glow: rgba(245, 158, 11, 0.18) !important;
    --liquid-accent-vibrant: #f59e0b !important;
    --liquid-accent-tint: #fbbf24 !important;
    --accent-shift-1: #d97706 !important; /* Deep Amber */
    --accent-shift-2: #f59e0b !important; /* Vibrant Amber */
    --accent-shift-3: #b45309 !important; /* Burnished Bronze */
    --accent-shift-4: #fbbf24 !important; /* Golden Light */
  }

  /* Emerald Accent (Botanical Forest / Radiance) */
  [data-accent="emerald"],
  html[data-accent="emerald"] {
    --accent-primary: #10b981 !important;
    --accent-secondary: #34d399 !important;
    --accent-soft: rgba(16, 185, 129, 0.18) !important;
    --accent-border: rgba(16, 185, 129, 0.55) !important;
    --text-on-accent: #022c22 !important;
    --zero-accent: #10b981 !important;
    --zero-dial-stroke: #10b981 !important;
    --accent-hex: #10b981 !important;
    --accent-rgb: 16, 185, 129 !important;
    --liquid-accent-glow: rgba(16, 185, 129, 0.40) !important;
    --liquid-accent-soft-glow: rgba(16, 185, 129, 0.18) !important;
    --liquid-accent-vibrant: #10b981 !important;
    --liquid-accent-tint: #34d399 !important;
    --accent-shift-1: #059669 !important; /* Pine */
    --accent-shift-2: #10b981 !important; /* Emerald */
    --accent-shift-3: #047857 !important; /* Deep Forest */
    --accent-shift-4: #34d399 !important; /* Spring Mint */
  }

  /* Purple Accent */
  [data-accent="purple"],
  html[data-accent="purple"] {
    --accent-primary: #a855f7 !important;
    --accent-secondary: #c084fc !important;
    --accent-soft: rgba(168, 85, 247, 0.18) !important;
    --accent-border: rgba(168, 85, 247, 0.55) !important;
    --text-on-accent: #ffffff !important;
    --zero-accent: #a855f7 !important;
    --zero-dial-stroke: #a855f7 !important;
    --accent-hex: #a855f7 !important;
    --accent-rgb: 168, 85, 247 !important;
    --liquid-accent-glow: rgba(168, 85, 247, 0.40) !important;
    --liquid-accent-soft-glow: rgba(168, 85, 247, 0.18) !important;
    --liquid-accent-vibrant: #a855f7 !important;
    --liquid-accent-tint: #c084fc !important;
    --accent-shift-1: #6366f1 !important; /* Royal Indigo */
    --accent-shift-2: #c026d3 !important; /* Electric Orchid */
    --accent-shift-3: #4338ca !important; /* Midnight Violet */
    --accent-shift-4: #8b5cf6 !important; /* Luminous Purple */
  }

  /* Rose Coral Accent (Default Flagship Accent) */
  :root,
  [data-accent="crimson"],
  html[data-accent="crimson"] {
    --accent-primary: #f43f5e !important;
    --accent-secondary: #fb7185 !important;
    --accent-soft: rgba(244, 63, 94, 0.18) !important;
    --accent-border: rgba(244, 63, 94, 0.55) !important;
    --text-on-accent: #ffffff !important;
    --zero-accent: #f43f5e !important;
    --zero-dial-stroke: #f43f5e !important;
    --accent-hex: #f43f5e !important;
    --accent-rgb: 244, 63, 94 !important;
    --liquid-accent-glow: rgba(244, 63, 94, 0.40) !important;
    --liquid-accent-soft-glow: rgba(244, 63, 94, 0.18) !important;
    --liquid-accent-vibrant: #f43f5e !important;
    --liquid-accent-tint: #fb7185 !important;
    --accent-shift-1: #e11d48 !important; /* Ruby */
    --accent-shift-2: #f43f5e !important; /* Crimson */
    --accent-shift-3: #be123c !important; /* Deep Velvet */
    --accent-shift-4: #fb7185 !important; /* Rose Blossom */
  }

  /* Liquid Sapphire Accent (replaces Cyber Cyan; supports legacy cyan alias) */
  [data-accent="azure"],
  [data-accent="cyan"],
  html[data-accent="azure"],
  html[data-accent="cyan"] {
    --accent-primary: #0ea5e9 !important;
    --accent-secondary: #38bdf8 !important;
    --accent-soft: rgba(14, 165, 233, 0.18) !important;
    --accent-border: rgba(14, 165, 233, 0.50) !important;
    --text-on-accent: #ffffff !important;
    --zero-accent: #0ea5e9 !important;
    --zero-dial-stroke: #0ea5e9 !important;
    --accent-hex: #0ea5e9 !important;
    --accent-rgb: 14, 165, 233 !important;
    --liquid-accent-glow: rgba(14, 165, 233, 0.40) !important;
    --liquid-accent-soft-glow: rgba(14, 165, 233, 0.18) !important;
    --liquid-accent-vibrant: #0ea5e9 !important;
    --liquid-accent-tint: #38bdf8 !important;
    --accent-shift-1: #0284c7 !important; /* Deep Sapphire */
    --accent-shift-2: #38bdf8 !important; /* Radiant Sky */
    --accent-shift-3: #0369a1 !important; /* Cobalt Sea */
    --accent-shift-4: #7dd3fc !important; /* Arctic Frost */
  }

  /* Electric Indigo Accent (Sleek SaaS / Twilight Neon) */
  [data-accent="indigo"],
  html[data-accent="indigo"] {
    --accent-primary: #6366f1 !important;
    --accent-secondary: #818cf8 !important;
    --accent-soft: rgba(99, 102, 241, 0.18) !important;
    --accent-border: rgba(99, 102, 241, 0.55) !important;
    --text-on-accent: #ffffff !important;
    --zero-accent: #6366f1 !important;
    --zero-dial-stroke: #6366f1 !important;
    --accent-hex: #6366f1 !important;
    --accent-rgb: 99, 102, 241 !important;
    --liquid-accent-glow: rgba(99, 102, 241, 0.38) !important;
    --liquid-accent-soft-glow: rgba(99, 102, 241, 0.18) !important;
    --liquid-accent-vibrant: #6366f1 !important;
    --liquid-accent-tint: #818cf8 !important;
    --accent-shift-1: #4f46e5 !important;
    --accent-shift-2: #6366f1 !important;
    --accent-shift-3: #4338ca !important;
    --accent-shift-4: #a5b4fc !important;
  }

  /* Laser Volt Lime Accent (High-Energy Flagship OLED) */
  [data-accent="lime"],
  html[data-accent="lime"] {
    --accent-primary: #84cc16 !important;
    --accent-secondary: #a3e635 !important;
    --accent-soft: rgba(132, 204, 22, 0.18) !important;
    --accent-border: rgba(132, 204, 22, 0.55) !important;
    --text-on-accent: #0f1c04 !important;
    --zero-accent: #84cc16 !important;
    --zero-dial-stroke: #84cc16 !important;
    --accent-hex: #84cc16 !important;
    --accent-rgb: 132, 204, 22 !important;
    --liquid-accent-glow: rgba(132, 204, 22, 0.38) !important;
    --liquid-accent-soft-glow: rgba(132, 204, 22, 0.18) !important;
    --liquid-accent-vibrant: #84cc16 !important;
    --liquid-accent-tint: #a3e635 !important;
    --accent-shift-1: #65a30d !important;
    --accent-shift-2: #84cc16 !important;
    --accent-shift-3: #4d7c0f !important;
    --accent-shift-4: #bef264 !important;
  }

  /* Ice Platinum Silver Accent (Minimalist Monochrome Diamond) */
  [data-accent="silver"],
  html[data-accent="silver"] {
    --accent-primary: #e2e8f0 !important;
    --accent-secondary: #94a3b8 !important;
    --accent-soft: rgba(226, 232, 240, 0.16) !important;
    --accent-border: rgba(226, 232, 240, 0.45) !important;
    --text-on-accent: #090a0f !important;
    --zero-accent: #e2e8f0 !important;
    --zero-dial-stroke: #e2e8f0 !important;
    --accent-hex: #e2e8f0 !important;
    --accent-rgb: 226, 232, 240 !important;
    --liquid-accent-glow: rgba(226, 232, 240, 0.30) !important;
    --liquid-accent-soft-glow: rgba(226, 232, 240, 0.14) !important;
    --liquid-accent-vibrant: #f8fafc !important;
    --liquid-accent-tint: #cbd5e1 !important;
    --accent-shift-1: #cbd5e1 !important;
    --accent-shift-2: #e2e8f0 !important;
    --accent-shift-3: #94a3b8 !important;
    --accent-shift-4: #f8fafc !important;
  }

  /* -------------------------------------------------------------
     Bold Architectural Typography & Natural Letter-casing
     ------------------------------------------------------------- */
  body, .font-sans {
    font-family: 'Space Grotesk Variable', 'Space Grotesk', system-ui, -apple-system, sans-serif !important;
  }
  h1, h2, h3, h4, .font-display, .font-heading, .liquid-metric {
    font-family: 'Bricolage Grotesque Variable', 'Bricolage Grotesque', 'Space Grotesk Variable', sans-serif !important;
    letter-spacing: -0.025em;
  }
  .liquid-metric {
    font-weight: 800 !important;
    font-variant-numeric: tabular-nums;
  }
  .font-mono {
    font-family: 'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace !important;
    font-variant-numeric: tabular-nums;
  }
  .uppercase {
    text-transform: none !important;
    letter-spacing: 0.01em !important;
  }

  /* -------------------------------------------------------------
     Smooth Micro-Interactions & Hardware Acceleration
     ------------------------------------------------------------- */
  .liquid-spring {
    transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s ease, background-color 0.15s ease, border-color 0.15s ease !important;
  }
  .liquid-spring:active {
    transform: scale(0.97) !important;
  }

  /* -------------------------------------------------------------
     Liquid Glass Surface Cards (Authentic Frosted Acrylic Glass)
     Full-fidelity backdrop-filter blur with specular bevel highlights.
     No intrusive radial color stains or background bleed-through.
     ------------------------------------------------------------- */
  .glass-card,
  .obsidian-card,
  .liquid-glass,
  .liquid-card,
  .theme-card,
  .settings-card,
  [data-frosted-card="true"],
  [data-obsidian-card="true"] {
    background-color: var(--glass-surface-bg, rgba(20, 24, 32, 0.65)) !important;
    background-image:
      linear-gradient(
        160deg,
        rgba(255, 255, 255, calc(var(--glass-opacity, 0.50) * 0.08)) 0%,
        rgba(255, 255, 255, 0.01) 35%,
        rgba(0, 0, 0, 0.20) 100%
      ) !important;
    border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.09)) !important;
    border-top: 1px solid var(--border-specular, rgba(255, 255, 255, 0.28)) !important;
    border-radius: 20px !important;
    box-shadow:
      inset 0 1px 0 0 rgba(255, 255, 255, calc(var(--glass-opacity, 0.50) * 0.22)),
      0 12px 30px -6px rgba(0, 0, 0, 0.65) !important;
    backdrop-filter: var(--surface-blur, blur(18px) saturate(140%)) !important;
    -webkit-backdrop-filter: var(--surface-blur, blur(18px) saturate(140%)) !important;
    text-shadow: var(--glass-text-shadow, none) !important;
    color: var(--text-primary, #f8fafc) !important;
  }

  /* -------------------------------------------------------------
     Ambient Mesh Orbs (Static by Default — Optional Drift Toggle)
     ------------------------------------------------------------- */
  @keyframes ambientMeshGlideA {
    0% {
      transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
    }
    25% {
      transform: translate3d(36px, -24px, 0) scale(1.08) rotate(3deg);
    }
    50% {
      transform: translate3d(64px, 28px, 0) scale(1.02) rotate(-2deg);
    }
    75% {
      transform: translate3d(-14px, 48px, 0) scale(1.11) rotate(3.5deg);
    }
    100% {
      transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
    }
  }

  @keyframes ambientMeshGlideB {
    0% {
      transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
    }
    25% {
      transform: translate3d(-42px, -30px, 0) scale(1.09) rotate(-3.5deg);
    }
    50% {
      transform: translate3d(-24px, 40px, 0) scale(0.95) rotate(2.5deg);
    }
    75% {
      transform: translate3d(40px, -18px, 0) scale(1.06) rotate(-2deg);
    }
    100% {
      transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
    }
  }

  @keyframes ambientMeshGlideC {
    0% {
      transform: translate3d(0, 0, 0) scale(0.94);
      opacity: 0.55;
    }
    33% {
      transform: translate3d(-30px, 36px, 0) scale(1.12);
      opacity: 0.85;
    }
    66% {
      transform: translate3d(34px, -26px, 0) scale(1.03);
      opacity: 0.65;
    }
    100% {
      transform: translate3d(0, 0, 0) scale(0.94);
      opacity: 0.55;
    }
  }

  .ambient-mesh-node-1,
  .ambient-mesh-node-2,
  .ambient-mesh-node-3 {
    animation: none;
    will-change: transform;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform: translateZ(0);
  }

  html[data-ambient-drift="true"]:not([data-gpu-safeguard="true"]) .ambient-mesh-node-1 {
    animation: ambientMeshGlideA 44s cubic-bezier(0.42, 0, 0.58, 1) infinite;
  }
  html[data-ambient-drift="true"]:not([data-gpu-safeguard="true"]) .ambient-mesh-node-2 {
    animation: ambientMeshGlideB 52s cubic-bezier(0.42, 0, 0.58, 1) infinite;
  }
  html[data-ambient-drift="true"]:not([data-gpu-safeguard="true"]) .ambient-mesh-node-3 {
    animation: ambientMeshGlideC 60s cubic-bezier(0.42, 0, 0.58, 1) infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    html[data-ambient-drift="true"] .ambient-mesh-node-1,
    html[data-ambient-drift="true"] .ambient-mesh-node-2,
    html[data-ambient-drift="true"] .ambient-mesh-node-3 {
      animation: none !important;
    }
  }

  .obsidian-inset,
  .liquid-inset {
    background-color: var(--glass-inset-bg, rgba(26, 32, 44, 0.45)) !important;
    border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08)) !important;
    border-top: 1px solid var(--border-specular, rgba(255, 255, 255, 0.18)) !important;
    border-radius: 14px !important;
  }

  .obsidian-inset-neutral,
  .liquid-row {
    background-color: var(--glass-row-bg, rgba(16, 20, 28, 0.36)) !important;
    border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.06)) !important;
    border-radius: 14px !important;
  }

  /* -------------------------------------------------------------
     Fluent Glass Tactile Pills & Buttons (Ultra-Fast 0ms Overhead)
     ------------------------------------------------------------- */
  .theme-pill-active,
  .liquid-pill-active,
  .obsidian-pill-active,
  .action-pill {
    background-color: var(--accent-soft) !important;
    background-image: none !important;
    color: var(--accent-primary) !important;
    border: 1px solid var(--accent-border) !important;
    border-radius: 9999px !important;
    box-shadow: 0 0 14px var(--liquid-accent-soft-glow) !important;
    font-weight: 700 !important;
  }

  .theme-pill,
  .liquid-pill-inactive,
  .obsidian-pill-inactive,
  .action-pill-inactive {
    background-color: rgba(255, 255, 255, 0.07) !important;
    background-image: none !important;
    color: #cbd5e1 !important;
    border: 1px solid rgba(255, 255, 255, 0.11) !important;
    border-radius: 9999px !important;
    font-weight: 600 !important;
  }

  /* -------------------------------------------------------------
     Radial Dial Optical Glass Surface & Zero-Heat Touch Dragging
     ------------------------------------------------------------- */
  .zero-dial-surface {
    background-color: var(--glass-dial-bg, rgba(16, 21, 30, 0.70)) !important;
    background-image:
      radial-gradient(
        circle at 35% 25%,
        rgba(255, 255, 255, 0.08) 0%,
        rgba(255, 255, 255, 0.01) 50%,
        transparent 80%
      ) !important;
    border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.12)) !important;
    border-top: 1px solid var(--border-specular, rgba(255, 255, 255, 0.30)) !important;
    border-radius: 9999px !important;
    backdrop-filter: var(--surface-blur, blur(18px) saturate(140%)) !important;
    -webkit-backdrop-filter: var(--surface-blur, blur(18px) saturate(140%)) !important;
    box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.22), 0 16px 36px -8px rgba(0, 0, 0, 0.70) !important;
    contain: layout style paint;
    touch-action: none !important;
  }

  /* Instant 0ms Tracking on Touch Drag */
  .zero-dial-surface[data-dial-dragging="true"] .zero-dial-knob-layer,
  .zero-dial-surface[data-dial-dragging="true"] .zero-dial-arc {
    transition: none !important;
  }

  /* -------------------------------------------------------------
     Floating Frosted Dock Navigation (Lightweight 8px Blur Only Where Content Scrolls)
     ------------------------------------------------------------- */
  .liquid-dock,
  .zero-bottom-nav,
  nav[data-bottom-nav="true"],
  nav[data-frosted-chrome="true"] {
    background-color: var(--glass-dock-bg, rgba(12, 16, 24, 0.80)) !important;
    border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.10)) !important;
    border-top: 1px solid var(--border-specular, rgba(255, 255, 255, 0.26)) !important;
    border-radius: 2rem !important;
    backdrop-filter: blur(10px) saturate(130%) !important;
    -webkit-backdrop-filter: blur(10px) saturate(130%) !important;
    box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.20), 0 12px 32px -4px rgba(0, 0, 0, 0.65) !important;
  }

  /* -------------------------------------------------------------
     Dynamic Modal & Bottom-Sheet Optical Depth Hierarchy
     ------------------------------------------------------------- */
  .modal-glass,
  [data-modal-glass="true"],
  .zero-modal-card {
    background-color: rgba(12, 15, 20, 0.94) !important;
    background-image: linear-gradient(155deg, rgba(255, 255, 255, 0.07) 0%, transparent 45%) !important;
    backdrop-filter: blur(10px) saturate(125%) !important;
    -webkit-backdrop-filter: blur(10px) saturate(125%) !important;
    border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.12)) !important;
    border-top: 1px solid var(--border-specular, rgba(255, 255, 255, 0.30)) !important;
  }

  /* -------------------------------------------------------------
     Eco Glass Engine & GPU Battery Safeguard (Shaderless Architecture)
     ------------------------------------------------------------- */
  html[data-glass-engine="eco"] .glass-card,
  html[data-glass-engine="eco"] .obsidian-card,
  html[data-glass-engine="eco"] .liquid-glass,
  html[data-glass-engine="eco"] .liquid-card,
  html[data-glass-engine="eco"] .theme-card,
  html[data-glass-engine="eco"] .settings-card,
  html[data-glass-engine="eco"] [data-frosted-card="true"],
  html[data-glass-engine="eco"] [data-obsidian-card="true"],
  html[data-glass-engine="eco"] .zero-dial-surface,
  html[data-glass-engine="eco"] .liquid-dock,
  html[data-glass-engine="eco"] .modal-glass,
  html[data-glass-engine="eco"] [data-modal-glass="true"],
  html[data-gpu-safeguard="true"] .glass-card,
  html[data-gpu-safeguard="true"] .obsidian-card,
  html[data-gpu-safeguard="true"] .liquid-glass,
  html[data-gpu-safeguard="true"] .liquid-card,
  html[data-gpu-safeguard="true"] .theme-card,
  html[data-gpu-safeguard="true"] .settings-card,
  html[data-gpu-safeguard="true"] [data-frosted-card="true"],
  html[data-gpu-safeguard="true"] [data-obsidian-card="true"],
  html[data-gpu-safeguard="true"] .zero-dial-surface,
  html[data-gpu-safeguard="true"] .liquid-dock,
  html[data-gpu-safeguard="true"] .modal-glass,
  html[data-gpu-safeguard="true"] [data-modal-glass="true"] {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    background-color: rgba(14, 18, 24, 0.95) !important;
    background-image: linear-gradient(
      160deg,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 255, 255, 0.01) 40%,
      transparent 100%
    ) !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.75) !important;
  }

  html[data-gpu-safeguard="true"] .ambient-mesh-node-1,
  html[data-gpu-safeguard="true"] .ambient-mesh-node-2,
  html[data-gpu-safeguard="true"] .ambient-mesh-node-3 {
    animation-play-state: paused !important;
  }

  /* -------------------------------------------------------------
     Living Ambient Canvas
     ------------------------------------------------------------- */
  .zero-ambient-canvas {
    display: block !important;
    opacity: 0.90 !important;
  }

  /* Semantic Helper Utilities */
  .theme-bg-primary { background-color: #08090c !important; color: #f8fafc !important; }
  .theme-bg-secondary { background-color: rgba(15, 18, 24, 0.75) !important; color: #f8fafc !important; }
  .theme-text-primary { color: #f8fafc !important; }
  .theme-text-secondary { color: #94a3b8 !important; }
  .theme-text-muted { color: #64748b !important; }
  .theme-text-accent { color: var(--accent-primary) !important; }
  .theme-border { border-color: rgba(255, 255, 255, 0.09) !important; }
`;
