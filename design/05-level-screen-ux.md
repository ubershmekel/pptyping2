# Level Screen (Typing UI)

## Intent

The level screen is the main gameplay surface. It must do one thing
exceptionally well: let the player focus entirely on typing. Every non-essential
element is removed or pushed to the periphery. The typing text is the visual
center of the screen.

This screen orchestrates all the subsystems — typing engine, character
companion, particles, audio, environment — but its own DOM is intentionally
minimal.

## Layout

The screen has four visible regions, all fitting within the viewport:

1. **Environment layer** (back) — full-bleed background image + ambient
   particles behind everything else
2. **Stats bar** (top or top corner) — small, unobtrusive WPM and accuracy
   readout; updates in real time but draws no attention
3. **Typing area** (center) — the character companion walking above a single
   line of letter spans; this is the dominant visual element
4. **Minimal controls** — pause button (also triggered by Escape key); visible
   enough to locate at a glance but styled to recede during active typing — it
   must never require hunting for

There is no progress bar, no level title during play, no level number on screen.
Those belong to other screens. During typing, nothing competes with the text.

## Text Display

The typing area renders one line at a time. Each character is its own `<span>`
element with a data-state attribute (`done | current | pending`). CSS handles
all visual styling based on the state:

- `done`: subtle team-colored tint (soft yellow / soft pink)
- `current`: gentle glow or blinking cursor indicator (defined by `--env-glow`)
- `pending`: muted gray, fully readable

When the engine emits `lineComplete`, the current line fades out and the new
line fades in. The character companion resets to the left edge. This transition
should feel snappy (~150–200ms) so flow is not interrupted. The engine must
automatically skip any whitespace between lines — the player's next keystroke
should target the first character of the new line, never a space separator.

## Keystroke Effects

On every correct keystroke, a small team-themed effect plays on the current
letter span (spark for Pokemon, rainbow flash for MLP). This is a CSS animation
triggered by adding a class to the span, then removing it after the animation
completes. The particle manager also emits a tiny burst at the letter's
position.

On error, a CSS shake/flash class is applied to the letter span briefly. No
cursor advance.

## Orchestration

The level screen listens to typing engine events and calls the appropriate
subsystems:

- `correctKeystroke` → `letterSpan.setDone()`, CSS spark effect,
  `audioManager.playSfx("correct")`, `particleManager.triggerBurst("keystroke")`
- `errorKeystroke` → CSS error flash, `audioManager.playSfx("error")`,
  `companion.flinch()`
- `comboMilestone` → `companion.celebrate()`, `audioManager.playSfx("combo")`,
  `particleManager.triggerBurst("combo")`
- `levelComplete` → tear down, navigate to level complete screen

## Progress Beam

A team-themed energy beam extends from the left edge of the screen toward the
right as the player types, reaching full width at level completion. It lives in
the background layer (behind text and character) so it never competes with
typing, but it is deliberately loud — a glance downward reveals exactly how far
through the level the player is.

- **Pokemon**: a jagged golden lightning beam with a bright leading-edge glow
  and a subtle flicker animation; box-shadow fans out in gold to fill the
  environment with electric light
- **MLP**: a full-spectrum rainbow beam (red → violet) with a pink glow; no
  flicker — smooth and continuous

The beam is driven by the typing engine's `progress` value (0–1) mapped to a
CSS `width` percentage, updated on every `syncStats` call (~250 ms interval plus
every correct keystroke). Transition is 180 ms so motion feels responsive
without being jittery.

Future work: per-arc visual variants (e.g. crystal shards for Crystal Cavern,
stardust trail for Stardrift Coast) that override the team default.

## Pause

Pressing Escape or the pause button mounts the pause overlay (see
`08-pause-overlay-ux.md`) on top of the level screen without destroying it. The
typing engine is paused (stops accepting input, stops the stat timer). On
resume, everything continues from where it left off.

## Key Files

- `src/screens/levelScreen.ts` — the orchestration layer; reads level
  definition, instantiates and connects the typing engine, character companion,
  stats display, and environment; handles the event glue between subsystems;
  manages the lifecycle
