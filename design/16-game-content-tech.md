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

20 levels. Each level is defined as a `LevelDefinition` object (see
`13-data-model-tech.md`).

**Letter introduction order** follows the curriculum order
`fjetoainhsrludywmgcpkbvxqz` so that real words are available as early as
possible. Level 1 is a speed test using the full keyboard. Learn levels use
only `f`, `j`, and the current pair. Arc finale levels review the cumulative set
for their own arc. Level 20 is the full-alphabet final review.

| Level | Role         | New Letters     | Active Set                          |
| ----- | ------------ | --------------- | ----------------------------------- |
| 1     | Speed test   | (full keyboard) | all                                 |
| 2     | Learn        | f, j            | f, j                                |
| 3     | Learn        | e, t            | f, j, e, t                          |
| 4     | Arc 1 finale | —               | f, j, e, t                          |
| 5     | Learn        | o, a            | f, j, o, a                          |
| 6     | Learn        | i, n            | f, j, i, n                          |
| 7     | Learn        | h, s            | f, j, h, s                          |
| 8     | Arc 2 finale | —               | f, j, o, a, i, n, h, s              |
| 9     | Learn        | r, l            | f, j, r, l                          |
| 10    | Learn        | u, d            | f, j, u, d                          |
| 11    | Learn        | y, w            | f, j, y, w                          |
| 12    | Arc 3 finale | —               | f, j, r, l, u, d, y, w              |
| 13    | Learn        | m, g            | f, j, m, g                          |
| 14    | Learn        | c, p            | f, j, c, p                          |
| 15    | Learn        | k, b            | f, j, k, b                          |
| 16    | Arc 4 finale | —               | f, j, m, g, c, p, k, b              |
| 17    | Learn        | v, x            | f, j, v, x                          |
| 18    | Learn        | q, z            | f, j, q, z                          |
| 19    | Arc 5 finale | —               | f, j, v, x, q, z                    |
| 20    | Final review | —               | all letters                         |

The word pool for each learn level is pre-filtered to only include words
constructible from that level's focused letter set. Review levels widen to the
arc's cumulative set, and only the final review widens to the full alphabet.

## Word Lists

Word lists are curated per level, not generated at runtime. Each level has a
list of valid words. The typing engine draws from this list when constructing
lines (see `17-typing-engine-tech.md`). Words are all lowercase.

For the speed test (level 1), the word list is a standard common-words corpus —
the goal is establishing a baseline WPM, not teaching letters.

For learn levels, the list is intentionally narrow: `f`, `j`, and the active
pair only. For arc finales, it becomes cumulative within that arc.

## Story Text

All narrative content is inline TypeScript — no CMS, no external files. A
single `stories.ts` file maps `(team, arcNumber)` to:

- Cutscene narrative text (the full story passage shown on the cutscene screen)
- Per-level story blurb (2–3 sentence reward text shown on the level complete
  screen)

The two storylines are completely independent. The Pokemon arc follows an
adventure/rescue plot; the MLP arc follows a diplomacy/friendship plot. Story
content for one team is never shown to a player on the other team.

## Arc & Environment Definitions

5 arcs group levels under one environment theme (4, 4, 4, 4, and 4 gameplay
levels per arc). Arc definitions include the `EnvironmentConfig` (background
image, CSS variables, particle preset, ambient sound key) and a reference to
the cutscene that follows the arc. See `11-environments-ux.md` for how the
environment presentation is applied on screen.
