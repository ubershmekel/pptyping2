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
3. **Cutscene one-shot particles** — dramatic timed bursts that punctuate story
   beats: pink petals, golden key flashes, Thunderbolts, party cannons, and so
   on. Each burst fires once at a configured delay after the cutscene opens.

## Implementation

Feedback and cutscene particles are rendered on a full-screen `<canvas>` overlay
(`position: fixed; z-index: 9999`) managed by `ParticleManager`. It uses a
requestAnimationFrame loop with delta-time scaling so the physics is
frame-rate-independent. No external library is used.

Ambient particles are pure CSS: `<span class="env-particle">` /
`<span class="cs-particle">` elements that each environment overrides via CSS
custom properties (`--env-particle-color`, `--env-particle-radius`,
`--env-particle-anim`).

## Key Files

- `src/particles/particleManager.ts` — initializes and controls the canvas
  particle system; exposes `mount(el)`, `destroy()`, and
  `triggerBurst(type, x, y)`
- `src/particles/presets.ts` — defines `BurstConfig` (count, speed, life, size,
  gravity) and color palettes for every burst type; consumed by
  `particleManager.ts`

## Burst Types

| Type        | Spawn pattern   | Used in                                        |
| ----------- | --------------- | ---------------------------------------------- |
| `correct`   | Radial          | Level screen — every correct keystroke         |
| `error`     | Radial          | Level screen — every error                     |
| `combo`     | Radial          | Level screen — every 10th correct keystroke    |
| `victory`   | Top-edge rain   | Level screen — level complete                  |
| `petal`     | Rightward drift | Pokémon cutscene #0 — Fluttershy's trail       |
| `golden`    | Radial          | Pokémon #1, MLP #4 — restored keys / warmth    |
| `electric`  | Radial          | Pokémon #2 & #4 — Thunder Shrine / cheek spark |
| `ripple`    | Uniform ring    | Pokémon #3 — crystal wall pulse                |
| `lightning` | Top-edge rain   | Pokémon #5 — Thunderbolt                       |
| `glass`     | Radial          | Pokémon #5 — dimensional barrier shatters      |
| `water`     | Radial          | MLP #0 & #2 — Squirtle's water blast           |
| `confetti`  | Radial          | MLP #1 & #3 — prank landing                    |
| `party`     | Upward fan      | MLP #5 — party cannon blast                    |

## Cutscene One-Shot Schedule

Bursts are defined in `CUTSCENE_BURSTS` in `cutscene.ts`. Each entry is
`{ delay: number (ms), type: BurstType }`.

| Cutscene | Pokémon burst(s)                         | MLP burst(s)          |
| -------- | ---------------------------------------- | --------------------- |
| #0       | `petal` @ 1 800 ms                       | `water` @ 1 400 ms    |
| #1       | `golden` @ 1 200 ms                      | `confetti` @ 1 500 ms |
| #2       | `electric` @ 1 400 ms                    | `water` @ 1 300 ms    |
| #3       | `ripple` @ 1 600 ms                      | `confetti` @ 1 600 ms |
| #4       | `electric` @ 1 200 ms                    | `golden` @ 1 700 ms   |
| #5       | `lightning` @ 900 ms, `glass` @ 2 200 ms | `party` @ 800 ms      |

## Ambient Presets

Each environment overrides CSS custom properties on `.env-particle` (level
screen) and `.cs-particle` (cutscene screen):

| Environment     | Color                            | Animation                                                  |
| --------------- | -------------------------------- | ---------------------------------------------------------- |
| Digital Grove   | Soft green rgba(100,220,120,0.5) | `env-drift` — gentle upward float                          |
| Thunder Shrine  | Purple rgba(180,100,255,0.55)    | `env-ember` / `cs-particle-flicker` — fast lateral flicker |
| Crystal Cavern  | Blue rgba(80,160,255,0.45)       | `env-bubble` — slow wobble                                 |
| Stardrift Coast | Teal rgba(60,210,200,0.4)        | `env-bubble` — longer duration                             |
| Apex Summit     | Gold rgba(255,220,80,0.5)        | `env-sparkle` / `cs-particle-flicker` — rotating twinkle   |

## Particle Debugger

A secret developer screen at `/debug-particles` (no link in the game UI).
Navigate there directly in the browser to access it.

The screen lists every burst type as a card. Each card shows:

- The `type` key and a **Fire** button
- Human-readable label and the story context / in-game trigger
- Five live knobs: **Count**, **Speed**, **Life ms**, **Size px**, **Gravity**

Clicking Fire (or pressing Space / Enter) triggers the burst at screen center.
Moving a knob immediately re-fires so the change is visible without a second
click. Knob changes are written back into `BURST_CONFIGS` in memory — copy the
values you want into `src/particles/presets.ts` to make them permanent.

See `src/screens/debugParticles.ts` and `src/screens/debugParticles.css`.
