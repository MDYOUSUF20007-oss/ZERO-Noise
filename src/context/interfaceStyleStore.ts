import { createContext, useContext } from 'react';
import {
  type CanonicalThemeId,
  type AccentColorId,
  type InterfaceStyle,
  type ThemeEngineDefinition,
  AVAILABLE_THEMES,
  normalizeThemeId,
} from '../themes';
import type { ClassicPreset, M3Palette } from '../types';

export type { CanonicalThemeId, AccentColorId, InterfaceStyle, ThemeEngineDefinition };
export { AVAILABLE_THEMES, normalizeThemeId };
export type GlassEngineType = 'acrylic' | 'eco';
export type AeroPaletteId = 'orange' | 'espresso' | 'terracotta';

export interface AmoledAccent {
  id: AccentColorId;
  name: string;
  subtitle: string;
  color: string;
  glow: string;
  bg: string;
}

export const AMOLED_ACCENTS: readonly AmoledAccent[] = [
  { id: 'crimson', name: 'Rose Coral', subtitle: 'Neon Coral Ruby', color: '#F43F5E', glow: 'rgba(244, 63, 94, 0.40)', bg: '#4C0519' },
  { id: 'emerald', name: 'Neon Emerald', subtitle: 'Mint Phosphor', color: '#10B981', glow: 'rgba(16, 185, 129, 0.40)', bg: '#022C22' },
  { id: 'silver', name: 'Ice Platinum', subtitle: 'Monochrome Specular', color: '#E2E8F0', glow: 'rgba(226, 232, 240, 0.35)', bg: '#0F172A' },
  { id: 'azure', name: 'Liquid Sapphire', subtitle: 'Deep Arctic Sapphire', color: '#0EA5E9', glow: 'rgba(14, 165, 233, 0.40)', bg: '#082F49' },
  { id: 'amber', name: 'Sunset Amber', subtitle: 'Golden Ember', color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.35)', bg: '#451A03' },
  { id: 'purple', name: 'Cosmic Violet', subtitle: 'Ultraviolet', color: '#A855F7', glow: 'rgba(168, 85, 247, 0.35)', bg: '#3B0764' },
  { id: 'indigo', name: 'Electric Indigo', subtitle: 'Royal Twilight', color: '#6366F1', glow: 'rgba(99, 102, 241, 0.35)', bg: '#1E1B4B' },
  { id: 'lime', name: 'Laser Volt', subtitle: 'Acid Lime', color: '#84CC16', glow: 'rgba(132, 204, 22, 0.35)', bg: '#1A2E05' },
] as const;

export function isAmoledAccent(val: unknown): val is AccentColorId {
  return typeof val === 'string' && (AMOLED_ACCENTS.some((a) => a.id === val) || val === 'cyan');
}

export function applyGlassTokens(root: HTMLElement, strength: number): void {
  const clamped = Math.max(0.05, Math.min(1, Math.round(strength * 100) / 100));
  // Background alpha: from 0.08 at 0.05 up to 0.72 at 1.0 (clear transparent to deep acrylic)
  const bgAlpha = (0.05 + clamped * 0.67).toFixed(3);
  // Blur: from 2px up to 24px
  const blurPx = Math.round(2 + clamped * 22);
  // Saturation: 125% to 185%
  const satPct = Math.round(125 + clamped * 60);
  // Specular border opacity: 0.06 to 0.38
  const specularAlpha = (0.06 + clamped * 0.32).toFixed(3);
  // Top specular optical highlight line: 0.12 to 0.80
  const specularRim = (0.12 + clamped * 0.68).toFixed(3);
  // Sub-elements & Insets
  const insetAlpha = (0.08 + clamped * 0.57).toFixed(3);
  const rowAlpha = (0.06 + clamped * 0.49).toFixed(3);
  const dockAlpha = (0.25 + clamped * 0.60).toFixed(3);
  const dialAlpha = (0.12 + clamped * 0.48).toFixed(3);
  const glowMult = (0.20 + clamped * 0.70).toFixed(3);
  const modalBgAlpha = (0.72 + clamped * 0.22).toFixed(3);
  const modalBlurPx = Math.round(16 + clamped * 12);
  const textShadowRule =
    clamped < 0.25
      ? `0 1px 3px rgba(0, 0, 0, ${(0.85 * (1 - clamped / 0.25)).toFixed(2)})`
      : 'none';

  root.style.setProperty('--glass-opacity', clamped.toString());
  root.style.setProperty('--glass-surface-bg', `rgba(20, 24, 32, ${bgAlpha})`);
  root.style.setProperty('--bg-surface', `rgba(20, 24, 32, ${bgAlpha})`);
  root.style.setProperty('--surface-tonal', `rgba(28, 34, 46, ${(0.10 + clamped * 0.68).toFixed(3)})`);
  root.style.setProperty('--bg-surface-hover', `rgba(32, 38, 52, ${(0.08 + clamped * 0.66).toFixed(3)})`);
  root.style.setProperty('--bg-elevated', `rgba(26, 31, 42, ${(0.10 + clamped * 0.68).toFixed(3)})`);
  root.style.setProperty('--surface-blur', `blur(${blurPx}px) saturate(${satPct}%)`);
  root.style.setProperty('--glass-blur', `${blurPx}px`);
  root.style.setProperty('--border-specular', `rgba(255, 255, 255, ${specularAlpha})`);
  root.style.setProperty('--border-subtle', `rgba(255, 255, 255, ${(0.03 + clamped * 0.11).toFixed(3)})`);
  root.style.setProperty('--glass-specular-opacity', specularRim);
  root.style.setProperty('--glass-inset-bg', `rgba(26, 32, 44, ${insetAlpha})`);
  root.style.setProperty('--glass-row-bg', `rgba(16, 20, 28, ${rowAlpha})`);
  root.style.setProperty('--glass-dock-bg', `rgba(12, 16, 24, ${dockAlpha})`);
  root.style.setProperty('--glass-dial-bg', `rgba(16, 21, 30, ${dialAlpha})`);
  root.style.setProperty('--glass-glow-mult', glowMult);
  root.style.setProperty('--glass-modal-bg', `rgba(12, 15, 22, ${modalBgAlpha})`);
  root.style.setProperty('--glass-modal-blur', `blur(${modalBlurPx}px) saturate(180%)`);
  root.style.setProperty('--glass-text-shadow', textShadowRule);
}

