# Audio

STATUS: NOT YET IMPLEMENTED - PLEASE IGNORE THIS FILE

## Intent

Audio is a significant part of the game feel. Sound effects give instant tactile
feedback on correct keystrokes, errors, and level events. Ambient background
loops make each environment feel alive. The audio module manages all of this via
Howler.js, which provides cross-browser audio support, loop management, and
volume control.

Audio should enhance focus, not distract from it. Sound effects are crisp and
brief; ambient loops are subtle and unobtrusive. All audio is opt-out via the
settings screen.

## Sound Effects

Short one-shot sounds triggered by typing events:

| Event                 | Sound                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------- |
| Correct keystroke     | Soft click or spark sound (team-themed: electric snap for Pokemon, bubble-pop for MLP) |
| Error keystroke       | Low thud or negative tone (brief, not harsh)                                           |
| Combo milestone       | Rising chime or brief musical flourish                                                 |
| Line complete         | Short satisfying resolution sound                                                      |
| Level complete (pass) | Victory jingle (a few seconds, not a full fanfare)                                     |
| Level complete (fail) | Gentle failure tone                                                                    |

Sound effects are loaded once at startup and triggered via `Howl.play()`. They
are short enough that overlapping plays (if the player types fast) are
acceptable.

## Ambient Loops

Each environment has one ambient background loop that plays during the level
screen, level complete screen, and cutscene within that arc. Loops are defined
in the `EnvironmentConfig` and started/stopped by the environment manager (see
`11-environments-ux.md`).

The audio manager maintains a reference to the currently playing loop. When
switching environments, it fades out the previous loop and fades in the new one.
Loops are loaded lazily — not all 5 are loaded at startup, only when their arc
is first reached.

Approximate ambient themes (5 loops total):

- Forest/nature ambience
- Cave/underground echoes
- Ocean/coastal waves
- Wind/sky ambience
- Ethereal/magic hum (finale arc)

## Volume & Mute Controls

The settings screen exposes:

- Master volume slider
- Separate toggles for SFX and ambient music (players may want ambient but no
  click sounds, or vice versa)

Volume s