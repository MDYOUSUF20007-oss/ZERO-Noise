export type CanonicalThemeId = 'fluent' | 'aetherial' | 'aero' | 'dusk';
export type AccentColorId =
  | 'cyan'
  | 'emerald'
  | 'indigo'
  | 'purple'
  | 'amber'
  | 'crimson'
  | 'lime'
  | 'silver';

// Prevents TypeScript TS2367 errors if any legacy component checks an interface style string
export type InterfaceStyle = 'fluent' | 'aetherial' | 'aero' | 'dusk' | (string & {});
export type ThemeId = InterfaceStyle;

export interface ThemeEngineDefinition {
  id: CanonicalThemeId;
  name: string;
  badge: string;
  description: string;
  swatchBg: string;
  swatchSurface: string;
  swatchAccent: string;
  swatchAccentSecondary?: string;
  css: string;
}
