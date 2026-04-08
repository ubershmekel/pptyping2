# Key Curriculum And Finger Guide

This document records the intended blind-typing curriculum and pre-level
teaching flow for the PPTyping game.

## Intent

PPTyping is not only a typing game. Its teaching goal is blind typing.

That means the game must repeatedly reinforce two habits:

- Eyes stay on the screen.
- Fingers return to consistent touch-typing positions.

Every time the game teaches a new key or starts a cumulative review level, it
must briefly remind the player where the relevant fingers belong before live
typing starts.

Teaching is front and center. Level 1 is positioned as the start of a personal
improvement journey — the game tells the player upfront that this first result
is their baseline, and future speed tests will show how far they've come.

## Curriculum Rules

### Core order

The teaching order is:

`fjetoainhsrludywmgcpkbvxqz`

This order is the source of truth for curriculum planning, `wordLists.ts`, and
any future generated helper data. It is based on letter frequency in Pokémon and
My Little Pony movies. The `fj` start is used as an anchor for returning fingers
to the home row.

### Level roles

- Level 1 is a full-keyboard speed-test baseline.
- Level 2 introduces the home-row anchors `f` and `j`.
- Later levels teach the alphabet in two-letter pairs.
- `f` and `j` remain the visual anchors for all teaching content.
- Arc finale levels are cumulative review levels. They must use all letters
  unlocked so far, not only the newest pair.

Because the campaign has 14 levels total, some finale levels both emphasize the
arc's closing pair and serve as cumulative review. The important rule is that
their word lists and UI framing behave like review levels, not narrow drills.

## Level Breakdown

The canonical level list lives in `src/data/levels.ts`. This section is the
human-readable description of that same data. If they ever disagree, the code is
correct and this document should be updated to match.

**Arc 1 — The Digital Grove**

1. Speed test — full keyboard baseline
2. Learn `f j`
3. Learn `f j e t`
4. Arc finale review — `f j e t`

**Arc 2 — The Thunder Shrine**

5. Learn `f j o a`
6. Learn `f j i n`
7. Learn `f j h s`
8. Arc finale review — `f j o a i n h s`

**Arc 3 — The Crystal Cavern**

9. Learn `f j r l`
10. Learn `f j u d`
11. Learn `f j y w`
12. Arc finale review — `f j r l u d y w`

**Arc 4 — The Stardrift Coast**

13. Learn `f j m g`
14. Learn `f j c p`
15. Learn `f j k b`
16. Arc finale review — `f j m g c p k b`

**Arc 5 — The Apex Summit**

17. Learn `f j v x`
18. Learn `f j q z`
19. Arc finale review — `f j v x q z`
20. Final review — all letters full alphabet

## Speed Test Intro Screen (Level 1 Only)

Level 1 does not use the finger guide screen. It has its own dedicated intro
screen whose entire job is to frame the speed test as a starting point.

The screen is large and simple. Its message is something like:

> "Let's see how fast you type right now — no pressure. We'll come back to this
> later and see how much you've improved."

There is no keyboard diagram, no finger color legend, no tip. Just the framing
text and a single "Start" button.

Level 1 has **no pass/fail criteria**. Any result — 1 WPM, 100 WPM — is
accepted. The player always proceeds to the next level regardless of speed or
accuracy. The level complete screen for level 1 shows the results as a baseline
snapshot, not a grade.

## Pre-Level Finger Guide Screen

### Placement in flow

Every level from level 2 onward starts with a dedicated explainer screen before
gameplay begins.

Expected flow:

- cutscene -> finger guide -> level
- level select -> finger guide -> level
- retry -> finger guide -> level
- continue from main menu -> finger guide -> level

Level 1 uses the speed test intro screen instead (see above). The finger guide
is not shown for level 1.

The explainer is not optional on first implementation. The teaching reminder is
part of the curriculum, not polish.

### Teaching tip rotation

The finger guide shows **one teaching tip per level**, not all three at once.
Showing all three simultaneously every time creates noise that players learn to
ignore. Surfacing one prominent tip at a time gives each rule a chance to land.

