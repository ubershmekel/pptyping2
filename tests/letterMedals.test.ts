import assert from "node:assert/strict";
import test from "node:test";

import {
  applyLetterProgress,
  evaluateFinaleMedals,
} from "../src/state/letterMedals";
import type { LevelDefinition, LevelStats, TeamProgress } from "../src/types";

const finaleLevel: LevelDefinition = {
  number: 5,
  arc: 1,
  isSpeedTest: false,
  isFinale: true,
  availableLetters: "fjdk ",
};

function stats(
  overrides: Partial<
    Pick<LevelStats, "charHits" | "charErrors" | "charAvgTimes">
  >,
): LevelStats {
  return {
    wpm: 30,
    accuracy: 95,
    timeSeconds: 30,
    errors: 0,
    totalKeystrokes: 100,
    passed: true,
    charHits: { f: 10, j: 10, d: 10, k: 10, " ": 10 },
    charErrors: {},
    charAvgTimes: { f: 800, j: 600, d: 400, k: 300, " ": 500 },
    ...overrides,
  };
}

test("finale medal evaluation assigns tiers from per-letter WPM", () => {
  const evaluation = evaluateFinaleMedals(finaleLevel, stats({}));

  assert.equal(evaluation.heartbreak, false);
  assert.deepEqual(
    evaluation.results.map((result) => [result.letter, result.medal]),
    [
      ["f", "bronze"],
      ["j", "silver"],
      ["d", "gold"],
      ["k", "gold"],
      [" ", "silver"],
    ],
  );
});

test("heartbreak prevents every medal in the run", () => {
  const evaluation = evaluateFinaleMedals(
    finaleLevel,
    stats({
      charErrors: { d: 5 },
      charAvgTimes: { f: 800, j: 600, d: 400, k: 300, " ": 500 },
    }),
  );

  assert.equal(evaluation.heartbreak, true);
  assert.ok(evaluation.results.every((result) => result.medal === "none"));
});

test("letter progress keeps highest medals and still records heartbreak stats", () => {
  const progress: TeamProgress = {
    levelRecords: {},
    highestUnlockedLevel: 5,
    letterProgress: {
      d: {
        medal: "gold",
        totalHits: 4,
        recentWpm: 30,
        recentAccuracy: 100,
        recentRuns: [{ wpm: 30, accuracy: 100 }],
      },
    },
  };

  const next = applyLetterProgress(
    progress,
    stats({
      charErrors: { d: 5 },
      charAvgTimes: { f: 800, j: 600, d: 400, k: 300, " ": 500 },
    }),
    finaleLevel,
  );

  assert.equal(next.letterProgress.d.medal, "gold");
  assert.equal(next.letterProgress.d.totalHits, 14);
  assert.equal(next.letterProgress.d.recentRuns.length, 2);
});

test("letter progress records normal level stats without awarding medals", () => {
  const progress: TeamProgress = {
    levelRecords: {},
    highestUnlockedLevel: 3,
    letterProgress: {},
  };

  const next = applyLetterProgress(
    progress,
    stats({
      charHits: { d: 8, k: 6 },
      charErrors: { k: 2 },
      charAvgTimes: { d: 700, k: 500 },
    }),
  );

  assert.equal(next.letterProgress.d.medal, "none");
  assert.equal(next.letterProgress.d.totalHits, 8);
  assert.equal(next.letterProgress.d.recentWpm, 17);
  assert.equal(next.letterProgress.k.recentAccuracy, 75);
});
