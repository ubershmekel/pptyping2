import assert from "node:assert/strict";
import test from "node:test";

import { parseRoute, routeToPath } from "../src/router";

test("parseRoute strips the deploy base path before matching routes", () => {
  assert.deepEqual(parseRoute("/pptyping2/", "/pptyping2/"), {
    screen: "main-menu",
  });
  assert.deepEqual(parseRoute("/pptyping2/team-select", "/pptyping2/"), {
    screen: "team-select",
  });
  assert.deepEqual(parseRoute("/pptyping2/cutscene/0", "/pptyping2/"), {
    screen: "cutscene",
    index: 0,
  });
});

test("routeToPath prefixes canonical routes with the deploy base path", () => {
  assert.equal(
    routeToPath({ screen: "main-menu" }, "/pptyping2/"),
    "/pptyping2/",
  );
  assert.equal(
    routeToPath({ screen: "level-select" }, "/pptyping2/"),
    "/pptyping2/level-select",
  );
  assert.equal(
    routeToPath({ screen: "level", number: 7 }, "/pptyping2/"),
    "/pptyping2/level/7",
  );
});