The three core tips are:

1. Eyes on the screen, not your fingers
2. Always return to F and J
3. Use the highlighted finger for each key

These rotate across levels starting from level 2. Assign one tip per level in
order, cycling back to tip 1 after tip 3:

| Level | Tip shown                               |
| ----- | --------------------------------------- |
| 2     | Eyes on the screen, not your fingers    |
| 3     | Always return to F and J                |
| 4     | Use the highlighted finger for each key |
| 5     | Eyes on the screen, not your fingers    |
| 6     | Always return to F and J                |
| …     | (continues cycling)                     |

Additionally, level 2 also shows "Thumbs press Space between words" as a
one-time supplement — this is the only level where the space bar is first
relevant.

The tip should be visually prominent on the screen, not buried in a strip.
Think of it as the headline of the pre-level screen, not a footnote.

### Required visual aid

The screen shows a simplified keyboard diagram with:

- the currently relevant keys highlighted
- left and right index fingers anchored on `f` and `j`
- each highlighted key tinted by the finger that should press it
- labels for the responsible finger

For review levels, the diagram highlights:

- all keys unlocked so far
- stronger emphasis on the newest pair for that arc

### Finger mapping

The visual aid uses standard touch-typing assignments:

| Finger       | Keys          |
| ------------ | ------------- |
| Left pinky   | `q a z`       |
| Left ring    | `w s x`       |
| Left middle  | `e d c`       |
| Left index   | `r f v t g b` |
| Right index  | `y h n u j m` |
| Right middle | `i k`         |
| Right ring   | `o l`         |
| Right pinky  | `p`           |

The design intentionally ignores punctuation and number-row instruction for now.

### Screen actions

- Primary action: start level
- Secondary action: back to level select

Retrying a level should land on this screen again so the reminder is repeated.

## Speed Test History Log

Every time the player completes the speed test level (level 1), the result is
appended to a date-stamped log stored in the player profile. This log is the
basis for showing improvement over time.

Each entry records:

- the date the test was taken (YYYY-MM-DD)
- the WPM achieved
- the accuracy achieved (0–100)

There is no limit on the number of entries. If the player takes the speed test
multiple times on the same day, all runs are stored — not just the best.

The level complete screen for level 1 shows the current result alongside a
brief history so the player can see their trajectory. See
`07-level-complete-ux.md` for how this is displayed.

## Word-List Contract

`src/data/wordLists.ts` is curriculum data, not filler text.

Its responsibilities are:

- preserve the letter order defined above
- keep each level's text compatible with that level's teaching role
- make finale levels read like cumulative review, not isolated pair drills
- avoid accidental inclusion of letters that have not been unlocked yet

For focus drills, the text should heavily favor `f`, `j`, and the active pair.
For finale levels, the text should mix all unlocked letters so the player proves
retention across the whole cumulative set.

## Finale Feedback Rule

This applies to failed cumulative-review levels.

When the player fails one of those levels, the results screen should identify
the character they missed most often and recommend a refresher level before
retrying the finale.

Example:

`You missed "n" most often. Replay Level 6 to refresh that key, then retry this review.`

### Tracking requirement

- Count incorrect presses per expected character during the level.
- Ignore spaces.
- Use the expected character, not the mistyped key, when recording the error.

### Retry recommendation mapping

Recommend the first level whose primary emphasis contains that character.

If multiple characters tie for worst performance, prefer the latest character in
the curriculum order

## Implementation Surface

The current implementation primarily affects:

- `src/app.ts`
- `src/data/wordLists.ts`
- `src/data/levels.ts`
- `src/types.ts`
- `src/screens/speedTestIntro.ts`
- `src/screens/letterIntro.ts`
- `src/screens/fjIntro.ts`
- `src/screens/fingerGuide.ts`
- `src/screens/levelScreen.ts`
- `src/screens/levelComplete.ts`

This document should stay aligned with those files.
