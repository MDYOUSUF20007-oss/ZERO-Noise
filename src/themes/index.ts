import { type CanonicalThemeId, type ThemeEngineDefinition } from './types';
import { aeroEngine } from './engine-aero';
import { duskEngine } from './engine-dusk';

export * from './types';
export { aeroEngine } from './engine-aero';
export { duskEngine } from './engine-dusk';

export const THEME_ENGINES: Record<CanonicalThemeId, ThemeEngineDefinition> = {
  aero: aeroEngine,
  dusk: duskEngine,
  fluent: duskEngine, // Consolidates legacy glass themes directly into Twilight Dusk
  aetherial: duskEngine,
};

export const AVAILABLE_THEMES: readonly ThemeEngineDefinition[] = [
  aeroEngine,
  duskEngine,
] as const;

export function normalizeThemeId(raw?: string | null): CanonicalThemeId {
  if (!raw) return 'aero';
  const cleaned = raw.toLowerCase().trim();
  if (
    cleaned === 'dusk' ||
    cleaned === 'twilight' ||
    cleaned === 'night' ||
    cleaned === 'fluent' ||
    cleaned === 'fluent_glass' ||
    cleaned === 'glass' ||
    cleaned === 'liquid_glass' ||
    cleaned === 'aetherial' ||
    cleaned === 'aetherial_focus' ||
    cleaned === 'cosmic' ||
    cleaned === 'dark'
  ) {
    return 'dusk';
  }
  return 'aero';
}
