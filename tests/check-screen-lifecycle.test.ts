import assert from "node:assert/strict";
import test from "node:test";

import { findLifecycleViolations } from "../scripts/check-screen-lifecycle";

test("findLifecycleViolations flags raw screen lifecycle APIs", () => {
  const rootDir = "repo";
  const violations = findLifecycleViolations(rootDir, [
    {
      file: "repo/src/screens/example.ts",
      rules: [
        {
          regex: /\.addEventListener\s*\(/,
          message: "Use `mount.listen(...)`.",
        },
        {
          regex: /\b(?:window\.)?setTimeout\s*\(/,
          message: "Use `mount.timeout(...)`.",
        },
      ],
      source: [
        "const screen = document.createElement('div');",
        "screen.addEventListener('click', onClick);",
        "window.setTimeout(doThing, 100);",
      ].join("\n"),
    },
  ]);

  assert.deepEqual(
    violations.map((violation) => violation.replace(/\\\\/g, "/")),
    [
      "src/screens/example.ts:2: Use `mount.listen(...)`.",
      "src/screens/example.ts:3: Use `mount.timeout(...)`.",
    ],
  );
});

test("findLifecycleViolations can allow app-level requestAnimationFrame usage", () => {
  const rootDir = "repo";
  const violations = findLifecycleViolations(rootDir, [
    {
      file: "repo/src/app.ts",
      rules: [
        { regex: /\.addEventListener\s*\(/, message: "Use mount.listen." },
      ],
      source: "window.requestAnimationFrame(() => {});\n",
    },
  ]);

  assert.deepEqual(violations, []);
});
