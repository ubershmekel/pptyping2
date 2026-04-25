# Data Model & Types

## Intent

This module defines the canonical TypeScript types that every other module
imports. It is the single source of truth for the shape of all data in the game.
No logic lives here - only type declarations and enums.

Having strict types prevents runtime surprises when reading from localStorage,
loading content files, or passing state between screens.

## Core Entities

### `Team`

An enum: `"pokemon" | "mlp"`. Set once at game start; determines storyline,
character sprites, color palette, and story text for the entire session.

### `Difficulty`

An enum: `"easy" | "medium" | "hard"`. Can be changed at any time in settings.
Controls WPM and accuracy thresholds for level pass/fail.

### `PlayerProfile`

The persisted player state. Contains:

- `activeTeam: Team` - which team is currently selected
- `teamSelected: boolean` - true once a team has been chosen
- `difficulty: Difficulty` - current difficulty setting
- `teams: Record<Team, TeamProgress>` - per-team progress, records, and medals
- `speedTestHistory: SpeedTestEntry[]` - ordered log of every speed test run,
  oldest first
- `activityLog: ActivityLogEntry[]` - ordered log of every level 2+ completion
  attempt, oldest first

### `TeamProgress`

Per-team progress:

- `levelRecords: Record<number, LevelRecord>` - keyed by level number
- `highestUnlockedLevel: number`
- `letterProgress: Record<string, LetterProgress>` - keyed by lowercase letter;
  the spacebar uses the `" "` key

### `LevelRecord`

Per-level best performance:

- `bestWpm: number`
- `bestAccuracy: number` (0-100)
- `completed: boolean` - true once the level has cleared its progression gate.
  Regular teaching levels clear after any finished attempt; boss / review levels
  clear only after a passing attempt.

### `LetterProgress`

Per-key practice stats and medal mastery:

- `medal: "none" | "bronze" | "silver" | "gold"` - highest medal earned
- `totalHits: number` - correct hits recorded for this key across typing runs
- `bestWpm: number` - highest per-key WPM achieved in any non-heartbreak boss
  run
- `bestAccuracy: number` (0-100) - accuracy from the same run where `bestWpm`
  was set
- `recentWpm: number` - average key WPM across the last 1-2 runs that included
  this key
- `recentAccuracy: number` (0-100) - average key accuracy across the last 1-2
  runs that included this key
- `recentRuns: { wpm: number; accuracy: number }[]` - the raw last 1-2 samples

`totalHits` and `recent*` update after any completed level or training run.
`bestWpm` / `bestAccuracy` only advance on non-heartbreak boss completions.
Bronze is 15+ WPM, silver is 20+ WPM, and gold is 30+ WPM, but medals are only
awarded on review / boss levels. A review run has a Heartbreak if any reviewed
letter is 10 WPM or below, or 70% accuracy or below; on Heartbreak no medals
are awarded for that run, though per-key stats still update.

### `SpeedTestEntry`

One run of the speed test level (level 1):

- `date: string` - ISO date string (YYYY-MM-DD) of when the run was taken
- `wpm: number`
- `accuracy: number` (0-100)

All runs are stored, including multiple runs on the same day. The entries are
never deduplicated or trimmed. The level complete screen for level 1 displays
these in reverse chronological order.

### `ActivityLogEntry`

One completed level attempt (levels 2 and beyond):

- `date: string` - ISO date string (YYYY-MM-DD) of when the attempt was made
- `levelNumber: number`
- `wpm: number`
- `accuracy: number` (0-100)
- `passed: boolean` - whether the attempt met the active difficulty thresholds

All attempts are stored regardless of pass/fail. Entries are never deduplicated
or trimmed. The settings screen displays these in reverse chronological order so
the player can see their full practice history across all levels.

### `LevelDefinition`

Static data describing a single typing level:

- `number: number`
- `arc: number`
- `availableLetters: string` - the full set of letters the word pool may use at
  this level
- `isSpeedTest: boolean` - level 1 flag; uses full keyboard, no letter
  restriction
- `isFinale: boolean` - review / boss flag; only these levels can award
  per-letter medals and block progression on a failed attempt

### `ArcDefinition`

Static data describing one story arc (5 arcs total):

