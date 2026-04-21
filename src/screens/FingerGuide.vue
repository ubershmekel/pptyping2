<template>
  <div ref="screenEl" :class="`screen finger-guide-screen team-${team}`">
    <div class="fg-layout">
      <div class="fg-header">
        <div class="fg-level-tag" v-html="levelTag"></div>
      </div>

      <div class="fg-tip">
        <span class="fg-tip-icon" aria-hidden="true">{{ tip.icon }}</span>
        <span class="fg-tip-text" v-html="tip.html"></span>
      </div>
      <div v-if="levelNumber === 4" class="fg-tip-supplement">
        <span class="fg-tip-icon" aria-hidden="true">👍</span>
        <span>Thumbs press <kbd>Space</kbd> between words</span>
      </div>

      <div class="fg-keyboard-section">
        <div ref="kbWrap" class="fg-keyboard-wrap"></div>
        <div class="fg-hands">
          <div class="fg-hand fg-hand-left">
            <div ref="leftHandWrap" class="fg-hand-svg"></div>
            <div class="fg-hand-label">Left hand</div>
          </div>
          <div class="fg-hand fg-hand-right">
            <div ref="rightHandWrap" class="fg-hand-svg"></div>
            <div class="fg-hand-label">Right hand</div>
          </div>
        </div>
      </div>

      <div class="fg-actions">
        <button class="fg-btn-primary" @click="onStart">Start Level →</button>
        <button class="fg-btn-secondary" @click="emit('back')">
          ← Level Select
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import "./fingerGuide.css";
import { getLevelDef } from "../data/levels";
import { LEVEL_LETTERS } from "../data/wordLists";
import kbSvgRaw from "../assets/keyboard/KB_United_States.svg?raw";
import handSvgRaw from "../assets/hand/right-hand.svg?raw";
import { KEY_DATA, FINGER_COLORS, HAND_FINGER_IDS } from "./keyboardData";
import type { Team } from "../types";

const props = defineProps<{ levelNumber: number; team: Team }>();
const emit = defineEmits<{ start: []; back: [] }>();

const screenEl = ref<HTMLElement | null>(null);
const kbWrap = ref<HTMLElement | null>(null);
const leftHandWrap = ref<HTMLElement | null>(null);
const rightHandWrap = ref<HTMLElement | null>(null);

const levelDef = computed(() => getLevelDef(props.levelNumber));
const available = computed(
  () => new Set(levelDef.value.availableLetters.split("")),
);
const prevLetters = computed(() =>
  props.levelNumber > 1 ? (LEVEL_LETTERS[props.levelNumber - 1] ?? "") : "",
);
const prevSet = computed(() => new Set(prevLetters.value.split("")));
const newSet = computed(
  () => new Set([...available.value].filter((k) => !prevSet.value.has(k))),
);

const TEACHING_TIPS = [
  { icon: "👁", html: "Eyes on the screen, not your fingers" },
  { icon: "✋", html: "Use the highlighted finger for each key" },
];
const tip = computed(
  () => TEACHING_TIPS[(props.levelNumber - 2) % TEACHING_TIPS.length],
);

const levelTag = computed(() => {
  let tag = `Level ${props.levelNumber}`;
  if (levelDef.value.isFinale) {
    tag += " — Review";
  } else if (newSet.value.size > 0) {
    const newKeys = [...newSet.value]
      .map((k) => `<kbd>${k.toUpperCase()}</kbd>`)
      .join(" ");
    tag += ` — New keys: ${newKeys}`;
  }
  return tag;
});

let gone = false;
function onStart(): void {
  if (gone) return;
  gone = true;
  emit("start");
}

// ─── Keyboard interaction helpers ─────────────────────────────────────────────

