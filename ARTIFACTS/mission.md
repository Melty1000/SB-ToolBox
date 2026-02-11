# Mission: Auto-Update Function for SB Toolbox

## Objective
Design and implement a robust auto-update system for SB Toolbox (Electron + Next.js).

## Success Criteria
- [ ] App checks GitHub for new releases on startup (if enabled).
- [ ] User can enable/disable automatic checks and background downloads in Settings.
- [ ] No background processes/launch-on-startup (logic runs inside the app).
- [ ] Seamless experience for both Portage and Installed versions.
- [ ] "Zero UX" interaction: Sidebar notification badge and background downloading.
- [ ] Toast notification for "Restart to Update" with one-click relaunch.

## Constraints
- Windows 10 OS environment.
- No third-party update managers that require installation (must be self-contained or use standard tools).
- No Windows Startup shortcuts.

## Next Step
- `/architect-core --research`
