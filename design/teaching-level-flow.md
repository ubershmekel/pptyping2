# Teaching Level Flow

What happens from the moment a player starts a level to the moment they leave
it. This is the sequence as implemented in `src/app.ts`.

## Level 1 (speed test)

- **Speed test intro** - frames the run as a personal baseline, not a graded
  test. Removes pressure so the result is honest.
- **Level screen** - full-keyboard timed typing run.
- **Level complete** - shows the result as a snapshot to return to later, not a
  pass/fail grade. Level 1 always passes.

## Level 2 (first learn level - F and J)

- **Finger guide** - introduces the home-row anchors F and J and the concept of
  finger positioning. This is the first time the player sees the hand diagram,
  so the teaching tip is "Eyes on the screen, not your fingers."
- **Level screen** - narrow drill on F and J only.
- **Level complete** - pass/fail based on difficulty thresholds.

## Learn levels (levels 3+, introducing new letters)

- **Letter intro x N** - one screen per new letter, in order. The player
  presses each letter three times before advancing. This locks in the
  finger-letter association before any time pressure exists. There is no
  penalty for taking as long as needed. Each letter intro also has a Back
  button that returns to level select.
- **fj-intro** (level 3 only) - a one-time reminder to return fingers to F and
  J between letters. Shown after the letter intros on the first level where
  there are multiple keys to juggle. Not repeated on later levels because the
  finger guide already reinforces home-row return from level 3 onward.
- **Finger guide** - shows the full key map for this level (F, J, and the
  active pair), the hand diagram, and a rotating teaching tip. Lets the player
  explore the finger map interactively before typing starts.
- **Level screen** - timed drill on F, J, and the active pair only.
- **Level complete** - pass/fail. On fail the player retries from the finger
  guide (letter intros are skipped on retry so they do not become annoying).

## Finale / review levels

- **Finger guide** - shows all letters active in this arc. No "new key"
  emphasis because everything on screen has been seen before.
- **Level screen** - cumulative review drill.
- **Level complete** - pass/fail.

## After level complete

- If a cutscene is scheduled after this level, it plays next.
- Otherwise the player advances directly to the next level (which starts its
  own flow from the top).
- After the final level, the ending cutscene plays and the player returns to
  the main menu.