// On mount, hands start over the F/J keys on the keyboard and slide to their
// resting positions, then finger colors cross-fade to the level's actual keys.
function animateHandsFromHomeRow(
  kbSvg: SVGSVGElement,
  leftWrap: HTMLElement | null,
  rightWrap: HTMLElement | null,
  usedFingers: Set<string>,
  cleanups: (() => void)[],
): void {
  const leftHandEl = leftWrap?.parentElement as HTMLElement | null;
  const rightHandEl = rightWrap?.parentElement as HTMLElement | null;
  if (!leftHandEl || !rightHandEl) return;

  // Color index fingers only (home row starting position)
  colorHandSvg(leftWrap!, "left", new Set(["left-index"]));
  colorHandSvg(rightWrap!, "right", new Set(["right-index"]));

  // F center = x:315 y:150, J center = x:495 y:150 in the 900×300 SVG viewBox
  const kbRect = kbSvg.getBoundingClientRect();
  const fCenterX = kbRect.left + (315 / 900) * kbRect.width;
  const jCenterX = kbRect.left + (495 / 900) * kbRect.width;
  const keyCenterY = kbRect.top + 0.5 * kbRect.height;

  const leftRect = leftHandEl.getBoundingClientRect();
  const rightRect = rightHandEl.getBoundingClientRect();

  leftHandEl.style.transform = `translateX(${fCenterX - (leftRect.left + leftRect.width / 2)}px) translateY(${keyCenterY - (leftRect.top + leftRect.height / 2)}px)`;
  rightHandEl.style.transform = `translateX(${jCenterX - (rightRect.left + rightRect.width / 2)}px) translateY(${keyCenterY - (rightRect.top + rightRect.height / 2)}px)`;

  // Two rAFs ensure the initial transform is painted before the transition starts
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      leftHandEl.style.transition = "transform 0.5s ease-out";
      rightHandEl.style.transition = "transform 0.5s ease-out";
      leftHandEl.style.transform = "";
      rightHandEl.style.transform = "";
    }),
  );

  // After hands settle, cross-fade finger colors to the actual level state
  const timer = setTimeout(() => {
    for (const wrap of [leftWrap!, rightWrap!]) {
      const svg = wrap.querySelector("svg");
      if (!svg) continue;
      for (const el of svg.querySelectorAll<SVGElement>(
        "#Pinky,#Ring,#Middle,#Index,#Thumb",
      ))
        el.style.transition = "fill 0.4s ease, opacity 0.4s ease";
      (svg.querySelector("#Hand") as SVGElement | null)?.style.setProperty(
        "transition",
        "opacity 0.4s ease",
      );
    }
    if (leftWrap) colorHandSvg(leftWrap, "left", usedFingers);
    if (rightWrap) colorHandSvg(rightWrap, "right", usedFingers);
  }, 600);

  cleanups.push(
    () => clearTimeout(timer),
    () => {
      leftHandEl.style.transition = leftHandEl.style.transform = "";
    },
    () => {
      rightHandEl.style.transition = rightHandEl.style.transform = "";
    },
  );
}

function colorHandSvg(
  container: HTMLElement,
  side: "left" | "right",
  usedFingers: Set<string>,
): void {
  const svg = container.querySelector("svg");
  if (!svg) return;
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
  const thumb = svg.querySelector("#Thumb") as SVGElement | null;
  if (thumb) {
    thumb.style.fill = "#d8d4ce";
    thumb.style.opacity = "0.85";
  }
  const hasAnyActive = HAND_FINGER_IDS.some(({ right, left }) =>
    usedFingers.has(side === "right" ? right : left),
  );
  const palm = svg.querySelector("#Hand") as SVGElement | null;
  if (palm) palm.style.opacity = hasAnyActive ? "1" : "0.3";
}

const cleanups: (() => void)[] = [];

