import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import {
  type CanonicalThemeId,
  type AccentColorId,
  type InterfaceStyle,
  type ThemeEngineDefinition,
  THEME_ENGINES,
  AVAILABLE_THEMES,
  normalizeThemeId,
} from '../themes';
import type { ThemeConfig } from '../types';
import { initActiveThemeMod, removeActiveModStyles } from '../utils/themeMods';
import { setNativeTargetFps } from '../plugins/zeroBridge';
import {
  InterfaceStyleContext,
  type InterfaceStyleContextValue,
  type GlassEngineType,
  type AeroPaletteId,
  type AmoledAccent,
  isAmoledAccent,
  applyGlassTokens,
} from './interfaceStyleStore';

export type {
  CanonicalThemeId,
  AccentColorId,
  InterfaceStyle,
  ThemeEngineDefinition,
  GlassEngineType,
  AeroPaletteId,
  AmoledAccent,
  InterfaceStyleContextValue,
};

const STORAGE_KEY_THEME = 'zero_isolated_theme_engine_v5';
const STORAGE_KEY_ACCENT = 'zero_theme_accent_seed_v5';
const STORAGE_KEY_AERO_PALETTE = 'zero_aero_palette_v1';
const STORAGE_KEY_GLOW = 'zero_ambient_glow_intensity_v1';
const STORAGE_KEY_GLASS_STRENGTH = 'zero_fluent_glass_strength_v1';
const STORAGE_KEY_GPU_SAFEGUARD = 'zero_gpu_thermal_safeguard_v1';
const STORAGE_KEY_AMBIENT_DRIFT = 'zero_ambient_drift_enabled_v1';
const STORAGE_KEY_GLASS_ENGINE = 'zero_glass_engine_v1';
const STORAGE_KEY_TARGET_FPS = 'zero_target_fps_v1';
const STYLE_TAG_ID = 'zero-active-theme-engine';

const LEGACY_STORAGE_KEYS = [
  'zero_theme',
  'zero_interface_style',
  'interface_style',
  'interfaceStyle',
  'app_theme',
  'theme',
  'custom_theme',
  'theme_studio_config',
  'zero_custom_theme',
  'zero_theme_v2',
  'zero_clean_theme_v3',
  'zero_isolated_theme_engine_v4',
];

const LEGACY_CLASSES = [
  'theme-classic',
  'theme-minimalist',
  'theme-minimal',
  'theme-fluent',
  'theme-glass',
  'theme-liquid-glass',
  'theme-amoled',
  'theme-onyx',
  'theme-fintech',
  'theme-material',
  'theme-kindle',
  'classic',
  'minimalist',
  'fluent',
  'amoled',
  'material',
];

