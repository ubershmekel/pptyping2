import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { MAX_LEVEL } from "../src/data/levels";

const DIST_DIR = path.resolve("dist");
const INDEX_HTML_PATH = path.join(DIST_DIR, "index.html");
const CUTSCENE_COUNT = 6;

function getStaticRoutes(): string[] {
  return [
    "/team-select",
    "/level-select",
    "/settings",
    "/debug-particles",
    ...Array.from({ length: MAX_LEVEL }, (_, index) => `/level/${index + 1}`),
    ...Array.from(
      { length: CUTSCENE_COUNT },
      (_, index) => `/cutscene/${index}`,
    ),
  ];
}

async function writeRouteEntry(route: string, html: string): Promise<void> {
  const routeDir = path.join(DIST_DIR, route.slice(1));
  const outputPath = path.join(routeDir, "index.html");
  await mkdir(routeDir, { recursive: true });
  await writeFile(outputPath, html);
}

async function main(): Promise<void> {
  const html = await readFile(INDEX_HTML_PATH, "utf8");
  await Promise.all(
    getStaticRoutes().map((route) => writeRouteEntry(route, html)),
  );
}

await main();
