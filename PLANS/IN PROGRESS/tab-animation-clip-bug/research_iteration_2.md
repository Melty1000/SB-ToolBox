# Research: Tab Animation Bug (Iteration 2)

**Created:** 2026-02-08T16:15:00-06:00
**Mission:** [mission.md](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/PLANS/IN%20PROGRESS/tab-animation-clip-bug/mission.md)
**Previous Findings:** [research.md](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/PLANS/IN%20PROGRESS/tab-animation-clip-bug/research.md)

## New Findings (Post-Execution)

**User Feedback:** 
"Now the icons of the unselected tabs are bleeding out... that area is literally the same area of the golden background for a selected tab. thats where the visual effect comes in... cutting the icon off gives the visual effect of them having that area."

**Analysis:**
1. **Intentaional Clipping:** The `overflow-hidden` on `NavItem` was NOT a bug for unselected tabs. It defines the "visual area" of the tab.
2. **The Real Bug:** The active/selected tab needs to BREAK OUT of this clipping during its transition/active state, but unselected tabs must REMAIN clipped.
3. **Current State:** `overflow-visible` on all tabs causes unselected icons (which might be scaled/positioned differently) to bleed out, ruining the grid/area effect.

## Key Constraint
- **Unselected Tabs:** MUST have `overflow-hidden` (or equivalent clipping) to maintain the "button area" visual.
- **Active/Transitioning Tab:** MUST have `overflow-visible` (or expanded bounds/z-index) to allow the icon to animate out.

## Updated Scenario Enumeration

### Scenario 1: Unselected Tab (Static)
- **Expected:** Icon confined to 40px height. Any overflow (if scale > 1) matches button bounds.
- **Actual (Sol A):** Icon bleeds out if scale/pos pushes it out.

### Scenario 2: Active Tab (Static)
- **Expected:** Icon fully visible, potentially extending beyond 40px bounds (GSAP `y: 70%` + `scale: 2.5`).
- **Actual (Sol A):** Works, but at cost of Scenario 1.

### Scenario 3: Transition (Click)
- **Trigger:** Click unselected tab.
- **Expected:** Container expands, icon animates. The clipping boundary needs to release the icon seamlessly.

## Revised Approaches

### Approach 1: Conditional Overflow (State-Based)
- **Description:** Apply `overflow-visible` ONLY to the active tab (and maybe hovered tab).
- **Implementation:**
  ```tsx
  className={cn(
      "relative ... nav-item",
      active ? "overflow-visible z-10" : "overflow-hidden z-0"
  )}
  ```
- **Pros:** Preserves clipping for unselected loops. Allows active to pop out.
- **Cons:** The transition from hidden -> visible might still be jarring if not timed with GSAP. React state update happens immediately on click.

### Approach 2: Header/Container Expansion
- **Description:** Instead of popping the icon *out*, expand the *container* immediately to fit it? 
- **Analysis:** No, sidebar width animates. Height is fixed 40px? No, row height is 40px.

### Approach 3: GSAP-Controlled Overflow
- **Description:** Let GSAP manage the overflow property during the animation timeline.
- **Pros:** Perfect timing control.
- **Cons:** `overflow` is not a smooth animatable property, it's a switch.

## Conclusion
The clipping is a DESIGN FEATURE for unselected tabs. The strict 40px height defines the "cell". The active tab is the "hero" that breaks the grid.

**Recommendation:** Modify Solution to be **conditional**. Only the `active` tab gets `overflow-visible`.

## Next
/architect-core --design (update solution)
