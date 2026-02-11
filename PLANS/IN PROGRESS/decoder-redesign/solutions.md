# Solutions: Decoder Page Redesign (Vibe Align)

**Goal:** Fix specific user feedback items.

## Feedback Analysis & Solutions

### 1. Top Row: Input String Only
**Current:** Grid with Input (Left) and Metadata (Right).
**Problem:** User wants Input to take full width of top row.
**Solution:** Move Metadata/Stats to a new row below the Action Bar, or integrate into the "Results" area.
**Decision:** Input String = Row 1 (Full Width).

### 2. Decode Button "Fucked Up"
**Current:** `ActionBtn` with `onClick={handleDecode}`.
**Problem:** Likely the state/icon logic or visual alignment.
**Observation:** In `EncoderPage`, `ActionBtn` is wrapped in a specific flex container with dividers.
**Solution:** Ensure the wrapper matches exactly:
```tsx
<div className="flex flex-col lg:flex-row items-center justify-between w-full h-[52px] gap-0">
    <div className="flex-1 flex items-center h-full gap-6">
        <div className="h-[1px] flex-1 bg-white/5" />
        <ActionBtn ... />
        <div className="h-[1px] flex-1 bg-white/5" />
    </div>
</div>
```

### 3. Stats Missing
**Current:** `MiniStat` grid is inside the "Right Column" which the user dislikes.
**Solution:** Restore the full `StatCard` grid from the original design, but style it to fit the "Industrial" vibe. Maybe placed *after* the decode action, before the extracted content.

### 4. Metadata/Stats Card Vibe
**Current:** Generic `glass-panel`.
**Solution:** Use the "Industrial Item Strip" aesthetic.
- Instead of a big card, maybe a horizontal bar of "Chips" or a "Property Grid".

### 5. Extracted Content Vibe
**Current:** Sidebar list + Editor.
**Problem:** "Does not match vibe of encoder tab".
**Encoder Vibe:** `ScriptStrip` (Full width rows with icons, status badges, quick actions).
**Solution:**
- Replace "Sidebar + Editor" with a **List of Expandable Strips**.
- Each Script is a Strip.
- Clicking expands to show the Editor (or a "View Code" modal/drawer).
- This matches `EncoderPage`'s list of CS files.

## Proposed Layout

1.  **Row 1:** Input String (Full Width). `JSON Template` style.
2.  **Row 2:** Action Bar ("DECODE").
3.  **Row 3 (If Decoded):** Stats Grid (Full Width).
4.  **Row 4 (If Decoded):**
    -   Header: "EXTRACTED CONTENT"
    -   List of `ScriptStrip` (adapted for editing).
    -   List of `MetadataStrip` (editable fields as rows).

## Refined Component: `UniversalStrip`
- Props: `label`, `icon`, `rightElement`, `children` (expandable content).
- Use this for Scripts (Expand to Edit) and Metadata.

## Plan
1.  **Refactor Layout:** Top = Input. Center = Action. Bottom = Results.
2.  **Restore Stats:** Use the horizontal grid from `EncoderPage` (if applicable) or a clean "Dashboard" row.
3.  **Implement `ScriptStrip` for Decoder:**
    -   Re-implement the "List of Files" look.
    -   Accordion style: Click strip -> Expands editor.

