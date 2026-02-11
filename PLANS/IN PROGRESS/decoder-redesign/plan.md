# Plan: Decoder Redesign Execution

**Mission:** [mission.md](file:///D:/.DevSuite/Antigravity/Projects/SB-Encoder-Decoder-React/PLANS/IN%20PROGRESS/decoder-redesign/mission.md)
**Solution:** Full-width layout, Extracted `ScriptStrip`, Dedicated Metadata Bar.

## Phase 1: Preparation (Components)
1.  **Extract `ScriptStrip`:** Move from `EncoderPage` to `src/components/ui/ScriptStrip.tsx` for reuse.
    -   Need to generalize props: `onAction` instead of `onDelete`? Or specific usage?
    -   Use `children` prop for expandable editor content?
    -   **Decision:** Create a new `UniversalStrip.tsx` or adapt `ScriptStrip` to be generic. Let's call it `IndustrialStrip`.

2.  **Create `IndustrialStrip.tsx`:**
    -   Props: `label`, `icon`, `rightElement`, `children` (expanded content).
    -   Visuals: Border-bottom, hover effect, expand arrow. `GSAP` expand animation.

## Phase 2: Page Layout (`DecoderPage.tsx`)
1.  **Row 1 (Input):**
    -   Use `EncoderPage`'s "JSON Template" style (Full Width).
    -   Header: "INPUT STRING" (with Icon).

2.  **Row 2 (Action):**
    -   Use `ActionBtn` with correct wrapper (dividers).

3.  **Row 3 (Stats/Metadata):**
    -   **If Decoded:** Show Stats Grid (Horizontal 4-col).
    -   Show Metadata Fields as `IndustrialStrip` items (Expand to edit?). Or just horizontal inputs in a panel.

4.  **Row 4 (Extracted Content):**
    -   Header: "EXTRACTED SCRIPTS"
    -   Use `IndustrialStrip` for each script.
    -   Click strip -> Expands to show `SBEditor`.

## Steps
1.  **Create `IndustrialStrip.tsx`:** Generic expandable strip component.
2.  **Refactor `DecoderPage.tsx`:** Implement new layout.
3.  **Verify:** Check visual consistency.

