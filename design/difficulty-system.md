# Difficulty System

## Intent

The difficulty system defines the pass/fail thresholds for every level. It is a
simple, self-contained module: given a difficulty tier, it returns the WPM and
accuracy requirements. Screens that need to evaluate a result call into this
module rather than hardcoding thresholds inline.

Difficulty is player-controlled at any time. It is meant to be accessible — a
confused child who can barely type should be able to make progress on Easy; a
dexterous and motivated child should find Hard genuinely challenging.

## Tiers

| Tier   | Pokemon Label  | MLP Label          | Min Accuracy | Min WPM |
| ------ | -------------- | ------------------ | ------------ | ------- |
| Easy   | Casual Trainer | Friendship Student | 80%          | 15 WPM  |
| Medium | Gym Leader     | Royal Guard        | 90%          | 20 WPM  |
| Hard   | Elite Four     | Alicorn            | 95%          | 25 WPM  |

These are approximate. Thresholds may be tuned during playtesting, but the
intent is: Easy is genuinely forgiving, Medium requires real effort, Hard
requires practiced typing.

## Default

New players start on **Medium**. This can be changed at any time in Settings.

## Pass/Fail Logic

A level attempt **passes** if BOTH conditions are met:

- `accuracy >= threshold.accuracy`
- `wpm >= threshold.wpm`

Failing either condition is a fail for scoring and activity-log feedback.
Regular teaching levels still unlock the next level after any completed attempt.
Only review / boss levels (`isFinale === true`) use fail state to block progress;
the player must clear the boss level to unlock the next arc or finale.

Note: The **speed test** (level 1) is handled differently — it doesn't pass or
fail; it simply records a baseline WPM and unlocks level 2 regardless of
performance. The intent is to establish what the player can already do, not gate
them.

## Level Records vs. Difficulty

Level records (`LevelRecord` in the data model) store the best WPM and accuracy
regardless of difficulty. This means a player's personal best is always their
personal best — even if they recorded it on Easy. The pass/fail determination
for unlocking the _next_ level uses the _current_ difficulty at the time of the
attempt.

This allows a player to:

- Move through regular teaching levels even when a run needs more practice
- Come back and beat their scores on Hard for personal achievement

## Key Files

- `src/types.ts` — exports `DIFFICULTY_THRESHOLDS`
- `src/state/gameState.ts` — exports `didPass(...)` and applies the progression
  gate rule when saving a level result
