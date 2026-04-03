# Game Content

## Intent

All static game content — level definitions, arc definitions, letter sets, word
pools, and story text — lives in a dedicated content layer. This layer is pure
data: no DOM, no state, no side effects. Screens and the typing engine read from
it; nothing writes to it.

Keeping content in TypeScript files (rather than JSON or a CMS) means it's
type-checked, co-located with the codebase, and trivially tree-shaken if a level
is unused in testing.

## Level Definitions

14 levels. Each level is defined as a `LevelDefinition` object (see
`02-data-model-and-types.md`).

**Letter introduction order** follows English frequency so that real words are
available as early as possible. Level 1 is a speed test using the full keyboard.
Levels 2–14 progressively unlock letters:

| Level | New Letters                  | Cumulative Set         |
| ----- | ---------------------------- | ---------------------- |
| 1     | (speed test — full keyboard) | all                    |
| 2     | f, j                         | f, j                   |
| 3     | e, t                         | f, j, e, t             |
| 4     | o, a                         | f, j, e, t, o, a       |
| 5     | i, n                         | f, j, e, t, o, a, i, n |
| 6     | h, s                         | …+ h, s                |
| 7     | r, l                         | …+ r, l                |
| 8     | u, d                         | …+ u, d                |
| 9     | y, w                         | …+ y, w                |
| 10    | m, g                         | …+ m, g                |
| 11    | c, p                         | …+ c, p                |
| 12    | k, b                         | …+ k, b                |
| 13    | v, x                         | …+ v, x                |
| 14    | q, z                         | all letters            |

The word pool for each teaching level is pre-filtered to only include words
constructible from the cumulative letter set at that level. Because letters
follow frequency order, genuine English words are available from level 4 onward
(e.g., "fate", "feat", "tofu").

## Word Lists

Word lists are curated per level, not generated at runtime. Each level has a
list of valid words. The typing engine draws from this list when constructing
lines (see `09-typing-engine.md`). Words are all lowercase.

For the speed test (level 1), the word list is a standard common-words corpus —
the goal is establishing a baseline WPM, not teaching letters.

## Story Text

All narrative content is inline TypeScript — no CMS, no external files. A single
`stories.ts` file maps `(team, arcNumber)` to:

- Cutscene narrative text (the full story passage shown on the cutscene screen)
- Per-level story blurb (2–3 sentence reward text shown on the level complete
  screen)

The two storylines are completely independent. The Pokemon arc follows an
adventure/rescue plot; the MLP arc follows a diplomacy/friendship plot. Story
content for one team is never shown to a player on the other team.

## Arc & Environment Definitions

5 arcs, each grouping 3 levels under one environment theme. Arc definitions
include the `EnvironmentConfig` (background image, CSS variables, particle
preset, ambient sound key) and a reference to the cutscene that follows the arc.
See `11-environments.md` for how environment configs are applied.

## Key Files

- `src/content/levels.ts` — array of all 14 `LevelDefinition` objects; exported
  as `LEVELS`
- `src/content/wordLists.ts` — per-level word arrays; keyed by level number
- `src/content/letterSets.ts` — cumulative letter sets per level; used by both
  the typing engine and word list filtering tooling
- `src/content/arcs.ts` — array of all 5 `ArcDefinition` objects including
  environment configs; exported as `ARCS`
- `src/content/stories.ts` — all narrative text; exports
  `getCutsceneText(team, cutsceneNumber): string` and
  `getLevelBlurb(team, levelNumber): string`
