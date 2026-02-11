# Plan: Tab Animation Clip Bug (Iteration 2)

**Created:** 2026-02-08T16:30:00-06:00
**Mission:** [mission.md](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/PLANS/IN%20PROGRESS/tab-animation-clip-bug/mission.md)
**Solution:** F (GSAP-Controlled Overflow) from solutions_verified_iteration_2.md

## Impact Summary
- Direct changes: 2 files
- Indirect impact: 0 files
- Risk level: Medium (GSAP logic slightly more complex than CSS)

## Prerequisites
- [x] Memory loaded
- [x] Previous attempt (Sol A) reverted (Step 1 of this plan handles revert)

## Steps

### Step 1: Revert CitadelShell.tsx to `overflow-hidden`
**File:** [CitadelShell.tsx](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/application/src/components/layout/CitadelShell.tsx)
**Lines:** 165
**Action:** modify
**Edit Strategy:** replace_file_content
**Changes:**
```diff
- "relative flex items-center justify-center rounded-md group w-full h-10 nav-item overflow-visible",
+ "relative flex items-center justify-center rounded-md group w-full h-10 nav-item overflow-hidden",
```
**Verification:** Unselected tabs are clipped again.
**Status:** [x] Complete

---

### Step 2: Implement GSAP Overflow Control
**File:** [useCitadelSidebar.ts](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/application/src/hooks/useCitadelSidebar.ts)
**Lines:** 91-110 (approx)
**Action:** modify
**Edit Strategy:** replace_file_content
**Logic:**
Inside `icons.forEach`:
1. Get the parent `.nav-item` element for the icon.
2. If `isActive`:
   - `gsap.set(parentItem, { overflow: 'visible', zIndex: 10 })`
   - Play icon animation
3. If `!isActive`:
   - Play reverse icon animation
   - `onComplete: () => gsap.set(parentItem, { overflow: 'hidden', zIndex: 0 })`

**Verification:**
1. Click tab -> Icon pops out immediately + animates.
2. Click other tab -> Old icon animates back -> Clips after done.
3. No instant clipping on deactivation.

**Code Pattern:**
```typescript
icons.forEach((icon, i) => {
    const parentItem = icon.closest('.nav-item');
    const isActive = i === activeIndex;
    
    if (isActive) {
        gsap.set(parentItem, { overflow: 'visible', zIndex: 10 });
        gsap.to(icon, { ... });
    } else {
        gsap.to(icon, {
            ...,
            onComplete: () => {
                gsap.set(parentItem, { overflow: 'hidden', zIndex: 0 });
            }
        });
    }
});
```

**Rollback:** Revert changes to useCitadelSidebar.ts
**Status:** [x] Complete

---

## Test Scenarios
1. **Unselected Tab:** Perfectly clipped at 40px bounds.
2. **Transition In:** Pop out -> Animate. Smooth?
3. **Transition Out:** Animate In -> Clip. Smooth?
4. **Fast Clicking:** Does rapid switching break state? (GSAP should handle overwrites).

## Rollback Plan
1. Revert changes to `useCitadelSidebar.ts`
2. Keep `CitadelShell.tsx` at `overflow-hidden` (original state)

## Status
COMPLETE

## Next
/architect-core --verify-plan
