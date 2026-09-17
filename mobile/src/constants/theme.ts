import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    surfaceHigh: '#F8F8F8',
    textSecondary: '#60646C',

    homeBackground: '#F5F5F7',
    homeGradientStart: '#EDEDF0',
    homeGradientMid: '#F5F5F7',
    homeGradientEnd: '#FFFFFF',
    textLabel: '#909096',
    textGreeting: '#60646C',
    textSubtle: '#A0A0A8',

    addButtonGradientStart: '#1A1A1A',
    addButtonGradientEnd: '#3A3A3C',
    addButtonIcon: '#FFFFFF',
    addButtonBorder: 'rgba(255, 255, 255, 0.2)',
    addButtonShadowLight: 'rgba(0, 0, 0, 0.12)',
    addButtonShadowDark: 'rgba(0, 0, 0, 0.25)',

    grain: '#000000',

    cardText: '#FFFFFF',
    cardTextMuted: 'rgba(255, 255, 255, 0.72)',
    cardBadgeBackground: 'rgba(0, 0, 0, 0.28)',
    cardBadgeBorder: 'rgba(255, 255, 255, 0.18)',
    cardGlassEdge: 'rgba(255, 255, 255, 0.22)',
    cardShadow: 'rgba(0, 0, 0, 0.65)',
    cardEmojiShadow: 'rgba(0, 0, 0, 0.25)',
    cardTitleShadow: 'rgba(0, 0, 0, 0.3)',

    emptyGhostBack: '#E0E0E4',
    emptyGhostMid: '#ECECF0',
    emptyGhostGradientStart: '#E8E8EC',
    emptyGhostGradientMid: '#F0F0F3',
    emptyGhostGradientEnd: '#D8D8DE',
    emptyGhostBorder: 'rgba(0, 0, 0, 0.08)',
    emptyGhostEmoji: 'rgba(0, 0, 0, 0.35)',
    emptyGhostTitle: 'rgba(0, 0, 0, 0.85)',
    emptyGhostHint: 'rgba(0, 0, 0, 0.35)',
    emptyCtaBackground: 'rgba(0, 0, 0, 0.06)',
    emptyCtaBorder: 'rgba(0, 0, 0, 0.12)',
    emptyCtaText: 'rgba(0, 0, 0, 0.75)',

    groupSurface: '#FFFFFF',
    groupSeparator: 'rgba(0, 0, 0, 0.06)',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    surfaceHigh: '#1C1C1E',
    textSecondary: '#B0B4BA',

    homeBackground: '#0A0A0A',
    homeGradientStart: '#080808',
    homeGradientMid: '#0E0E0E',
    homeGradientEnd: '#111111',
    textLabel: 'rgba(255, 255, 255, 0.38)',
    textGreeting: 'rgba(255, 255, 255, 0.55)',
    textSubtle: 'rgba(255, 255, 255, 0.32)',

    addButtonGradientStart: '#FFFFFF',
    addButtonGradientEnd: '#D4D4D8',
    addButtonIcon: '#0A0A0A',
    addButtonBorder: 'rgba(255, 255, 255, 0.6)',
    addButtonShadowLight: 'rgba(255, 255, 255, 0.25)',
    addButtonShadowDark: 'rgba(0, 0, 0, 0.4)',

    grain: '#FFFFFF',

    cardText: '#FFFFFF',
    cardTextMuted: 'rgba(255, 255, 255, 0.72)',
    cardBadgeBackground: 'rgba(0, 0, 0, 0.28)',
    cardBadgeBorder: 'rgba(255, 255, 255, 0.18)',
    cardGlassEdge: 'rgba(255, 255, 255, 0.22)',
    cardShadow: 'rgba(0, 0, 0, 0.65)',
    cardEmojiShadow: 'rgba(0, 0, 0, 0.25)',
    cardTitleShadow: 'rgba(0, 0, 0, 0.3)',

    emptyGhostBack: '#141414',
    emptyGhostMid: '#1A1A1A',
    emptyGhostGradientStart: '#1C1C1E',
    emptyGhostGradientMid: '#2A2A2E',
    emptyGhostGradientEnd: '#3F3F46',
    emptyGhostBorder: 'rgba(255, 255, 255, 0.08)',
    emptyGhostEmoji: 'rgba(255, 255, 255, 0.5)',
    emptyGhostTitle: 'rgba(255, 255, 255, 0.85)',
    emptyGhostHint: 'rgba(255, 255, 255, 0.35)',
    emptyCtaBackground: 'rgba(255, 255, 255, 0.08)',
    emptyCtaBorder: 'rgba(255, 255, 255, 0.14)',
    emptyCtaText: 'rgba(255, 255, 255, 0.75)',

    groupSurface: '#1C1C1E',
    groupSeparator: 'rgba(255, 255, 255, 0.08)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 800;
