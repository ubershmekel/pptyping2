import assert from "node:assert/strict";
import test from "node:test";

import { LEVELS } from "../src/data/levels";
import { ALL_LETTERS, LEVEL_LETTERS, LEVEL_TEXTS } from "../src/data/wordLists";

// All letters with a defined touch-typing finger assignment: full alphabet + space (level 21 covers all).
const FINGER_ASSIGNED = new Set(ALL_LETTERS);

// Must match the maxLength default in buildLines() in src/screens/levelScreen.ts
const MAX_LINE_CHARS = 32;
const MAX_WORD_LEN = 15;

function levelWords(levelNumber: number): string[] {
  return (LEVEL_TEXTS[levelNumber] ?? "").split(/\s+/).filter(Boolean);
}

test("all level availableLetters have a finger assignment", () => {
  for (const level of LEVELS) {
    for (const letter of level.availableLetters) {
      assert.ok(
        FINGER_ASSIGNED.has(letter),
        `Level ${level.number}: letter "${letter}" has no finger assignment`,
      );
    }
  }
});

test("no level word contains letters outside availableLetters", () => {
  for (const level of LEVELS) {
    const allowed = new Set(LEVEL_LETTERS[level.number] ?? "");
    for (const word of levelWords(level.number)) {
      for (const char of word) {
        assert.ok(
          allowed.has(char),
          `Level ${level.number}: word "${word}" contains disallowed letter "${char}"`,
        );
      }
    }
  }
});

test("no word exceeds 15 characters", () => {
  for (const level of LEVELS) {
    // Levels before spacebar is taught have no spaces by design — skip word-length check
    if (!LEVEL_LETTERS[level.number]?.includes(" ")) continue;
    for (const word of levelWords(level.number)) {
      assert.ok(
        word.length <= MAX_WORD_LEN,
        `Level ${level.number}: word "${word}" is ${word.length} chars (max ${MAX_WORD_LEN})`,
      );
    }
  }
});

test("no generated line exceeds MAX_LINE_CHARS", () => {
  for (const level of LEVELS) {
    const words = levelWords(level.number);
    let lineWords: string[] = [];
    for (const word of words) {
      const candidate =
        lineWords.length === 0 ? word : lineWords.join(" ") + " " + word;
      if (lineWords.length > 0 && candidate.length > MAX_LINE_CHARS) {
        // word starts a new line — verify it fits on its own
        assert.ok(
          word.length <= MAX_LINE_CHARS,
          `Level ${level.number}: word "${word}" alone (${word.length} chars) exceeds MAX_LINE_CHARS (${MAX_LINE_CHARS})`,
        );
        lineWords = [word];
      } else {
        lineWords.push(word);
      }
    }
  }
});

test("every level has at least 5 distinct words", () => {
  for (const level of LEVELS) {
    // Levels before spacebar is taught have no spaces by design — skip distinct-words check
    if (!LEVEL_LETTERS[level.number]?.includes(" ")) continue;
    const distinct = new Set(levelWords(level.number));
    assert.ok(
      distinct.size >= 5,
      `Level ${level.number}: only ${distinct.size} distinct word(s) (minimum 5)`,
    );
  }
});
