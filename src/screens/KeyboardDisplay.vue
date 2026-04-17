<template>
  <div class="kd-root">
    <div ref="kbWrap" class="kd-keyboard-wrap"></div>
    <div class="kd-hands">
      <div class="kd-hand kd-hand-left">
        <div ref="leftHandWrap" class="kd-hand-svg"></div>
        <div class="kd-hand-label">Left hand</div>
      </div>
      <div class="kd-hand kd-hand-right">
        <div ref="rightHandWrap" class="kd-hand-svg"></div>
        <div class="kd-hand-label">Right hand</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import "./keyboardDisplay.css";
import kbSvgRaw from "../assets/keyboard/KB_United_States.svg?raw";
import handSvgRaw from "../assets/hand/right-hand.svg?raw";
import { KEY_DATA, FINGER_COLORS, HAND_FINGER_IDS } from "./keyboardData";

const props = defineProps<{
  availableLetters: string;
  focusLetters?: string;
}>();

const kbWrap = ref<HTMLElement | null>(null);
const leftHandWrap = ref<HTMLElement | null>(null);
const rightHandWrap = ref<HTMLElement | null>(null);

const cleanups: (() => void)[] = [];

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
    thumb.style.opacity = "0.4";
  }
  const hasAnyActive = HAND_FINGER_IDS.some(({ right, left }) =>
    usedFingers.has(side === "right" ? right : left),
  );
  const palm = svg.querySelector("#Hand") as SVGElement | null;
  if (palm) palm.style.opacity = hasAnyActive ? "1" : "0.3";
}

onMounted(() => {
  const available = new Set(props.availableLetters.split(""));
  const focus = props.focusLetters
    ? new Set(props.focusLetters.split(""))
    : new Set<string>();
  const anchors = new Set(["f", "j", "a", "l"]);

  if (!kbWrap.value) return;

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
        cap.style.opacity = "0.3";
      }
      continue;
    }

    if (!available.has(key)) {
      [cap, label].forEach((el) => {
        if (!el) return;
        el.style.fill = "#e8e4de";
        el.style.opacity = "0.2";
      });
      continue;
    }

    usedFingers.add(meta.finger);
    const isAnchor = anchors.has(key);
    const isFocus = focus.has(key);
    const color = FINGER_COLORS[meta.finger];
    if (cap) {
      cap.style.fill = color;
      cap.style.opacity = "1";
      cap.style.stroke = isAnchor || isFocus ? "#4b2f18" : "#888";
      cap.style.strokeWidth = isAnchor ? "2.8" : isFocus ? "2.2" : "1";
    }
    if (label) {
      label.style.fill = "#1e1b16";
      label.style.opacity = "1";
    }
  }

  if (leftHandWrap.value) {
    leftHandWrap.value.innerHTML = handSvgRaw;
    colorHandSvg(leftHandWrap.value, "left", usedFingers);
  }
  if (rightHandWrap.value) {
    rightHandWrap.value.innerHTML = handSvgRaw;
    colorHandSvg(rightHandWrap.value, "right", usedFingers);
  }

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
    if (activeFinger === "thumb") return;
    const el = getFingerEl(activeFinger);
    if (!el) return;
    el.style.fill = "#ffffff";
    el.style.filter = `drop-shadow(0 0 6px ${FINGER_COLORS[activeFinger]}) drop-shadow(0 0 3px #000)`;
  }

  function restoreActiveFinger(activeFinger: string): void {
    if (activeFinger === "thumb") return;
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
    if (!meta) return;
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
    if (!meta) return;
    const cap = kbSvg.querySelector(`#${meta.capId}`) as SVGElement | null;
    if (cap) {
      cap.style.filter = "";
      cap.style.stroke = "";
      cap.style.strokeWidth = "";
      if (available.has(key)) {
        const isAnchor = anchors.has(key);
        const isFocus = focus.has(key);
        cap.style.stroke = isAnchor || isFocus ? "#4b2f18" : "#888";
        cap.style.strokeWidth = isAnchor ? "2.8" : isFocus ? "2.2" : "1";
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

  document.addEventListener("keydown", kbDown);
  document.addEventListener("keyup", kbUp);
  cleanups.push(
    () => document.removeEventListener("keydown", kbDown),
    () => document.removeEventListener("keyup", kbUp),
  );
});

onUnmounted(() => {
  for (let i = cleanups.length - 1; i >= 0; i--) cleanups[i]();
});
</script>
