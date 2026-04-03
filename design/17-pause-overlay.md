# Pause Overlay

## Intent

The pause overlay is a lightweight modal that sits on top of the active level
screen without destroying it. It gives the player a graceful way to take a
break, restart, or quit without losing their attempt mid-stream. The pause state
fully suspends the typing engine — no input is accepted, the stat timer stops.

The overlay is designed to be minimal so it's fast to interact with and fast to
dismiss.

## Trigger

- **Escape key** — the primary way to pause; always active during a level
- **Pause button** — a small, unobtrusive button in the level screen UI;
  accessible to players who prefer mouse/touch

## Options

1. **Resume** — dismisses the overlay and resumes the typing engine from the
   exact point it was paused (cursor position, stats, line position all
   preserved)
2. **Retry** — confirms (or immediately) restarts the current level from the
   beginning; discards the current attempt's stats
3. **Quit to Main Menu** — navigates to `/`; the current attempt is discarded
   (no partial save)

## Stats During Pause

The overlay shows the current attempt's in-progress stats — WPM so far, accuracy
so far, time elapsed. This gives the player context for whether to keep going or
retry.

## Visual Treatment

A semi-transparent dark overlay covers the level screen. The level's background
and environment are still visible behind it (blurred or dimmed), which
reinforces that you're pausing a game-in-progress rather than leaving it. The
character companion freezes mid-animation.

## Key Files

- `src/screens/pauseOverlay.ts` — mounts/unmounts the overlay DOM on top of the
  level screen; subscribes to Escape key events; receives a `resume` and `quit`
  callback from the level screen; calls the typing engine's `pause()` and
  `resume()` methods
