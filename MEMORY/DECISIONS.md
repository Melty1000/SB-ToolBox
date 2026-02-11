# DECISIONS.md

## 2026-02-11
- **Mission**: Implement Auto-Update Function.
- **Technology**: GitHub Releases used as source of truth via `electron-updater`.
- **UI Architecture**: "Zero UX" approach. Background downloading by default with Sidebar Badge and Toast Relaunch notifications.
- **Settings Store**: Migrated from `localStorage` to a persistent JSON store (`SettingsStore.ts`) in the Main process for consistency across restarts and portable modes.
- **Portable Support**: Confirmed support for portable versions using `electron-updater`'s native replacement logic.
 and installed versions.
