# Solutions: Tab Animation Clip Bug

**Created:** 2026-02-08T15:46:00-06:00
**Mission:** [mission.md](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/PLANS/IN%20PROGRESS/tab-animation-clip-bug/mission.md)
**Based on:** [research.md](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/PLANS/IN%20PROGRESS/tab-animation-clip-bug/research.md), [code_verified.md](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/PLANS/IN%20PROGRESS/tab-animation-clip-bug/code_verified.md)

## Root Cause Verification

### Claimed Root Cause
The `overflow-hidden` class on the `NavItem` button (line 165 of `CitadelShell.tsx`) immediately clips the icon when GSAP animates it to `y: "70%"` and `scale: 2.5`, placing the icon outside the 40px container bounds.

### Evidence For
1. **Direct code inspection** - `overflow-hidden` is explicitly declared on NavItem button (line 165)
2. **Animation targets outside bounds** - GSAP sets `y: "70%"` (28px below center) + `scale: 2.5` (50px icon in 40px container)
3. **Precedent in same file** - `logo-container` (line 64) uses `overflow-visible` for similar animated content
4. **User screenshot** - Shows icon cropped at bottom with blank space, consistent with overflow clipping behavior
5. **CSS mechanics** - `overflow: hidden` clips content immediately upon render, not animatable

### Evidence Against / Uncertainties
1. **Inline styles conflict** (FINDING-2) may contribute, but inline styles set transforms, not clipping
2. **GSAP timing** - Could theoretically be a race condition, but GSAP runs synchronously within rAF

### Verification Method
Remove `overflow-hidden` from NavItem → if icon is no longer cropped during animation, root cause confirmed.

### Alternative Explanations
1. **GSAP animation order** - Ruled out because clipping happens immediately on click (before animation starts)
2. **React inline style conflict** - Ruled out because inline styles control `transform`, not `overflow`
3. **CSS specificity issue** - Ruled out because `overflow-hidden` is in the class list, not overridden

### Root Cause Confidence
[x] HIGH - Multiple evidence points, alternatives ruled out
[ ] MEDIUM - Good evidence, some uncertainty
[ ] LOW - Mostly inference, needs more investigation

---

## Context

The sidebar uses GSAP for smooth animations. When expanded, icons animate to a larger scale and shifted position (`y: 70%`). The design intention is for icons to visually extend beyond their button containers in expanded state. However, `overflow-hidden` on the button clips this immediately, while the sidebar width and other elements animate over 0.5s.

---

## Solution A: Conservative Refactor

**Approach:** Replace `overflow-hidden` with `overflow-visible` on the NavItem button.

**Changes Required:**
- [CitadelShell.tsx L165](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/application/src/components/layout/CitadelShell.tsx#L165): Change `overflow-hidden` → `overflow-visible`

**Risk Level:** Low

**Effort:** 5 minutes

**Addresses:**
- FINDING-1 (CRITICAL): Overflow clipping

**Trade-offs:**
- ✓ Minimal change, single line edit
- ✓ Directly addresses root cause
- ✓ Matches existing pattern (`logo-container` uses `overflow-visible`)
- ✗ Scaled icons may visually overlap adjacent nav items (needs visual testing)
- ✗ Any background/focus ring styling may bleed outside button bounds

---

## Solution B: Systemic Improvement

**Approach:** Restructure NavItem to use a non-clipping wrapper for the icon, while keeping the button clipped for interactive styling.

**Changes Required:**
- [CitadelShell.tsx L160-196](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/application/src/components/layout/CitadelShell.tsx#L160-L196): 
  - Keep `overflow-hidden` on button for focus/hover state containment
  - Add a new wrapper `<div className="absolute inset-0 overflow-visible pointer-events-none">` around the icon
  - Move `.nav-icon-wrapper` inside this visible-overflow container
- Remove conflicting inline styles (FINDING-2, FINDING-5) to let GSAP fully control transforms

**Risk Level:** Medium

**Effort:** 30 minutes

**Addresses:**
- FINDING-1 (CRITICAL): Overflow clipping
- FINDING-2 (MAJOR): Inline style conflicts
- FINDING-5 (MINOR): Nav-text style conflicts

**Trade-offs:**
- ✓ Clean separation: button clips interactive elements, icon can overflow
- ✓ Fixes secondary findings (inline style conflicts)
- ✓ More robust for future animation changes
- ✗ More DOM elements
- ✗ Slightly more complex mental model

---

## Solution C: Strategic Rebuild

**Approach:** Rewrite NavItem as a GSAP-first component with all styles controlled via GSAP.set/GSAP.to, eliminating all inline React styles.

**Changes Required:**
- Create new `NavItemGSAP.tsx` component
- Move all style logic to `useCitadelSidebar.ts` via GSAP refs
- Remove inline `style={}` props entirely from NavItem
- Use GSAP.set on mount for initial state
- Use `overflow-visible` on icon container
- Use proper React event handlers instead of direct DOM assignment (fixes FINDING-3)

**Risk Level:** High

**Effort:** 2-3 hours

**Addresses:**
- FINDING-1 (CRITICAL): Overflow clipping
- FINDING-2 (MAJOR): Inline style conflicts
- FINDING-3 (MINOR): Event handler leaks
- FINDING-4 (MINOR): DOM query performance
- FINDING-5 (MINOR): Nav-text style conflicts

**Trade-offs:**
- ✓ Fixes ALL findings
- ✓ Clean GSAP-controlled architecture
- ✓ Better separation of concerns
- ✗ High effort for this scope
- ✗ Risk of regression in animation behavior
- ✗ Overkill for single-issue fix

---

## Recommendation

**Solution A** is the recommended approach. It directly addresses the root cause with minimal risk and effort. Visual testing should confirm no unintended side effects.

If visual overlap becomes an issue, **Solution B** provides a clean architectural separation.

**Solution C** is only warranted if the project requires a broader animation refactor.

---

## Discoveries

1. **Overflow affects clipping, not animation** - GSAP animates transforms freely, but CSS `overflow` clips the visible result instantly
2. **React inline styles should be avoided with GSAP** - The pattern of setting inline `style.transform` on elements that GSAP also animates creates potential conflicts

## Status
COMPLETE

## Next
/architect-core --verify-solutions