- `arcNumber: number`
- `levels: number[]` - which level numbers belong to this arc
- `cutsceneNumber: number` - which cutscene follows this arc
- `environment: EnvironmentConfig`

### `EnvironmentConfig`

Defines the full visual/audio theme for an arc:

- `backgroundImage: string` - asset path
- `cssVariables: Record<string, string>` - injected as CSS custom properties on
  the root element (text tint, glow color, particle color, UI accent)
- `particlePreset: string` - key into the particle presets registry (see
  `particles.md`)
- `ambientSoundKey: string` - key into the audio manager's loop registry (see
  `audio.md`)

### `CutsceneDefinition`

- `cutsceneNumber: number`
- `narrativeText: string` - team-specific; resolved from `stories.ts`
- `imageAssetPath: string` - team-specific; 6 images per team, 12 total

### `ScreenPosition`

Represents where a player currently is:

- `screen: ScreenName` - enum of all screen names
  (`"main-menu" | "team-select" | "level-select" | "level" | "cutscene" | "settings"`)
- `levelNumber?: number`
- `cutsceneNumber?: number`

### `ScreenMount`

The required return type of every screen render function:

```ts
interface ScreenMount {
  el: HTMLElement;
  cleanup: () => void;
  defer: (cleanup: () => void) => () => void;
  listen: (...) => () => void;
  timeout: (callback: () => void, ms: number) => () => void;
  interval: (callback: () => void, ms: number) => () => void;
  frame: (callback: FrameRequestCallback) => () => void;
}
```

**Contract**: `app.ts` calls `cleanup()` on the previous screen's mount before
calling `replaceChildren` with the new one. This guarantees that document-level
event listeners, `setInterval` handles, `setTimeout` handles, and any other
resources are released at the moment of navigation - not lazily, and not relying
on GC or DOM events.

**Rule**: Every screen render function must return `ScreenMount`, including
temporary render helpers that still live in `app.ts`. Screens that have no
resources to release still return a real mount object so future listeners,
timers, intervals, frames, and custom teardown can be registered through the
same lifecycle owner.

**Lifecycle registration rule**: Screen code must not call `addEventListener`,
`removeEventListener`, `setTimeout`, `clearTimeout`, `setInterval`,
`clearInterval`, `requestAnimationFrame`, or `cancelAnimationFrame` directly.
Instead it must use `ScreenMount.listen()`, `timeout()`, `interval()`,
`frame()`, and `defer()`. The helper returns a disposer function when a screen
needs to cancel work before the final `cleanup()`.

**Why put these methods on `ScreenMount`?** The intent is to make lifecycle
ownership explicit. A screen that creates long-lived work should register that
work on the same object that will later be cleaned up. This has three benefits:

- **Single owner**: The DOM element and all of its long-lived side effects are
  owned by one lifecycle object.
- **Fewer paired APIs in screen code**: Authors write "register this listener"
  instead of manually writing both `addEventListener(...)` and
  `removeEventListener(...)`, or `setTimeout(...)` and `clearTimeout(...)`, in
  separate parts of the file.
- **Enforceability**: Once registration goes through `ScreenMount`, the codebase
  can reject raw listener/timer APIs in `src/screens/` and keep one consistent
  lifecycle pattern.

This is intentionally narrow in scope. `ScreenMount` is not a general-purpose
utility bag. It only owns teardown-sensitive work: listeners, timers, animation
frames, intervals, and custom disposers.

**Why not MutationObserver / `'remove'` events?** `'remove'` is not a real DOM
event (it never fires). `MutationObserver` is asynchronous. Both are weaker than
a synchronous, caller-driven cleanup.

## Key Files

- `src/types.ts` - the canonical shared type declarations, including
  `ScreenMount`
- `src/screenMount.ts` - factory that creates a `ScreenMount` and tracks all
  lifecycle registrations
- `src/app.ts` - owns the root container and enforces `cleanup()` before each
  screen replacement
- `scripts/check-screen-lifecycle.ts` - rejects raw listener/timer APIs inside
  `src/screens/` so the `ScreenMount` contract stays enforced
- `tests/screenMount.test.ts` - covers the `ScreenMount` cleanup contract and
  disposer semantics in TypeScript
