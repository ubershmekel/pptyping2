# Team Select

## Intent

Team Select is a flow that sets the player's entire experience: storyline,
character companion, color palette, and narrative voice. It should feel like a
meaningful choice, not a settings toggle. The two teams are presented as equals
with distinct identities.

The screen is shown when no team is stored in the player profile. If the player
wants to try the other team later, a separate "New Game (other team)" flow
routes back here - but it is framed as starting a fresh adventure on that side,
not changing a setting.

## Behavior

- Two large, visually distinct options: **Pokemon** and **My Little Pony**.
- Each option shows the team's lead character(s), a brief flavor description of
  their arc, and the team's color palette.
- Hovering or focusing an option applies a preview of its theme (color shift,
  character animation, short ambient sound snippet) - gives the player a taste
  before committing.
- Selecting a team writes `team` to the `PlayerProfile`, saves via
  `persistence.ts`, then navigates to `/cutscene/0` (the opening cutscene for
  that team).

## What This Choice Controls

Downstream consumers of the team value:

- `stories.ts` - which narrative text to serve
- `environmentManager.ts` - which character sprite set to load
- CSS custom properties - the global palette variables (primary color, accent,
  text tint)
- `cutsceneScreen.ts` - which image assets to display
- Level complete screen - which story blurb to show

## Key Files

- `src/screens/teamSelect.ts` - renders the two-option UI, handles selection,
  writes to `gameState.ts`, triggers navigation
- `src/assets/characters/index.ts` - provides the per-team portrait asset used
  by the Team Select character preview, including animated sprite-sheet previews
- `src/state/gameState.ts` - receives the team assignment and persists it
