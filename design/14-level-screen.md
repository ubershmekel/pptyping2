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
4. **Minimal controls** (accessible but not prominent) — pause button (also
   triggered by Escape key)

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
should feel snappy (~150–200ms) so flow is not interrupted.

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

## Pause

Pressing Escape or the pause button mounts the pause overlay (see
`16-pause-overlay.md`) on top of the level screen without destroying it. The
typing engine is paused (stops accepting input, stops the stat timer). On
resume, everything continues from where it left off.

## Key Files

- `src/screens/levelScreen.ts` — the orchestration layer; reads level
  definition, instantiates and connects the typing engine, character companion,
  stats display, and environment; handles the event glue between subsystems;
  manages the lifecycle of a level attempt
