# Settings Screen

## Intent

The settings screen lets the player adjust preferences that apply across all
play sessions. It is accessible at any time from the main menu. Changes take
effect immediately and are persisted to `localStorage` alongside the
`PlayerProfile`.

The settings screen also houses the data export/import feature — the only way to
back up or transfer progress.

## Settings Available

### Difficulty

A three-way toggle: Easy / Medium / Hard. Each tier has a team-specific label:

- Easy: "Casual Trainer" (Pokemon) / "Friendship Student" (MLP)
- Medium: "Gym Leader" (Pokemon) / "Royal Guard" (MLP)
- Hard: "Elite Four" (Pokemon) / "Alicorn" (MLP)

Changing difficulty takes effect immediately on any subsequent level attempt.
Completed level records are stored per-attempt and compared against whatever
difficulty was active at the time.

### Activity Log

A scrollable table showing every level played, newest first. Each row shows:

- Date
- Level number
- WPM
- Accuracy
- Pass or fail indicator

This gives players a complete picture of their practice history and lets them
spot which levels they struggle with. The log is read-only; it cannot be
filtered or cleared from the UI (clearing requires an import).

### Audio

- Master volume slider
- SFX on/off toggle
- Ambient music on/off toggle

### Data Management

- **Export**: Shows a read-only textarea containing the full `PlayerProfile` as
  formatted JSON. Auto-selects on focus so the player can copy it easily.
- **Import**: An editable textarea plus a "Load Save" button. On submit, parses
  the JSON, validates it, and if valid, replaces the current profile (with a
  confirmation prompt since this overwrites current progress). Shows a clear
  error if the JSON is invalid or the schema doesn't match.

### Team

- A read-only indicator showing the current active team
- A "New Game" button that routes to team select — framed as "Try the other
  team" rather than "reset everything". If both teams have been started, both
  are shown with their progress intact.
- This is intentionally placed in Settings (not the main menu) to reduce the
  risk of players accidentally wiping or abandoning their current run.

## Key Files

- `src/screens/settingsScreen.ts` — renders all settings UI; reads from and
  writes to `gameState.ts`; wires up the export/import UI to `persistence.ts`;
  handles difficulty change, audio changes, and the team/new game flow
