# Code Verification Audit: Auto-Update Function

## 1. Electron Main Process (`main.ts`)
- **Integration Points**:
  - `app.whenReady()` (L105): Hook for initial update check.
  - `createWindow` function: Needs to pass the `UpdateManager` instance.
  - IPC Handlers: Need to append `settings:*` and `update:*` listeners after the `fs:*` handlers (L94).
- **Existing Patterns**: Uses `ipcMain.handle` for async file operations. I will follow this for `settings`.

## 2. Shared Settings Store
- **Note**: Currently `SettingsPage.tsx` uses `localStorage` (L11).
- **Integration**: I will need to refactor the `useEffect` in `SettingsPage.tsx` to read from the new IPC settings bridge instead of purely `localStorage`.

## 3. Sidebar Badge (`MeltShell.tsx`)
- **Integration Point**: `NavItem` component (L189).
- **Plan**: I will add an `hasUpdate` prop to `NavItem` and render a `bg-melt-accent` dot if true. Only the "Settings" item (L47) will receive this prop based on a global update state.

## 4. Toast Notification (`MeltShell.tsx`)
- **Integration Point**: `MeltShell` main return (L55).
- **Plan**: Add an `useEffect` to listen for the `update:ready` IPC event. When triggered, show a GSAP-animated toast overlay.

## 5. Dependencies
- **Audit**: `package.json` needs:
  - `electron-updater` (for the actual updating logic).
  - `electron-store` or a simple JSON/FS implementation.

## Verdict: AUDIT PASSED
The codebase is clean and follows a consistent IPC/component pattern making integration straightforward. No major blockers identified.
