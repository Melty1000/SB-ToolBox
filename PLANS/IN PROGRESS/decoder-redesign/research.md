# Research: Decoder Page Vibe (Encoder Analysis)

## Questions
1.  **What defines the "Industrial Vibe"?**
    -   Typography: `font-black uppercase tracking-[0.2em]`.
    -   Components: `ScriptStrip`, `ActionBtn`, Dark Glass Panels.
    -   Layout: Full-width vs Columns?

2.  **How is `ScriptStrip` structured?**
    -   Can it be adapted for "Extracted Scripts" in the Decoder?
    -   Need to support "View/Edit" instead of "Link/Delete".

3.  **Metadata/Stats Display:**
    -   Encoder doesn't have a large metadata block.
    -   How to fit this without breaking the vibe? Maybe a horizontal "Info Bar" or a separate panel that mimics the "Script List" but for properties?

## Action Plan
1.  **Analyze `EncoderPage.tsx`:**
    -   Extract `ScriptStrip` props/structure.
    -   Check "JSON Template" input styling (User wants this for Decoder Input).
2.  **Analyze `DecoderPage.tsx` (Current):**
    -   Identify why "Stats are missing" (did I delete `MiniStat` usage?).
    -   Check `ActionBtn` implementation.

## Scenarios
-   **Input:** Full width text area (Top).
-   **Action:** Center bar with "Decode" button.
-   **Output:**
    -   **Scripts:** List of scripts (use `ScriptStrip`-like component).
    -   **Metadata:** Display as a "Property Grid" or similar strip?
