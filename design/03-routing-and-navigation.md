# Routing & Navigation

## Intent

Every screen in the game has a canonical URL. The router keeps the browser URL
in sync with the active screen, allows back/forward to work naturally, and
enables users to share or bookmark a specific level or cutscene via a direct
link.

There is no framework router. The History API (`pushState` / `popState`) is used
directly. The router is a thin layer that maps URL paths to screen names,
renders the correct screen, and handles the edge case of navigating to a locked
level.

## URL Structure

| Path                                | Screen                        |
| ----------------------------------- | ----------------------------- |
| `/`                                 | Main Menu                     |
| `/team-select`                      | Team Select (first-time only) |
| `/level-select`                     | Level Select                  |
| `/level/1` through `/level/14`      | Level Screen (typing UI)      |
| `/cutscene/1` through `/cutscene/6` | Cutscene Screen               |
| `/settings`                         | Settings Screen               |

## Navigation Rules

- **Locked level guard**: If the player navigates directly to `/level/5` and
  that level is not unlocked, redirect to `/level-select`. Show a visual
  indicator of which level they tried to reach.
- **No-team guard**: If the player navigates to any gameplay screen and no team
  is set, redirect to `/team-select`.
- **Continue**: Reads `currentPosition` from `PlayerProfile` and navigates to
  that URL via `pushState`.
- **Back button**: The `popstate` event re-renders the screen corresponding to
  the browser's current URL. All screen renders are idempotent — calling "render
  level 3" twice is safe.

## Screen Manager

The router delegates actual rendering to the Screen Manager, which owns the
single root DOM container. Navigating to a new screen:

1. Calls the teardown method of the current screen (removes event listeners,
   stops particles/audio if needed)
2. Clears the root container
3. Instantiates and mounts the new screen
4. Calls `pushState` with the correct URL (unless the navigation was triggered
   by a `popstate` event, in which case the URL is already correct)

## Key Files

- `src/router.ts` — parses `window.location.pathname`, maps to a
  `ScreenPosition`, enforces guards, calls the screen manager
- `src/screens/screenManager.ts` — owns the root `#app` DOM element; mounts and
  unmounts screens; exposes `navigateTo(position: ScreenPosition)` which both
  updates the URL and renders the correct screen