export interface InterfaceStyleContextValue {
  theme: CanonicalThemeId;
  setTheme: (next: InterfaceStyle) => void;
  restartWithTheme: (next: InterfaceStyle) => void;
  accent: AccentColorId;
  setAccent: (next: AccentColorId) => void;
  interfaceStyle: InterfaceStyle;
  setInterfaceStyle: (next: InterfaceStyle) => void;
  style: InterfaceStyle;
  setStyle: (next: InterfaceStyle) => void;
  activeEngine: ThemeEngineDefinition;
  availableThemes: readonly ThemeEngineDefinition[];

  // Compatibility properties for zero-noise components
  engine: string;
  setEngine: (next: string) => void;
  isOnyx: boolean;
  isFintech: boolean;
  isClassic: boolean;
  isClassicV2: boolean;
  isTrantor: boolean;
  isMaterialYou: boolean;
  isFluent: boolean;
  isFluentGlass: boolean;
  isLiquidGlass: boolean;
  isAetherial: boolean;
  isAero: boolean;
  isDusk: boolean;
  aeroPalette: AeroPaletteId;
  setAeroPalette: (palette: AeroPaletteId) => void;
  aeroAccentColor: string;
  isMinimalist: boolean;
  isBespoke: boolean;

  classicPreset: ClassicPreset;
  setClassicPreset: (p: ClassicPreset) => void;
  m3Palette: M3Palette;
  setM3Palette: (p: M3Palette) => void;
  amoled: boolean;
  setAmoled: (a: boolean) => void;
  materialYouSeed: string;
  setMaterialYouSeed: (s: any) => void;
  materialYouAmoled: boolean;
  setMaterialYouAmoled: (a: boolean) => void;
  fluentOrbIntensity: number;
  setFluentOrbIntensity: (i: number) => void;
  fluentGlassStrength: number;
  setFluentGlassStrength: (s: number) => void;
  gpuThermalSafeguard: boolean;
  setGpuThermalSafeguard: (enabled: boolean) => void;
  ambientDriftEnabled: boolean;
  setAmbientDriftEnabled: (enabled: boolean) => void;
  glassEngine: GlassEngineType;
  setGlassEngine: (engine: GlassEngineType) => void;
  targetFps: number;
  setTargetFps: (fps: number) => void;
  fluentBlurStrength: number;
  setFluentBlurStrength: (b: number) => void;
  fluentSpecularHighlight: number;
  setFluentSpecularHighlight: (s: number) => void;
  minimalistBorderWidth: string;
  setMinimalistBorderWidth: (b: string) => void;
  minimalistTypography: string;
  setMinimalistTypography: (t: string) => void;
  minimalistTelemetryDensity: string;
  setMinimalistTelemetryDensity: (d: string) => void;
  classicV2Surface: string;
  setClassicV2Surface: (s: string) => void;
  classicV2Accent: string;
  setClassicV2Accent: (a: string) => void;
  trantorSurface: string;
  setTrantorSurface: (s: string) => void;
  trantorAccent: string;
  setTrantorAccent: (a: string) => void;
}

export const InterfaceStyleContext = createContext<InterfaceStyleContextValue | undefined>(undefined);

export function useInterfaceStyle(): InterfaceStyleContextValue {
  const context = useContext(InterfaceStyleContext);
  if (!context) {
    throw new Error('useInterfaceStyle must be used within an InterfaceStyleProvider');
  }
  return context;
}

export const useTheme = useInterfaceStyle;
