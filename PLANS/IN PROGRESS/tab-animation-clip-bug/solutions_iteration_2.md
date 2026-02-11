# Solutions: Tab Animation Clip Bug (Iteration 2)

**Created:** 2026-02-08T16:20:00-06:00
**Mission:** [mission.md](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/PLANS/IN%20PROGRESS/tab-animation-clip-bug/mission.md)
**Based on:** [research_iteration_2.md](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/PLANS/IN%20PROGRESS/tab-animation-clip-bug/research_iteration_2.md)

## Root Cause Logic (Revised)

The root cause is not simply `overflow-hidden` existing, but rather that it applies **unconditionally** to all tabs, including the active one which needs to break bounds. The user confirmed unselected tabs *should* clip their icons to create a specific grid visual effect.

**Requirement:**
- **Active Tab:** `overflow-visible` + `z-index` boost (to prevent overlap clipping)
- **Inactive Tabs:** `overflow-hidden` (to maintain grid visual)

---

## Solution D: Conditional Overflow (State-Based)

**Approach:** Apply `overflow-visible` ONLY to the active tab via the existing `active` prop logic.

**Changes Required:**
- [CitadelShell.tsx L165](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/application/src/components/layout/CitadelShell.tsx#L165):
  ```tsx
  className={cn(
      "relative flex items-center justify-center rounded-md group w-full h-10 nav-item",
      active ? "overflow-visible z-20" : "overflow-hidden z-0",
      active ? "text-citadel-frame" : "text-citadel-text-dim group-hover:text-citadel-text-label"
  )}
  ```

**Risk Level:** Low

**Effort:** 5 minutes

**Addresses:**
- **Clipping Bug:** Active tab can now animate cutside bounds.
- **Visual Regression:** Inactive tabs remain clipped as desired.
- **Z-Index Issues:** Explicit z-index ensures active tab floats above others.

**Trade-offs:**
- ✓ Preserves original visual design for unselected tabs
- ✓ Fixes the specific clipping bug for active transition
- ✗ Transition moment (click) instantly switches overflow - GSAP animation might still look slightly abrupt if the icon isn't already "out". But since icon starts animating from valid position, this should be seamless.

---

## Solution E: Hover + Active Overflow

**Approach:** Allow overflow on both Active AND Hovered tabs.

**Rationale:** When user hovers an unselected tab, the icon scales to 1.6x (line 142). If this also exceeds 40px, it might clip ugly.

**Changes Required:**
- Update `className` logic to include `group-hover:overflow-visible`.

**Risk Level:** Low-Medium

**Trade-offs:**
- ✓ Better hover experience if generic scale causes clipping
- ✗ More "popping" elements potentially distracting

---

## Recommendation

**Solution D (Conditional Active)** is the safest direct fix. It respects the "selected = hero" vs "unselected = grid" hierarchy.

**Verification Plan:**
1. Default: Inactive tabs clip large icons (User's desired visual)
2. Click: Tab becomes active -> overflow opens -> icon animates out
3. Z-Index: Active tab must be above neighbors to avoid clipping by THEIR overflow-hidden containers (though siblings don't clip each other, z-index helps with rendering order).

## Next
/architect-core --verify-solutions (Iteration 2)
