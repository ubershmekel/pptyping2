import "./styles/base.css";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index";
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

restoreRouteFromRedirectParam();

createApp(App).use(router).mount("#app");
