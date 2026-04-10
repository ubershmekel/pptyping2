// Shared keyboard metadata used by FingerGuide.vue and LetterIntro.vue

export interface KeyMeta {
  capId: string;
  labelId: string;
  finger: string;
}

export const KEY_DATA: Record<string, KeyMeta> = {
  q: { capId: "rect2252", labelId: "text5474", finger: "left-pinky" },
  w: { capId: "rect2254", labelId: "text5482", finger: "left-ring" },
  e: { capId: "rect2256", labelId: "text5492", finger: "left-middle" },
  r: { capId: "rect2258", labelId: "text5500", finger: "left-index" },
  t: { capId: "rect2262", labelId: "text5504", finger: "left-index" },
  y: { capId: "rect2264", labelId: "text5518", finger: "right-index" },
  u: { capId: "rect2266", labelId: "text5522", finger: "right-index" },
  i: { capId: "rect2270", labelId: "text5526", finger: "right-middle" },
  o: { capId: "rect2272", labelId: "text5530", finger: "right-ring" },
  p: { capId: "rect2274", labelId: "text5534", finger: "right-pinky" },
  a: { capId: "rect2292", labelId: "text5641", finger: "left-pinky" },
  s: { capId: "rect2296", labelId: "text5645", finger: "left-ring" },
  d: { capId: "rect2298", labelId: "text5649", finger: "left-middle" },
  f: { capId: "rect2300", labelId: "text5653", finger: "left-index" },
  g: { capId: "rect2302", labelId: "text5657", finger: "left-index" },
  h: { capId: "rect2306", labelId: "text5661", finger: "right-index" },
  j: { capId: "rect2308", labelId: "text5665", finger: "right-index" },
  k: { capId: "rect2312", labelId: "text5669", finger: "right-middle" },
  l: { capId: "rect2314", labelId: "text5673", finger: "right-ring" },
  z: { capId: "rect2324", labelId: "text5679", finger: "left-pinky" },
  x: { capId: "rect2326", labelId: "text5683", finger: "left-ring" },
  c: { capId: "rect2330", labelId: "text5687", finger: "left-middle" },
  v: { capId: "rect2334", labelId: "text5691", finger: "left-index" },
  b: { capId: "rect2336", labelId: "text5695", finger: "left-index" },
  n: { capId: "rect2338", labelId: "text5699", finger: "right-index" },
  m: { capId: "rect2340", labelId: "text5703", finger: "right-index" },
  " ": { capId: "key-space", labelId: "", finger: "thumb" },
};

export const FINGER_COLORS: Record<string, string> = {
  "left-pinky": "#f3b6a5",
  "left-ring": "#f6c98f",
  "left-middle": "#f4de7f",
  "left-index": "#b8d98b",
  "right-index": "#8ed6b8",
  "right-middle": "#93c7ef",
  "right-ring": "#b6b7ef",
  "right-pinky": "#dbb0e8",
};

export const FINGER_LABELS: Record<string, string> = {
  "left-pinky": "Left pinky",
  "left-ring": "Left ring",
  "left-middle": "Left middle",
  "left-index": "Left index",
  "right-index": "Right index",
  "right-middle": "Right middle",
  "right-ring": "Right ring",
  "right-pinky": "Right pinky",
};

// SVG path IDs in right-hand.svg → the matching keyboard finger name.
// The left hand is the same SVG flipped (scaleX(-1)), so Index→left-index etc.
export const HAND_FINGER_IDS: { svgId: string; right: string; left: string }[] =
  [
    { svgId: "Pinky", right: "right-pinky", left: "left-pinky" },
    { svgId: "Ring", right: "right-ring", left: "left-ring" },
    { svgId: "Middle", right: "right-middle", left: "left-middle" },
    { svgId: "Index", right: "right-index", left: "left-index" },
  ];
