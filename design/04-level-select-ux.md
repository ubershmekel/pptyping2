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

The screen is divided into 5 arc sections displayed horizontally or in a flowing
layout that fits without scrolling. Each arc section shows:

- The arc's environment theme as a small background swatch or icon
- The 3 levels within the arc, each as a card or node
- The cutscene node that follows the arc

Level cards show:

- Level number
- Lock icon (if locked) or completion state
- Best WPM (if completed)
- Best accuracy (if completed)
- Star rating or simple pass indicator
- The new letters introduced at that level

Cutscene nodes show a thumbnail of the story illustration if completed, or a
silhouette placeholder if locked.

## Interaction

- Clicking an unlocked level navigates to `/level/{number}`.
- Clicking a locked level shows a tooltip indicating what's required to unlock
  it (complete the previous level at the current difficulty).
- Clicking a completed cutscene node re-plays the cutscene.
- There is no scrolling — all 14 levels + 6 cutscenes fit in the viewport. The
  layout must be designed to achieve this.

## Key Files

- `src/screens/levelSelect.ts` — reads `LEVELS`, `ARCS`, and the `PlayerProfile`
  level records to render the full map; wires click handlers to the router
