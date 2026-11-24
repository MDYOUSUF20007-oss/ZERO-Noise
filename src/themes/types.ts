export type CanonicalThemeId = 'fluent' | 'aetherial' | 'aero' | 'dusk';
export type AccentColorId =
  | 'crimson' // Rose Coral (Primary / Recommended)
  | 'emerald' // Neon Emerald
  | 'silver'  // Ice Platinum
  | 'azure'   // Liquid Sapphire (replaces Cyber Cyan)
  | 'amber'   // Sunset Amber
  | 'purple'  // Cosmic Violet
  | 'indigo'  // Electric Indigo
  | 'lime'    // Laser Volt
  | 'cyan';   // Backward compatibility alias for azure

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
