// ─── Level texts ─────────────────────────────────────────────────────────────
// Each level has a fixed, carefully chosen string to type.
// Letters are always lowercase. Only letters in the level's availableLetters set appear.

// Level 1: Speed test — full keyboard baseline
export const LEVEL_TEXTS: Record<number, string> = {
  1: "the quick brown fox jumps over the lazy dog and rests in the warm grass by the river",

  // Level 2: f + j only — no spaces
  2: "fjfjffjjfffjjjffffjjjjfjfjjjfff",

  // Level 3: f j d k — no spaces
  3: "fjdkfjkdfkdjdkjfjkdfkdfjkdjfkjdkfjdkfjkdfkdjdkjfjkdfkdfjkdjfkjd",

  // Level 4: f j + spacebar — introduces the spacebar
  4: "fjf jfj fff jjj fj jf fjfj jfjf fffj jjjf fjfjf jfjfj fjj jff jjjfff fjfjfjfj jfjfjfjf ffffjjjj jjjjffff ffjj",

  // Level 5: arc 1 finale — review f j d k + space
  5: "fjd jdk kfj djk jfd fkd djf kjd fkj dkf fjdk jkdf kdfj dfjk fjd jdk kfj djk jfd fkd djf kjd fkj dkf fjdk jkdf kdfj dfjk",

  // Level 6: learn a l with f j anchors
  6: "fal jal alf laj fla jla fjal jalf laff jalj alaf fjla fal jal alf laj fla jla fjal jalf laff jalj",

  // Level 7: learn i s with f j anchors
  7: "fis jis sif isj fsi jsi fjis jisf siff isjf fis jis sif isj fsi jsi fjis jisf siff isjf",

  // Level 8: learn h g with f j anchors
  8: "fhg jhg ghf fgh jhf hgj fjhg jhgf ghff hgjf fhg jhg ghf fgh jhf hgj fjhg jhgf ghff hgjf",

  // Level 9: arc 2 finale — review f j a l i s h g
  9: "flash jail fish lash sail hail gash sigh flag fig jig ails halls flash jail fish lash sail hail gash sigh",

  // Level 10: learn r o with f j anchors
  10: "fro jro rof ofj orf jor fjro jorf roff ofjr fro jro rof ofj orf jor fjro jorf roff ofjr",

  // Level 11: learn u w with f j anchors
  11: "fuw juw wuf uwj fwu jwu fjuw juwf wuff uwjf fuw juw wuf uwj fwu jwu fjuw juwf wuff uwjf",

  // Level 12: learn y e with f j anchors
  12: "fye jye yef ejy fey jey fjye jeyf yeff ejyf fye jye yef ejy fey jey fjye jeyf yeff ejyf",

  // Level 13: arc 3 finale — review f j r o u w y e
  13: "jury fury your fore wore joey four euro woe few rye ore joy row owe yore jury fury your fore wore joey",

  // Level 14: learn m c with f j anchors
  14: "fmc jmc cmf mcj fcm jcm fjmc jmcf cmff mcjf fmc jmc cmf mcj fcm jcm fjmc jmcf cmff mcjf",

  // Level 15: learn n t with f j anchors
  15: "fnt jnt tnf nfj ftn jtn fjnt jtnf tnff ntjf fnt jnt tnf nfj ftn jtn fjnt jtnf tnff ntjf",

  // Level 16: learn p b with f j anchors
  16: "fpb jpb pbf bfj fbp jbp fjpb jbpf pbff bfjp fpb jpb pbf bfj fbp jbp fjpb jbpf pbff bfjp",

  // Level 17: arc 4 finale — review f j m c n t p b
  17: "fjmc jntp pbtf mcnj jbtp fcnt tjpb bmnf fjmc jntp pbtf mcnj jbtp fcnt tjpb bmnf fjmc jntp",

  // Level 18: learn v x with f j anchors
  18: "fjvx vxfj jvxf xfvj fvjx jjvx ffxv xjfv fjvx vxfj jvxf xfvj fvjx jjvx ffxv xjfv",

  // Level 19: learn q z with f j anchors
  19: "fjqz zqfj jqzf fzqj qjfz jjqz ffzq qzfj fjqz zqfj jqzf fzqj qjfz jjqz ffzq qzfj",

  // Level 20: arc 5 finale — review f j v x q z
  20: "fjvx qzfj vxqj zjvf fxqz jvqz xzfj qjvx fjvx qzfj vxqj zjvf fxqz jvqz xzfj qjvx",

  // Level 21: final review — all letters
  21: "happy wizards and jumping zebras quickly mix bright fox cubs over woven jade quilts while tiny puppies frolic by charming green kiosks as jazzy velvet xylophones quiver softly",
};

// Helper: build a timed practice text for a level
export function getLevelText(levelNumber: number): string {
  return LEVEL_TEXTS[levelNumber] ?? LEVEL_TEXTS[1];
}

// Generate a drill text for training mode.
// Takes 6 drill letters, builds all full permutations (6! = 720), shuffles them,
// and picks 20 — giving a varied ~140-char text that changes each drill session.
function allPerms(arr: string[]): string[][] {
  if (arr.length <= 1) return [arr.slice()];
  return arr.flatMap((item, i) =>
    allPerms([...arr.slice(0, i), ...arr.slice(i + 1)]).map((rest) => [
      item,
      ...rest,
    ]),
  );
}

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function generateDrillText(letters: string[]): string {
  return shuffle(allPerms(letters))
    .slice(0, 20)
    .map((p) => p.join(""))
    .join(" ");
}

// Letters active at each level.
// Learn levels stay narrow: f/j anchors plus the current pair.
// Finale levels expand to the cumulative set for that arc.
// Space is included from level 4 onwards (taught at level 4).
export const ALL_LETTERS = "abcdefghijklmnopqrstuvwxyz ";
export const LEVEL_LETTERS: Record<number, string> = {
  1: ALL_LETTERS, // speed test: full alphabet
  2: "fj", // no space
  3: "fjdk", // no space
  4: "fj ", // space introduced
  5: "fjdk ", // arc 1 finale
  6: "fjal ",
  7: "fjis ",
  8: "fjhg ",
  9: "fjalisgh ", // arc 2 finale
  10: "fjro ",
  11: "fjuw ",
  12: "fjye ",
  13: "fjrouwye ", // arc 3 finale
  14: "fjmc ",
  15: "fjnt ",
  16: "fjpb ",
  17: "fjmcntpb ", // arc 4 finale
  18: "fjvx ",
  19: "fjqz ",
  20: "fjvxqz ", // arc 5 finale
  21: ALL_LETTERS, // final review: full alphabet
};
