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
| Easy   | Casual Trainer | Friendship Student | 60%          | 10 WPM  |
| Medium | Gym Leader     | Royal Guard        | 80%          | 25 WPM  |
| Hard   | Elite Four     | Alicorn            | 90%          | 35 WPM  |

These are approximate. Thresholds may be tuned during playtesting, but the
intent is: Easy is genuinely forgiving, Medium requires real effort, Hard
requires practiced typing.

## Pass/Fail Logic

A level attempt **passes** if BOTH conditions are met:

- `accuracy >= threshold.accuracy`
- `wpm >= threshold.wpm`

Failing either condition is a fail. The player must retry to unlock the next
level.

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

- Grind through levels on Easy to see the story
- Come back and beat their scores on Hard for personal achievement

## Key Files

- `src/difficulty/difficultySystem.ts` — exports
  `getThreshold(difficulty: Difficulty): { wpm: number; accuracy: number }` and
  `isPassing(stats: LevelStats, difficulty: Difficulty): boolean`; no state,
  pure functions
