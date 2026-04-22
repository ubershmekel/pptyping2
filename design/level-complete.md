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

Completing a regular teaching level unlocks the next level in the
`PlayerProfile` and saves via `persistence.ts`, even when the attempt misses the
current difficulty thresholds. Boss / review levels (`isFinale === true`) are
the only levels that can block progression; they unlock the next level or
cutscene only after a passing attempt. Every attempt still updates the level
record if it sets a new personal best.

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
- **Reward image** — on pass, a level-specific illustration is shown alongside
  the story blurb. On fail, no image is shown. See `assets.md` for the
  naming convention and asset list.

### Review / boss levels

When `isFinale === true`, the result screen also shows per-letter review
results:

- current medal result for each reviewed letter (none, bronze, silver, gold)
- per-letter WPM converted from average key time
- per-letter accuracy and hit count
- weakest letters highlighted by lowest medal, slowest WPM, or lowest accuracy

Medals are only awarded on these review / boss levels. Bronze (`🥉`) requires
15+ WPM, silver (`🥈`) requires 20+ WPM, and gold (`🥇`) requires 30+ WPM for the
letter.

If any reviewed letter is 10 WPM or below, or 70% accuracy or below, the run
triggers Heartbreak. On Heartbreak, the result screen labels the run and no
medals are awarded for any letter in that run.

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

- **Next Level** — available after every regular teaching level attempt, after
  passing a boss / review level, and always on level 1; navigates to the next
  level or to the cutscene if the arc is complete
- **Retry** — restarts the current level attempt; always available
- **Practice slowest key** — on boss / review levels, navigates to the teaching
  level that introduced the character with the slowest average key time; this is
  highlighted with Retry when the boss blocks progress
- **Level Select** — navigates to the level select screen; always available
- If the arc is complete: the Next button navigates to the cutscene instead of
  directly to a level

## Environment Continuity

Like cutscenes, the level complete screen inherits the active arc's environment
(background, particles, ambient audio). The screen feels like a natural pause
within the same world.

## Key Files

- `src/screens/LevelComplete.vue` — renders results, boss medals, and action
  buttons
- `src/screens/LevelFlow.vue` — receives final stats from `LevelScreen.vue`,
  updates `gameState.ts`, and handles next/retry/practice navigation
