# Content Integrity Tests

## Intent

This document specifies the unit tests that verify the static game content
(level definitions and word lists) is internally consistent and safe for the UI.
These tests run against `src/data/levels.ts` and `src/data/wordLists.ts` — they
catch authoring mistakes early without requiring a running browser.

All tests live in `test/content/` and use the same test runner as the rest of
the project.

## Tests

### 1 — Levels match their finger assignments

Every level's `availableLetters` set must be a subset of the letters that have a
defined finger assignment in the touch-typing map (see
`01b-teaching-touch-typing.md`).

**Test file**: `test/content/levelFingers.test.ts`

### 2 — No level's words introduce unallowed letters

For every level, every word in that level's word list must be constructible
entirely from the level's declared `availableLetters`. No character outside the
set (including any punctuation not taught) may appear in any word.

**Why**: A word containing an untaught letter would appear during gameplay
before the player has learned it, breaking the curriculum progression and
potentially causing unexpected finger guide behaviour.

**Test file**: `test/content/levelLetters.test.ts`

### 3 — No word exceeds the maximum line length

The typing engine lays out words in fixed-width lines. A single word that is
longer than the line width cap would overflow the UI. The maximum word length is
**15 characters**.

Every word in every level's word list must have `word.length <= 15`.

Additionally, the generated line length (the sum of word lengths plus one space
between each word for a line of the default word count) must not exceed the
configured line character cap. This cap is defined in
`src/config/typingEngine.ts` as `MAX_LINE_CHARS`.

**Why**: Long lines caused the UI to overflow. This test prevents regressions.

**Test file**: `test/content/lineLengths.test.ts`

### 4 — Every level has at least five distinct words

Every level's word list must contain at least **5 distinct words**. A list with
fewer unique words makes the typing content feel repetitive and, at the extreme,
could produce a level where the entire session types only one word. It's ok if
some words a gibberish.

**Why**: There was a real case during development where a level's word list
collapsed to a single word due to an over-restrictive letter filter. Five words
is the minimum that produces varied typing content.

**Test file**: `test/content/wordVariety.test.ts`

## Running

```
npx vitest run test/content/
```

These tests are fast (pure data, no async, no DOM) and should be included in the
default CI check.
