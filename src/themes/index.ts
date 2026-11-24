import { type CanonicalThemeId, type ThemeEngineDefinition } from './types';
import { fluentEngine } from './engine-fluent';
import { aeroEngine } from './engine-aero';
import { duskEngine } from './engine-dusk';

export * from './types';
export { fluentEngine } from './engine-fluent';
export { aeroEngine } from './engine-aero';
export { duskEngine } from './engine-dusk';

export const THEME_ENGINES: Record<CanonicalThemeId, ThemeEngineDefinition> = {
  fluent: fluentEngine,
  aetherial: fluentEngine,
  aero: aeroEngine,
  dusk: duskEngine,
};

export const AVAILABLE_THEMES: readonly ThemeEngineDefinition[] = [
  fluentEngine,
  aeroEngine,
  duskEngine,
] as const;

export function normalizeThemeId(raw?: string | null): CanonicalThemeId {
  if (!raw) return 'fluent';
  const cleaned = raw.toLowerCase().trim();
  if (
    cleaned === 'fluent' ||
    cleaned === 'fluent_glass' ||
    cleaned === 'glass' ||
    cleaned === 'liquid_glass' ||
    cleaned === 'acrylic' ||
    cleaned === 'dark'
  ) {
    return 'fluent';
  }
  if (cleaned === 'aero' || cleaned === 'aero_ui' || cleaned === 'aeroui' || cleaned === 'light') {
    return 'aero';
  }
  if (cleaned === 'dusk' || cleaned === 'twilight' || cleaned === 'night') {
    return 'dusk';
  }
  if (cleaned === 'aetherial' || cleaned === 'aetherial_focus' || cleaned === 'cosmic') {
    return 'fluent';
  }
  return 'fluent';
}
