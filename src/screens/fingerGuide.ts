import "./fingerGuide.css";
import type { ScreenMount, Team } from "../types";
import { createScreenMount } from "../screenMount";
import { getLevelDef } from "../data/levels";
import { LEVEL_LETTERS } from "../data/wordLists";
import kbSvgRaw from "../assets/keyboard/KB_United_States.svg?raw";
import handSvgRaw from "../assets/hand/right-hand.svg?raw";

// ─── Key metadata ─────────────────────────────────────────────────────────────

interface KeyMeta {
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

const FINGER_ORDER = [
  "left-pinky",
  "left-ring",
  "left-middle",
  "left-index",
  "right-index",
  "right-middle",
  "right-ring",
  "right-pinky",
];

// SVG path IDs in right-hand.svg → the matching keyboard finger name.
// The left hand is the same SVG flipped (scaleX(-1)), so Index→left-index etc.
export const HAND_FINGER_IDS: { svgId: string; right: string; left: string }[] = [
  { svgId: "Pinky", right: "right-pinky", left: "left-pinky" },
  { svgId: "Ring", right: "right-ring", left: "left-ring" },
  { svgId: "Middle", right: "right-middle", left: "left-middle" },
  { svgId: "Index", right: "right-index", left: "left-index" },
  // Thumb has no keyboard assignment — kept neutral
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function colorHandSvg(
  container: HTMLElement,
  side: "left" | "right",
  usedFingers: Set<string>,
): void {
  const svg = container.querySelector("svg");
  if (!svg) return;

  // Remove hard-coded white background rect so the container bg shows through
  const bgRect = svg.querySelector('rect[width="208"]') as SVGElement | null;
  if (bgRect) bgRect.style.display = "none";

  for (const { svgId, right, left } of HAND_FINGER_IDS) {
    const fingerName = side === "right" ? right : left;
    const el = svg.querySelector(`#${svgId}`) as SVGElement | null;
    if (!el) continue;

    if (usedFingers.has(fingerName)) {
      el.style.fill = FINGER_COLORS[fingerName];
      el.style.opacity = "1";
    } else {
      el.style.fill = "#b0a898";
      el.style.opacity = "0.3";
    }
  }

  // Thumb → space-bar grey, always visible
  const thumb = svg.querySelector("#Thumb") as SVGElement | null;
  if (thumb) {
    thumb.style.fill = "#d8d4ce";
    thumb.style.opacity = "0.85";
  }

  // Dim the palm to match dimmed fingers when nothing is active on that hand
  const hasAnyActive = HAND_FINGER_IDS.some(({ right, left }) =>
    usedFingers.has(side === "right" ? right : left),
  );
  const palm = svg.querySelector("#Hand") as SVGElement | null;
  if (palm) {
    palm.style.opacity = hasAnyActive ? "1" : "0.3";
  }
}

// ─── Teaching tip rotation ────────────────────────────────────────────────────

const TEACHING_TIPS: { icon: string; html: string }[] = [
  { icon: "👁", html: "Eyes on the screen, not your fingers" },
  { icon: "✋", html: "Use the highlighted finger for each key" },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export function renderFingerGuide(
  team: Team,
  levelNumber: number,
  onStart: () => void,
  onBack: () => void,
): ScreenMount {
  const levelDef = getLevelDef(levelNumber);
  const screen = document.createElement("div");
  const mount = createScreenMount(screen);
  screen.className = `screen finger-guide-screen team-${team}`;

  const available = new Set(levelDef.availableLetters.split(""));
  const prevLetters =
    levelNumber > 1 ? (LEVEL_LETTERS[levelNumber - 1] ?? "") : "";
  const prevSet = new Set(prevLetters.split(""));
  const newSet = new Set([...available].filter((k) => !prevSet.has(k)));

  // Level tag
  let levelTag = `Level ${levelNumber}`;
  if (levelDef.isFinale) {
    levelTag += " — Review";
  } else if (newSet.size > 0) {
    const newKeys = [...newSet]
      .map((k) => `<kbd>${k.toUpperCase()}</kbd>`)
      .join(" ");
    levelTag += ` — New keys: ${newKeys}`;
  }

  // One tip per level, cycling through the three tips starting at level 2
  const tip = TEACHING_TIPS[(levelNumber - 2) % TEACHING_TIPS.length];

  screen.innerHTML = `
    <div class="fg-layout">
      <div class="fg-header">
        <div class="fg-level-tag">${levelTag}</div>
      </div>

      <div class="fg-tip">
        <span class="fg-tip-icon" aria-hidden="true">${tip.icon}</span>
        <span class="fg-tip-text">${tip.html}</span>
      </div>
      ${
        levelNumber === 2
          ? `<div class="fg-tip-supplement">
          <span class="fg-tip-icon" aria-hidden="true">👍</span>
          <span>Thumbs press <kbd>Space</kbd> between words</span>
        </div>`
          : ""
      }

      <div class="fg-keyboard-section">
        <div class="fg-keyboard-wrap"></div>
        <div class="fg-hands">
          <div class="fg-hand fg-hand-left">
            <div class="fg-hand-svg"></div>
            <div class="fg-hand-label">Left hand</div>
          </div>
          <div class="fg-hand fg-hand-right">
            <div class="fg-hand-svg"></div>
            <div class="fg-hand-label">Right hand</div>
          </div>
        </div>
      </div>

      <div class="fg-actions">
        <button class="fg-btn-primary" id="fg-start">Start Level →</button>
        <button class="fg-btn-secondary" id="fg-back">← Level Select</button>
      </div>
    </div>
  `;

  // ── Keyboard SVG ─────────────────────────────────────────────────────────────
  const kbWrap = screen.querySelector(".fg-keyboard-wrap") as HTMLElement;
  kbWrap.innerHTML = kbSvgRaw;
  const kbSvg = kbWrap.querySelector("svg") as SVGSVGElement;
  kbSvg.removeAttribute("width");
  kbSvg.removeAttribute("height");
  kbSvg.setAttribute("viewBox", "0 0 900 300");

  // ── Colorise keys ─────────────────────────────────────────────────────────────
  const usedFingers = new Set<string>();

  for (const [key, meta] of Object.entries(KEY_DATA)) {
    const cap = kbSvg.querySelector(`#${meta.capId}`) as SVGElement | null;
    const label = meta.labelId
      ? (kbSvg.querySelector(`#${meta.labelId}`) as SVGElement | null)
      : null;

    if (key === " ") {
      if (cap) {
        cap.style.fill = "#d8d4ce";
        cap.style.opacity = "1";
      }
      continue;
    }

    if (!available.has(key)) {
      [cap, label].forEach((el) => {
        if (!el) return;
        el.style.fill = "#e8e4de";
        el.style.opacity = "0.35";
      });
      continue;
    }

    usedFingers.add(meta.finger);
    const isAnchor = key === "f" || key === "j";
    const isNew = newSet.has(key) && !levelDef.isSpeedTest;
    const color = FINGER_COLORS[meta.finger];

    if (cap) {
      cap.style.fill = color;
      cap.style.opacity = "1";
      cap.style.stroke = isAnchor || isNew ? "#4b2f18" : "#888";
      cap.style.strokeWidth = isAnchor ? "2.8" : isNew ? "2.2" : "1";
    }
    if (label) {
      label.style.fill = "#1e1b16";
      label.style.opacity = "1";
    }
  }

  // ── Hand SVGs ────────────────────────────────────────────────────────────────
  const leftHandSvgWrap = screen.querySelector(
    ".fg-hand-left  .fg-hand-svg",
  ) as HTMLElement;
  const rightHandSvgWrap = screen.querySelector(
    ".fg-hand-right .fg-hand-svg",
  ) as HTMLElement;

  leftHandSvgWrap.innerHTML = handSvgRaw;
  rightHandSvgWrap.innerHTML = handSvgRaw;

  colorHandSvg(leftHandSvgWrap, "left", usedFingers);
  colorHandSvg(rightHandSvgWrap, "right", usedFingers);

  // ── Interactive key highlighting ──────────────────────────────────────────────

  // Reverse map: capId → key letter (for click detection)
  const capIdToKey: Record<string, string> = {};
  for (const [key, meta] of Object.entries(KEY_DATA)) {
    capIdToKey[meta.capId] = key;
  }

  function getFingerEl(activeFinger: string): SVGElement | null {
    const side = activeFinger.startsWith("left") ? "left" : "right";
    const wrap = side === "left" ? leftHandSvgWrap : rightHandSvgWrap;
    const svg = wrap.querySelector("svg");
    if (!svg) return null;
    const entry = HAND_FINGER_IDS.find(
      ({ right, left }) => (side === "right" ? right : left) === activeFinger,
    );
    return entry
      ? (svg.querySelector(`#${entry.svgId}`) as SVGElement | null)
      : null;
  }

  function highlightActiveFinger(activeFinger: string): void {
    if (activeFinger === "thumb") {
      for (const wrap of [leftHandSvgWrap, rightHandSvgWrap]) {
        const el = wrap.querySelector("#Thumb") as SVGElement | null;
        if (el) {
          el.style.fill = "#222222";
          el.style.filter =
            "drop-shadow(0 0 6px #d8d4ce) drop-shadow(0 0 3px #000)";
        }
      }
      return;
    }
    const el = getFingerEl(activeFinger);
    if (!el) return;
    el.style.fill = "#ffffff";
    el.style.filter = `drop-shadow(0 0 6px ${FINGER_COLORS[activeFinger]}) drop-shadow(0 0 3px #000)`;
  }

  function restoreActiveFinger(activeFinger: string): void {
    if (activeFinger === "thumb") {
      colorHandSvg(leftHandSvgWrap, "left", usedFingers);
      colorHandSvg(rightHandSvgWrap, "right", usedFingers);
      return;
    }
    const el = getFingerEl(activeFinger);
    if (!el) return;
    el.style.fill = "";
    el.style.filter = "";
    // re-run full colorHandSvg just for that hand to restore correct state
    const side = activeFinger.startsWith("left") ? "left" : "right";
    colorHandSvg(
      side === "left" ? leftHandSvgWrap : rightHandSvgWrap,
      side,
      usedFingers,
    );
  }

  let activeKey: string | null = null;

  function pressKey(key: string): void {
    if (activeKey === key) return;
    if (activeKey) releaseKey(activeKey);
    activeKey = key;

    const meta = KEY_DATA[key];
    const cap = kbSvg.querySelector(`#${meta.capId}`) as SVGElement | null;
    if (cap) {
      cap.style.filter = "brightness(0.78)";
      cap.style.stroke = "#1a0a00";
      cap.style.strokeWidth = "3";
    }
    highlightActiveFinger(meta.finger);
  }

  function releaseKey(key: string): void {
    if (activeKey !== key) return;
    activeKey = null;

    const meta = KEY_DATA[key];
    const cap = kbSvg.querySelector(`#${meta.capId}`) as SVGElement | null;
    if (cap) {
      cap.style.filter = "";
      cap.style.stroke = "";
      cap.style.strokeWidth = "";
      if (available.has(key)) {
        const isAnchor = key === "f" || key === "j";
        const isNew = newSet.has(key) && !levelDef.isSpeedTest;
        cap.style.stroke = isAnchor || isNew ? "#4b2f18" : "#888";
        cap.style.strokeWidth = isAnchor ? "2.8" : isNew ? "2.2" : "1";
      }
    }
    restoreActiveFinger(meta.finger);
  }

  // Keyboard press/release
  mount.listen(document, "keydown", (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (KEY_DATA[key]) pressKey(key);
  });
  mount.listen(document, "keyup", (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (KEY_DATA[key]) releaseKey(key);
  });

  // Mouse press/release on SVG key caps
  mount.listen(kbSvg, "mousedown", (e: MouseEvent) => {
    const key = capIdToKey[(e.target as SVGElement).id];
    if (key) pressKey(key);
  });
  mount.listen(document, "mouseup", () => {
    if (activeKey) releaseKey(activeKey);
  });

  // ── Buttons & keyboard shortcut ──────────────────────────────────────────────
  const startBtn = screen.querySelector("#fg-start") as HTMLButtonElement;
  const backBtn = screen.querySelector("#fg-back") as HTMLButtonElement;

  let gone = false;
  const go = () => {
    if (gone) return;
    gone = true;
    onStart();
  };

  mount.listen(startBtn, "click", go);
  mount.listen(backBtn, "click", () => onBack());
  mount.listen(document, "keydown", (e: KeyboardEvent) => {
    if (e.key === "Enter") go();
  });

  return mount;
}
