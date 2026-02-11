# Finalize: Auto-Update Mission

## Mission Success Criteria Audit
- [x] App checks GitHub for new releases on startup (if enabled).
- [x] User can enable/disable automatic checks and background downloads in Settings.
- [x] No background processes/launch-on-startup (logic runs inside the app).
- [x] Seamless experience for both Portage and Installed versions.
- [x] "Zero UX" interaction: Sidebar notification badge and background downloading.
- [x] Toast notification for "Restart to Update" with one-click relaunch.

## Dependencies Installed
- `electron-updater`
- `fs-extra`

## New Files Created
- `electron/SettingsStore.ts`
- `electron/UpdateManager.ts`

## Status: COMPLETE
The mission is finished. All implementation steps in `plan.md` have been executed and verified for structural correctness.
