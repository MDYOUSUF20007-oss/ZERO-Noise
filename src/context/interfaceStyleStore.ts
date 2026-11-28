import { createContext, useContext } from 'react';
import {
  type CanonicalThemeId,
  type MaterialAppearanceMode,
  type AccentColorId,
  type InterfaceStyle,
  type ThemeEngineDefinition,
  AVAILABLE_THEMES,
  normalizeThemeId,
} from '../themes';
import type { ClassicPreset, M3Palette } from '../types';

export type { CanonicalThemeId, MaterialAppearanceMode, AccentColorId, InterfaceStyle, ThemeEngineDefinition };
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
  // Silicate glass alpha: 0.08 at 0.05 up to 0.72 at 1.0 (transparent optical pane to deep VisionOS frost)
  const bgAlpha = (0.05 + clamped * 0.67).toFixed(3);
  // Backdrop blur calibrated to Apple VisionOS optical clarity (8px to 32px)
  const blurPx = Math.round(6 + clamped * 26);
  // Optical silicate vibrancy: high chromatic saturation + gentle luminance lift
  const satPct = Math.round(145 + clamped * 55);
  const brightPct = (1.02 + clamped * 0.06).toFixed(3);
  // Fresnel grazing rim & specular bevel opacity
  const specularAlpha = (0.10 + clamped * 0.28).toFixed(3);
  const specularRim = (0.20 + clamped * 0.65).toFixed(3);
  const fresnelTop = (0.16 + clamped * 0.22).toFixed(3);
  const fresnelEdge = (0.07 + clamped * 0.11).toFixed(3);
  const fresnelBottom = (0.03 + clamped * 0.06).toFixed(3);
  const sheenTop = (0.06 + clamped * 0.08).toFixed(3);
  const sheenMid = (0.02 + clamped * 0.025).toFixed(3);
  // Sub-elements, pills & insets
  const insetAlpha = (0.12 + clamped * 0.52).toFixed(3);
  const rowAlpha = (0.08 + clamped * 0.44).toFixed(3);
  const dockAlpha = (0.34 + clamped * 0.50).toFixed(3);
  const dockBlurPx = Math.round(14 + clamped * 14);
  const dialAlpha = (0.20 + clamped * 0.48).toFixed(3);
  const pillAlpha = (0.05 + clamped * 0.05).toFixed(3);
  const pillHoverAlpha = (0.10 + clamped * 0.06).toFixed(3);
  const glowMult = (0.24 + clamped * 0.68).toFixed(3);
  const modalBgAlpha = (0.74 + clamped * 0.20).toFixed(3);
  const modalBlurPx = Math.round(18 + clamped * 12);
  const textShadowRule =
    clamped < 0.30
      ? `0 1px 4px rgba(0, 0, 0, ${(0.85 * (1 - clamped / 0.30)).toFixed(2)})`
      : '0 1px 10px rgba(0, 0, 0, 0.22)';

  root.style.setProperty('--glass-opacity', clamped.toString());
  root.style.setProperty('--glass-surface-bg', `rgba(18, 22, 32, ${bgAlpha})`);
  root.style.setProperty('--bg-surface', `rgba(18, 22, 32, ${bgAlpha})`);
  root.style.setProperty('--surface-tonal', `rgba(26, 32, 46, ${(0.12 + clamped * 0.64).toFixed(3)})`);
  root.style.setProperty('--bg-surface-hover', `rgba(30, 38, 54, ${(0.10 + clamped * 0.62).toFixed(3)})`);
  root.style.setProperty('--bg-elevated', `rgba(24, 30, 44, ${(0.12 + clamped * 0.64).toFixed(3)})`);
  root.style.setProperty('--surface-blur', `blur(${blurPx}px) saturate(${satPct}%) brightness(${brightPct})`);
  root.style.setProperty('--glass-blur', `${blurPx}px`);
  root.style.setProperty('--border-specular', `rgba(255, 255, 255, ${specularAlpha})`);
  root.style.setProperty('--border-subtle', `rgba(255, 255, 255, ${(0.05 + clamped * 0.11).toFixed(3)})`);
  root.style.setProperty('--glass-fresnel-top', `rgba(255, 255, 255, ${fresnelTop})`);
  root.style.setProperty('--glass-fresnel-edge', `rgba(255, 255, 255, ${fresnelEdge})`);
  root.style.setProperty('--glass-fresnel-bottom', `rgba(255, 255, 255, ${fresnelBottom})`);
  root.style.setProperty('--glass-sheen-top', `rgba(255, 255, 255, ${sheenTop})`);
  root.style.setProperty('--glass-sheen-mid', `rgba(196, 220, 255, ${sheenMid})`);
  root.style.setProperty('--glass-specular-opacity', specularRim);
  root.style.setProperty('--glass-inset-bg', `rgba(24, 30, 44, ${insetAlpha})`);
  root.style.setProperty('--glass-row-bg', `rgba(15, 19, 28, ${rowAlpha})`);
  root.style.setProperty('--glass-dock-bg', `rgba(12, 16, 26, ${dockAlpha})`);
  root.style.setProperty('--glass-dock-blur', `blur(${dockBlurPx}px) saturate(${Math.min(200, satPct + 15)}%) brightness(1.05)`);
  root.style.setProperty('--glass-dial-bg', `rgba(14, 18, 28, ${dialAlpha})`);
  root.style.setProperty('--glass-pill-bg', `rgba(255, 255, 255, ${pillAlpha})`);
  root.style.setProperty('--glass-pill-hover-bg', `rgba(255, 255, 255, ${pillHoverAlpha})`);
  root.style.setProperty('--glass-glow-mult', glowMult);
  root.style.setProperty('--glass-modal-bg', `rgba(11, 14, 22, ${modalBgAlpha})`);
  root.style.setProperty('--glass-modal-blur', `blur(${modalBlurPx}px) saturate(190%) brightness(1.04)`);
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
  isMaterial: boolean;
  materialMode: MaterialAppearanceMode;
  setMaterialMode: (mode: MaterialAppearanceMode) => void;
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
