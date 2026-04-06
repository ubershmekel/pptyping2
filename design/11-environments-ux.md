# Environments

## Intent

Each arc (5 total) has a distinct environment theme that defines the visual and
audio atmosphere of its 3 levels. Environments make the player feel like they're
progressing through different worlds within the story without changing the core
typing mechanics at all.

The text area, typing behavior, and character companion are identical across
environments — only the "dressing" changes. This separation keeps the
environment system additive and safe to modify without touching game logic.

## What an Environment Controls

Each `EnvironmentConfig` (defined in `src/content/arcs.ts`, typed in
`13-data-model-tech.md`) controls:

1. **Background image** — a full-bleed atmospheric scene behind the text area.
   Pre-generated. Applies as a CSS `background-image` on the level screen's root
   element.
2. **CSS custom properties** — a set of design tokens injected onto `:root` when
   the environment is active:
   - `--env-primary`: main accent color (used for done-letter tint, UI borders,
     progress indicators)
   - `--env-glow`: glow color for the current letter cursor effect
   - `--env-particle`: particle color override
   - `--env-text-done`: the subtle tint applied to completed letters (soft
     yellow for Pokemon, soft pink/purple for MLP — these may be team-specific
     variants of the env colors)
3. **Particle preset** — a key referencing a preset configuration in the
   particle manager (see `12-particles-ux.md`). Examples: floating leaves for a
   forest arc, embers for a fire arc, snowflakes for an ice arc, bubbles for an
   ocean arc, sparkles for a final arc.
4. **Ambient sound key** — a key referencing a registered loop in the audio
   manager (see `20-audio-tech.md`). Examples: forest birds, cave echoes, ocean
   waves, wind, magic hum.

## Environment Application

When a level screen mounts:

1. It reads the arc number from the level definition
2. It looks up the `EnvironmentConfig` from `ARCS`
3. It calls `environmentManager.apply(config)` which:
   - Sets the background image
   - Injects CSS variables onto `:root`
   - Starts the particle preset via `particleManager`
   - Starts the ambient loop via `audioManager`

When the level screen unmounts, `environmentManager.teardown()` stops particles
and fades out the ambient loop.

The cutscene screen and level complete screen inherit the environment of the arc
they belong to — the environment stays active across these transitions so the
world feels continuous.

## Environments (Planned — 5 Arcs)

Exact themes TBD, but one per arc. Examples:

- Arc 1: Peaceful meadow/pallet town (introductory, calm)
- Arc 2: Forest or jungle (mysterious, building tension)
- Arc 3: Cave or ruins (darker, action-oriented)
- Arc 4: Sky/clouds or city (energetic, fast-paced)
- Arc 5: Grand hall or cosmic space (epic, finale)

Story flavor text on the level complete screen will explain why the keyboard
corruption happened in this particular place.

## Key Files

- `src/environment/environmentManager.ts` — applies and tears down an
  `EnvironmentConfig`; the single point of contact for all environment state
  changes; coordina
