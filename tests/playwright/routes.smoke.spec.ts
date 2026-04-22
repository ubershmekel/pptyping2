import { expect, test, type Page } from "@playwright/test";

const STORAGE_KEY = "pptyping_profile";

type PlayerProfile = {
  activeTeam: "pokemon" | "mlp";
  teamSelected: boolean;
  difficulty: "easy" | "medium" | "hard";
  teams: {
    pokemon: {
      levelRecords: Record<
        number,
        { bestWpm: number; bestAccuracy: number; completed: boolean }
      >;
      highestUnlockedLevel: number;
    };
    mlp: {
      levelRecords: Record<
        number,
        { bestWpm: number; bestAccuracy: number; completed: boolean }
      >;
      highestUnlockedLevel: number;
    };
  };
  speedTestHistory: Array<{ date: string; wpm: number; accuracy: number }>;
  activityLog: Array<{
    date: string;
    levelNumber: number;
    wpm: number;
    accuracy: number;
    passed: boolean;
  }>;
};

function buildSavedProfile(): PlayerProfile {
  return {
    activeTeam: "pokemon",
    teamSelected: true,
    difficulty: "easy",
    teams: {
      pokemon: {
        levelRecords: {
          1: { bestWpm: 31, bestAccuracy: 97, completed: true },
          2: { bestWpm: 26, bestAccuracy: 95, completed: true },
          3: { bestWpm: 0, bestAccuracy: 0, completed: false },
        },
        highestUnlockedLevel: 3,
      },
      mlp: {
        levelRecords: {
          1: { bestWpm: 0, bestAccuracy: 0, completed: false },
        },
        highestUnlockedLevel: 1,
      },
    },
    speedTestHistory: [],
    activityLog: [],
  };
}

async function seedProfile(page: Page, profile?: PlayerProfile) {
  if (!profile) {
    await page.addInitScript((key) => {
      window.localStorage.removeItem(key);
    }, STORAGE_KEY);
    return;
  }

  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, value);
    },
    { key: STORAGE_KEY, value: JSON.stringify(profile) },
  );
}

async function pressCurrentCharacter(
  page: Page,
  options: { makeMistake?: boolean } = {},
) {
  const currentChar = page
    .locator('.level-screen .char[data-state="current"]')
    .first();
  await expect(currentChar).toBeVisible();

  const raw = ((await currentChar.textContent()) ?? "").replace(/\u00a0/g, " ");
  const key = raw.toLowerCase();
  const keyPress = key === " " ? "Space" : key;

  if (options.makeMistake) {
    const wrongKey = key === "x" ? "z" : "x";
    await page.keyboard.press(wrongKey);
  }

  await page.keyboard.press(keyPress);
}

async function completeLevelWithMistakes(page: Page) {
  for (let i = 0; i < 400; i++) {
    if (await page.locator(".level-complete-screen").isVisible()) return;
    if (
      (await page
        .locator('.level-screen .char[data-state="current"]')
        .count()) === 0
    ) {
      await page.waitForTimeout(50);
      continue;
    }
    await pressCurrentCharacter(page, { makeMistake: true });
  }
  throw new Error("Level did not complete within the safety bound.");
}

const freshRouteCases = [
  {
    name: "main menu",
    path: "/",
    url: /\/$/,
    selector: ".main-menu-screen",
  },
  {
    name: "team select",
    path: "/team-select",
    url: /\/team-select$/,
    selector: ".team-select-screen",
  },
  {
    name: "settings",
    path: "/settings",
    url: /\/settings$/,
    selector: ".settings-screen",
  },
  {
    name: "debug particles",
    path: "/debug-particles",
    url: /\/debug-particles$/,
    selector: ".debug-particles-screen",
  },
  {
    name: "level-select guard redirect",
    path: "/level-select",
    url: /\/team-select/,
    selector: ".team-select-screen",
  },
] as const;

const savedRouteCases = [
  {
    name: "level select",
    path: "/level-select",
    url: /\/level-select$/,
    selector: ".level-select-screen",
  },
  {
    name: "opening cutscene",
    path: "/cutscene/0",
    url: /\/cutscene\/0$/,
    selector: ".cutscene-screen",
  },
  {
    name: "level 1 intro",
    path: "/level/1",
    url: /\/level\/1$/,
    selector: ".speed-test-intro-screen",
  },
] as const;

