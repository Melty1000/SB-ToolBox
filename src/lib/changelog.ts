export interface ChangelogEntry {
    version: string;
    date: string;
    changes: string[];
}

// Most recent release first. The first entry is automatically marked as "latest".
export const CHANGELOG: ChangelogEntry[] = [
    {
        version: "V0.2.1 BETA",
        date: "2026-03-03",
        changes: [
            "Performed a holistic project-wide dead code sweep",
            "Deleted obsolete unused Next.js SVG template images to reduce compiled build size",
            "Removed unused legacy TSX component backups to clear IDE search pollution",
            "Removed vestigial --melt-accent-glow CSS variables from the application theme definitions",
            "Purged fs-extra NPM dependency to reduce bundled dependencies",
            "Added global `appearance: none` CSS flag to resolve Monaco-editor integration lints"
        ]
    },
    {
        version: "V0.2.0 BETA",
        date: "2026-03-01",
        changes: [
            "Fixed persistent bug that forced the theme to 'Graphite and Cobalt' on Settings page visit",
            "Synchronized DOM, React state, and Electron IPC cache to universally default to 'Graphite and Gold'",
            "Completely rebuilt Support Page community grids into side-by-side auto-scrolling GSAP carousels",
            "Added background prefetching system for Twitch live status, caching results in sessionStorage on boot",
            "Fixed memory leak bug in Encoder where clearing a template left orphaned file linkages",
            "ActionBtn component now supports descriptive tooltips via the new 'desc' prop (implemented on Encoder/Decoder pages)",
            "Implemented a CSS-based animation in the Monaco 'SBEditor' to suppress scrollbar flashing during component mount",
            "Removed hardcoded opacity filters from accent glows across all themes for true flat UI colors",
            "Completely redesigned Sidebar Navigation Tabs to feature unified slide-out text and GSAP morphing logic",
            "Replaced legacy floating docking behavior of sidebar tabs with modern flush-edge aesthetic",
            "Refined overall UI layout padding, margins, and borders to provide a cohesive, unified visual experience",
            "Adjusted text placement on extended sidebar tabs to sit tighter against the icons",
            "Consolidated sidebar version text to a single smooth expanding element to eliminate disjointed cross-fade animations",
            "Redesigned the Update Status block in Settings to be minimal and cohesive with the unified UI",
            "Redesigned Encoder/Decoder action buttons to match borderless transparent 'Social Link' style",
            "Restored 1px horizontal separator lines to Encoder and Decoder action bars",
            "Eliminated false scrolling on the Support Page by removing unnecessary bottom padding",
            "Fixed Encoder and Decoder footer backgrounds to extend solidly to the edge of the window",
            "Updated formatting structure on the Help Guide page for better visual hierarchy"
        ]
    },
    {
        version: "V0.1.3 ALPHA",
        date: "2026-02-23",
        changes: [
            "Implemented working auto-update pipeline for installed and portable builds",
            "Portable build now downloads new version to Windows Downloads folder with live progress",
            "Added 'Show in Explorer' button for portable users after download completes",
            "Added portable mode badge and status text in Settings",
            "Background Download toggle is hidden in portable mode (not applicable)",
            "Auto-download setting now triggers download automatically after update check",
            "Fixed missing latest.yml — updater version checks now resolve correctly",
            "Added GitHub publish config so electron-updater knows where to look"
        ]
    },
    {
        version: "V0.1.2 ALPHA",
        date: "2026-02-22",
        changes: [
            "Fixed sidebar logos not loading in packaged builds",
            "Fixed sidebar re-expanding on every tab navigation",
            "Fixed active tab label disappearing after click-while-hovered",
            "Removed per-page slide and header fade animations on tab switch"
        ]
    },
    {
        version: "V0.1.1 ALPHA",
        date: "2026-02-22",
        changes: [
            "Added Twitch live detection to Inspirations section",
            "Added OsuPhoenix, Andilippi, and CodeWithTD to Inspirations",
            "Added YoThatsCarter to My Little Community",
            "Live streamers now auto-sort to top of both grids",
            "Clicking a live avatar or name opens their stream in a new tab",
            "Protected app from browser forced dark mode",
            "Applied consistent background to Encoder action bar",
            "Fixed history restore for encoded import strings"
        ]
    },
    {
        version: "V0.1 ALPHA",
        date: "2026-02-10",
        changes: [
            "Renamed application to 'SB Toolbox'",
            "Fixed window layout regression (Logo/Title sync)",
            "Added 'Zombie Process' prevention (Hard exit)",
            "Added 100ms Sidebar hover delay",
            "Refined Theme Selection UI",
            "Fixed tab animation clip bug"
        ]
    }
];
