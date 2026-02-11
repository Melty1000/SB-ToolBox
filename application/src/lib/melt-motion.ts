

// --- MELT PHYSICS & SPATIAL CONSTANTS ---

export const MELT_CONSTANTS = {
    SIDEBAR: {
        COLLAPSED: '64px',
        EXPANDED: '142px', // Elite Narrow SPA look
    },
    BRANDING: {
        OFFSET: 15.5,
        INTERLOCK: 15,
        TILT: 12, // degrees
        CONTAINER_HEIGHT: 72,
        LOGO_SIZE: 48, // h-12
    },
    ANIMATION: {
        DURATION: 0.5,
        COLLAPSE_DURATION: 0.4, // Decelerated for smoothness
        UNHOVER_SPEED: 1.35, // Softened from aggressive 1.6x
        TEXT_DURATION_EXPAND: 0.65,
        TEXT_DURATION_COLLAPSE: 0.25, // Head start: vanish before sidebar finishes
        ICON_DURATION: 0.3,
        ICON_DURATION_COLLAPSE: 0.25, // Synchronized with text
        STAGGER: 0.05,
        VERSION_START: 0.1, // Delay version to keep focus on nav
        BOUNCE_EASE: "back.out(1.7)",
        LAYOUT_BOUNCE: "back.out(1.2)", // Softer overshoot for layout variables
        SMOOTH_EASE: "power2.inOut",
        PEAK_SCALE: 1.15,
        NAV_ACTIVE_PEAK: 1.60, // Refined splash factor
        NAV_INACTIVE_PEAK: 1.15,
        NAV_ACTIVE_REST: 1.25, // Calibrated focal rest state
    },
} as const;

// --- MECHANICAL PRESETS ---

export const meltMotion = {
    // Easing presets
    bouncy: MELT_CONSTANTS.ANIMATION.BOUNCE_EASE,
    smooth: MELT_CONSTANTS.ANIMATION.SMOOTH_EASE,

    // Branding Physics Factory
    logoMain: (expanded: boolean) => ({
        xPercent: -50,
        yPercent: -50,
        x: expanded ? -MELT_CONSTANTS.BRANDING.OFFSET : 0,
        rotation: expanded ? -MELT_CONSTANTS.BRANDING.TILT : 0,
    }),

    logoReveal: (expanded: boolean) => ({
        xPercent: -50,
        yPercent: -50,
        x: expanded ? MELT_CONSTANTS.BRANDING.OFFSET : 0,
        rotation: expanded ? MELT_CONSTANTS.BRANDING.TILT : 0,
        opacity: expanded ? 1 : 0,
    }),

    // Nav Item Physics Factory
    navItemIcon: (isActive: boolean, isExpanded: boolean) => ({
        scale: isExpanded ? (isActive ? MELT_CONSTANTS.ANIMATION.NAV_ACTIVE_REST : 1) : 1,
        rotation: isExpanded ? -10 : 0,
    }),
};
