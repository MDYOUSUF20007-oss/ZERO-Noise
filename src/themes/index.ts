import { type CanonicalThemeId, type ThemeEngineDefinition } from './types';
import { fluentEngine } from './engine-fluent';
import { materialEngine } from './engine-material';

export * from './types';
export { fluentEngine } from './engine-fluent';
export { materialEngine } from './engine-material';
export { materialEngine as aeroEngine };
export { materialEngine as duskEngine };

export const THEME_ENGINES: Record<CanonicalThemeId, ThemeEngineDefinition> = {
  fluent: fluentEngine,
  material: materialEngine,
  aetherial: fluentEngine,
  aero: materialEngine,
  dusk: materialEngine,
};

export const AVAILABLE_THEMES: readonly ThemeEngineDefinition[] = [
  fluentEngine,
  materialEngine,
] as const;

export function normalizeThemeId(raw?: string | null): CanonicalThemeId {
  if (!raw) return 'fluent';
  const cleaned = raw.toLowerCase().trim();
  if (
    cleaned === 'fluent' ||
    cleaned === 'fluent_glass' ||
    cleaned === 'glass' ||
    cleaned === 'liquid_glass' ||
    cleaned === 'acrylic'
  ) {
    return 'fluent';
  }
  if (
    cleaned === 'material' ||
    cleaned === 'material_dusk' ||
    cleaned === 'material-you' ||
    cleaned === 'material_you' ||
    cleaned === 'aero' ||
    cleaned === 'aero_ui' ||
    cleaned === 'aeroui' ||
    cleaned === 'light' ||
    cleaned === 'dusk' ||
    cleaned === 'twilight' ||
    cleaned === 'night'
  ) {
    return 'material';
  }
  if (cleaned === 'aetherial' || cleaned === 'aetherial_focus' || cleaned === 'cosmic') {
    return 'fluent';
  }
  return 'fluent';
}
