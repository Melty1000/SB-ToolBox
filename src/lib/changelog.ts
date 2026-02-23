export interface ChangelogEntry {
    version: string;
    date: string;
    changes: string[];
}

// Most recent release first. The first entry is automatically marked as "latest".
export const CHANGELOG: ChangelogEntry[] = [
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
