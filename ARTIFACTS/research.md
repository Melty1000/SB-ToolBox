# Research: Auto-Update Strategy (Deep Dive)

## 1. GitHub Provider Details
- **Provider**: `github` (standard for `electron-updater`).
- **Required File**: `latest.yml` (Installed) and `latest-portable.yml` (Portable).
- **Auto-Discovery**: `electron-builder` automatically generates these if configured in `package.json`.

## 2. Portable vs. Installed Scenarios
### Scenario A: Installed (NSIS)
- **Path**: `app.getPath('exe')` is usually in `C:/Users/{User}/AppData/Local/Programs/sb-toolbox`.
- **Handling**: `electron-updater` downloads `.exe` to temp, runs installer on quit.

### Scenario B: Portable
- **Path**: User-defined (e.g., Desktop, Downloads).
- **Handling**: `electron-updater` detects `PORTABLE_EXECUTABLE_DIR`. It re-downloads the `.exe`. 
- **Risk**: Cannot replace the running file on Windows directly.
- **Solution**: `electron-updater` handles this by downloading and prompting for relaunch, where a secondary process replaces the file.

## 3. "Zero UX" Technical Implementation
- **Auto-Download**: `autoUpdater.autoDownload = settings.autoDownload`.
- **Throttling**: Check on `app.ready` + every 12 hours.
- **IPC Pulsing**:
  - `update-available`: Main -> Renderer (Triggers sidebar dot).
  - `download-progress`: Main -> Renderer (Updates settings progress bar).
  - `update-downloaded`: Main -> Renderer (Triggers Toast).

## 4. Settings Storage Logic
- **Store**: `electron-store` (or custom JSON helper).
- **Location**: `%APPDATA%/sb-toolbox/settings.json`.
- **Bridge**:
  - `main.ts` loads store.
  - Renderer requests keys via `ipcRenderer.invoke('settings:get')`.

## 5. Relaunch Sequence
- `autoUpdater.quitAndInstall()`:
  - Shuts down all windows.
  - Runs update process.
  - Re-opens application.

## Verdict
Standard `electron-updater` configuration with `autoDownload: false` by default is sufficient. We will wrap it in an `UpdateManager` to handle the specific "Zero UX" signaling.
