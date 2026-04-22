import assert from "node:assert/strict";
import test from "node:test";

import { applyLevelResult } from "../src/state/gameState";
import type { LevelStats, PlayerProfile, TeamProgress } from "../src/types";

const storage = new Map<string, string>();

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
    clear: () => storage.clear(),
  },
});

function stats(overrides: Partial<LevelStats> = {}): LevelStats {
  return {
    wpm: 5,
    accuracy: 50,
    timeSeconds: 30,
    errors: 10,
    totalKeystrokes: 100,
    passed: false,
    charHits: { f: 10, j: 10 },
    charErrors: { f: 5 },
    charAvgTimes: { f: 1200, j: 900 },
    ...overrides,
  };
}

function progress(highestUnlockedLevel: number): TeamProgress {
  return {
    levelRecords: {},
    highestUnlockedLevel,
    letterProgress: {},
  };
}

function profile(highestUnlockedLevel: number): PlayerProfile {
  return {
    activeTeam: "pokemon",
    teamSelected: true,
    difficulty: "hard",
    teams: {
      pokemon: progress(highestUnlockedLevel),
      mlp: progress(1),
    },
    speedTestHistory: [],
    activityLog: [],
  };
}

test("failed regular levels still clear the progression gate", () => {
  const next = applyLevelResult(profile(2), 2, stats());
  const pokemon = next.teams.pokemon;

  assert.equal(pokemon.levelRecords[2].completed, true);
  assert.equal(pokemon.highestUnlockedLevel, 3);
  assert.equal(next.activityLog[0].passed, false);
});

test("failed boss levels do not clear the progression gate", () => {
  const next = applyLevelResult(profile(5), 5, stats());
  const pokemon = next.teams.pokemon;

  assert.equal(pokemon.levelRecords[5].completed, false);
  assert.equal(pokemon.highestUnlockedLevel, 5);
  assert.equal(next.activityLog[0].passed, false);
});
