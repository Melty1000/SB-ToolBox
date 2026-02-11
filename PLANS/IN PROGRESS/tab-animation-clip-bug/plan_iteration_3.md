# Plan: Tab Animation Clip Bug (Iteration 3)

**Created:** 2026-02-08T16:55:00-06:00
**Mission:** [mission.md](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/PLANS/IN%20PROGRESS/tab-animation-clip-bug/mission.md)
**Solution:** G (Remove Z-Index Boost)

## Impact Summary
- Direct changes: 1 file (`useCitadelSidebar.ts`)
- Indirect impact: 0 files
- Risk level: Low

## Prerequisites
- [x] Memory loaded
- [x] Previous fix (Sol F) applied (State: `useCitadelSidebar.ts` currently sets `zIndex: 10`)

## Steps

### Step 1: Remove Z-Index Control from useCitadelSidebar.ts
**File:** [useCitadelSidebar.ts](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/application/src/hooks/useCitadelSidebar.ts)
**Lines:** 96-101, 199 (approx)
**Action:** modify
**Edit Strategy:** replace_file_content
**Logic:**
Wait, simply removing `zIndex` might not be enough if `overflow: visible` makes it render.
But in standard flow, Item N is stacked HIGHER than Item N-1.
So if Item 1 expands DOWN, it goes UNDER Item 2.
This is exactly what we want.

**Change:**
Remove `zIndex: 10` and `zIndex: 0` properties from `gsap.set` calls. Keep the `overflow` logic.

```typescript
// Before:
if (isActive && parentItem) {
    gsap.set(parentItem, { overflow: 'visible', zIndex: 10 });
} else if (parentItem) {
     gsap.set(parentItem, { overflow: 'hidden', zIndex: 0 });
}

// After:
if (isActive && parentItem) {
    gsap.set(parentItem, { overflow: 'visible' }); // Let natural stack handle overlap
} else if (parentItem) {
     gsap.set(parentItem, { overflow: 'hidden' });
}
```
And similarly for the Collapse block.

**Verification:**
1. Click Top Tab -> Scales DOWN -> Tucks UNDER second tab.
2. Click Bottom Tab -> Scales UP? No, `y` is always `70%` (down).
   - If I click the LAST tab, it scales down into empty space. Fine.
   - If I click MIDDLE tab, it scales down under the NEXT tab.
3. Overlap check: "Bleeding" should now look like "Tucking".

**Rollback:** Re-add `zIndex` properties.
**Status:** [x] Complete

---

## Test Scenarios
1. **Unselected Tabs:** Clipped (Grid visual maintained).
2. **Active Tab:** Expanded (Pop out).
3. **Overlap:** Active tucks BEHIND Next.
4. **Transparency:** If overlap looks messy due to transparency, note for future fix (add background).

## Rollback Plan
1. Revert changes to `useCitadelSidebar.ts`

## Status
COMPLETE

## Next
/architect-core --verify-plan