for (const route of freshRouteCases) {
  test(`fresh profile route smoke: ${route.name}`, async ({ page }) => {
    await seedProfile(page);
    await page.goto(route.path);
    await expect(page).toHaveURL(route.url);
    await expect(page.locator(route.selector)).toBeVisible();
  });
}

for (const route of savedRouteCases) {
  test(`saved profile route smoke: ${route.name}`, async ({ page }) => {
    await seedProfile(page, buildSavedProfile());
    await page.goto(route.path);
    await expect(page).toHaveURL(route.url);
    await expect(page.locator(route.selector)).toBeVisible();
  });
}

// ─── Multi-letter-intro regression ───────────────────────────────────────────
//
// Level 5 introduces two new letters ("o" then "a").  Before the :key fix in
// LevelFlow.vue, the second letter-intro never re-mounted, so the "a" screen
// stayed broken and the player could not proceed to the finger guide.

function buildLevel6Profile(): PlayerProfile {
  // Levels 1–5 completed so level 6 is unlocked.
  const levelRecords: PlayerProfile["teams"]["pokemon"]["levelRecords"] = {};
  for (let n = 1; n <= 5; n++) {
    levelRecords[n] = { bestWpm: 30, bestAccuracy: 95, completed: true };
  }
  return {
    activeTeam: "pokemon",
    teamSelected: true,
    difficulty: "easy",
    teams: {
      pokemon: { levelRecords, highestUnlockedLevel: 6 },
      mlp: { levelRecords: {}, highestUnlockedLevel: 1 },
    },
    speedTestHistory: [],
    activityLog: [],
  };
}

test("level 6 letter-intro: both letters advance and reach finger guide", async ({
  page,
}) => {
  await seedProfile(page, buildLevel6Profile());
  await page.goto("/level/6");

  // ── First letter intro ("o") ──────────────────────────────────────────────
  await expect(page.locator(".letter-intro-screen")).toBeVisible();
  // The displayed letter should be "O"
  await expect(page.locator(".li-letter")).toHaveText("O");

  // Press "o" three times to complete the first intro
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press("o");
    // Small wait for animation between presses
    await page.waitForTimeout(50);
  }

  // ── Second letter intro ("a") ─────────────────────────────────────────────
  // This is the regression case: without the :key fix the component was not
  // remounted and the screen stayed on "o" / was non-functional.
  await expect(page.locator(".li-letter")).toHaveText("A", { timeout: 2000 });

  // Press "a" three times
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press("a");
    await page.waitForTimeout(50);
  }

  // ── Finger guide ──────────────────────────────────────────────────────────
  await expect(page.locator(".finger-guide-screen")).toBeVisible({
    timeout: 2000,
  });
});

test("pause menu retry restarts the current level attempt", async ({
  page,
}) => {
  await seedProfile(page, buildLevel6Profile());
  await page.goto("/level/5");

  await expect(page.locator(".finger-guide-screen")).toBeVisible();
  await page.getByRole("button", { name: /start level/i }).click();
  await expect(page.locator(".level-screen")).toBeVisible();

  await pressCurrentCharacter(page);
  await expect(
    page.locator('.level-screen .char[data-state="done"]'),
  ).toHaveCount(1);

  await page.getByRole("button", { name: "Pause" }).click();
  await expect(page.getByRole("dialog", { name: "Paused" })).toBeVisible();
  await page.getByRole("button", { name: "Retry" }).click();

  await expect(page.locator(".level-screen")).toBeVisible();
  await expect(
    page.locator('.level-screen .char[data-state="done"]'),
  ).toHaveCount(0);
});

test("failed level retry returns to the finger guide", async ({ page }) => {
  await seedProfile(page, buildLevel6Profile());
  await page.goto("/level/5");

  await expect(page.locator(".finger-guide-screen")).toBeVisible();
  await page.getByRole("button", { name: /start level/i }).click();
  await expect(page.locator(".level-screen")).toBeVisible();

  await completeLevelWithMistakes(page);

  await expect(page.locator(".level-complete-screen.lc-failed")).toBeVisible();
  await page.getByRole("button", { name: "Retry" }).click();

  await expect(page).toHaveURL(/\/level\/5$/);
  await expect(page.locator(".finger-guide-screen")).toBeVisible();
});
