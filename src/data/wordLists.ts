// ─── Level texts ─────────────────────────────────────────────────────────────
// Each level has a fixed, carefully chosen string to type.
// Letters are always lowercase. Only letters in the level's availableLetters set appear.

// Level 1: Speed test — full keyboard baseline
export const LEVEL_TEXTS: Record<number, string> = {
  1: "the quick brown fox jumps over the lazy dog and rests in the warm grass by the river",

  // Level 2: f + j only — no spaces
  2: "fjfjffjjfffjjjffffjjjjfjfjjjfff",

  // Level 3: f j e t — no spaces
  3: "jetfeeteefetefejeffeftjefejetteefeetejetjetefjetjtefeftejefetfeje",

  // Level 4: f j + spacebar — introduces the spacebar
  4: "fjf jfj fff jjj fj jf fjfj jfjf fffj jjjf fjfjf jfjfj fjj jff jjjfff fjfjfjfj jfjfjfjf ffffjjjj jjjjffff ffjj",

  // Level 5: arc 1 finale — review f j e t + space
  5: "feet jet fee tee fete jeff eft feet jet fee tee fete jeff eft feet jet fee tee fete eft jet feet fee tee jeff eft fete jet",

  // Level 6: learn o a with f j anchors
  6: "foj joa oaf afo fjoa jofa foaf jajo foj joa oaf afo fjoa jofa foaf jajo",

  // Level 7: learn i n with f j anchors
  7: "fin jin nif jif fjin jiff jinn nifi fin jin nif jif fjin jiff jinn nifi",

  // Level 8: learn h s with f j anchors
  8: "fjhs shfj hsjf jhss fjsh shjs jjff hhss fjhs shfj hsjf jhss fjsh shjs jjff hhss",

  // Level 9: arc 2 finale — review f j o a i n h s
  9: "finish fashion jason shoji oasis join fish finish fashion jason shoji oasis join fish",

  // Level 10: learn r l with f j anchors
  10: "fjrl jrfl rljf lfjr frjl jrlf llfj rrjf fjrl jrfl rljf lfjr frjl jrlf llfj rrjf",

  // Level 11: learn u d with f j anchors
  11: "fjud judf dujf fudj jufu duud judd fujd fjud judf dujf fudj jufu duud judd fujd",

  // Level 12: learn y w with f j anchors
  12: "fjwy wyfj jywf wfyj fwyj jyyf wwfj yjfw fjwy wyfj jywf wfyj fwyj jyyf wwfj yjfw",

  // Level 13: arc 3 finale — review f j r l u d y w
  13: "jury july fury duly wryly drury jury july fury duly wryly drury",

  // Level 14: learn m g with f j anchors
  14: "fjmg gmfj mjfg gfmj jgmf ffgm jjmg mgfj fjmg gmfj mjfg gfmj jgmf ffgm jjmg mgfj",

  // Level 15: learn c p with f j anchors
  15: "fjcp pcfj cjpf pfcj jcpf ffcp jjpc cpfj fjcp pcfj cjpf pfcj jcpf ffcp jjpc cpfj",

  // Level 16: learn k b with f j anchors
  16: "fjkb bkfj kjbf bfjk jkbf ffkb jjbk kbfj fjkb bkfj kjbf bfjk jkbf ffkb jjbk kbfj",

  // Level 17: arc 4 finale — review f j m g c p k b
  17: "fjmg gcmp pcbg kbfj mgcp jbfg pcfj mgkb fjmg gcmp pcbg kbfj mgcp jbfg pcfj mgkb",

  // Level 18: learn v x with f j anchors
  18: "fjvx vxfj jvxf xfvj fvjx jjvx ffxv xjfv fjvx vxfj jvxf xfvj fvjx jjvx ffxv xjfv",

  // Level 19: learn q z with f j anchors
  19: "fjqz zqfj jqzf fzqj qjfz jjqz ffzq qzfj fjqz zqfj jqzf fzqj qjfz jjqz ffzq qzfj",

  // Level 20: arc 5 finale — review f j v x q z
  20: "fjvx qzfj vxqj zjvf fxqz jvqz xzfj qjvx fjvx qzfj vxqj zjvf fxqz jvqz xzfj qjvx",

  // Level 21: final review — all letters
  21: "how vexingly daft jumping zebras pack my box with five dozen liquor jugs the quick brown fox jumps over the lazy dog",
};

// Helper: build a timed practice text for a level
export function getLevelText(levelNumber: number): string {
  return LEVEL_TEXTS[levelNumber] ?? LEVEL_TEXTS[1];
}

// Letters active at each level.
// Learn levels stay narrow: f/j anchors plus the current pair.
// Finale levels expand to the cumulative set for that arc.
// Space is included from level 4 onwards (taught at level 4).
export const LEVEL_LETTERS: Record<number, string> = {
  1: "abcdefghijklmnopqrstuvwxyz", // speed test: full alphabet (no space needed)
  2: "fj", // no space
  3: "fjet", // no space
  4: "fj ", // space introduced
  5: "fjet ", // arc 1 finale
  6: "fjoa ",
  7: "fjin ",
  8: "fjhs ",
  9: "fjoainhs ", // arc 2 finale
  10: "fjrl ",
  11: "fjud ",
  12: "fjyw ",
  13: "fjrludyw ", // arc 3 finale
  14: "fjmg ",
  15: "fjcp ",
  16: "fjkb ",
  17: "fjmgcpkb ", // arc 4 finale
  18: "fjvx ",
  19: "fjqz ",
  20: "fjvxqz ", // arc 5 finale
  21: "abcdefghijklmnopqrstuvwxyz ", // final review: full alphabet + space
};
