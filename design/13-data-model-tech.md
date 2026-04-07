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

- `team: Team` - which team was chosen
- `difficulty: Difficulty` - current difficulty setting
- `currentPosition: ScreenPosition` - where the player is in the flow (so
  Continue works)
- `levelRecords: Record<number, LevelRecord>` - keyed by level number
- `speedTestHistory: SpeedTestEntry[]` - ordered log of every speed test run,
  oldest first

### `LevelRecord`

Per-level best performance:

- `unlocked: boolean`
- `bestWpm: number`
- `bestAccuracy: number` (0-100)
- `completed: boolean`

### `SpeedTestEntry`

One run of the speed test level (level 1):

- `date: string` - ISO date string (YYYY-MM-DD) of when the run was taken
- `wpm: number`
- `accuracy: number` (0-100)

All runs are stored, including multiple runs on the same day. The entries are
never deduplicated or trimmed. The level complete screen for level 1 displays
these in reverse chronological order.

### `LevelDefinition`

Static data describing a single typing level:

- `levelNumber: number`
- `arcNumber: number`
- `availableLetters: string[]` - the full set of letters the word pool may use
  at this level
- `newLetters: string[]` - letters being introduced this level (shown as
  highlighted in UI)
- `isSpeedTest: boolean` - level 1 flag; uses full keyboard, no letter
  restriction
- `unlockThresholds: Record<Difficulty, { wpm: number; accuracy: number }>` -
  pass/fail requirements
- `storyBlurb: string` - 2-3 sentence narrative shown on level complete screen
  (team-specific; resolved at runtime via `stories.ts`)

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
  `12-particles-ux.md`)
- `ambientSoundKey: string` - key into the audio manager's loop registry (see
  `20-audio-tech.md`)

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
- `test/screenMount.test.ts` - covers the `ScreenMount` cleanup contract and
  disposer semantics in TypeScript
