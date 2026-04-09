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
`difficulty-system.md`):

- **Pass**: WPM ≥ threshold AND accuracy ≥ threshold
- **Fail**: either metric below threshold

Passing unlocks the next level in the `PlayerProfile` and saves via
`persistence.ts`. Failing does not advance the unlock state, but does update the
level record if it's a new personal best.

Every attempt (pass or fail) appends an `ActivityLogEntry` to the player's
activity log in `PlayerProfile`. The log entry records the date, level number,
WPM, accuracy, and pass/fail result.

### Level 1 exception — no pass or fail

Level 1 (the speed test) has no pass/fail criteria. Any result proceeds.
The level complete screen for level 1 does not show a pass/fail indicator, does
not show difficulty thresholds, and always makes "Next Level" available. The
result is framed as a baseline, not a grade.

## Content Displayed

### Levels 2 and beyond (standard)

- Final WPM and accuracy (large, prominent)
- Personal best WPM and accuracy for this level (comparison)
- Pass/fail state — visually clear (green/success vs. amber/retry)
- Short story blurb (2–3 sentences from `stories.ts`, team-specific) — even on
  failure the blurb can be shown (it's flavor, not a reward gate)
- Difficulty label (so the player knows what thresholds they were held to)
- **Reward image** — on pass, a level-specific illustration is shown alongside
  the story blurb. On fail, no image is shown. See `assets.md` for the
  naming convention and asset list.

### Level 1 (speed test baseline)

- Final WPM and accuracy (large, prominent)
- A brief framing message, e.g. "That's your starting point — come back after
  more practice to see how far you've come."
- A short history of past speed test results: date, WPM, and accuracy for each
  prior run, newest first. If this is the first run ever, omit the history
  section.
- No pass/fail indicator, no difficulty threshold, no personal best comparison
  (there is no "best" — all runs are stored as history).
- Story blurb (same as other levels — flavor is not gated on performance)

## Actions

- **Next Level** — available on pass, and always available on level 1; navigates
  to the next level or to the cutscene if the arc is complete
- **Retry** — restarts the current level attempt; always available
- **Level Select** — navigates to the level select screen; always available
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
  navig
