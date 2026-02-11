# Code Verification: Tab Animation Clip Bug

**Created:** 2026-02-08T15:44:00-06:00
**Mission:** [mission.md](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/PLANS/IN%20PROGRESS/tab-animation-clip-bug/mission.md)
**Scope:** Sidebar navigation animation and icon clipping behavior

## Files Analyzed

| File | Lines | Purpose |
|------|-------|---------|
| [CitadelShell.tsx](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/application/src/components/layout/CitadelShell.tsx) | 271 | Shell layout + NavItem component |
| [useCitadelSidebar.ts](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/application/src/hooks/useCitadelSidebar.ts) | 234 | GSAP animation controller |
| [citadel-motion.ts](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/application/src/lib/citadel-motion.ts) | 66 | Animation constants |
| [page.tsx](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/application/src/app/page.tsx) | 31 | Root page (state host) |

## Async Operation Trace

### Async Chain 1: Sidebar Expand/Collapse Timeline
1. **Start:** `useCitadelSidebar.ts:16` - `useGSAP()` creates timeline
2. **Create:** `useCitadelSidebar.ts:20` - `gsap.timeline({ paused: true })`
3. **Play:** `useCitadelSidebar.ts:88` - `tl.current.play()` on isExpanded=true
4. **Reverse:** `useCitadelSidebar.ts:178` - `tl.current.reverse()` on isExpanded=false
5. **Resolution:** Managed by GSAP internal ticker (requestAnimationFrame)

### Async Chain 2: Page Transition Fade
1. **Start:** `useCitadelSidebar.ts:45` - `useEffect()` on activePage change
2. **Await:** `useCitadelSidebar.ts:49` - `gsap.fromTo(viewport, ...)` - 0.5s duration
3. **Resolution:** GSAP ticker completes animation

### Async Chain 3: Selection Drip Animation
1. **Start:** `useCitadelSidebar.ts:60` - `useGSAP()` on dependencies change
2. **Execute:** `useCitadelSidebar.ts:75` - `gsap.to(selectionDrip, ...)` - 0.6s elastic
3. **Resolution:** GSAP ticker completes

### Async Chain 4: Icon Scale/Position Animation
1. **Start:** `useCitadelSidebar.ts:91` - `icons.forEach()` in useGSAP
2. **Execute:** `useCitadelSidebar.ts:97` - `gsap.to(icon, { y: "70%", scale: 2.5 })` - 0.5s
3. **Resolution:** GSAP ticker completes

### Yield Points

| File:Line | Type | Throttled in Background? |
|-----------|------|--------------------------|
| `useCitadelSidebar.ts:20` | gsap.timeline (rAF) | YES - paused/1fps |
| `useCitadelSidebar.ts:49` | gsap.fromTo (rAF) | YES - paused/1fps |
| `useCitadelSidebar.ts:75` | gsap.to (rAF) | YES - paused/1fps |
| `useCitadelSidebar.ts:97` | gsap.to (rAF) | YES - paused/1fps |
| `CitadelShell.tsx:231` | gsap.fromTo (rAF) | YES - paused/1fps |

### Potential Bottlenecks
- `useCitadelSidebar.ts:138-174`: Event handlers assigned on every `isExpanded` change (no cleanup between toggles)

---

## Findings

### FINDING-1 (MISSION-CRITICAL)
**Type:** BUG
**Severity:** CRITICAL
**File:** [CitadelShell.tsx](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/application/src/components/layout/CitadelShell.tsx)
**Lines:** 165
**Description:** NavItem button has `overflow-hidden` which immediately clips the icon when it animates outside the 40px container bounds.
**Evidence:**
```tsx
className={cn(
    "relative flex items-center justify-center rounded-md group w-full h-10 nav-item overflow-hidden",
    ...
)}
```
**Impact:** Icon is clipped instantly while sidebar/scale animation is gradual (0.5s), creating a jarring visual disconnect with blank space below the icon.
**Relates to Mission:** YES - This is the root cause of the reported issue.

---

### FINDING-2
**Type:** BUG
**Severity:** MAJOR
**File:** [CitadelShell.tsx](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/application/src/components/layout/CitadelShell.tsx)
**Lines:** 170-176
**Description:** Inline styles on `nav-icon-wrapper` conflict with GSAP animation targets.
**Evidence:**
```tsx
<span
    className="... nav-icon-wrapper"
    style={{
        transform: active ? 'rotate(-10deg) scale(1.25)' : 'rotate(0deg) scale(1)',
        opacity: 1
    } as any}
>
```
**Impact:** React's inline `style.transform` is applied on every render, which may conflict with GSAP's animation of the same properties. GSAP sets inline styles directly, so this creates potential for visual flicker or style fights.
**Relates to Mission:** PARTIAL - May contribute to jarring transitions, but FINDING-1 is the primary cause.

---

### FINDING-3
**Type:** MAINTAIN
**Severity:** MINOR
**File:** [useCitadelSidebar.ts](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/application/src/hooks/useCitadelSidebar.ts)
**Lines:** 138-174
**Description:** Mouse event handlers are reassigned on every `isExpanded` change without proper cleanup.
**Evidence:**
```tsx
items.forEach((item, i) => {
    (item as HTMLElement).onmouseenter = () => { ... };
    (item as HTMLElement).onmouseleave = () => { ... };
});
```
**Impact:** Memory leak potential if items are removed/re-added. Also overwrites any other handlers on those elements.
**Relates to Mission:** NO

---

### FINDING-4
**Type:** PERF
**Severity:** MINOR
**File:** [useCitadelSidebar.ts](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/application/src/hooks/useCitadelSidebar.ts)
**Lines:** 63-65
**Description:** DOM queries inside `useGSAP` run on every dependency change.
**Evidence:**
```tsx
const icons = shellRef.current.querySelectorAll('.nav-icon-wrapper');
const selectionDrip = shellRef.current.querySelector('.selection-drip');
const items = shellRef.current.querySelectorAll('.nav-item');
```
**Impact:** Minor performance cost on every page change or sidebar toggle. Could be memoized with refs.
**Relates to Mission:** NO

---

### FINDING-5
**Type:** BUG
**Severity:** MINOR
**File:** [CitadelShell.tsx](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/application/src/components/layout/CitadelShell.tsx)
**Lines:** 184-190
**Description:** `.nav-text` inline styles also conflict with GSAP animations.
**Evidence:**
```tsx
style={{
    opacity: isExpanded ? 1 : 0,
    visibility: isExpanded ? 'visible' : 'hidden',
    transform: 'translateY(-30px)'
} as any}
```
**Impact:** GSAP animates `autoAlpha` (opacity + visibility), but React's inline styles may override or fight with these.
**Relates to Mission:** PARTIAL - May contribute to animation inconsistency.

---

## Summary

| Metric | Count |
|--------|-------|
| Total findings | 5 |
| Mission-related | 3 |
| Critical | 1 |
| Major | 1 |
| Minor | 3 |

## Discoveries

1. **React inline styles vs GSAP conflict** - Multiple elements have inline `style` that animates the same properties GSAP controls. This is a pattern anti-pattern.
2. **`overflow-hidden` is the root cause** - Confirmed: the icon animation targets `y: 70%` which places it ~28px (70% of 40px) below center, combined with `scale: 2.5` making it 50px tall, well exceeding the 40px container.
3. **Logo container uses `overflow-visible`** - Line 64 shows precedent for visible overflow in the same file.
4. **Event handlers leak** - The `onmouseenter`/`onmouseleave` pattern should use proper React event handlers or GSAP's `callbackScope`.

## Status
COMPLETE

## Next
/architect-core --design
