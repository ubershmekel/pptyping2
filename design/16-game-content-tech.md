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

19 levels. Each level is defined as a `LevelDefinition` object (see
`13-data-model-tech.md`).

**Letter introduction order** follows the curriculum order `fjetoainhsrludywmgcpkbvxqz`
so that real words are available as early as possible. Level 1 is a speed test
using the full keyboard. Levels 2–19 progressively unlock letters, with arc
finale levels (5, 9, 13, 18) reviewing all letters unlocked so far:

| Level | Role         | New Letters     | Cumulative Set                     |
| ----- | ------------ | --------------- | ---------------------------------- |
| 1     | Speed test   | (full keyboard) | all                                |
| 2     | Learn        | f, j            | f, j                               |
| 3     | Learn        | e, t            | f, j, e, t                         |
| 4     | Learn        | o, a            | f, j, e, t, o, a                   |
| 5     | Arc 2 finale | —               | f, j, e, t, o, a                   |
| 6     | Learn        | i, n            | …+ i, n                            |
| 7     | Learn        | h, s            | …+ h, s                            |
| 8     | Learn        | r, l            | …+ r, l                            |
| 9     | Arc 3 finale | —               | f, j, e, t, o, a, i, n, h, s, r, l |
| 10    | Learn        | u, d            | …+ u, d                            |
| 11    | Learn        | y, w            | …+ y, w                            |
| 12    | Learn        | m, g            | …+ m, g                            |
| 13    | Arc 4 finale | —               | …+ u, d, y, w, m, g                |
| 14    | Learn        | c, p            | …+ c, p                            |
| 15    | Learn        | k, b            | …+ k, b                            |
| 16    | Learn        | v, x            | …+ v, x                            |
| 17    | Learn        | q, z            | all letters                        |
| 18    | Arc 5 finale | —               | all letters                        |
| 19    | Final review | —               | all letters                        |

The word pool for each teaching level is pre-filtered to only include words
constructible from the cumulative letter set at that level. Because letters
follow frequency order, genuine English words are available from level 4 onward
(e.g., "fate", "feat", "tofu").

## Word Lists

Word lists are curated per level, not generated at runtime. Each level has a
list of valid words. The typing engine draws from this list when constructing
lines (see `17-typing-engine-tech.md`). Words are all lowercase.

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

5 arcs grouping levels under one environment theme (2, 3, 4, 4, and 6 levels per arc respectively). Arc definitions
include the `EnvironmentConfig` (background image, CSS variables, particle
preset, ambient sound key) and a reference to the cutscene that follows the arc.
See `11-environments-ux.md` for how
