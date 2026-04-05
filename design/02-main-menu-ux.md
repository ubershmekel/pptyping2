# Main Menu

## Intent

The main menu is the player's home base between sessions. It provides clear
entry points into the game while reflecting the player's current state. The
design should feel like a game title screen, not a web app dashboard — visually
rich with the team theme applied if a team is already chosen.

## Behavior

The menu adapts to player state:

- **No save data**: Only "Start Game" and "Settings" are visible.
- **Team chosen, in progress**: "Continue", "Switch Teams", and "Settings" are
  shown. The current team's colors and character are visible as ambient
  background/decoration.

## Menu Options

1. **Continue** — navigates to `/level-select`. Only shown if the player has
   made progress. Players choose their specific level from there.
2. **Switch Teams** — navigates to `/team-select`. Shown when a save exists;
   replaces the destructive "New Game" option, which lives in Settings instead.
   When no save exists, this button is labeled "Start Game".
3. **Settings** — navigates to `/settings`. "New Game" (starting over) is found
   here to reduce the risk of accidental progress loss.

## Visual Design Intent

The menu uses the active team's color palette. If no team is set, use a neutral
split palette hinting at both sides. The title/logo is displayed prominently at
the top. The environment background (or a simplified version of it) of the
player's current arc plays ambience in the background — particles and ambient
sound are active on the menu, making the world feel alive before the player even
starts typing.

## Key Files

- `src/screens/mainMenu.ts` — renders the menu DOM, reads from `gameState.ts` to
  determine which options to show, wires up navigation calls to
  `screenManager.ts`
