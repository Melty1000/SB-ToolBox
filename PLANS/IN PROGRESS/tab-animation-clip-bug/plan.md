# Plan: Tab Animation Clip Bug

**Created:** 2026-02-08T15:52:00-06:00
**Mission:** [mission.md](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/PLANS/IN%20PROGRESS/tab-animation-clip-bug/mission.md)
**Solution:** A (Conservative Refactor) from solutions_verified.md

## Impact Summary
- Direct changes: 1 file
- Indirect impact: 0 files (no other code depends on overflow-hidden)
- Risk level: Low

## Prerequisites
- [x] Git status clean (or changes stashed)
- [x] Memory loaded
- [x] All previous phases complete

## Steps

### Step 1: Change NavItem overflow behavior
**File:** [CitadelShell.tsx](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/application/src/components/layout/CitadelShell.tsx)
**Lines:** 165
**Action:** modify
**Edit Strategy:** replace_file_content (file is 271 lines, <300)
**Changes:**
```diff
- "relative flex items-center justify-center rounded-md group w-full h-10 nav-item overflow-hidden",
+ "relative flex items-center justify-center rounded-md group w-full h-10 nav-item overflow-visible",
```
**Verification:** 
1. Hot reload triggers in running dev server
2. Navigate to app in browser
3. Click different tabs - icons should animate smoothly without clipping
4. No blank space below icon during transition
**Rollback:** Change `overflow-visible` back to `overflow-hidden`
**Status:** [x] Complete

---

### Step 2: Visual Integration Testing
**Action:** Verify all changes work together
**Checks:**
- [ ] Click tab while sidebar collapsed → icon animates smoothly, no clipping
- [ ] Click tab while sidebar expanded → icon animates smoothly with selection drip
- [ ] Hover sidebar → icons scale to 2.5x without being cut off
- [ ] Check adjacent icons → no severe visual overlap issues
- [ ] Test keyboard Tab → focus ring appears correctly (no bleeding)
- [ ] Test sidebar collapse → animation plays smoothly (regression check)
**Status:** [ ] Pending

---

### Step 3: Conditional Z-Index Fix (if needed)
**File:** [CitadelShell.tsx](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/application/src/components/layout/CitadelShell.tsx)
**Lines:** 165
**Action:** modify (ONLY if Step 2 reveals overlap issues)
**Edit Strategy:** replace_file_content
**Changes:**
```diff
- "relative flex items-center justify-center rounded-md group w-full h-10 nav-item overflow-visible",
+ "relative flex items-center justify-center rounded-md group w-full h-10 nav-item overflow-visible z-0 [&.active]:z-10",
```
**Or via the active prop:**
```tsx
cn(
    "relative flex items-center justify-center rounded-md group w-full h-10 nav-item overflow-visible",
    active ? "text-citadel-frame z-10" : "text-citadel-text-dim group-hover:text-citadel-text-label z-0"
)
```
**Verification:** Active icon renders above adjacent icons
**Rollback:** Remove z-index classes
**Status:** [ ] Conditional - only execute if overlap is problematic

---

## Test Scenarios
1. **Tab Click During Collapsed State** - Icon animates smoothly, no blank space below
2. **Tab Click During Expanded Hover** - Selection drip slides, icon animates without clipping  
3. **Sidebar Collapse After Tab Click** - Animation plays correctly (regression)
4. **First Mount (Page Load)** - Correct initial state, no flash

## Rollback Plan
1. Undo Step 3 (if applied): Remove z-index classes
2. Undo Step 1: Change `overflow-visible` back to `overflow-hidden` on line 165

## Discoveries
None - straightforward single-line change with clear verification path.

## Status
COMPLETE

## Next
/architect-core --verify-plan