onMounted(() => {
  document.title = "Finger Guide";
  if (screenEl.value) {
    screenEl.value.classList.add("screen-enter");
    requestAnimationFrame(() =>
      screenEl.value?.classList.remove("screen-enter"),
    );
  }

  // Keyboard SVG
  if (kbWrap.value) {
    kbWrap.value.innerHTML = kbSvgRaw;
    const kbSvg = kbWrap.value.querySelector("svg") as SVGSVGElement;
    kbSvg.removeAttribute("width");
    kbSvg.removeAttribute("height");
    kbSvg.setAttribute("viewBox", "0 0 900 300");

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
      if (!available.value.has(key)) {
        [cap, label].forEach((el) => {
          if (!el) return;
          el.style.fill = "#e8e4de";
          el.style.opacity = "0.35";
        });
        continue;
      }
      usedFingers.add(meta.finger);
      const isAnchor = key === "f" || key === "j";
      const isNew =
        newSet.value.has(key) &&
        !levelDef.value.isSpeedTest &&
        !levelDef.value.isFinale;
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

    // Hand SVGs
    if (leftHandWrap.value) leftHandWrap.value.innerHTML = handSvgRaw;
    if (rightHandWrap.value) rightHandWrap.value.innerHTML = handSvgRaw;
    animateHandsFromHomeRow(
      kbSvg,
      leftHandWrap.value,
      rightHandWrap.value,
      usedFingers,
      cleanups,
    );
    // Interactive key highlighting
    const capIdToKey: Record<string, string> = {};
    for (const [key, meta] of Object.entries(KEY_DATA))
      capIdToKey[meta.capId] = key;

    function getFingerEl(activeFinger: string): SVGElement | null {
      const side = activeFinger.startsWith("left") ? "left" : "right";
      const wrap = side === "left" ? leftHandWrap.value : rightHandWrap.value;
      const svg = wrap?.querySelector("svg");
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
        for (const wrap of [leftHandWrap.value, rightHandWrap.value]) {
          const el = wrap?.querySelector("#Thumb") as SVGElement | null;
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
        if (leftHandWrap.value)
          colorHandSvg(leftHandWrap.value, "left", usedFingers);
        if (rightHandWrap.value)
          colorHandSvg(rightHandWrap.value, "right", usedFingers);
        return;
      }
      const el = getFingerEl(activeFinger);
      if (!el) return;
      el.style.fill = "";
      el.style.filter = "";
      const side = activeFinger.startsWith("left") ? "left" : "right";
      const wrap = side === "left" ? leftHandWrap.value : rightHandWrap.value;
      if (wrap) colorHandSvg(wrap, side, usedFingers);
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
        if (available.value.has(key)) {
          const isAnchor = key === "f" || key === "j";
          const isNew =
            newSet.value.has(key) &&
            !levelDef.value.isSpeedTest &&
            !levelDef.value.isFinale;
          cap.style.stroke = isAnchor || isNew ? "#4b2f18" : "#888";
          cap.style.strokeWidth = isAnchor ? "2.8" : isNew ? "2.2" : "1";
        }
      }
      restoreActiveFinger(meta.finger);
    }

    const kbDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (KEY_DATA[key]) pressKey(key);
    };
    const kbUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (KEY_DATA[key]) releaseKey(key);
    };
    const mouseDown = (e: MouseEvent) => {
      const key = capIdToKey[(e.target as SVGElement).id];
      if (key) pressKey(key);
    };
    const mouseUp = () => {
      if (activeKey) releaseKey(activeKey);
    };

    document.addEventListener("keydown", kbDown);
    document.addEventListener("keyup", kbUp);
    kbSvg.addEventListener("mousedown", mouseDown);
    document.addEventListener("mouseup", mouseUp);
    cleanups.push(
      () => document.removeEventListener("keydown", kbDown),
      () => document.removeEventListener("keyup", kbUp),
      () => kbSvg.removeEventListener("mousedown", mouseDown),
      () => document.removeEventListener("mouseup", mouseUp),
    );
  }

  const enterKey = (e: KeyboardEvent) => {
    if (e.key === "Enter") onStart();
  };
  document.addEventListener("keydown", enterKey);
  cleanups.push(() => document.removeEventListener("keydown", enterKey));
});

onUnmounted(() => {
  for (let i = cleanups.length - 1; i >= 0; i--) cleanups[i]();
});
</script>
