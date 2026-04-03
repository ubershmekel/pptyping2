# Data Model & Types

## Intent

This module defines the canonical TypeScript types that every other module
imports. It is the single source of truth for the shape of all data in the game.
No logic lives here — only type declarations and enums.

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

- `team: Team` — which team was chosen
- `difficulty: Difficulty` — current difficulty setting
- `currentPosition: ScreenPosition` — where the player is in the flow (so
  Continue works)
- `levelRecords: Record<number, LevelRecord>` — keyed by level number

### `LevelRecord`

Per-level best performance:

- `unlocked: boolean`
- `bestWpm: number`
- `bestAccuracy: number` (0–100)
- `completed: boolean`

### `LevelDefinition`

Static data describing a single typing level:

- `levelNumber: number` (1–14)
- `arcNumber: number` (1–5)
- `availableLetters: string[]` — the full set of letters the word pool may use
  at this level
- `newLetters: string[]` — letters being introduced this level (shown as
  highlighted in UI)
- `isSpeedTest: boolean` — level 1 flag; uses full keyboard, no letter
  restriction
- `unlockThresholds: Record<Difficulty, { wpm: number; accuracy: number }>` —
  pass/fail requirements
- `storyBlurb: string` — 2–3 sentence narrative shown on level complete screen
  (team-specific; resolved at runtime via `stories.ts`)

### `ArcDefinition`

Static data describing one story arc (5 arcs total):

- `arcNumber: number`
- `levels: number[]` — which level numbers belong to this arc
- `cutsceneNumber: number` — which cutscene follows this arc
- `environment: EnvironmentConfig`

### `EnvironmentConfig`

Defines the full visual/audio theme for an arc:

- `backgroundImage: string` — asset path
- `cssVariables: Record<string, string>` — injected as CSS custom properties on
  the root element (text tint, glow color, particle color, UI accent)
- `particlePreset: string` — key into the particle presets registry (see
  `12-particles-ux.md`)
- `ambientSoundKey: string` — key into the audio manager's loop registry (see
  `20-audio-tech.md`)

### `CutsceneDefinition`

- `cutsceneNumber: number`
- `narrativeText: string` — team-specific; resolved from `stories.ts`
- `imageAssetPath: string` — team-specific; 6 images per team, 12 total

### `ScreenPosition`

Represents where a player currently is:

- `screen: ScreenName` — enum of all screen names
  (`"main-menu" | "team-select" | "level-select" | "level" | "cutscene" | "settings"`)
- `levelNumber?: number`
- `cutsceneNumber?: number`

## Key Files

- `src/types/index.ts` — all types and enums exported from a single barrel file;
  every other m