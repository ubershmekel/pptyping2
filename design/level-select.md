# Level Select

## Intent

The level select screen gives the player a bird's-eye view of their progress
through the entire game. It communicates:

- How far they've come
- What's immediately ahead
- What they've mastered vs. what needs improvement

The layout is a visual map of all levels and cutscenes, grouped by arc (5 arcs).
The arc grouping conveys narrative structure — each arc is a chapter with its
own environment theme.

## Layout Concept

The screen is divided into 5 arc sections displayed in a horizontal grid (one
column per arc), fitting without scrolling. Each arc section shows:

- The arc's environment theme name and emoji icon in a header, with a soft glow
  in the arc's color
- A vertical connector track running down the column, in the arc's color
- A cutscene node preceding arc 1 (the intro, index 0)
- The 2–5 levels within the arc, each as a card
- The cutscene node that follows the arc (outro)

Level cards show:

- Level number (in Press Start 2P font)
- ⚡ Speed badge for speed-test levels
- Completion status icon (✓ done, ▶ open and not yet attempted, ⚿ locked;
  no icon for levels that were attempted but not passed)
- WPM and accuracy stats: arc-color on completed cards; yellow on attempted-but-
  not-passed cards (each stat only turns yellow if it individually fell below the
  active difficulty threshold); "Not played yet" on unlocked-but-unplayed cards
- New letters introduced at that level (one chip per letter on learn levels;
  review levels show no new-letter chips)

The header includes a Treasure Chest button that opens a modal over the level
map. The modal lists all learned keys for the active team, including SPACE, and
shows each key's current medal, total hits, best WPM, best accuracy (from the
same run), recent WPM, and recent accuracy. Medal tiers are represented with
the active team's bronze, silver, and gold rank keycap SVG icons from
`src/assets/medals/{pok|mlp}/`. Best stats only advance on non-heartbreak boss
completions; recent stats update after any completed typing run; medals still
only change after review / boss levels.

Cutscene nodes show an icon (🎬 intro, ▶ chapter, 🏆 finale) and label when
unlocked, or a 🔒 icon when locked.

## Visual State Hierarchy

Four clearly distinct states for level cards, in descending prominence:

1. **Completed** — arc-color border + gradient background + arc-color glow.
   Chips tinted in arc color. ✓ icon glows. Stats shown in arc color.

2. **Unlocked (open, not yet attempted)** — arc-color left accent border,
   subtle arc-color background tint. ▶ icon in arc color. Hover lifts + glows.
   The _next_ playable level (frontier) also pulses gently to draw the eye.

3. **Attempted but not passed** — same open card styling. No status icon. Stats
   shown in yellow for each individual stat that fell below the active difficulty
   threshold (WPM or accuracy independently); stats at or above threshold stay
   in their normal color.

4. **Locked** — near-invisible: dark background with diagonal hatch overlay,
   near-invisible border, very dim text and chips, no connector glow. Clicking a
   locked card triggers a shake animation; the card stays visible.

## Interaction

- Clicking an unlocked level navigates to `/level/{number}`.
- Clicking a locked level shakes the card (does not navigate or disappear).
- Clicking a completed cutscene node re-plays the cutscene.
- Locked cutscene nodes are inert (`pointer-events: none`).
- Cards are keyboard-navigable (Tab + Enter/Space).
- All 19 levels + 6 cutscenes are visible; arc columns scroll vertically if
  needed. Responsive fallback: 3-column at ≤800 px, 2-column at ≤520 px.

## Header

- Back button → main menu
- "Choose Level" title
- Progress pill showing `X / 19` completed levels
- If a locked level was deep-linked, a red notice banner appears below the
  header explaining the lock.

## Key Files

- `src/screens/levelSelect.ts` — reads `LEVELS`, `ARC_ENVIRONMENTS`, and the
  `PlayerProfile` level records to render the full map; wires click handlers to
  router callbacks passed in from `app.ts`
- `src/screens/levelSelect.css` — all styling; per-arc color tokens defined as
  CSS custom properties (`--arc-col`, `--arc-glow`) on `.arc-{n}` selectors
- `src/app.ts` — instantiates `renderLevelSelect` with `onLevel`, `onCutscene`,
  and `onBack` callbacks; handles the `attempted` parameter for locked
  deep-links
