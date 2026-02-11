# Research: Tab Animation Clip Bug

**Created:** 2026-02-08T15:40:00-06:00
**Mission:** [mission.md](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/PLANS/IN%20PROGRESS/tab-animation-clip-bug/mission.md)

## Domain Understanding

This issue relates to GSAP-powered sidebar navigation animation in a React application. The sidebar expands/collapses on hover, with icons undergoing scale and position transforms. The bug manifests when clicking a tab causes the icon to be visually cropped to its final position before the animation completes.

## External Research

**GSAP + Overflow Clipping:**
- `overflow: hidden` on a parent container clips any content that extends beyond the padding box immediately
- GSAP transforms (scale, translate) do NOT change the actual bounding box of elements
- When animating elements that need to visually exceed their container, `overflow: visible` is required

**Best Practice:**
- Use wrapper containers with `overflow: visible` for animated elements
- Only apply `overflow: hidden` to intentionally clip static content or after animation completes

## Internal Research

### Key Files Identified

| File | Purpose | Lines |
|------|---------|-------|
| [CitadelShell.tsx](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/application/src/components/layout/CitadelShell.tsx) | Shell layout + NavItem component | 271 |
| [useCitadelSidebar.ts](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/application/src/hooks/useCitadelSidebar.ts) | GSAP animation controller | 234 |
| [citadel-motion.ts](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/application/src/lib/citadel-motion.ts) | Animation constants/timings | 66 |

### Root Cause Location

**File:** `CitadelShell.tsx`
**Line:** 165

```tsx
className={cn(
    "relative flex items-center justify-center rounded-md group w-full h-10 nav-item overflow-hidden",
    ...
)}
```

The `NavItem` button has **`overflow-hidden`** applied.

**Animation Logic:** `useCitadelSidebar.ts` lines 91-107
```tsx
icons.forEach((icon, i) => {
    const isActive = i === activeIndex;
    const targetScale = isActive ? 2.5 : 2.25;
    gsap.to(icon, {
        x: 0,
        y: "70%",  // <-- Icon moves OUTSIDE the 40px container
        scale: targetScale,
        ...
    });
});
```

**The Problem:**
1. Icon receives `y: "70%"` + `scale: 2.5` transform
2. This positions the icon well outside the 40px (`h-10`) button bounds
3. `overflow-hidden` **immediately clips** the icon to the button boundary
4. The clipping is instant, but the sidebar width animation is gradual (0.5s)
5. Result: Icon appears "cut off" with blank space below during transition

## Scenario Enumeration

### Scenario 1: Tab Click During Collapsed State
- **Trigger:** User clicks a tab while sidebar is collapsed
- **Expected:** Icon smoothly animates to new position; no jarring clip
- **Actual:** Icon instantly clips to final position; blank space visible below icon
- **Files:** `CitadelShell.tsx` (NavItem), `useCitadelSidebar.ts` (animation)

### Scenario 2: Tab Click During Expanded Hover
- **Trigger:** User hovers sidebar (expanded), then clicks a different tab
- **Expected:** Selection drip slides, icon animates smoothly
- **Actual:** Icon clips abruptly; jarring transition
- **Files:** Same as Scenario 1

### Scenario 3: Sidebar Collapse After Tab Click
- **Trigger:** User clicks tab, then moves mouse away (sidebar collapses)
- **Expected:** Icon scales down, no clipping
- **Actual:** Works correctly (icon is scaling DOWN within bounds)
- **Files:** Same

### Scenario 4: First Mount (Page Load)
- **Trigger:** App loads with initial page
- **Expected:** Icon in correct position, no animation
- **Actual:** Works correctly (gsap.set used, no animation)
- **Files:** `useCitadelSidebar.ts` line 95

### Scenario Coverage Checklist
- [x] Initial load
- [x] User interaction
- [ ] Background/throttled - N/A (no background processes)
- [ ] Error recovery - N/A (no error states in animation)
- [x] Edge cases (tab click during various states)

## Approaches Found

### Approach 1: Remove `overflow-hidden` from NavItem
- **Description:** Change `overflow-hidden` to `overflow-visible` on the NavItem button
- **Pros:** Simplest fix; directly addresses root cause
- **Cons:** May allow icon to visually overlap adjacent items; requires testing for visual side effects
- **Examples:** Used in `logo-container` (line 64: `overflow-visible`)

### Approach 2: Move clipping to parent `<nav>`
- **Description:** Apply `overflow-hidden` to the `<nav>` container instead of individual items
- **Pros:** Contains overflow at a higher level; icons can animate freely within sidebar bounds
- **Cons:** May clip the selection drip if it needs to extend beyond nav bounds
- **Examples:** Common pattern for sidebar navigation containers

### Approach 3: Animate with `clipPath` instead of overflow
- **Description:** Use GSAP to animate a `clipPath` on the icon wrapper to match the animation timing
- **Pros:** Precise control over clipping during animation
- **Cons:** More complex; adds CPU overhead; may cause aliasing
- **Examples:** Advanced GSAP masking techniques

## Common Pitfalls

1. **Removing overflow on button breaks hover states** - Button background or focus ring may bleed outside bounds
2. **Sibling overlap** - Icons scaled at 2.5x may overlap adjacent nav items visually
3. **Selection drip misalignment** - The `.selection-drip` element relies on `relative` positioning within nav; changing overflow could affect its bounds
4. **Touch targets** - `overflow-visible` doesn't change the clickable area; users may click on the visible icon but miss the actual button
5. **Z-index stacking** - Visible overflow may require z-index adjustments to prevent icons from appearing above header or content

## Relevant Code

- [CitadelShell.tsx L165](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/application/src/components/layout/CitadelShell.tsx#L165): NavItem `overflow-hidden`
- [useCitadelSidebar.ts L91-107](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/application/src/hooks/useCitadelSidebar.ts#L91-L107): Icon scale/translate animation
- [useCitadelSidebar.ts L177-200](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/application/src/hooks/useCitadelSidebar.ts#L177-L200): Collapse animation (works correctly)

## Issue Relationship Analysis

Single issue - no multi-issue grouping required.

## Key Insights

1. The icon is designed to animate to `y: 70%` and `scale: 2.5` in expanded state - this intentionally places it OUTSIDE the button bounds
2. The `overflow-hidden` on NavItem conflicts with this design intent
3. The `logo-container` on line 64 already uses `overflow-visible` for the same reason - precedent exists

## Discoveries

- `overflow: visible` is already used for logo animations in the same file (line 64)
- The collapsed state animation works fine because the icon stays within bounds
- Selection drip positioning (`activeIndex * 44`) assumes 44px row height (40px button + 4px spacing)

## Status
COMPLETE

## Next
/architect-core --verify-code
