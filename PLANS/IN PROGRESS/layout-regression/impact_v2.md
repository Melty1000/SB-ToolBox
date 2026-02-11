# Impact Analysis: Layout Sync & Content Shift

## Issues Identified
1.  **Content Static:** The `<main>` content area is not pushed by the expanding sidebar because it resides in Grid Col 2, which is fixed or not reflecting the sidebar's visual expansion (since sidebar is `z-55` overlay in a fixed col).
2.  **Animation Desync:** The Window Title uses CSS `transition: all` while the Sidebar uses GSAP. This causes a mismatch in easing and timing.

## Solutions
### 1. Fix Content Shift
The `<main>` tag needs a dynamic left margin similar to the header text.
```tsx
<main 
  className="..."
  style={{ marginLeft: 'calc(var(--sidebar-width, 64px) - 64px)' }}
>
```
*Note: This assumes we want the content to squash/move. If we want it to be covered, we do nothing. User says "content needs to move too".*

### 2. Fix Animation Sync
Remove the CSS transition from the header text. Instead, animate the CSS variable `--sidebar-width` via GSAP (already done), AND ensure the text element uses that variable directly (already done). 

**Wait:** If the text uses `calc(var(--sidebar-width) ...)` and GSAP animates `--sidebar-width`, the browser updates the layout every frame. 
**Why is it mismatched?** The `transition-all duration-300` class I added to the div *interpolates the margin change* on top of the variable change?
**YES.** If the variable changes smoothly, AND the element has `transition: all`, the browser tries to transition from `margin: 0` to `margin: X` *lagging behind* the variable update.
**Fix:** Remove `transition-all` from the header text wrapper. It will then snap instantly to the variable's current value, which is being smoothed by GSAP.

## Verification
- [ ] Remove `transition-all` from header text.
- [ ] Add `marginLeft` logic to `<main>`.
- [ ] Check sync.
