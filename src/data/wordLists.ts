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

  // Level 4: arc 1 finale — review f j e t
  4: "feet jet fee tee fete jeff eft feet jet fee tee fete jeff eft feet jet fee tee fete eft jet feet fee tee jeff eft fete jet",

  // Level 5: + o a (fjetoa)
  5: "fate feat jot toe foe oat ate eat fat aft oft tote feta tat too off afoot fate feat jot foe oat ate fat tote fate feat jot toe",

  // Level 6: + i n (fjetoain)
  6: "into fine note tone nine teen often nation tone fine into note often into fine note tone nine teen often nation",

  // Level 7: + h s (fjetoainhs)
  7: "shine those stone fish this often nation tone fine into note shine those stone fish thin shone those stone",

  // Level 8: arc 2 finale — review f j o a i n h s
  8: "honest faith shine those stone fish into fine note tone nation haste feast satin shine those stone fish honest faith into fine",

  // Level 9: + r l (fjetoainhsrl)
  9: "their shirt roles short forest roles their shirt short forest shirt their roles short forest trail rains holes",

  // Level 10: + u d (fjetoainhsrlud)
  10: "round found sound round found sound round found sound should round found sound should",

  // Level 11: + y w (fjetoainhsrludyw)
  11: "worthy worthy worthy worthy worthy worthy worthy worthy worthy worthy worthy worthy worthy",

  // Level 12: arc 3 finale — review f j r l u d y w (cumulative: all unlocked)
  12: "worthy study world youth round truly dusty rusty shield thunder wander journal thirst forest finest slowly worthy study world youth",

  // Level 13: + m g (fjetoainhsrludywmg)
  13: "among morning among morning among morning among morning among morning among morning among",

  // Level 14: + c p (fjetoainhsrludywmgcp)
  14: "complete complete complete complete complete complete complete complete complete complete",

  // Level 15: + k b (fjetoainhsrludywmgcpkb)
  15: "blanket blanket blanket blanket blanket blanket blanket blanket blanket blanket blanket",

  // Level 16: arc 4 finale — review f j m g c p k b (cumulative: all unlocked)
  16: "kingdom blanket problem compact morning whisper broken graphic camping market kingdom blanket problem compact morning whisper broken",

  // Level 17: + v x (fjetoainhsrludywmgcpkbvx)
  17: "vortex exactly vortex exactly vortex exactly vortex exactly vortex exactly vortex",

  // Level 18: + q z — full alphabet now available
  18: "the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog",

  // Level 19: arc 5 finale — review f j v x q z (cumulative: full alphabet)
  19: "sphinx of black quartz judge my vow five boxing wizards jump quickly the quick brown fox jumps over a lazy dog",

  // Level 20: final review — all letters
  20: "how vexingly daft jumping zebras pack my box with five dozen liquor jugs the quick brown fox jumps over the lazy dog",
};

// Helper: build a timed practice text for a level
export function getLevelText(levelNumber: number): string {
  return LEVEL_TEXTS[levelNumber] ?? LEVEL_TEXTS[1];
}

// Letters available at each level (cumulative, ordered by curriculum order fjetoainhsrludywmgcpkbvxqz)
// Finale levels reuse the same cumulative set as the prior learning level.
export const LEVEL_LETTERS: Record<number, string> = {
  1: "abcdefghijklmnopqrstuvwxyz", // speed test: full alphabet
  2: "fj",
  3: "fjet",
  4: "fjet", // arc 1 finale: reviews f j e t
  5: "fjetoa",
  6: "fjetoain",
  7: "fjetoainhs",
  8: "fjetoainhs", // arc 2 finale: reviews all unlocked so far
  9: "fjetoainhsrl",
  10: "fjetoainhsrlud",
  11: "fjetoainhsrludyw",
  12: "fjetoainhsrludyw", // arc 3 finale: reviews all unlocked so far
  13: "fjetoainhsrludywmg",
  14: "fjetoainhsrludywmgcp",
  15: "fjetoainhsrludywmgcpkb",
  16: "fjetoainhsrludywmgcpkb", // arc 4 finale: reviews all unlocked so far
  17: "fjetoainhsrludywmgcpkbvx",
  18: "fjetoainhsrludywmgcpkbvxqz", // full alphabet
  19: "fjetoainhsrludywmgcpkbvxqz", // arc 5 finale: reviews all unlocked so far
  20: "abcdefghijklmnopqrstuvwxyz", // final review: full alphabet
};
