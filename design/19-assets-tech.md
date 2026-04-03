# Assets

## Intent

This document catalogs all static assets the game requires - images,
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

These are large, atmospheric illustrations. Target ~800x600px, compressed to
keep load times reasonable.

### Environment Backgrounds (5 total)

Full-bleed atmospheric scene images, one per arc. Used behind the level screen,
level complete, and cutscene screens.

Naming convention: `public/images/environments/{arc-number}.webp` Examples:

- `public/images/environments/01.webp`

Target ~1920x1080px (or similar widescreen ratio) with compression. Referenced
via the `EnvironmentConfig` in `src/content/arcs.ts`.

### Character SVGs

Character art for the companion system (see `10-character-companion-ux.md`).
These should live in source control as standalone SVG files so the build can
import them directly and we can scale from a single pose to multi-frame
animation without changing the component contract.

- Pokemon: Pikachu SVG poses/frames
- MLP: Pinkie Pie SVG poses/frames

Naming convention: `src/assets/characters/{team}/{state-or-frame}.svg`
Examples:

- `src/assets/characters/pokemon/pikachu.svg`
- `src/assets/characters/mlp/pinkie-pie.svg`
- Future expansion: `src/assets/characters/pokemon/walk-01.svg`

State selection happens through `src/assets/characters/index.ts`, which maps a
team and companion state to an ordered list of SVG frame files. Today each state
can point at the same base SVG; later, walking/celebrating/flinch can point at
multiple frames for timed animation.

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
| `level-pass`      | Victory jingle (3-5 seconds) |
| `level-fail`      | Gentle failure tone          |

### Ambient Loops

Background audio loops for each arc environment. Seamlessly looping `.webm`
files (~30-60 seconds before repeat).

Naming convention: `public/audio/ambient/{key}.webm`

| Key      | Description                       |
| -------- | --------------------------------- |
| `forest` | Birds, leaves rustling            |
| `cave`   | Echoes, drips                     |
| `ocean`  | Waves, coastal wind               |
| `sky`    | High-altitude wind, distant birds |
| `finale` | Ethereal magic hum                |

## Key Files

- `public/` - static runtime assets copied as-is by Vite
- `src/assets/characters/` - character SVG source files imported by the app
- `src/assets/characters/index.ts` - character asset manifest used by the
  companion component
- `src/audio/soundEffects.ts` - maps `SoundKey` enum values to file paths
  (references `public/audio/sfx/`)
- `src/audio/audioManager.ts` - maps loop keys to file paths (references
  `public/audio/ambient/`)
