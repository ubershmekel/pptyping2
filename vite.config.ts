import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const indexHtml = fileURLToPath(new URL("./index.html", import.meta.url));
const notFoundHtml = fileURLToPath(new URL("./404.html", import.meta.url));

export default defineConfig({
  base: process.env.VITE_BASE ?? "/",
  appType: "spa", // enables history-API fallback in dev so /level/3 reloads correctly
  build: {
    rollupOptions: {
      input: {
        main: indexHtml,
        notFound: notFoundHtml,
      },
    },
  },
});
