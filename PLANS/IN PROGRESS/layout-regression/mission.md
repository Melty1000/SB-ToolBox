# Fix Window Title & Logo Animation Regression

The user reported that the window title text is obscured/static when the sidebar expands, and the logo animation is broken.

## Goals
1.  **Fix Window Title:** Ensure the "SB TOOL BOX // [PAGE]" text moves or adjusts so it isn't covered by the expanded sidebar, while keeping window controls pinned.
2.  **Fix Logo Animation:** Restore the correct hover behavior for the logo.

## Approach
- Use `/develop-plan` workflow.
- Restore dynamic padding or margin for the Title Bar's *left* side content, driven by `--sidebar-width`.
- Investigate the Logo component's interaction with the new `aside` structure.
