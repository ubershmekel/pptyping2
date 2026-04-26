# Assets

## Intent

This document catalogs all static assets the game requires - images,
spritesheets, and audio files. It defines the naming convention, expected count,
and how each asset type is referenced in code. No asset generation happens at
runtime; all assets are pre-produced and bundled.

## Images

### Story Illustrations (12 total)

Images for cutscene reveals. One per arc per team.

- 6 Pokemon story images
- 6 MLP story images

Naming convention: `public/cutscenes/{team-prefix}{cutscene-number}.jpg`
Examples:

- `public/cutscenes/pok0.jpg`
- `public/cutscenes/mlp3.jpg`

These are large, atmospheric illustrations. Target ~800x600px, compressed to
keep load times reasonable. Runtime code references them via
`import.meta.env.BASE_URL` so they resolve correctly under any deploy base path.

### Level Reward Images

Reward illustrations shown on the level complete screen when the player passes a
level. One image per level per team, for levels 2 and beyond (level 1 is the
speed test and has no pass/fail so no reward image).

That means 18 levels × 2 teams = **36 images** total.

Naming convention: `public/images/rewards/{team}/{level-number}.webp` Examples:

- `public/images/rewards/pokemon/02.webp`
- `public/images/rewards/mlp/14.webp`

These should feel celebratory and thematic — a vivid moment from that level's
narrative, sized to ~600x400px. They supplement the story blurb on the level
complete screen and are only shown on a passing attempt.

### Environment Backgrounds (5 total)

Full-bleed atmospheric scene images, one per arc. Used behind the level screen,
level complete, and cutscene screens.

Naming convention: `public/images/environments/{arc-number}.webp` Examples:

- `public/images/environments/01.webp`

Target ~1920x1080px (or similar widescreen ratio) with compression. Referenced
via the `EnvironmentConfig` in `src/content/arcs.ts`.

### Character Art

Character art now has two runtime forms:

- Companion art: standalone SVG files used by the in-level companion system (see
  `character-companion.md`)
- Menu portraits: static images or Aseprite-exported sprite sheets used by
  screens like Team Select

Companion SVG naming convention:
`src/assets/characters/{team}/{state-or-frame}.svg`

Examples:

- `src/assets/characters/pokemon/pikachu.svg`
- `src/assets/characters/mlp/pinkie-pie.svg`
- Future expansion: `src/assets/characters/pokemon/walk-01.svg`

Sprite portrait naming convention:
`src/assets/{character}/{animation-name}.json` plus the referenced PNG sheet

Examples:

- `src/assets/pikachu/pikachu-stand.json`
- `src/assets/pikachu/pikachu-stand.png`

`src/assets/characters/index.ts` owns the per-team asset manifest:

- `CHARACTER_FRAMES` maps a team and companion state to ordered SVG frame files
- `CHARACTER_PORTRAITS` maps a team to either a static portrait asset or a
  sprite-sheet source definition

`src/aseprite.ts` is the generic Aseprite loader. It sorts exported frames,
reads `meta.frameTags`, and resolves a named loop when a screen asks to present
that character. If no tag is requested, it falls back to the first exported tag,
or the full frame list when the sheet has no tags.

`src/components/characterPortrait.ts` renders portrait assets for menus and can
request a specific loop such as `stand` when building the element.

### Keyboard SVG

The finger guide uses a source-controlled keyboard SVG so individual letter keys
can be highlighted and tinted without depending on editor-generated element ids.

Naming convention: `src/assets/keyboard/{layout-name}.svg`

Example:

- `src/assets/keyboard/KB_United_States.svg`
- `src/assets/keyboard/KB_United_States.demo.html` for local visual iteration

Contract for letter keys:

- keycap paths use `class="kb-keycap"`
- label paths use `class="kb-keylabel"`
- both carry `data-key="{letter}"`, `data-finger="{finger-name}"`, and
  `data-row="{top|home|bottom}"`
- runtime code must target those semantic classes and `data-*` attributes

### Medal Rank Keycaps

Review / boss medals are bundled SVG keycap badges. The medal asset manifest in
`src/assets/medals/index.ts` maps the active team and medal tier to the correct
SVG.

Naming convention: `src/assets/medals/{team-prefix}/{tier}-rank-keycap.svg`

Examples:

- `src/assets/medals/pok/bronze-rank-keycap.svg`
- `src/assets/medals/pok/silver-rank-keycap.svg`
- `src/assets/medals/pok/gold-rank-keycap.svg`
- `src/assets/medals/mlp/bronze-rank-keycap.svg`
- `src/assets/medals/mlp/silver-rank-keycap.svg`
- `src/assets/medals/mlp/gold-rank-keycap.svg`

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
- `public/cutscenes/` - cutscene JPGs used by `Cutscene.vue`
- `src/assets/characters/` - character SVG source files imported by the app
- `src/assets/characters/index.ts` - character asset manifest used by the app
- `src/aseprite.ts` - generic parser and tag selector for Aseprite JSON exports
- `src/components/characterPortrait.ts` - menu portrait renderer for static and
  sprite-sheet assets
- `src/audio/soundEffects.ts` - maps `SoundKey` enum values to file paths
  (references `public/audio/sfx/`)
- `src/audio/audioManager.ts` - maps loop keys to file paths (references
  `public/audio/ambient/`)