function mountIsolatedThemeEngine(
  themeId: CanonicalThemeId,
  accent: AccentColorId,
  glowIntensity = 0.35,
  glassStrength = 0.50
): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const body = document.body;

  // 1. Wipe all inline styles on <html> and <body> so nothing overrides the active engine
  root.removeAttribute('style');
  if (body) {
    body.removeAttribute('style');
    body.removeAttribute('data-theme');
    body.removeAttribute('data-engine');
    body.removeAttribute('data-accent');
    body.removeAttribute('data-style');
    body.classList.remove(...LEGACY_CLASSES);
  }

  // 2. Set strict DOM attributes
  root.classList.remove(...LEGACY_CLASSES);
  root.removeAttribute('data-style');
  root.setAttribute('data-theme', themeId);
  root.setAttribute('data-engine', themeId);
  root.setAttribute('data-accent', accent);
  if (themeId === 'aero') {
    root.setAttribute('data-interface-style', 'aero');
    root.classList.remove('dark');
    root.classList.add('light');
    const palColor = '#E69F86';
    root.setAttribute('data-aero-palette', 'orange');
    root.style.setProperty('--aero-palette-color', palColor);
    root.style.setProperty('--aero-ink-primary', '#353B5B');
    root.style.setProperty('--accent-primary', palColor);
    root.style.setProperty('--accent-hex', palColor);
    root.style.setProperty('--accent-rgb', '230, 159, 134');
  } else if (themeId === 'dusk') {
    root.setAttribute('data-interface-style', 'dusk');
    root.classList.remove('light');
    root.classList.add('dark');
    const palColor = '#E69F86';
    root.style.setProperty('--accent-primary', palColor);
    root.style.setProperty('--accent-hex', palColor);
    root.style.setProperty('--accent-rgb', '230, 159, 134');
    root.style.setProperty('--ambient-glow-opacity', glowIntensity.toString());
    root.style.setProperty('--ambient-glow-scale', (0.75 + glowIntensity * 0.45).toString());
    applyGlassTokens(root, glassStrength);
  } else {
    // Fluent Glass (Flagship / Default)
    root.removeAttribute('data-interface-style');
    root.classList.remove('light');
    root.classList.add('dark');
    root.setAttribute('data-theme', 'fluent');
    root.setAttribute('data-engine', 'fluent');
    root.setAttribute('data-accent', accent);

    const accentConfig: Record<AccentColorId, { hex: string; rgb: string; tint: string; glow: string; softGlow: string }> = {
      crimson: { hex: '#f43f5e', rgb: '244, 63, 94', tint: '#fb7185', glow: 'rgba(244, 63, 94, 0.40)', softGlow: 'rgba(244, 63, 94, 0.18)' },
      emerald: { hex: '#10b981', rgb: '16, 185, 129', tint: '#34d399', glow: 'rgba(16, 185, 129, 0.40)', softGlow: 'rgba(16, 185, 129, 0.18)' },
      silver: { hex: '#e2e8f0', rgb: '226, 232, 240', tint: '#f8fafc', glow: 'rgba(226, 232, 240, 0.35)', softGlow: 'rgba(226, 232, 240, 0.15)' },
      azure: { hex: '#0ea5e9', rgb: '14, 165, 233', tint: '#38bdf8', glow: 'rgba(14, 165, 233, 0.40)', softGlow: 'rgba(14, 165, 233, 0.18)' },
      cyan: { hex: '#0ea5e9', rgb: '14, 165, 233', tint: '#38bdf8', glow: 'rgba(14, 165, 233, 0.40)', softGlow: 'rgba(14, 165, 233, 0.18)' },
      indigo: { hex: '#6366f1', rgb: '99, 102, 241', tint: '#818cf8', glow: 'rgba(99, 102, 241, 0.35)', softGlow: 'rgba(99, 102, 241, 0.16)' },
      purple: { hex: '#a855f7', rgb: '168, 85, 247', tint: '#c084fc', glow: 'rgba(168, 85, 247, 0.35)', softGlow: 'rgba(168, 85, 247, 0.16)' },
      amber: { hex: '#f59e0b', rgb: '245, 158, 11', tint: '#fbbf24', glow: 'rgba(245, 158, 11, 0.35)', softGlow: 'rgba(245, 158, 11, 0.16)' },
      lime: { hex: '#84cc16', rgb: '132, 204, 22', tint: '#a3e635', glow: 'rgba(132, 204, 22, 0.35)', softGlow: 'rgba(132, 204, 22, 0.16)' },
    };

    const cfg = accentConfig[accent] || accentConfig.crimson;
    root.style.setProperty('--accent-primary', cfg.hex);
    root.style.setProperty('--accent-hex', cfg.hex);
    root.style.setProperty('--accent-rgb', cfg.rgb);
    root.style.setProperty('--liquid-accent-vibrant', cfg.hex);
    root.style.setProperty('--liquid-accent-tint', cfg.tint);
    root.style.setProperty('--liquid-accent-glow', cfg.glow);
    root.style.setProperty('--liquid-accent-soft-glow', cfg.softGlow);
    root.style.setProperty('--zero-accent', cfg.hex);
    root.style.setProperty('--zero-dial-stroke', cfg.hex);
    try {
      window.ZeroNative?.setActiveThemeAccent?.(cfg.hex, cfg.rgb, '#000000');
    } catch {}

    // Set real-time ambient glow parameters
    root.style.setProperty('--ambient-glow-opacity', glowIntensity.toString());
    root.style.setProperty('--ambient-glow-scale', (0.75 + glowIntensity * 0.45).toString());
    // Set real-time fluent glass parameters
    applyGlassTokens(root, glassStrength);
  }

  // Restore GPU Battery & Thermal Safeguard, Glass Engine, Target FPS & optional Ambient Drift attributes
  try {
    if (window.localStorage.getItem(STORAGE_KEY_GPU_SAFEGUARD) === 'true') {
      root.setAttribute('data-gpu-safeguard', 'true');
    }
    const savedGlass = window.localStorage.getItem(STORAGE_KEY_GLASS_ENGINE);
    if (savedGlass === 'eco') {
      root.setAttribute('data-glass-engine', 'eco');
    } else {
      root.setAttribute('data-glass-engine', 'acrylic');
    }
    const savedFps = window.localStorage.getItem(STORAGE_KEY_TARGET_FPS);
    if (savedFps) {
      root.setAttribute('data-target-fps', savedFps);
      root.style.setProperty('--zero-target-fps', savedFps);
    }
    const savedDrift = window.localStorage.getItem(STORAGE_KEY_AMBIENT_DRIFT);
    if (savedDrift === null || savedDrift === 'true') {
      root.setAttribute('data-ambient-drift', 'true');
    } else {
      root.removeAttribute('data-ambient-drift');
    }
  } catch {
    // ignore
  }

  // 3. Destroy previous theme engine CSS and mount ONLY the active theme engine file's CSS
  let styleTag = document.getElementById(STYLE_TAG_ID) as HTMLStyleElement | null;
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = STYLE_TAG_ID;
    styleTag.setAttribute('type', 'text/css');
    document.head.appendChild(styleTag);
  }

  const engine = THEME_ENGINES[themeId] ?? THEME_ENGINES.aero;
  styleTag.textContent = engine.css;
}

