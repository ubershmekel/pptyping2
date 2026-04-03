# Main Menu

## Intent

The main menu is the player's home base between sessions. It provides clear
entry points into the game while reflecting the player's current state. The
design should feel like a game title screen, not a web app dashboard — visually
rich with the team theme applied if a team is already chosen.

## Behavior

The menu adapts to player state:

- **No save data**: Only "New Game" and "Settings" are visible. "Continue" and
  "Level Select" are hidden or grayed out.
- **Team chosen, in progress**: All options are available. The current team's
  colors and character are visible as ambient background/decoration.
- **Both teams started**: Shows the active team prominently with a subtler
  "Switch to [other team]" path that routes to team select for a new game on
  that side.

## Menu Options

1. **Continue** — navigates to `currentPosition` from `PlayerProfile`. Only
   shown if the player has made progress.
2. **Level Select** — navigates to `/level-select`.
3. **Settings** — navigates to `/settings`.
4. **Team indicator** — shows which team is active (Pokemon / MLP) with its
   palette. Tapping it offers to start a new game on the other team (with a
   confirmation, since it sets the opposite team — it does not erase existing
   progress for either team if we store both, or at minimum it warns the
   player).

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
