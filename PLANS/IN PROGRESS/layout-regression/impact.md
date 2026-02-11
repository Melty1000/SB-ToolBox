# Impact Analysis: Layout Regression Fix

## Proposed Changes
We will modify `CitadelShell.tsx` to restore the dynamic positioning of the Window Title and Logo Animation, linking them directly to the `--sidebar-width` CSS variable.

## Blast Radius
### Direct Modifications
- `src/components/layout/CitadelShell.tsx`
    - `div.branding-overlay`: Add dynamic `width`.
    - `header > div`: Add dynamic `marginLeft`.

### Dependencies
- None. `useCitadelSidebar.ts` already manages the CSS variable correctly.

## Risks
| Risk | Probability | Severity | Mitigation |
|------|-------------|----------|------------|
| Layout Thrashing | Low | Low | CSS Variables are performant. |
| Window Controls Move | Low | High | We are NOT touching the header grid column. Controls stay pinned. |
| Text Overlap | Low | Medium | Text moves right. Even at max sidebar width, plenty of space remains. |

## Verification
- [ ] Hover sidebar: Confirm Header Text slides right smoothly.
- [ ] Hover sidebar: Confirm Logo Animation (slide/rotate) centers in expanded area.
- [ ] Resize window: Confirm Control Buttons remain pinned to top-right.
