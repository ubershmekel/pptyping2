// ─── Route types ─────────────────────────────────────────────────────────────

/**
 * A Route is the URL-addressable subset of AppScreen.
 * `level-complete` has no canonical URL — it inherits `/level/<N>` and is
 * tracked only in in-memory App state.
 */
export type Route =
  | { screen: "main-menu" }
  | { screen: "team-select" }
  | { screen: "level-select" }
  | { screen: "level"; number: number }
  | { screen: "cutscene"; index: number }
  | { screen: "settings" }
  | { screen: "debug-particles" }
  | { screen: "not-found" };

import { MAX_LEVEL } from "./data/levels";
import { stripBasePath, withBasePath } from "./basePath";

// ─── URL ↔ Route mapping ─────────────────────────────────────────────────────

/** Parse a pathname string into a Route. */
export function parseRoute(pathname: string, basePath?: string): Route {
  const path = stripBasePath(pathname || "/", basePath);

  if (path === "/") return { screen: "main-menu" };
  if (path === "/team-select") return { screen: "team-select" };
  if (path === "/level-select") return { screen: "level-select" };
  if (path === "/settings") return { screen: "settings" };
  if (path === "/debug-particles") return { screen: "debug-particles" };

  const levelMatch = path.match(/^\/level\/(\d+)$/);
  if (levelMatch) {
    const n = parseInt(levelMatch[1], 10);
    if (n >= 1 && n <= MAX_LEVEL) return { screen: "level", number: n };
  }

  const cutsceneMatch = path.match(/^\/cutscene\/(\d+)$/);
  if (cutsceneMatch) {
    const n = parseInt(cutsceneMatch[1], 10);
    if (n >= 0 && n <= 5) return { screen: "cutscene", index: n };
  }

  return { screen: "not-found" };
}

/** Build the canonical path string for a navigable route. */
export function routeToPath(
  route: Exclude<Route, { screen: "not-found" }>,
  basePath?: string,
): string {
  let path = "/";
  switch (route.screen) {
    case "main-menu":
      path = "/";
      break;
    case "team-select":
      path = "/team-select";
      break;
    case "level-select":
      path = "/level-select";
      break;
    case "settings":
      path = "/settings";
      break;
    case "level":
      path = `/level/${route.number}`;
      break;
    case "cutscene":
      path = `/cutscene/${route.index}`;
      break;
    case "debug-particles":
      path = "/debug-particles";
      break;
  }

  return withBasePath(path, basePath);
}

// ─── Router class ────────────────────────────────────────────────────────────

/** Called by the Router whenever the active route changes. */
type RouteHandler = (route: Route, fromPopState: boolean) => void;

export class Router {
  private handler: RouteHandler;

  constructor(handler: RouteHandler) {
    this.handler = handler;
    window.addEventListener("popstate", this.onPopState);
  }

  // ── Event handler (arrow fn keeps `this`) ──────────────────────────────────

  private onPopState = (): void => {
    this.handler(parseRoute(window.location.pathname), true);
  };

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Navigate to a route, pushing a new browser history entry and notifying
   * the handler. Use this for all normal user-initiated navigation.
   */
  go(route: Exclude<Route, { screen: "not-found" }>): void {
    const path = routeToPath(route);
    this.handler(route, false);
    window.history.pushState({ screen: route.screen }, "", path);
  }

  /**
   * Silently update the URL to match the current logical route without adding
   * a new history entry. Use for guard redirects that shouldn't be back-navigable
   * or for syncing the URL to a non-URL app state (e.g. level-complete → /level/N).
   */
  replace(route: Exclude<Route, { screen: "not-found" }>): void {
    const path = routeToPath(route);
    window.history.replaceState({ screen: route.screen }, "", path);
    // No handler call — just a URL sync; the App is already rendering the right thing.
  }

  /** Return the Route for the current browser URL (useful on first load). */
  currentRoute(): Route {
    return parseRoute(window.location.pathname);
  }

  /** Remove the popstate listener (call if the router is ever torn down). */
  destroy(): void {
    window.removeEventListener("popstate", this.onPopState);
  }
}
