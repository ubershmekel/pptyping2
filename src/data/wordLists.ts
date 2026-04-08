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

  // Level 5: learn o a with f j anchors
  5: "foj joa oaf afo fjoa jofa foaf jajo foj joa oaf afo fjoa jofa foaf jajo",

  // Level 6: learn i n with f j anchors
  6: "fin jin nif jif fjin jiff jinn nifi fin jin nif jif fjin jiff jinn nifi",

  // Level 7: learn h s with f j anchors
  7: "fjhs shfj hsjf jhss fjsh shjs jjff hhss fjhs shfj hsjf jhss fjsh shjs jjff hhss",

  // Level 8: arc 2 finale — review f j o a i n h s
  8: "finish fashion jason shoji oasis join fish finish fashion jason shoji oasis join fish",

  // Level 9: learn r l with f j anchors
  9: "fjrl jrfl rljf lfjr frjl jrlf llfj rrjf fjrl jrfl rljf lfjr frjl jrlf llfj rrjf",

  // Level 10: learn u d with f j anchors
  10: "fjud judf dujf fudj jufu duud judd fujd fjud judf dujf fudj jufu duud judd fujd",

  // Level 11: learn y w with f j anchors
  11: "fjwy wyfj jywf wfyj fwyj jyyf wwfj yjfw fjwy wyfj jywf wfyj fwyj jyyf wwfj yjfw",

  // Level 12: arc 3 finale — review f j r l u d y w
  12: "jury july fury duly wryly drury jury july fury duly wryly drury",

  // Level 13: learn m g with f j anchors
  13: "fjmg gmfj mjfg gfmj jgmf ffgm jjmg mgfj fjmg gmfj mjfg gfmj jgmf ffgm jjmg mgfj",

  // Level 14: learn c p with f j anchors
  14: "fjcp pcfj cjpf pfcj jcpf ffcp jjpc cpfj fjcp pcfj cjpf pfcj jcpf ffcp jjpc cpfj",

  // Level 15: learn k b with f j anchors
  15: "fjkb bkfj kjbf bfjk jkbf ffkb jjbk kbfj fjkb bkfj kjbf bfjk jkbf ffkb jjbk kbfj",

  // Level 16: arc 4 finale — review f j m g c p k b
  16: "fjmg gcmp pcbg kbfj mgcp jbfg pcfj mgkb fjmg gcmp pcbg kbfj mgcp jbfg pcfj mgkb",

  // Level 17: learn v x with f j anchors
  17: "fjvx vxfj jvxf xfvj fvjx jjvx ffxv xjfv fjvx vxfj jvxf xfvj fvjx jjvx ffxv xjfv",

  // Level 18: learn q z with f j anchors
  18: "fjqz zqfj jqzf fzqj qjfz jjqz ffzq qzfj fjqz zqfj jqzf fzqj qjfz jjqz ffzq qzfj",

  // Level 19: arc 5 finale — review f j v x q z
  19: "fjvx qzfj vxqj zjvf fxqz jvqz xzfj qjvx fjvx qzfj vxqj zjvf fxqz jvqz xzfj qjvx",

  // Level 20: final review — all letters
  20: "how vexingly daft jumping zebras pack my box with five dozen liquor jugs the quick brown fox jumps over the lazy dog",
};

// Helper: build a timed practice text for a level
export function getLevelText(levelNumber: number): string {
  return LEVEL_TEXTS[levelNumber] ?? LEVEL_TEXTS[1];
}

// Letters active at each level.
// Learn levels stay narrow: f/j anchors plus the current pair.
// Finale levels expand to the cumulative set for that arc.
export const LEVEL_LETTERS: Record<number, string> = {
  1: "abcdefghijklmnopqrstuvwxyz", // speed test: full alphabet
  2: "fj",
  3: "fjet",
  4: "fjet", // arc 1 finale: reviews arc 1
  5: "fjoa",
  6: "fjin",
  7: "fjhs",
  8: "fjoainhs", // arc 2 finale: cumulative within arc 2
  9: "fjrl",
  10: "fjud",
  11: "fjyw",
  12: "fjrludyw", // arc 3 finale: cumulative within arc 3
  13: "fjmg",
  14: "fjcp",
  15: "fjkb",
  16: "fjmgcpkb", // arc 4 finale: cumulative within arc 4
  17: "fjvx",
  18: "fjqz",
  19: "fjvxqz", // arc 5 finale: cumulative within arc 5
  20: "abcdefghijklmnopqrstuvwxyz", // final review: full alphabet
};
