# Solution Verification: Tab Animation Clip Bug (Iteration 2)

**Created:** 2026-02-08T16:25:00-06:00
**Based on:** [solutions_iteration_2.md](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/PLANS/IN%20PROGRESS/tab-animation-clip-bug/solutions_iteration_2.md)

---

## Solution D: Conditional Overflow (State-Based)

### Attacks

#### ATTACK-D1: Animation Clipping During Transition
**Vector:** Edge Case
**Severity:** SERIOUS
**Attack:** If `active` state toggles BEFORE animation starts (likely), then `overflow-visible` applies instantly. If animation has delay, unselected (now active) icon might flash visible before moving.
**Mitigation:** GSAP animation starts immediately on state change. The icon is usually centered. If it's visible but unscaled, it looks fine (just an icon).

#### ATTACK-D2: Unselected Tab Hover Scale
**Vector:** Edge Case
**Severity:** MINOR
**Attack:** User hovers unselected tab. Icon scales to 1.6x. If this exceeds 40px, it clips.
**Result:** This is DESIRED behavior per user feedback ("cutting the icon off gives the visual effect").
**Verdict:** WAI (Working As Intended).

#### ATTACK-D3: Deactivating Tab Transition
**Vector:** Edge Case
**Severity:** SERIOUS
**Attack:** User clicks ANOTHER tab. The current active tab becomes inactive. `overflow-hidden` applies IMMEDIATELY.
**Potential Failure:** The old active icon (which is currently scaled 2.5x and at y:70%) gets INSTANTLY clipped before it can animate back to center/small.
**Result:** JAR ring cut.
**Mitigation:** We need `overflow-visible` to persist UNTIL animation completes?
**Revised Logic:** The `active` prop toggles instantly. We might need a `isTransitioning` state or rely on GSAP `onComplete` to toggle a class.
**Verdict:** **FAILS** - Immediate clipping on deactivation will look broken.

---

## Solution F: GSAP-Controlled Class Toggling

**Approach:** Use GSAP callbacks to manage the overflow class.

**Logic:**
- **On Expand (Activate):** Set `overflow-visible` at START of animation.
- **On Collapse (Deactivate):** Set `overflow-hidden` at END of animation.

**Changes Required:**
- `useCitadelSidebar.ts`: Add `onStart`/`onComplete` to timelines.
- Needs access to DOM elements? Yes, via refs.

**Evaluation:**
- **Complexity:** Medium-High. Need to wiring GSAP callbacks to React state or direct DOM manipulation.
- **Robustness:** High. Guarantees visual continuity.

---

## Solution G: CSS Transition Delay?

**Approach:** Can we animate `overflow`? No.
**Can we delay the class removal?**
- `transition-delay` works for CSS properties, not layout modes like overflow.

---

## Refined Solution D (Z-Index Stacking?)

If the "active" tab has `z-index: 20` and `overflow: visible`, and the inactive tabs have `z-index: 0` and `overflow: hidden`...

**The Deactivation Problem:**
When you click a new tab:
1. New tab -> Active (Visible) -> Animates Out (Good)
2. Old tab -> Inactive (Hidden) -> **Instantly Clips** -> Animates In (Bad)

**We need the OLD tab to stay `overflow-visible` until it finishes shrinking.**

---

## Solution H: "Expanded" Prop on NavItem

We already pass `isExpanded` (sidebar state) to NavItem. But we need independent item state.

**Proposal:**
Use a `data-state` attribute controlled by GSAP?
Or... simply **Always allow overflow**, but use `clip-path`?

**Better Proposal:**
The "clipping" user wants is strictly for the layout (40px height).
If we let the Old Active Tab be `overflow-visible` while it shrinks... it will overlap neighbors.
But it shrinks FAST (0.3s).
Maybe acceptable?

**Wait, User said:** "cutting the icon off gives the visual effect of them having that area."
So unselected tabs MUST be clipped.

**If we clip the old active tab instantly:**
It jumps from "Full Icon" to "Bottom Half Missing" then shrinks.
This is the **original bug** in reverse!

**CRITICAL FINDING:**
We need `overflow-visible` during the ENTIRE entry AND exit animation of the active state.

**How to implement in React/GSAP:**
We need a `isAnimating` state?
Or just a delay?

**Easiest Fix:**
`overflow-hidden` with `transition`? No.

**GSAP `set`:**
In `useCitadelSidebar.ts`:
```ts
// Activating
gsap.set(target, { overflow: "visible", zIndex: 20 });
gsap.to(icon, { ... });

// Deactivating
gsap.to(icon, { ..., onComplete: () => {
    gsap.set(target, { overflow: "hidden", zIndex: 0 });
}});
```
But `useCitadelSidebar` controls the Sidebar, not individual items?
Line 91: `icons.forEach(...)`
It has access to the icons. Does it have access to the NavItem containers?
Line 65: `const items = shellRef.current.querySelectorAll('.nav-item');`
YES.

## Selected Solution: GSAP-Controlled Overflow (Solution F)

**Verdict:** Solution D (State-based) FAILS the deactivation case. We MUST use GSAP to control the class/style timing.

**Plan Update:**
1. Modify `useCitadelSidebar.ts` to select `.nav-item` elements.
2. In the GSAP animation loop:
   - When animating TO active: Set `overflow: visible` immediately.
   - When animating FROM active: Set `overflow: hidden` ONLY after animation completes.

**Next:** /architect-core --plan (Solution F)
