/**
 * MELT THEME CONFIGURATION (Single Source of Truth)
 * -----------------------------------------------
 * This file defines the visual standards for the entire application.
 * Components (Monaco, Help Guide) use this directly.
 * Standard CSS (globals.css) is synchronized with these values.
 */

export const MELT_THEME_BASE = {
    void: '#050505',
    frame: '#0c0c0e',
    surface: '#18181b',
};

export const MELT_ACCENTS = {
    industrial: {
        main: '#ffaa00',
        hover: '#ffbb33',
        glow: 'rgba(255, 170, 0, 0.4)',
    },
    cobalt: {
        main: '#1D4267',
        hover: '#355C85',
        glow: 'rgba(29, 66, 103, 0.4)',
    },
    gold: {
        main: '#F2AF0D',
        hover: '#FFC130',
        glow: 'rgba(242, 175, 13, 0.3)',
    }
};

export const MELT_TYPOGRAPHY = {
    heading: '#E4E4E7', // Zinc-200
    body: '#D4D4D4',    // Zinc-300
    label: '#A1A1AA',   // Zinc-400
    muted: '#71717A',   // Zinc-500
};

/**
 * THEME DEFINITIONS
 * Maps the data-theme values to specific configuration objects.
 */
export const MELT_THEMES: Record<string, any> = {
    'graphite-cobalt': {
        ...MELT_THEME_BASE,
        accent: MELT_ACCENTS.cobalt,
    },
    'slate-gold': {
        void: '#08090A',
        frame: '#0E1115',
        surface: '#1C1F26',
        accent: MELT_ACCENTS.gold,
    },
    'graphite-gold': {
        ...MELT_THEME_BASE,
        accent: MELT_ACCENTS.gold,
    },
    'slate-cobalt': {
        void: '#08090A',
        frame: '#0E1115',
        surface: '#1C1F26',
        accent: MELT_ACCENTS.cobalt,
    },
    'default': {
        ...MELT_THEME_BASE,
        accent: MELT_ACCENTS.industrial,
    }
};
