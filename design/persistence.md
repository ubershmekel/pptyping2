# Persistence & Export

## Intent

The entire game state is stored in the browser's `localStorage` — no server, no
login, no account. The player's team choice, difficulty setting, level records,
and current position in the game are all persisted locally.

Because localStorage is fragile (can be cleared by the browser or the user), the
game provides a **JSON export/import via copy/paste**. This lets players back up
progress, transfer it between devices, or share a save file. There is no file
download — just a textarea with JSON that the player copies or pastes.

## Persistence Layer

The persistence module wraps `localStorage` with a typed interface. All reads
deserialize JSON and validate against the `PlayerProfile` type. All writes
serialize the current profile to JSON. If the stored data is malformed or
missing, a fresh default profile is returned rather than crashing.

The game saves after every significant state change:

- Team selection
- Difficulty change
- Level completion (best WPM/accuracy update; new `ActivityLogEntry` appended to
  `activityLog`; per-key `letterProgress` total hits and recent WPM / accuracy
  update under the active team's progress)
- Training activity completion (new `ActivityLogEntry` appended to
  `activityLog`; per-key `letterProgress` stats update without changing level
  records)
- Review / boss level completion (`isFinale === true`): medals are awarded only
  if the run avoids Heartbreak. Heartbreak blocks medals for the run but does
  not block per-key stat updates.
- Speed test completion (new `SpeedTestEntry` appended to `speedTestHistory`)
- Screen navigation (updates `currentPosition` for the Continue button)

Saves are synchronous and immediate — no debouncing needed given the
infrequency.

## Export / Import Flow

**Export**: The persistence module serializes the current `PlayerProfile` to a
formatted JSON string. The settings screen presents this in a read-only textarea
that auto-selects on focus so the player can copy it easily.

**Import**: The settings screen provides an editable textarea. On submit, the
string is parsed, validated against the `PlayerProfile` shape, and if valid,
written to localStorage and applied immediately. Invalid JSON or schema
mismatches show an inline error message rather than crashing.

The intent is that a player can move their save between browsers or devices by
copy-pasting a JSON blob — no cloud required.

## Key Files

- `src/state/persistence.ts` — all read/write operations against `localStorage`;
  exports `loadProfile(): PlayerProfile`,
  `saveProfile(profile: PlayerProfile): void`, `exportProfileJson(): string`,
  `importProfileJson(json: string): PlayerProfile | null`
- `src/state/gameState.ts` — the in-memory singleton that holds the live
  `PlayerProfile` during a session; all screens read from and write to this; it
  delegates persistence to `persistence.ts` on mutation
