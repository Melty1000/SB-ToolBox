# Execution Log: Layout Regression Fix

## Action 1: Modify CitadelShell.tsx
Applying the dynamic style bindings.

### Changes
1.  **Branding Overlay:** Added `style={{ width: 'var(--sidebar-width, 64px)' }}` to force it to expand with the sidebar, allowing the logo to recenter. [COMPLETED]
2.  **Window Title:** Added `style={{ marginLeft: 'calc(var(--sidebar-width, 64px) - 64px)' }}` to the title wrapper to push it right as the sidebar expands. [COMPLETED]

## Action 2: Fix Animation Sync & Content Shift
Addressing the "bad animation" and missing content move.

### Changes
1.  **Header Text:** Removed `transition-all duration-300 ease-out` from the title wrapper. This allows the GSAP-driven variable to control the position frame-by-frame without CSS interpolation lag. [COMPLETED]
2.  **Main Content:** Added `style={{ marginLeft: 'calc(var(--sidebar-width, 64px) - 64px)' }}` to the `<main>` element to squash/move the content viewport as the sidebar expands. [COMPLETED]

## Verification
- Code changes applied.
- Next step: Manual confirmation (User to verify visual result).
