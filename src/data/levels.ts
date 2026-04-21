import type { LevelDefinition } from "../types";
import { LEVEL_LETTERS } from "./wordLists";

export const LEVELS: LevelDefinition[] = [
  // Arc 1 — The Digital Grove
  {
    number: 1,
    arc: 1,
    isSpeedTest: true,
    isFinale: false,
    availableLetters: LEVEL_LETTERS[1],
  },
  {
    number: 2,
    arc: 1,
    isSpeedTest: false,
    isFinale: false,
    availableLetters: LEVEL_LETTERS[2],
  },
  {
    number: 3,
    arc: 1,
    isSpeedTest: false,
    isFinale: false,
    availableLetters: LEVEL_LETTERS[3],
  },
  {
    number: 4,
    arc: 1,
    isSpeedTest: false,
    isFinale: false,
    availableLetters: LEVEL_LETTERS[4],
  },
  {
    number: 5,
    arc: 1,
    isSpeedTest: false,
    isFinale: true,
    availableLetters: LEVEL_LETTERS[5],
  },
  // Arc 2 — The Thunder Shrine
  {
    number: 6,
    arc: 2,
    isSpeedTest: false,
    isFinale: false,
    availableLetters: LEVEL_LETTERS[6],
  },
  {
    number: 7,
    arc: 2,
    isSpeedTest: false,
    isFinale: false,
    availableLetters: LEVEL_LETTERS[7],
  },
  {
    number: 8,
    arc: 2,
    isSpeedTest: false,
    isFinale: false,
    availableLetters: LEVEL_LETTERS[8],
  },
  {
    number: 9,
    arc: 2,
    isSpeedTest: false,
    isFinale: true,
    availableLetters: LEVEL_LETTERS[9],
  },
  // Arc 3 — The Crystal Cavern
  {
    number: 10,
    arc: 3,
    isSpeedTest: false,
    isFinale: false,
    availableLetters: LEVEL_LETTERS[10],
  },
  {
    number: 11,
    arc: 3,
    isSpeedTest: false,
    isFinale: false,
    availableLetters: LEVEL_LETTERS[11],
  },
  {
    number: 12,
    arc: 3,
    isSpeedTest: false,
    isFinale: false,
    availableLetters: LEVEL_LETTERS[12],
  },
  {
    number: 13,
    arc: 3,
    isSpeedTest: false,
    isFinale: true,
    availableLetters: LEVEL_LETTERS[13],
  },
  // Arc 4 — The Stardrift Coast
  {
    number: 14,
    arc: 4,
    isSpeedTest: false,
    isFinale: false,
    availableLetters: LEVEL_LETTERS[14],
  },
  {
    number: 15,
    arc: 4,
    isSpeedTest: false,
    isFinale: false,
    availableLetters: LEVEL_LETTERS[15],
  },
  {
    number: 16,
    arc: 4,
    isSpeedTest: false,
    isFinale: false,
    availableLetters: LEVEL_LETTERS[16],
  },
  {
    number: 17,
    arc: 4,
    isSpeedTest: false,
    isFinale: true,
    availableLetters: LEVEL_LETTERS[17],
  },
  // Arc 5 — The Apex Summit
  {
    number: 18,
    arc: 5,
    isSpeedTest: false,
    isFinale: false,
    availableLetters: LEVEL_LETTERS[18],
  },
  {
    number: 19,
    arc: 5,
    isSpeedTest: false,
    isFinale: false,
    availableLetters: LEVEL_LETTERS[19],
  },
  {
    number: 20,
    arc: 5,
    isSpeedTest: false,
    isFinale: true,
    availableLetters: LEVEL_LETTERS[20],
  },
  {
    number: 21,
    arc: 5,
    isSpeedTest: true,
    isFinale: true,
    availableLetters: LEVEL_LETTERS[21],
  },
];

// Derived constants — import these instead of hardcoding level numbers elsewhere
export const MAX_LEVEL = LEVELS[LEVELS.length - 1].number;

// Maps each letter to the learn level that first introduces it.
// Finales and the speed-test levels are excluded — only the drill levels count.
const LEARN_LEVEL_CHARS: Array<{ level: number; chars: string }> = [
  { level: 2, chars: "fj" },
  { level: 3, chars: "dk" },
  { level: 4, chars: " " }, // spacebar
  { level: 6, chars: "oa" },
  { level: 7, chars: "in" },
  { level: 8, chars: "hs" },
  { level: 10, chars: "rl" },
  { level: 11, chars: "ue" },
  { level: 12, chars: "yw" },
  { level: 14, chars: "mg" },
  { level: 15, chars: "cp" },
  { level: 16, chars: "tb" },
  { level: 18, chars: "vx" },
  { level: 19, chars: "qz" },
];

export const CHAR_TO_LEARN_LEVEL: Record<string, number> = {};
for (const { level, chars } of LEARN_LEVEL_CHARS) {
  for (const c of chars) {
    CHAR_TO_LEARN_LEVEL[c] = level;
  }
}

export function getLevelDef(number: number): LevelDefinition {
  return LEVELS.find((l) => l.number === number) ?? LEVELS[0];
}

// Navigation helpers
// Cutscenes fire after arc finale levels: 5, 9, 13, 17, 21
const CUTSCENE_AFTER_LEVEL: Record<number, number> = {
  5: 1,
  9: 2,
  13: 3,
  17: 4,
  21: 5,
};
// Cutscene 0 fires before level 1 (opening)
const LEVEL_AFTER_CUTSCENE: Record<number, number | null> = {
  0: 1,
  1: 6,
  2: 10,
  3: 14,
  4: 18,
  5: null,
};

export function cutsceneAfterLevel(levelNumber: number): number | null {
  return CUTSCENE_AFTER_LEVEL[levelNumber] ?? null;
}

export function levelAfterCutscene(cutsceneIndex: number): number | null {
  return LEVEL_AFTER_CUTSCENE[cutsceneIndex] ?? null;
}

// Environment per arc
export const ARC_ENVIRONMENTS: Record<
  number,
  { name: string; cssClass: string }
> = {
  1: { name: "The Digital Grove", cssClass: "env-digital-grove" },
  2: { name: "The Thunder Shrine", cssClass: "env-thunder-shrine" },
  3: { name: "The Crystal Cavern", cssClass: "env-crystal-cavern" },
  4: { name: "The Stardrift Coast", cssClass: "env-stardrift-coast" },
  5: { name: "The Apex Summit", cssClass: "env-apex-summit" },
};
