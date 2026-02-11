# Solution Verification: Tab Animation Clip Bug (Iteration 3)

**Created:** 2026-02-08T16:50:00-06:00
**Based on:** [solutions_iteration_3.md](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/PLANS/IN%20PROGRESS/tab-animation-clip-bug/solutions_iteration_3.md)

---

## Solution G: Remove Z-Index Boost

### Attacks

#### ATTACK-G1: Overlap Transparency
**Vector:** Edge Case
**Severity:** SERIOUS
**Attack:** If the *next* tab has a transparent background, the icon sliding *under* it will still be visible, looking like a "ghost" or messy overlap.
**Result:**
- Check `CitadelShell.tsx`. Buttons have NO background color by default.
- However, they contain text/icon.
- If Active Icon slides under, it will be visible *through* the empty space of the next button.
- **This might still look broken.**
- **Mitigation:** The user specifically complained about "bleeding into". Usually implies "on top".
- If it's "under", it's less intrusive.

#### ATTACK-G2: Last Item Z-Index
**Vector:** Edge Case
**Severity:** MINOR
**Attack:** The last item has no neighbor to cover it.
**Result:** It renders on top of whatever is below the list (empty space). Fine.

#### ATTACK-G3: Previous Item Z-Index
**Vector:** Edge Case
**Severity:** MINOR
**Attack:** If we select Item 2, it is *above* Item 1 in DOM. So it covers Item 1.
**Result:** The expanded icon goes DOWN (`y: 70%`). So it covers Item 3, not Item 1.
- Wait. DOM order: 1, 2, 3.
- Item 1 is *below* Item 2? No, z-index 0 implies stacking context by source order.
- Later elements are ON TOP of earlier elements.
- So Item 2 is ON TOP of Item 1.
- If Item 1 expands DOWN, it goes UNDER Item 2.
- **Perfect.** The expansion direction matches the stacking direction (Down -> Under).

**Conclusion:** Removing `zIndex: 10` is the correct structural fix for "expanded item covering neighbor".

### Verdict: SURVIVES
**Reason:** The natural DOM stacking order (Down -> Under) aligns perfectly with the animation direction (Down). This should Tuck the icon under the next item.

**Caveat:** If transparency makes it look messy, we might need to add a background color to `nav-item`?
- Adding `bg-citadel-void` (black) to `nav-item` would ensure clean occlusion.
- user's theme might vary.
- `styles: { background: 'var(--citadel-void)' }`?
- Safe bet: Try just removing `zIndex` first. If messy, add background.

---

## Solution H: Reduce Scale

### Attacks
**Attack:** Reducing scale changes the design intent. user said "looks better".
**Verdict:** Keep scale as is (2.5) unless Z-Index fix fails.

## Selected Solution
**Solution G (Remove Z-Index)**.

**Plan Update:**
1. Modify `useCitadelSidebar.ts`: Remove `zIndex: 10` and `zIndex: 0` logic. Just rely on `overflow` toggling.
2. (Optional) Add `background` to `nav-item` if transparency is an issue?
   - Let's stick to the minimal change first.

**Next:** /architect-core --plan (Solution G)
