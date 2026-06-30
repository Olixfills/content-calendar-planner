export type Pillar = string;

export type Platform = string;

export type PostStatus = 'Idea' | 'Scripting' | 'Filming' | 'Scheduled' | 'Posted';

export interface Post {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  pillar: Pillar; // references PillarConfig.id or name
  platforms: Platform[];
  status: PostStatus;
  notes?: string;
  time?: string; // HH:MM
  recurring?: 'none' | 'monthly';
}

export const DEFAULT_PLATFORMS: Platform[] = [
  'YouTube Shorts',
  'TikTok',
  'Instagram Reels',
  'X',
  'LinkedIn'
];

// Backward compat alias
export const PLATFORMS: Platform[] = DEFAULT_PLATFORMS;

export const STATUSES: PostStatus[] = [
  'Idea',
  'Scripting',
  'Filming',
  'Scheduled',
  'Posted'
];

export interface PillarConfig {
  id: string;
  name: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  accentColor: string;
  dotClass: string;
}

export interface ColorPreset {
  id: string;
  name: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  accentColor: string;
  dotClass: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'emerald',
    name: 'Emerald Green',
    bgClass: 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20',
    textClass: 'text-emerald-800 dark:text-emerald-300',
    borderClass: 'border-emerald-200 dark:border-emerald-900/50',
    accentColor: '#10b981',
    dotClass: 'bg-emerald-500'
  },
  {
    id: 'blue',
    name: 'Blue Tech',
    bgClass: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20',
    textClass: 'text-blue-800 dark:text-blue-300',
    borderClass: 'border-blue-200 dark:border-blue-900/50',
    accentColor: '#3b82f6',
    dotClass: 'bg-blue-500'
  },
  {
    id: 'purple',
    name: 'Purple Apps',
    bgClass: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/20',
    textClass: 'text-purple-800 dark:text-purple-300',
    borderClass: 'border-purple-200 dark:border-purple-900/50',
    accentColor: '#a855f7',
    dotClass: 'bg-purple-500'
  },
  {
    id: 'amber',
    name: 'Amber Tools',
    bgClass: 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20',
    textClass: 'text-amber-800 dark:text-amber-300',
    borderClass: 'border-amber-200 dark:border-amber-900/50',
    accentColor: '#f59e0b',
    dotClass: 'bg-amber-500'
  },
  {
    id: 'rose',
    name: 'Rose Creative',
    bgClass: 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20',
    textClass: 'text-rose-800 dark:text-rose-300',
    borderClass: 'border-rose-200 dark:border-rose-900/50',
    accentColor: '#f43f5e',
    dotClass: 'bg-rose-500'
  },
  {
    id: 'indigo',
    name: 'Indigo Strategy',
    bgClass: 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20',
    textClass: 'text-indigo-800 dark:text-indigo-300',
    borderClass: 'border-indigo-200 dark:border-indigo-900/50',
    accentColor: '#6366f1',
    dotClass: 'bg-indigo-500'
  },
  {
    id: 'cyan',
    name: 'Cyan Growth',
    bgClass: 'bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/20',
    textClass: 'text-cyan-800 dark:text-cyan-300',
    borderClass: 'border-cyan-200 dark:border-cyan-900/50',
    accentColor: '#06b6d4',
    dotClass: 'bg-cyan-500'
  },
  {
    id: 'orange',
    name: 'Orange Marketing',
    bgClass: 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/20',
    textClass: 'text-orange-800 dark:text-orange-300',
    borderClass: 'border-orange-200 dark:border-orange-900/50',
    accentColor: '#f97316',
    dotClass: 'bg-orange-500'
  }
];

export interface Team {
  id: string;
  name: string;
  avatar: string;
  bgGrad: string;
}

export const TEAMS: Team[] = [
  { id: 'olixfills', name: 'Olixfills', avatar: '🎨', bgGrad: 'from-purple-500 to-indigo-600' },
  { id: 'liz', name: 'Liz', avatar: '🚀', bgGrad: 'from-pink-500 to-rose-600' },
  { id: 'filora', name: 'Filora', avatar: '📈', bgGrad: 'from-emerald-500 to-teal-600' }
];

