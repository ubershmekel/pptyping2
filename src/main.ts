import "./styles/base.css";
import { App } from "./app";
import { withBasePath } from "./basePath";

function restoreRouteFromRedirectParam(): void {
  const url = new URL(window.location.href);
  const redirectedPath = url.searchParams.get("p");
  if (!redirectedPath) return;

  url.searchParams.delete("p");
  const normalizedPath = redirectedPath.startsWith("/")
    ? redirectedPath
    : `/${redirectedPath}`;
  const query = url.searchParams.toString();
  const nextUrl = `${withBasePath(normalizedPath)}${query ? `?${query}` : ""}${url.hash}`;
  window.history.replaceState({}, "", nextUrl);
}

const container = document.getElementById("app");
if (!container) throw new Error("#app not found");

restoreRouteFromRedirectParam();

const app = new App(container);
app.start();
