// ─── Level texts ─────────────────────────────────────────────────────────────
// Each level has a fixed, carefully chosen string to type.
// Letters are always lowercase. Only letters in the level's availableLetters set appear.

// Level 1: Speed test — full keyboard baseline
export const LEVEL_TEXTS: Record<number, string> = {
  1: "the quick brown fox jumps over the lazy dog and rests in the warm grass by the river",

  // Level 2: f + j only — classic homerow anchor drills
  2: "fjf jfj fff jjj fj jf fjfj jfjf fffj jjjf fjfjf jfjfj fjj jff jjjfff fjfjfjfj jfjfjfjf ffffjjjj jjjjffff ffjj jjff fjjfj jffj",

  // Level 3: f j e t
  3: "jet fee tee feet fete jeff eft jefe jet tee fee feet jet jete fjet tjef eft efj fje tef etf tet fef jej fet tej eft",

  // Level 4: f j e t o a
  4: "fate feat jot toe foe oat ate eat fat aft oft tote feta tat too off afoot fate feat jot foe oat ate fat tote fate feat jot toe",

  // Level 5: arc finale — review f j e t o a
  5: "fate feat toe oat foe eat fat off tote feta jot afoot ate aft oft fate feat toe oat ate fat foe jot tote off fate feat ate",

  // Level 6: f j e t o a i n — introduces i, n
  6: "into fine note tone nine teen often nation tone fine into note often into fine note tone nine teen often nation",

  // Level 7: f j e t o a i n h s — introduces h, s
  7: "shine those stone shine those stone fish this shine those stone fish thin shone those stone",

  // Level 8: f j e t o a i n h s r l — introduces r, l
  8: "their shirt roles short forest roles their shirt short forest shirt their roles short",

  // Level 9: arc finale — review f j e t o a i n h s r l
  9: "shore their finest honest forest stone shine short roles shirt those trail rains holes shore finest honest forest stone",

  // Level 10: + u d — introduces u, d
  10: "round found sound round found sound round found sound should round found sound should",

  // Level 11: + y w — introduces y, w
  11: "worthy worthy worthy worthy worthy worthy worthy worthy worthy worthy worthy worthy worthy",

  // Level 12: + m g — introduces m, g
  12: "among morning among morning among morning among morning among morning among morning among",

  // Level 13: arc finale — review f j e t o a i n h s r l u d y w m g
  13: "morning worthy ground found mighty growth world glory dream youth storm young drawn morning worthy ground found storm",

  // Level 14: + c p — introduces c, p
  14: "complete complete complete complete complete complete complete complete complete complete",

  // Level 15: + k b — introduces k, b
  15: "blanket blanket blanket blanket blanket blanket blanket blanket blanket blanket blanket",

  // Level 16: + v x — introduces v, x
  16: "vortex exactly vortex exactly vortex exactly vortex exactly vortex exactly vortex",

  // Level 17: + q z — full alphabet now available
  17: "the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog",

  // Level 18: arc finale — review full alphabet
  18: "sphinx of black quartz judge my vow five boxing wizards jump quickly the quick brown fox jumps over a lazy dog",

  // Level 19: final review — full alphabet
  19: "how vexingly daft jumping zebras pack my box with five dozen liquor jugs the quick brown fox jumps over the lazy dog",
};

// Helper: build a timed practice text for a level
export function getLevelText(levelNumber: number): string {
  return LEVEL_TEXTS[levelNumber] ?? LEVEL_TEXTS[1];
}

// Letters available at each level (cumulative, ordered by curriculum order fjetoainhsrludywmgcpkbvxqz)
// Finale levels reuse the same cumulative set as the prior learning level.
export const LEVEL_LETTERS: Record<number, string> = {
  1:  "abcdefghijklmnopqrstuvwxyz", // speed test: full alphabet
  2:  "fj",
  3:  "fjet",
  4:  "fjetoa",
  5:  "fjetoa",                     // arc 2 finale: reviews f j e t o a
  6:  "fjetoain",
  7:  "fjetoainhs",
  8:  "fjetoainhsrl",
  9:  "fjetoainhsrl",               // arc 3 finale: reviews all unlocked so far
  10: "fjetoainhsrlud",
  11: "fjetoainhsrludyw",
  12: "fjetoainhsrludywmg",
  13: "fjetoainhsrludywmg",         // arc 4 finale: reviews all unlocked so far
  14: "fjetoainhsrludywmgcp",
  15: "fjetoainhsrludywmgcpkb",
  16: "fjetoainhsrludywmgcpkbvx",
  17: "fjetoainhsrludywmgcpkbvxqz", // full alphabet
  18: "fjetoainhsrludywmgcpkbvxqz", // arc 5 finale: reviews all unlocked so far
  19: "abcdefghijklmnopqrstuvwxyz", // final review: full alphabet
};
