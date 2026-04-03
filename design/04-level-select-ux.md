# Level Select

## Intent

The level select screen gives the player a bird's-eye view of their progress
through the entire game. It communicates:

- How far they've come
- What's immediately ahead
- What they've mastered vs. what needs improvement

The layout is a visual map of all 14 levels and 6 cutscenes, grouped by arc (5
arcs). The arc grouping conveys narrative structure — each arc is a chapter with
its own environment theme.

## Layout Concept

The screen is divided into 5 arc sections displayed in a horizontal grid (one
column per arc), fitting without scrolling. Each arc section shows:

- The arc's environment theme name and emoji icon in a header, with a soft glow
  in the arc's color
- A vertical connector track running down the column, in the arc's color
- A cutscene node preceding arc 1 (the intro, index 0)
- The 2–3 levels within the arc, each as a card
- The cutscene node that follows the arc (outro)

Level cards show:

- Level number (in Press Start 2P font)
- ⚡ Speed badge for speed-test levels
- Completion status icon (✓ done, ▶ open, ⚿ locked)
- Best WPM and best accuracy (if any record exists)
- "Not played yet" hint on unlocked-but-unplayed cards
- New letters introduced at that level (one chip per letter)

Cutscene nodes show an icon (🎬 intro, ▶ chapter, 🏆 finale) and label when
unlocked, or a 🔒 icon when locked.

## Visual State Hierarchy

Three clearly distinct states for level cards, in descending prominence:

1. **Completed** — arc-color border + gradient background + arc-color glow.
   Chips tinted in arc color. ✓ icon glows.

2. **Unlocked (open)** — arc-color left accent border, subtle arc-color
   background tint. ▶ icon in arc color. Hover lifts + glows.
   The *next* playable level (frontier) also pulses gently to draw the eye.

3. **Locked** — near-invisible: dark background with diagonal hatch overlay,
   near-invisible border, very dim text and chips, no connector glow.
   Clicking a locked card triggers a shake animation; the card stays visible.

## Interaction

- Clicking an unlocked level navigates to `/level/{number}`.
- Clicking a locked level shakes the card (does not navigate or disappear).
- Clicking a completed cutscene node re-plays the cutscene.
- Locked cutscene nodes are inert (`pointer-events: none`).
- Cards are keyboard-navigable (Tab + Enter/Space).
- There is no scrolling — all 14 levels + 6 cutscenes fit in the viewport.
  Responsive fallback: 3-column at ≤800 px, 2-column at ≤520 px.

## Header

- Back button → main menu
- "Choose Level" title
- Progress pill showing `X / 14` completed levels
- If a locked level was deep-linked, a red notice banner appears below the
  header explaining the lock.

## Key Files

- `src/screens/levelSelect.ts` — reads `LEVELS`, `ARC_ENVIRONMENTS`, and the
  `PlayerProfile` level records to render the full map; wires click handlers
  to router callbacks passed in from `app.ts`
- `src/screens/levelSelect.css` — all styling; per-arc color tokens defined as
  CSS custom properties (`--arc-col`, `--arc-glow`) on `.arc-{n}` selectors
- `src/app.ts` — instantiates `renderLevelSelect` with `onLevel`, `onCutscene`,
  and `onBack` callbacks; handles the `attempted` parameter for locked deep-links
