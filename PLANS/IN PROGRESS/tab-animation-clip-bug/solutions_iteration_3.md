# Solutions: Tab Animation Clip Bug (Iteration 3)

**Created:** 2026-02-08T16:45:00-06:00
**Mission:** [mission.md](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/PLANS/IN%20PROGRESS/tab-animation-clip-bug/mission.md)
**Based on:** User feedback "selected tab icon is bleeding into the unselected tab"

## Problem Analysis
The "Pop Out" effect (Sol F) works by setting `overflow: visible` and `zIndex: 10`.
- **Result:** The active icon (Scale 2.5, Y 70%) renders **on top** of the neighbor tab.
- **User Complaint:** "bleeding into" -> It covers the neighbor's text/icon in an ugly way.

## Constraints
1. **Unselected Tabs:** Must be validly clipped (grid effect). (Solved by Sol F)
2. **Active Tab:** Must NOT be instantly cropped (requires `overflow: visible`). (Solved by Sol F)
3. **Active Tab:** Must NOT obscure neighbor content aggressively.

## Solution Approaches

### Solution G: "Tuck Under" (Z-Index Reversal)
**Approach:** Instead of boosting Z-Index, let the Active tab stay *below* the subsequent tabs.
**Logic:**
- In standard DOM flow, next element is on top.
- If we remove `zIndex: 10`, Item N is covered by Item N+1.
- **Result:** The "Pop Out" will slide **underneath** the next button.
- **Risk:** If the next button is transparent, it still shows messy overlap. BUT, it respects the "border" of the next item (clipping by occlusion).
- **Edit:** Just remove `zIndex: 10` from the GSAP logic.

### Solution H: Reduce Animation Magnitude
**Approach:** The values `scale: 2.5` and `y: "70%"` are extremely aggressive (150% height).
**Logic:** Tune them down to "Pop" without "Exploding".
- Scale: 2.5 -> 2.0
- Y: 70% -> 35%
**Result:** Less overlap, cleaner look?
**Edit:** Update `useCitadelSidebar.ts` hardcoded values or `citadel-motion.ts`.

### Solution I: Clip-Path "Soft Edge"
**Approach:** Use `clip-path` to allow overflow ONLY at the bottom but feather it? Too complex.

## Recommendation: Combination (G + H)

1. **Remove Z-Index Boost:** Let the active item be covered by neighbors if they overlap. This creates a "Depth" effect rather than "Overlay".
   - *Exception:* What if it's the LAST item? No neighbor to cover it. Fine.
2. **Tune Values (Optional):** If user still finds it huge, we can tweak scale. But Z-Index is the structural fix for "bleeding".

**Hypothesis:** The "bleeding" complaint is specifically about the icon **covering the label/icon** of the next tab. Tucking it under fixes this immediately.

**Refined Plan (Sol G):**
- Modify `useCitadelSidebar.ts`:
  - **Remove** `zIndex: 10` from the `gsap.set` calls.
  - **Ensure** `zIndex: 0` (or `auto`) is consistent.

**Verification:**
- Active tab expands.
- Icon slides DOWN.
- It goes BEHIND the next tab.
- Visual effect: "Subtle Pop" rather than "Overlay".

**Caveat:** The next tab needs a background color to actually "hide" the icon sliding under it.
- `CitadelShell.tsx` buttons are transparent by default?
- `class="... nav-item"`
- User said "golden background for a selected tab".
- Unselected tabs might be transparent.
- If transparent, "Tuck Under" = "Messy Transparency Overlap".
- **Risk:** High.

**Alternative: Make Unselected Tabs Opaque?**
- Add `bg-citadel-void` (black) to all tabs?
- This guarantees the "Tuck Under" works cleanly.

**Let's assume the user LIKES the design (transparent).**
Maybe we just need to **shift the icon UP**?
If we center it or move it UP (`y: -20%`), it overlaps the *previous* tab.
Same issue.

**Let's try Reducing Scale (Sol H) first?**
If it's smaller, it bleeds less.
User said "looks better but...".
So the "Pop" is good in principle.

**What if we set `zIndex` to NEGATIVE?**
`zIndex: 0` for Active, `zIndex: 1` for Neighbors.
We need to force neighbors to be higher.
`nav-item` default: `relative ... z-10`?
Currently no z-index on default `nav-item`.

**Decision:**
I will attempt **Solution H (Tune Animation)** first, as it preserves the "Overlay" (Pop) nature but makes it less broken.
AND **Solution G (Remove Z-Index Boost)**.
Actually, let's remove the boost first. It's the most likely culprit for "Bad Bleeding".

**Why?**
If I have a stack of cards. I pull one out. If it covers the card below, it looks like it's floating.
If it slides under, it looks like it's expanding in place.
"Bleeding" usually implies "Unwanted Overlap on Top".

**Plan:**
1. Remove `zIndex: 10` from `useCitadelSidebar.ts`.
2. (Optional) Check transparent background.

**Implementation:**
Modify `useCitadelSidebar.ts`.
Remove `zIndex` properties from the `gsap.set` calls.

**Wait**, if I remove `zIndex`, `overflow: visible` will still allow it to render outside.
The **Stacking Context** determines overlap.
In Flex/Grid, default stacking is Source Order.
Item 1 < Item 2 < Item 3.
Item 1 (Active) with `overflow: visible` will render its content.
Does it render ON TOP of Item 2?
No. Item 2 is later in DOM -> ON TOP of Item 1.
So by default (without z-index), Item 1 tucks UNDER Item 2.
**So Sol G is just "Remove the line I added".**

**But what if Item 2 is Active?**
Item 2 is active. It renders.
Item 3 is later -> Item 2 tucks UNDER Item 3.
Item 1 is earlier -> Item 2 covers Item 1.
This creates a "Waterfall" depth effect.
This is likely much cleaner than "Always On Top".

**Refined Recommendation:**
**Solution G: Respect DOM Stacking Order.**
Remove the manual `zIndex: 10` boost. Let the natural waterfall (Next covers Previous) handle the overlap.

**Next:** /architect-core --verify-solutions (Iteration 3)
