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

The game must also work when deployed under a subpath such as GitHub Pages at
`/pptyping2/`. Route parsing and URL generation therefore strip/add the deploy
base path instead of assuming the site is mounted at `/`.

## URL Structure

| Path                                | Screen                        |
| ----------------------------------- | ----------------------------- |
| `/`                                 | Main Menu                     |
| `/team-select`                      | Team Select (first-time only) |
| `/level-select`                     | Level Select                  |
| `/level/1` through `/level/19`      | Level Screen (typing UI)      |
| `/cutscene/0` through `/cutscene/5` | Cutscene Screen               |
| `/settings`                         | Settings Screen               |
| `/debug-particles`                  | Particle Debugger (dev only)  |

## Navigation Rules

- **Locked level guard**: If the player navigates directly to `/level/5` and
  that level is not unlocked, redirect to `/level-select`. Show a visual
  indicator of which level they tried to reach.
- **No-team guard**: If the player navigates to any gameplay screen and no team
  is set, redirect to `/team-select`.
- **Continue**: Reads `currentPosition` from `PlayerProfile` and navigates to
  that URL via `pushState`.
- **Back button**: The `popstate` event re-renders the screen corresponding to
  the browser's current URL. All screen renders are idempotent - calling
  "render level 3" twice is safe.
- **GitHub Pages deep links**: The build emits a static `index.html` entry for
  every canonical route (`/team-select`, `/level/<N>`, `/cutscene/<N>`, etc.) so
  direct requests do not depend on a redirect shim. `404.html` remains a normal
  not-found page for truly unknown routes.

## Screen Manager

The router delegates actual rendering to `app.ts`, which owns the single root
DOM container and the active `ScreenMount`. Navigating to a new screen:

1. Calls the teardown method of the current screen (removes event listeners,
   stops particles/audio if needed)
2. Clears the root container
3. Instantiates and mounts the new screen
4. Calls `pushState` with the correct URL (unless the navigation was triggered
   by a `popstate` event, in which case the URL is already correct)

## Key Files

- `src/router.ts` - parses the base-aware browser pathname, maps it to a route,
  and generates canonical URLs for navigation
- `src/app.ts` - owns the root `#app` DOM element, tears down the current
  `ScreenMount`, mounts the next one, and coordinates route guards
- `404.html` - static not-found page for routes that are not part of the game
- `scripts/generate-static-routes.ts` - duplicates the built app shell into
  per-route HTML entry files for GitHub Pages deep-link support
