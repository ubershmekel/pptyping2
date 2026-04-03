// ─── Level texts ─────────────────────────────────────────────────────────────
// Each level has a fixed, carefully chosen string to type.
// Letters are always lowercase. Levels 3+ are stubs for now (full game expansion).

// Level 1: Speed test — two short sentences using common letters (no caps, no punctuation)
export const LEVEL_TEXTS: Record<number, string> = {
  1: "the quick brown fox jumps over the lazy dog and rests in the warm grass by the river",

  // Level 2: f + j only — classic homerow anchor drills
  2: "fjf jfj fff jjj fj jf fjfj jfjf fffj jjjf fjfjf jfjfj fjj jff jjjfff fjfjfjfj jfjfjfjf ffffjjjj jjjjffff ffjj jjff fjjfj jffj",

  // Level 3: f j e t
  3: "jet fee tee feet fete jeff eft jefe jet tee fee feet jet jete fjet tjef eft efj fje tef etf tet fef jej fet tej eft",

  // Level 4: f j e t o a
  4: "fate feat jot toe foe oat ate eat fat aft oft tote feta tat too off afoot fate feat jot foe oat ate fat tote fate feat jot toe",

  // Level 5: f j e t o a i n
  5: "into fine note tone nine teen often nation tone fine into note often into fine note tone nine teen often nation",

  // Level 6: f j e t o a i n h s
  6: "shine those stone shine those stone fish this shine those stone fish thin shone those stone",

  // Level 7: f j e t o a i n h s r l
  7: "their shirt roles short forest roles their shirt short forest shirt their roles short",

  // Level 8: f j e t o a i n h s r l u d
  8: "round found sound round found sound round found sound should round found sound should",

  // Level 9: f j e t o a i n h s r l u d y w
  9: "worthy worthy worthy worthy worthy worthy worthy worthy worthy worthy worthy worthy worthy",

  // Level 10: + m g
  10: "among morning among morning among morning among morning among morning among morning among",

  // Level 11: + c p
  11: "complete complete complete complete complete complete complete complete complete complete",

  // Level 12: + k b
  12: "blanket blanket blanket blanket blanket blanket blanket blanket blanket blanket blanket",

  // Level 13: + v x
  13: "vortex exactly vortex exactly vortex exactly vortex exactly vortex exactly vortex",

  // Level 14: + q z — full alphabet
  14: "the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog",
};

// Helper: build a timed practice text for a level
export function getLevelText(levelNumber: number): string {
  return LEVEL_TEXTS[levelNumber] ?? LEVEL_TEXTS[1];
}

// Letters available at each level (cumulative, ordered by English frequency)
export const LEVEL_LETTERS: Record<number, string> = {
  1: "abcdefghijklmnopqrstuvwxyz", // speed test: full alphabet
  2: "fj",
  3: "fjet",
  4: "fjetoa",
  5: "fjetoain",
  6: "fjetoainhs",
  7: "fjetoainhsrl",
  8: "fjetoainhsrlud",
  9: "fjetoainhsrludyw",
  10: "fjetoainhsrludywmg",
  11: "fjetoainhsrludywmgcp",
  12: "fjetoainhsrludywmgcpkb",
  13: "fjetoainhsrludywmgcpkbvx",
  14: "abcdefghijklmnopqrstuvwxyz",
};