export const STATUS_CONFIGS: Record<PostStatus, { label: string; bg: string; text: string; border: string }> = {
  'Idea': {
    label: 'Idea',
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700'
  },
  'Scripting': {
    label: 'Scripting',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-900/30'
  },
  'Filming': {
    label: 'Filming',
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    text: 'text-sky-700 dark:text-sky-400',
    border: 'border-sky-200 dark:border-sky-900/30'
  },
  'Scheduled': {
    label: 'Scheduled',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-900/30'
  },
  'Posted': {
    label: 'Posted',
    bg: 'bg-emerald-100 dark:bg-emerald-950/50',
    text: 'text-emerald-800 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-850'
  }
};

/**
 * Platform visual configuration for rendering icons, colors, and short labels.
 * Known platforms get specific colors; custom ones get a neutral fallback.
 */
export interface PlatformStyle {
  shortLabel: string;
  icon: string; // lucide icon name hint
  color: string; // accent hex
  bgClass: string;
  textClass: string;
  borderClass: string;
  dotClass: string;
  circleBg: string;
  circleText: string;
}

export const PLATFORM_STYLES: Record<string, PlatformStyle> = {
  'YouTube Shorts': {
    shortLabel: 'YT',
    icon: 'youtube',
    color: '#ef4444',
    bgClass: 'bg-rose-50 dark:bg-rose-950/20',
    textClass: 'text-rose-700 dark:text-rose-400',
    borderClass: 'border-rose-200 dark:border-rose-900/30',
    dotClass: 'text-rose-600 dark:text-rose-400',
    circleBg: 'bg-rose-100',
    circleText: 'text-rose-600',
  },
  'TikTok': {
    shortLabel: 'TK',
    icon: 'music',
    color: '#0ea5e9',
    bgClass: 'bg-sky-50 dark:bg-sky-950/20',
    textClass: 'text-sky-700 dark:text-sky-400',
    borderClass: 'border-sky-200 dark:border-sky-900/30',
    dotClass: 'text-sky-600 dark:text-sky-400',
    circleBg: 'bg-sky-100',
    circleText: 'text-sky-600',
  },
  'Instagram Reels': {
    shortLabel: 'IG',
    icon: 'instagram',
    color: '#ec4899',
    bgClass: 'bg-pink-50 dark:bg-pink-950/20',
    textClass: 'text-pink-700 dark:text-pink-400',
    borderClass: 'border-pink-200 dark:border-pink-900/30',
    dotClass: 'text-pink-600 dark:text-pink-400',
    circleBg: 'bg-pink-100',
    circleText: 'text-pink-600',
  },
  'X': {
    shortLabel: 'X',
    icon: 'twitter',
    color: '#1d9bf0',
    bgClass: 'bg-slate-50 dark:bg-slate-950/20',
    textClass: 'text-slate-700 dark:text-slate-400',
    borderClass: 'border-slate-300 dark:border-slate-700',
    dotClass: 'text-slate-800 dark:text-slate-300',
    circleBg: 'bg-slate-200',
    circleText: 'text-slate-700',
  },
  'LinkedIn': {
    shortLabel: 'LI',
    icon: 'linkedin',
    color: '#0a66c2',
    bgClass: 'bg-blue-50 dark:bg-blue-950/20',
    textClass: 'text-blue-700 dark:text-blue-400',
    borderClass: 'border-blue-200 dark:border-blue-900/30',
    dotClass: 'text-blue-600 dark:text-blue-400',
    circleBg: 'bg-blue-100',
    circleText: 'text-blue-600',
  },
};

export const DEFAULT_PLATFORM_STYLE: PlatformStyle = {
  shortLabel: '??',
  icon: 'globe',
  color: '#6366f1',
  bgClass: 'bg-violet-50 dark:bg-violet-950/20',
  textClass: 'text-violet-700 dark:text-violet-400',
  borderClass: 'border-violet-200 dark:border-violet-900/30',
  dotClass: 'text-violet-600 dark:text-violet-400',
  circleBg: 'bg-violet-100',
  circleText: 'text-violet-600',
};

export function getPlatformStyle(platform: string): PlatformStyle {
  return PLATFORM_STYLES[platform] || {
    ...DEFAULT_PLATFORM_STYLE,
    shortLabel: platform.slice(0, 2).toUpperCase(),
  };
}
