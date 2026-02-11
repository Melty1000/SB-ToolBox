# Mission: Decoder Page Redesign (Vibe Align)

**Objective:** Redesign the Decoder Page to perfectly match the visual logic and "vibe" of the Encoder Page, addressing specific user feedback.

## User Feedback / Requirements
1.  **Top Row:** Only the "Input String" box should be here. (1-column layout).
2.  **Action Button:** Fix the "Decode/Process" button (currently "fucked up").
3.  **Stats:** Restore missing stats.
4.  **Metadata/Stats Card:** Fix visual vibe (currently doesn't fit).
5.  **Extracted Content:** Redesign to match the "Industrial Item Strip" vibe of the Encoder tab (ScriptStrips, etc.).

## Context
- **Encoder Page:** Uses "Industrial Item Strips" (horizontal bars with icons/actions), dark glass panels, specific typography (`text-[10px] font-black uppercase tracking-[0.2em]`).
- **Current Decoder:** Tried to force a 2-column layout that the user disliked. Components are generic "Glass Panels" rather than the specific Encoder aesthetic.

## Constraints
- Must use the same component primitives or visual patterns as `EncoderPage`.
- `ActionBtn` must work correctly (animations, state).

## Definition of Done
- Input Box is full-width top row.
- Decode Button looks and behaves exactly like Encoder's Process button.
- Metadata and Stats are clearly visible and styled correctly (possibly in the output area or a second row).
- Extracted Scripts use a list style similar to `ScriptStrip`.
- User signs off on the "Vibe".
