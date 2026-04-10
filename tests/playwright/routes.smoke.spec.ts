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
    url: /\/team-select$/,
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