export interface InterfaceStyleProviderProps {
  children: ReactNode;
  engine?: string;
  setEngine?: (engine: string) => void;
  interfaceStyle?: InterfaceStyle;
  setInterfaceStyle?: (next: any) => void;
  materialYouSeed?: string;
  setMaterialYouSeed?: (s: any) => void;
  materialYouAmoled?: boolean;
  setMaterialYouAmoled?: (a: boolean) => void;
  themeConfig?: ThemeConfig;
  setThemeConfig?: (next: ThemeConfig) => void;
}

export function InterfaceStyleProvider({
  children,
  interfaceStyle: interfaceStyleProp,
  setInterfaceStyle: setInterfaceStyleProp,
  materialYouSeed: materialYouSeedProp,
  setMaterialYouSeed: setMaterialYouSeedProp,
}: InterfaceStyleProviderProps) {
  const isBespokeActive = interfaceStyleProp === 'bespoke' || interfaceStyleProp === 'minimalist';

  const [accent, setAccentState] = useState<AccentColorId>(() => {
    if (typeof window === 'undefined') return 'crimson';
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY_ACCENT);
      if (saved === 'cyan') return 'azure';
      if (isAmoledAccent(saved)) {
        return saved as AccentColorId;
      }
    } catch {}
    if (isAmoledAccent(materialYouSeedProp)) {
      return (materialYouSeedProp === 'cyan' ? 'azure' : materialYouSeedProp) as AccentColorId;
    }
    return 'crimson';
  });

  const [aeroPalette, setAeroPaletteState] = useState<AeroPaletteId>(() => {
    if (typeof window === 'undefined') return 'orange';
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY_AERO_PALETTE);
      if (saved === 'orange' || saved === 'espresso' || saved === 'terracotta') return saved as AeroPaletteId;
      if (saved === 'ink') return 'espresso';
      if (saved === 'azure' || saved === 'emerald' || saved === 'amber') return 'orange';
    } catch {}
    return 'orange';
  });

  const aeroAccentColor =
    aeroPalette === 'espresso'
      ? '#353B5B'
      : aeroPalette === 'terracotta'
      ? '#D87255'
      : '#E69F86';

  const setAeroPalette = useCallback((nextPalette: AeroPaletteId) => {
    setAeroPaletteState(nextPalette);
    try {
      window.localStorage.setItem(STORAGE_KEY_AERO_PALETTE, nextPalette);
    } catch {}
    const color =
      nextPalette === 'espresso'
        ? '#353B5B'
        : nextPalette === 'terracotta'
        ? '#D87255'
        : '#E69F86';
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-aero-palette', nextPalette);
      document.documentElement.style.setProperty('--aero-palette-color', color);
      document.documentElement.style.setProperty('--aero-ink-primary', '#353B5B');
      document.documentElement.style.setProperty('--accent-primary', color);
      document.documentElement.style.setProperty('--accent-hex', color);
    }
  }, []);

  const [fluentOrbIntensity, setFluentOrbIntensityState] = useState<number>(() => {
    if (typeof window === 'undefined') return 0.35;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY_GLOW);
      if (saved !== null) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) return parsed;
      }
      return 0.35;
    } catch {
      return 0.35;
    }
  });

  const [fluentGlassStrength, setFluentGlassStrengthState] = useState<number>(() => {
    if (typeof window === 'undefined') return 0.50;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY_GLASS_STRENGTH);
      if (saved !== null) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 0.05 && parsed <= 1) return parsed;
      }
      return 0.50;
    } catch {
      return 0.50;
    }
  });

  const [gpuThermalSafeguard, setGpuThermalSafeguardState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY_GPU_SAFEGUARD);
      if (saved !== null) return saved === 'true';
      if (window.matchMedia && window.matchMedia('(prefers-reduced-transparency: reduce)').matches) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  });

  const [ambientDriftEnabled, setAmbientDriftEnabledState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY_AMBIENT_DRIFT);
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const [glassEngine, setGlassEngineState] = useState<GlassEngineType>(() => {
    if (typeof window === 'undefined') return 'acrylic';
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY_GLASS_ENGINE);
      return saved === 'eco' ? 'eco' : 'acrylic';
    } catch {
      return 'acrylic';
    }
  });

  const [targetFps, setTargetFpsState] = useState<number>(() => {
    if (typeof window === 'undefined') return 120;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY_TARGET_FPS);
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed)) return parsed;
      }
      return 120;
    } catch {
      return 120;
    }
  });

  const [theme, setThemeState] = useState<CanonicalThemeId>(() => {
    if (typeof window === 'undefined') return 'fluent';
    try {
      for (const oldKey of LEGACY_STORAGE_KEYS) {
        window.localStorage.removeItem(oldKey);
      }
      const saved = window.localStorage.getItem(STORAGE_KEY_THEME);
      return normalizeThemeId(saved);
    } catch {
      return 'fluent';
    }
  });

  const setFluentOrbIntensity = useCallback((intensity: number) => {
    const clamped = Math.max(0, Math.min(1, Math.round(intensity * 100) / 100));
    setFluentOrbIntensityState(clamped);
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--ambient-glow-opacity', clamped.toString());
      document.documentElement.style.setProperty('--ambient-glow-scale', (0.75 + clamped * 0.45).toString());
    }
    try {
      window.localStorage.setItem(STORAGE_KEY_GLOW, clamped.toString());
    } catch {
      // ignore
    }
  }, []);

  const setFluentGlassStrength = useCallback((strength: number) => {
    const clamped = Math.max(0.05, Math.min(1, Math.round(strength * 100) / 100));
    setFluentGlassStrengthState(clamped);
    if (typeof document !== 'undefined') {
      applyGlassTokens(document.documentElement, clamped);
    }
    try {
      window.localStorage.setItem(STORAGE_KEY_GLASS_STRENGTH, clamped.toString());
    } catch {
      // ignore
    }
  }, []);

  const setGpuThermalSafeguard = useCallback((enabled: boolean) => {
    setGpuThermalSafeguardState(enabled);
    if (typeof document !== 'undefined') {
      if (enabled) {
        document.documentElement.setAttribute('data-gpu-safeguard', 'true');
      } else {
        document.documentElement.removeAttribute('data-gpu-safeguard');
      }
    }
    try {
      window.localStorage.setItem(STORAGE_KEY_GPU_SAFEGUARD, enabled.toString());
    } catch {
      // ignore
    }
  }, []);

  const setAmbientDriftEnabled = useCallback((enabled: boolean) => {
    setAmbientDriftEnabledState(enabled);
    if (typeof document !== 'undefined') {
      if (enabled) {
        document.documentElement.setAttribute('data-ambient-drift', 'true');
      } else {
        document.documentElement.removeAttribute('data-ambient-drift');
      }
    }
    try {
      window.localStorage.setItem(STORAGE_KEY_AMBIENT_DRIFT, enabled.toString());
    } catch {
      // ignore
    }
  }, []);

  const setGlassEngine = useCallback((engine: GlassEngineType) => {
    setGlassEngineState(engine);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-glass-engine', engine);
    }
    try {
      window.localStorage.setItem(STORAGE_KEY_GLASS_ENGINE, engine);
    } catch {
      // ignore
    }
  }, []);

  const setTargetFps = useCallback((fps: number) => {
    setTargetFpsState(fps);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-target-fps', fps.toString());
      document.documentElement.style.setProperty('--zero-target-fps', fps.toString());
    }
    try {
      window.localStorage.setItem(STORAGE_KEY_TARGET_FPS, fps.toString());
    } catch {
      // ignore
    }
    void setNativeTargetFps(fps);
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-glass-engine', glassEngine);
    }
  }, [glassEngine]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-target-fps', targetFps.toString());
      document.documentElement.style.setProperty('--zero-target-fps', targetFps.toString());
    }
    void setNativeTargetFps(targetFps);
  }, [targetFps]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (ambientDriftEnabled) {
        document.documentElement.setAttribute('data-ambient-drift', 'true');
      } else {
        document.documentElement.removeAttribute('data-ambient-drift');
      }
    }
  }, [ambientDriftEnabled]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (gpuThermalSafeguard) {
        document.documentElement.setAttribute('data-gpu-safeguard', 'true');
      } else {
        document.documentElement.removeAttribute('data-gpu-safeguard');
      }
    }
  }, [gpuThermalSafeguard]);

  useEffect(() => {
    const currentGlow = isBespokeActive ? 0 : fluentOrbIntensity;
    const currentGlass = isBespokeActive ? 0.05 : fluentGlassStrength;
    mountIsolatedThemeEngine(theme, accent, currentGlow, currentGlass);
    initActiveThemeMod();
    try {
      window.localStorage.setItem(STORAGE_KEY_THEME, theme);
      window.localStorage.setItem(STORAGE_KEY_ACCENT, accent);
      window.localStorage.setItem(STORAGE_KEY_GLOW, fluentOrbIntensity.toString());
      window.localStorage.setItem(STORAGE_KEY_GLASS_STRENGTH, fluentGlassStrength.toString());
    } catch {
      // Ignore storage errors
    }
  }, [theme, accent, fluentOrbIntensity, fluentGlassStrength, isBespokeActive]);

  const setInterfaceStyle = useCallback((next: InterfaceStyle) => {
    const isNextBespoke = next === 'bespoke' || next === 'minimalist';
    const normalized = normalizeThemeId(next);
    setInterfaceStyleProp?.(isNextBespoke ? 'bespoke' : normalized);
    setThemeState(normalized);
    try {
      window.localStorage.setItem(STORAGE_KEY_THEME, normalized);
    } catch {
      // ignore
    }
    mountIsolatedThemeEngine(
      normalized,
      accent,
      isNextBespoke ? 0 : (fluentOrbIntensity > 0 ? fluentOrbIntensity : 0.35),
      isNextBespoke ? 0.05 : fluentGlassStrength
    );
  }, [setInterfaceStyleProp, accent, fluentOrbIntensity, fluentGlassStrength]);

  const restartWithTheme = useCallback((nextTheme: InterfaceStyle) => {
    if (typeof window === 'undefined') return;
    try {
      const normalized = normalizeThemeId(nextTheme);
      window.localStorage.setItem(STORAGE_KEY_THEME, normalized);
      document.documentElement.removeAttribute('style');
      if (document.body) document.body.removeAttribute('style');
    } catch {
      // ignore
    }
    window.location.reload();
  }, []);

  const setAccent = useCallback((nextAccent: AccentColorId) => {
    const safeAccent: AccentColorId = nextAccent === 'cyan' ? 'azure' : (isAmoledAccent(nextAccent) ? nextAccent : 'crimson');
    removeActiveModStyles();
    mountIsolatedThemeEngine(theme, safeAccent, isBespokeActive ? 0 : fluentOrbIntensity, fluentGlassStrength);
    setAccentState(safeAccent);
    setMaterialYouSeedProp?.(safeAccent);
    try {
      window.localStorage.setItem(STORAGE_KEY_ACCENT, safeAccent);
    } catch {
      // Ignore storage errors
    }
  }, [theme, fluentOrbIntensity, fluentGlassStrength, isBespokeActive, setMaterialYouSeedProp]);

  const value = useMemo<InterfaceStyleContextValue>(
    () => ({
      theme,
      setTheme: setInterfaceStyle,
      restartWithTheme,
      accent,
      setAccent,
      interfaceStyle: isBespokeActive ? 'bespoke' : theme,
      setInterfaceStyle,
      style: isBespokeActive ? 'bespoke' : theme,
      setStyle: setInterfaceStyle,
      activeEngine: THEME_ENGINES[theme] ?? THEME_ENGINES.aero,
      availableThemes: AVAILABLE_THEMES,

      engine: isBespokeActive ? 'bespoke' : theme,
      setEngine: setInterfaceStyle,
      isOnyx: false,
      isFintech: false,
      isClassic: false,
      isClassicV2: false,
      isTrantor: false,
      isMaterialYou: false,
      isFluent: theme === 'fluent' && !isBespokeActive,
      isFluentGlass: theme === 'fluent' && !isBespokeActive,
      isLiquidGlass: theme === 'fluent' && !isBespokeActive,
      isAetherial: theme === 'aetherial' && !isBespokeActive,
      isAero: theme === 'aero' && !isBespokeActive,
      isDusk: theme === 'dusk' && !isBespokeActive,
      aeroPalette,
      setAeroPalette,
      aeroAccentColor: theme === 'fluent' ? '#00f0ff' : aeroAccentColor,
      isMinimalist: isBespokeActive,
      isBespoke: isBespokeActive,

      classicPreset: 'amoled',
      setClassicPreset: () => {},
      m3Palette: accent === 'cyan' ? 'cyber-cyan' : 'deep-purple',
      setM3Palette: () => {},
      amoled: true,
      setAmoled: () => {},
      materialYouSeed: accent,
      setMaterialYouSeed: (s: any) => {
        setAccent(isAmoledAccent(s) ? s : 'cyan');
      },
      materialYouAmoled: true,
      setMaterialYouAmoled: () => {},
      fluentOrbIntensity,
      setFluentOrbIntensity,
      fluentGlassStrength,
      setFluentGlassStrength,
      gpuThermalSafeguard,
      setGpuThermalSafeguard,
      ambientDriftEnabled,
      setAmbientDriftEnabled,
      glassEngine,
      setGlassEngine,
      targetFps,
      setTargetFps,
      fluentBlurStrength: Math.round(2 + fluentGlassStrength * 22),
      setFluentBlurStrength: (b: number) => {
        const normalized = Math.max(0.05, Math.min(1, (b - 2) / 22));
        setFluentGlassStrength(normalized);
      },
      fluentSpecularHighlight: Math.round((0.12 + fluentGlassStrength * 0.68) * 100) / 100,
      setFluentSpecularHighlight: (s: number) => {
        const normalized = Math.max(0.05, Math.min(1, (s - 0.12) / 0.68));
        setFluentGlassStrength(normalized);
      },
      minimalistBorderWidth: '1px',
      setMinimalistBorderWidth: () => {},
      minimalistTypography: 'sans',
      setMinimalistTypography: () => {},
      minimalistTelemetryDensity: 'standard',
      setMinimalistTelemetryDensity: () => {},
      classicV2Surface: 'obsidian',
      setClassicV2Surface: () => {},
      classicV2Accent: accent === 'cyan' ? '#00f0ff' : '#a855f7',
      setClassicV2Accent: () => {},
      trantorSurface: 'matte',
      setTrantorSurface: () => {},
      trantorAccent: accent === 'cyan' ? '#67d4ff' : '#d0bcff',
      setTrantorAccent: () => {},
    }),
    [
      theme,
      isBespokeActive,
      setInterfaceStyle,
      restartWithTheme,
      accent,
      setAccent,
      fluentOrbIntensity,
      setFluentOrbIntensity,
      fluentGlassStrength,
      setFluentGlassStrength,
      gpuThermalSafeguard,
      setGpuThermalSafeguard,
      ambientDriftEnabled,
      setAmbientDriftEnabled,
      glassEngine,
      setGlassEngine,
      targetFps,
      setTargetFps,
      aeroPalette,
      setAeroPalette,
      aeroAccentColor,
    ]
  );

  return (
    <InterfaceStyleContext.Provider value={value}>
      {children}
    </InterfaceStyleContext.Provider>
  );
}

export const ThemeProvider = InterfaceStyleProvider;
