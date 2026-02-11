# Plan: Tab Animation Clip Bug (Iteration 4)

**Created:** 2026-02-08T17:15:00-06:00
**Mission:** [mission.md](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/PLANS/IN%20PROGRESS/tab-animation-clip-bug/mission.md)
**Solution:** I (Active Text Logic Fix)

## Impact Summary
- Direct changes: 1 file (`useCitadelSidebar.ts`)
- Indirect impact: 0 files
- Risk level: Low

## Prerequisites
- [x] Memory loaded
- [x] Previous iterations complete

## Steps

### Step 1: Update Hover Logic in useCitadelSidebar.ts
**File:** [useCitadelSidebar.ts](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/application/src/hooks/useCitadelSidebar.ts)
**Lines:** 135, 149 (approx)
**Action:** modify
**Edit Strategy:** replace_file_content

**Changes 1 (Initial Expansion):**
Modify `items.forEach` loop to check `isActive` and exclude it from hiding.

```typescript
// Before:
// autoAlpha: isHovered ? 0 : 1

// After:
const isActive = i === activeIndex;
// Focused area stays text-free ONLY if not active
const shouldHideText = isHovered && !isActive; 

// autoAlpha: shouldHideText ? 0 : 1
```

**Changes 2 (Hover Handlers):**
Modify `onmouseenter` to respect Active state.

```typescript
(item as HTMLElement).onmouseenter = () => {
    // If active, do NOT trigger bounce or hide text
    if (i === activeIndex) return;

    // ... existing logic
};
```

**Verification:**
1. Click Tab -> Text remains visible.
2. Icon stays in "Pop" state (Scale 2.5).
3. Hover Unselected Tab -> Bounces (Scale 1.6), Text Hides.
4. Leave Unselected Tab -> Text Appears.

**Rollback:** Revert changes.
**Status:** [x] Complete

---

## Test Scenarios
1. **Click Tab:** Text visible immediately?
2. **Hover Active Tab:** No "Bounce"? Text stays visible?
3. **Hover Inactive Tab:** Bounces? Text Hides?

## Status
COMPLETE

## Next
/architect-core --verify-plan
