import type { ProfileAccent, ProfileAvatarId } from '../types';

export const ACCENT_THEMES = {
  Amber: {
    hex: '#F59E0B',
    rgb: '245, 158, 11',
    badgeGradient: 'linear-gradient(135deg, #FBBF24 0%, #D97706 100%)',
    badgeText: '#09090B',
  },
  Emerald: {
    hex: '#10B981',
    rgb: '16, 185, 129',
    badgeGradient: 'linear-gradient(135deg, #34D399 0%, #059669 100%)',
    badgeText: '#09090B',
  },
  Monolith: {
    hex: '#F4F4F5',
    rgb: '244, 244, 245',
    badgeGradient: 'linear-gradient(135deg, #FFFFFF 0%, #A1A1AA 100%)',
    badgeText: '#09090B',
  },
  Signal: {
    hex: '#06B6D4',
    rgb: '6, 182, 212',
    badgeGradient: 'linear-gradient(135deg, #22D3EE 0%, #0891B2 100%)',
    badgeText: '#09090B',
  },
} as const;

export type AccentKey = keyof typeof ACCENT_THEMES;
export type EmblemKey = 'Monk' | 'Void Eye' | 'Sentinel' | 'Spark' | 'Night Owl' | 'Ember';

export const AVATAR_ID_TO_EMBLEM: Record<ProfileAvatarId, EmblemKey> = {
  monk: 'Monk',
  void: 'Void Eye',
  shield: 'Sentinel',
  bolt: 'Spark',
  owl: 'Night Owl',
  flame: 'Ember',
};

export const ACCENT_ID_TO_KEY: Record<ProfileAccent, AccentKey> = {
  amber: 'Amber',
  emerald: 'Emerald',
  white: 'Monolith',
  cyan: 'Signal',
};

export const AVATAR_OPTIONS: Array<{
  id: ProfileAvatarId;
  label: EmblemKey;
}> = [
  { id: 'monk', label: 'Monk' },
  { id: 'void', label: 'Void Eye' },
  { id: 'shield', label: 'Sentinel' },
  { id: 'bolt', label: 'Spark' },
  { id: 'owl', label: 'Night Owl' },
  { id: 'flame', label: 'Ember' },
];

export const ACCENT_STYLES: Record<
  ProfileAccent,
  {
    label: string;
    ring: string;
    badgeBg: string;
    text: string;
    border: string;
    glow: string;
    bar: string;
  }
> = {
  amber: {
    label: 'Amber',
    ring: 'border-amber-400/70 bg-amber-500/15 text-amber-300',
    badgeBg: 'bg-amber-400 text-black',
    text: 'text-amber-300',
    border: 'border-amber-400/50',
    glow: 'shadow-[0_0_24px_rgba(245,158,11,0.3)]',
    bar: 'bg-amber-400',
  },
  emerald: {
    label: 'Emerald',
    ring: 'border-emerald-400/70 bg-emerald-500/15 text-emerald-300',
    badgeBg: 'bg-emerald-400 text-black',
    text: 'text-emerald-300',
    border: 'border-emerald-400/50',
    glow: 'shadow-[0_0_24px_rgba(16,185,129,0.3)]',
    bar: 'bg-emerald-400',
  },
  white: {
    label: 'Monolith',
    ring: 'border-white/70 bg-white/10 text-white',
    badgeBg: 'bg-white text-black',
    text: 'text-zinc-100',
    border: 'border-white/50',
    glow: 'shadow-[0_0_24px_rgba(255,255,255,0.22)]',
    bar: 'bg-white',
  },
  cyan: {
    label: 'Signal',
    ring: 'border-cyan-400/70 bg-cyan-500/15 text-cyan-300',
    badgeBg: 'bg-cyan-400 text-black',
    text: 'text-cyan-300',
    border: 'border-cyan-400/50',
    glow: 'shadow-[0_0_24px_rgba(34,211,238,0.3)]',
    bar: 'bg-cyan-400',
  },
};
