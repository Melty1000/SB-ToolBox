# Solutions: Tab Animation Clip Bug (Iteration 4)

**Created:** 2026-02-08T17:10:00-06:00
**Based on:** User feedback "text doesnt show on first selection"

## Problem Analysis
1. **Initial Expansion:** The code `autoAlpha: isHovered ? 0 : 1` hides text if the mouse is over the tab.
2. **Clicking a Tab:** Requires hovering. So when you click, you are hovering.
3. **Result:** The Active tab (clicked) expands with text Hidden.
4. **Design Conflict:**
   - **Hover (Bounce):** Icon at Y=0. Overlaps Text. -> **Text Must Hide.**
   - **Active (Pop):** Icon at Y=70%. No Overlap. -> **Text Should Show.**

## Solution I: Exclude Active Tab from Hover Logic

**Logic:**
- Only hide text if `isHovered && !isActive`.
- Disable `onmouseenter` bounce effect for `isActive` items (prevent jumping from Pop to Bounce).

**Changes Required:**
1. **Initial State (Expansion):**
   ```typescript
   const isActive = i === activeIndex;
   const shouldHideText = isHovered && !isActive;
   gsap.fromTo(text, { ... }, { autoAlpha: shouldHideText ? 0 : 1, ... });
   ```
2. **Hover Handlers:**
   ```typescript
   (item as HTMLElement).onmouseenter = () => {
       if (i === activeIndex) return; // Don't bounce active item
       // ... animate to bounce
   };
   ```

**Verification:**
- Click Tab -> Sidebar expands -> Text falls down and REMAINS visible (because `isActive` prevents hiding).
- Icon stays at Y:70% (Pop) instead of jumping to Y:0 (Bounce).

**Risk:** Low. Logic is straightforward.

**Next:** /architect-core --plan (Solution I)
