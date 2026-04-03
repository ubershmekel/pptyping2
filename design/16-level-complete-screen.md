# Level Complete Screen

## Intent

The level complete screen is the immediate feedback moment after a typing level
ends. It tells the player how they did, whether they passed, how it compares to
their best, and what happens next. It also delivers the short story blurb for
this level — 2–3 sentences of narrative flavor that reward the player for
completing the level.

This screen is a brief pause, not a deep dive. The player should be able to read
it and move on quickly.

## Pass / Fail

The engine emits final stats (WPM and accuracy). The level complete screen
compares them against the current difficulty's thresholds (see
`18-difficulty-system.md`):

- **Pass**: WPM ≥ threshold AND accuracy ≥ threshold
- **Fail**: either metric below threshold

Passing unlocks the next level in the `PlayerProfile` and saves via
`persistence.ts`. Failing does not advance the unlock state, but does update the
level record if it's a new personal best.

## Content Displayed

- Final WPM and accuracy (large, prominent)
- Personal best WPM and accuracy for this level (comparison)
- Pass/fail state — visually clear (green/success vs. amber/retry)
- Short story blurb (2–3 sentences from `stories.ts`, team-specific) — even on
  failure the blurb can be shown (it's flavor, not a reward gate)
- Difficulty label (so the player knows what thresholds they were held to)

## Actions

- **Next Level** — available on pass; navigates to the next level or to the
  cutscene if the arc is complete
- **Retry** — restarts the current level attempt; always available
- If the arc is complete (this was the 3rd level of the arc): the Next button
  navigates to the cutscene instead of directly to a level

## Environment Continuity

Like cutscenes, the level complete screen inherits the active arc's environment
(background, particles, ambient audio). The screen feels like a natural pause
within the same world.

## Key Files

- `src/screens/levelCompleteScreen.ts` — receives final stats from the level
  screen (via navigation state or a shared results object), renders the results
  layout, updates `gameState.ts` with new records, handles the next/retry
  navigation
