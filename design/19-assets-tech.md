# Assets

## Intent

This document catalogs all static assets the game requires — images,
spritesheets, and audio files. It defines the naming convention, expected count,
and how each asset type is referenced in code. No asset generation happens at
runtime; all assets are pre-produced and bundled.

## Images

### Story Illustrations (12 total)

AI-generated images for cutscene reveals. One per arc per team.

- 6 Pokemon story images
- 6 MLP story images

Naming convention: `public/images/stories/{team}/{cutscene-number}.webp`
Examples:

- `public/images/stories/pokemon/01.webp`
- `public/images/stories/mlp/03.webp`

These are large, atmospheric illustrations. Target ~800×600px, compressed to
keep load times reasonable.

### Environment Backgrounds (5 total)

Full-bleed atmospheric scene images, one per arc. Used behind the level screen,
level complete, and cutscene screens.

Naming convention: `public/images/environments/{arc-number}.webp` Examples:

- `public/images/environments/01.webp`

Target ~1920×1080px (or similar widescreen ratio) with compression. Referenced
via the `EnvironmentConfig` in `src/content/arcs.ts`.

### Character Sprites

Pose sets for the companion character (see `10-character-companion-ux.md`).

- Pokemon: Pikachu poses (idle, walk-frame-1, walk-frame-2, celebrate, flinch)
- MLP: Pinkie Pie poses (same states)

Naming convention: `public/images/characters/{team}/{state}.png` Examples:

- `public/images/characters/pokemon/idle.png`
- `public/images/characters/mlp/celebrate.png`

Start with transparent-background PNGs. Upgrade to spritesheets later if
animation complexity warrants it.

## Audio

### Sound Effects

Short one-shot audio clips. All in `.webm` (with `.mp3` fallback for older
browsers if needed). Howler handles format selection.

Naming convention: `public/audio/sfx/{key}.webm`

| Key               | Description                  |
| ----------------- | ---------------------------- |
| `correct-pokemon` | Electric spark click         |
| `correct-mlp`     | Bubbly pop                   |
| `error`           | Low negative thud            |
| `combo`           | Rising chime                 |
| `line-complete`   | Short resolution ding        |
| `level-pass`      | Victory jingle (3–5 seconds) |
| `level-fail`      | Gentle failure tone          |

### Ambient Loops

Background audio loops for each arc environment. Seamlessly looping `.webm`
files (~30–60 seconds before repeat).

Naming convention: `public/audio/ambient/{key}.webm`

| Key      | Description                       |
| -------- | --------------------------------- |
| `forest` | Birds, leaves rustling            |
| `cave`   | Echoes, drips                     |
| `ocean`  | Waves, coastal wind               |
| `sky`    | High-altitude wind, distant birds |
| `finale` | Ethereal magic hum                |

## Key Files

- `public/` — all static assets live here; Vite copies this directory to the
  build output as-is
- `src/audio/soundEffects.ts` — maps `SoundKey` enum values to file paths
  (references `public/audio/sfx/`)
- `src/audio/audioManager.ts` — maps loop keys to file paths (references
  `public/audio/ambient/`)
