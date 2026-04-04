# Key Curriculum And Finger Guide

This document records the intended blind-typing curriculum and pre-level
teaching flow for the PPTyping game.

## Status

As of 2026-04-03, the codebase does **not** yet implement:

- a pre-level finger explainer screen
- an explicit "look at the screen, not your fingers" teaching prompt
- cumulative-review failure feedback that recommends a refresher level based on
  the player's weakest character

`src/data/wordLists.ts` already reflects the broad letter order below, but the
full teaching contract described here is not yet enforced in UI or results
logic.

## Intent

PPTyping is not only a typing game. Its teaching goal is blind typing.

That means the game must repeatedly reinforce two habits:

- Eyes stay on the screen.
- Fingers return to consistent touch-typing positions.

Every time the game teaches a new key or starts a cumulative review level, it
must briefly remind the player where the relevant fingers belong before live
typing starts.

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

| Level | Role              | Primary Emphasis       |
| ----- | ----------------- | ---------------------- |
| 1     | Speed test        | Full keyboard baseline |
| 2     | Learn             | `f j`                  |
| 3     | Learn             | `f j e t`              |
| 4     | Learn             | `f j o a`              |
| 5     | Arc finale review | `f j e t o a`          |
| 6     | Learn             | `f j i n`              |
| 7     | Learn             | `f j h s`              |
| 8     | Learn             | `f j r l`              |
| 9     | Arc finale review | `f j i n h s r l`      |
| 10    | Learn             | `f j u d`              |
| 11    | Learn             | `f j y w`              |
| 12    | Learn             | `f j m g`              |
| 13    | Arc finale review | `f j u d y w m g`      |
| 14    | Learn             | `f j c p`              |
| 15    | Learn             | `f j k b`              |
| 16    | Learn             | `f j v x`              |
| 17    | Learn             | `f j q z`              |
| 18    | Arc finale review | `f j c p k b v x q z`  |
| 19    | Final review      | Full alphabet          |

## Pre-Level Finger Guide Screen

### Placement in flow

Every level starts with a dedicated explainer screen before gameplay begins.

Expected flow:

- cutscene -> finger guide -> level
- level select -> finger guide -> level
- retry -> finger guide -> level
- continue from main menu -> finger guide -> level

The explainer is not optional on first implementation. The teaching reminder is
part of the curriculum, not polish.

### Core message

The screen must explicitly say:

- look at the screen, not your fingers
- keep bringing your fingers back to `f` and `j`
- use the highlighted finger for the highlighted key

The copy should be brief and direct, like instruction from a typing tutor, not
story flavor.

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

This applies to failed cumulative-review levels:

- Level 5
- Level 8
- Level 11
- Level 14

When the player fails one of those levels, the results screen should identify
the character they missed most often and recommend a refresher level before
retrying the finale.

Example:

`You missed "n" most often. Replay Level 5 to refresh that key, then retry this review.`

### Tracking requirement

- Count incorrect presses per expected character during the level.
- Ignore spaces.
- Use the expected character, not the mistyped key, when recording the error.

### Retry recommendation mapping

Recommend the first level whose primary emphasis contains that character:

| Character Pair | Refresher Level |
| -------------- | --------------- |
| `f j`          | 2               |
| `e t`          | 3               |
| `o a`          | 4               |
| `i n`          | 5               |
| `h s`          | 6               |
| `r l`          | 7               |
| `u d`          | 8               |
| `y w`          | 9               |
| `m g`          | 10              |
| `c p`          | 11              |
| `k b`          | 12              |
| `v x`          | 13              |
| `q z`          | 14              |

If multiple characters tie for worst performance, prefer the latest character in
the curriculum order

## Future Implementation Surface

The eventual implementation will primarily affect:

- `src/data/wordLists.ts`
- `src/data/levels.ts`
- `src/types.ts`
- `src/screens/levelScreen.ts`
- `src/screens/levelComplete.ts`
- a new dedicated pre-level explainer screen module

This document should stay aligned with those files once implementation starts.
