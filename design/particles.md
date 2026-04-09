# Particles

## Intent

Particles serve two distinct purposes in the game:

1. **Ambient environmental particles** — subtle, continuous background effects
   that reinforce the arc's environment theme (floating leaves, drifting embers,
   snowflakes, bubbles, sparkles). These run behind the text area and are purely
   decorative.
2. **Feedback particles** — brief bursts on specific events: a small
   team-colored effect on each correct keystroke, a larger burst on combo
   milestones, and a full victory celebration on level complete.

Both types are managed via **tsparticles/slim** — the slim bundle is used to
keep bundle size reasonable, as only a subset of tsparticles' full feature set
is needed.

The particle system has no knowledge of the typing engine — it receives calls
from the level screen's event handlers, same as audio and the character
companion.

## Ambient Presets

Each environment has a named preset (a key in the particle preset registry). A
preset is a tsparticles config object that defines:

- Particle shape, size, and opacity
- Movement direction and speed (gentle, drifting)
- Color (driven by `--env-particle` CSS variable)
- Quantity (sparse — particles should not clutter the text area)

Presets are designed to feel like the environment without ever competing with
readability. The ambient particle layer sits **behind** the text area at a lower
z-index.

Preset examples:

- `"forest"` — slowly drifting leaves, occasional petal
- `"cave"` — rising embers, faint dust motes
- `"ocean"` — floating bubbles drifting upward
- `"sky"` — drifting cloud wisps or feathers
- `"finale"` — gentle orbiting sparkles

## Feedback Particles

Triggered by typing events. These run at a higher z-index, layered on top of the
text:

| Event             | Effect                                                                          |
| ----------------- | ------------------------------------------------------------------------------- |
| Correct keystroke | Small team-colored spark or glow burst at the current letter's position         |
| Error keystroke   | Brief red/dark flash (subtle — errors should sting but not dominate)            |
| Combo milestone   | Larger burst expanding outward from the companion character position            |
| Level complete    | Full-screen victory particle shower (confetti, stars, or team-themed explosion) |

Keystroke particles are short-lived (200–400ms) so they don't accumulate.
Victory particles can be longer and more extravagant — it's a reward moment.

## Key Files

- `src/particles/particleManager.ts` — initializes and controls the tsparticles
  instances; exposes `startAmbient(presetKey: string)`, `stopAmbient()`,
  `triggerBurst(type: BurstType, position?: {x, y})` for feedback effects
- `src/particles/presets.ts` — defines all named ambient preset configs and
  feedback burst configs as TypeScript objects; consumed by `particleManager.ts`
