# Plan: Auto-Update Implementation Steps

## Phase 1: Infrastructure & Dependencies
- [ ] Install dependencies: `npm install electron-updater fs-extra`
- [ ] Create `application/electron/SettingsStore.ts` (Class for persistent JSON settings)
- [ ] Create `application/electron/UpdateManager.ts` (Wrapper for `electron-updater`)

## Phase 2: Main Process Integration
- [ ] Initialize `SettingsStore` and `UpdateManager` in `main.ts`.
- [ ] Add `settings:*` and `update:*` IPC handlers to `main.ts`.
- [ ] Link `app.whenReady()` to trigger the initial update check.

## Phase 3: Bridge & State
- [ ] Update `application/electron/preload.ts` to expose `settings` and `updater` APIs.
- [ ] Update `application/src/components/layout/MeltShell.tsx` with global IPC listeners for update events.

## Phase 4: UI Implementation (Zero UX)
- [ ] Add Sidebar notification badge to `MeltShell.tsx`.
- [ ] Implement Toast component in `MeltShell.tsx` for "Restart to Update" flow.
- [ ] Integrate full "AUTO-UPDATE" section in `SettingsPage.tsx` with toggles and progress readout.

## Phase 5: Verification & Cleanup
- [ ] Verify settings persistence (localStorage vs JSON).
- [ ] Mock update event flow to test Toast and Badge.
- [ ] Verify "Restart" functionality relaunching the app.
