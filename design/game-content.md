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
`data-model.md`).

See `teaching-touch-typing.md` for the list of levels and focus letters.

The word pool for each learn level is pre-filtered to only include words
constructible from that level's focused letter set. Review levels widen to the
arc's cumulative set, and only the final review widens to the full alphabet.

## Word Lists

Word lists are curated per level, not generated at runtime. Each level has a
list of valid words. The typing engine draws from this list when constructing
lines (see `typing-engine.md`). Words are all lowercase.

For the speed test (level 1), the word list is a standard common-words corpus —
the goal is establishing a baseline WPM, not teaching letters.

For learn levels, the list is intentionally narrow: `f`, `j`, and the active
pair only. For arc finales, it becomes cumulative within that arc.

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

5 arcs group levels under one environment theme (4, 4, 4, 4, and 4 gameplay
levels per arc). Arc definitions include the `EnvironmentConfig` (background
image, CSS variables, particle preset, ambient sound key) and a reference to the
cutscene that follows the arc. See `environments.md` for how the
environment presentation is applied on screen.
