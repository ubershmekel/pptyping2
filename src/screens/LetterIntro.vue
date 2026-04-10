<template>
  <div
    ref="screenEl"
    :class="`screen letter-intro-screen team-${team}`"
    :style="`--li-color: ${fingerColor}`"
  >
    <div class="li-layout">
      <div class="li-top-bar">
        <button class="li-back-btn" @click="emit('back')">Back</button>
      </div>
      <div class="li-badge">
        Level {{ levelNumber }} &mdash; learn which finger types the letter
        <strong>{{ letter.toUpperCase() }}</strong>
      </div>

      <div class="li-letter-area">
        <div class="li-letter">{{ letter.toUpperCase() }}</div>
      </div>

      <div class="li-finger-label">{{ fingerLabel }}</div>

      <div class="li-hand-wrap">
        <div
          ref="leftHandWrap"
          :class="`li-hand-svg li-hand-flip${side === 'right' ? ' li-hand-shadow' : ''}`"
        ></div>
        <div
          ref="rightHandWrap"
          :class="`li-hand-svg${side === 'left' ? ' li-hand-shadow' : ''}`"
        ></div>
      </div>
      <canvas ref="canvas" class="li-canvas"></canvas>

      <div class="li-progress">
        <div v-for="n in 3" :key="n" class="li-dot" :class="{ 'li-dot-filled': pressCount >= n }"></div>
      </div>

      <div class="li-prompt" ref="promptEl">
        Press <kbd>{{ letter.toUpperCase() }}</kbd> three times to continue
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import "./letterIntro.css";
import handSvgRaw from "../assets/hand/right-hand.svg?raw";
import {
  FINGER_COLORS,
  FINGER_LABELS,
  KEY_DATA,
  HAND_FINGER_IDS,
} from "./keyboardData";
import type { Team } from "../types";

const props = defineProps<{ levelNumber: number; letter: string; team: Team }>();
const emit = defineEmits<{ done: []; back: [] }>();

const screenEl = ref<HTMLElement | null>(null);
const leftHandWrap = ref<HTMLElement | null>(null);
const rightHandWrap = ref<HTMLElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const promptEl = ref<HTMLElement | null>(null);

const meta = computed(() => KEY_DATA[props.letter]);
const fingerName = computed(() => meta.value.finger);
const fingerColor = computed(() => FINGER_COLORS[fingerName.value] ?? "#ffffff");
const fingerLabel = computed(() => FINGER_LABELS[fingerName.value] ?? fingerName.value);
const side = computed<"left" | "right">(() =>
  fingerName.value.startsWith("left") ? "left" : "right",
);
const activeHandWrap = computed(() =>
  side.value === "left" ? leftHandWrap.value : rightHandWrap.value,
);
const ghostHandWrap = computed(() =>
  side.value === "left" ? rightHandWrap.value : leftHandWrap.value,
);

const pressCount = ref(0);

// ─── Particle system ──────────────────────────────────────────────────────────

interface Particle {
  x: number; y: number; vx: number; vy: number; life: number; size: number; color: string;
}
const particles: Particle[] = [];
let rafId: number | null = null;
let lastTime = 0;

function spawnBurst(cx: number, cy: number, color: string): void {
  const count = 28;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const speed = 2 + Math.random() * 6;
    const isWhite = Math.random() > 0.55;
    particles.push({
      x: cx + (Math.random() - 0.5) * 24,
      y: cy + (Math.random() - 0.5) * 18,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.5,
      life: 0.85 + Math.random() * 0.15,
      size: 2.5 + Math.random() * 4.5,
      color: isWhite ? "#ffffff" : color,
    });
  }
}

function drawParticles(dt: number): void {
  const c = canvas.value;
  if (!c) return;
  const ctx = c.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, c.width, c.height);
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 0.18 * dt; p.life -= 0.028 * dt;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    const radius = p.size * Math.max(p.life, 0.05);
    ctx.save();
    ctx.globalAlpha = Math.min(p.life * 1.3, 1);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function resizeCanvas(): void {
  const s = screenEl.value;
  const c = canvas.value;
  if (!s || !c) return;
  const w = s.offsetWidth;
  const h = s.offsetHeight;
  if (w > 0 && (c.width !== w || c.height !== h)) { c.width = w; c.height = h; }
}

function getFingerBurstOrigin(): { x: number; y: number } {
  const entry = HAND_FINGER_IDS.find(
    ({ right, left }) => (side.value === "right" ? right : left) === fingerName.value,
  );
  if (!entry || !activeHandWrap.value || !canvas.value || !screenEl.value) {
    return { x: canvas.value ? canvas.value.width / 2 : 0, y: canvas.value ? canvas.value.height / 2 : 0 };
  }
  const svg = activeHandWrap.value.querySelector("svg");
  const el = svg?.querySelector(`#${entry.svgId}`) as SVGElement | null;
  if (!el) return { x: canvas.value.width / 2, y: canvas.value.height / 2 };
  const rect = el.getBoundingClientRect();
  const screenRect = screenEl.value.getBoundingClientRect();
  return { x: rect.left + rect.width / 2 - screenRect.left, y: rect.top + rect.height / 2 - screenRect.top };
}

// ─── Hand SVG helpers ─────────────────────────────────────────────────────────

function colorFocusedHand(container: HTMLElement, handSide: "left" | "right"): void {
  const svg = container.querySelector("svg");
  if (!svg) return;
  svg.style.overflow = "visible";
  const bgRect = svg.querySelector('rect[width="208"]') as SVGElement | null;
  if (bgRect) bgRect.style.display = "none";
  for (const { svgId, right, left } of HAND_FINGER_IDS) {
    const thisFinger = handSide === "right" ? right : left;
    const el = svg.querySelector(`#${svgId}`) as SVGElement | null;
    if (!el) continue;
    if (thisFinger === fingerName.value) {
      el.style.fill = fingerColor.value;
      el.style.opacity = "1";
      el.style.filter = `drop-shadow(0 0 14px ${fingerColor.value}) drop-shadow(0 0 7px ${fingerColor.value}90)`;
      el.classList.add("li-finger-pulse");
      el.classList.remove("li-finger-tap");
    } else {
      el.style.fill = "#7a7268"; el.style.opacity = "0.5"; el.style.filter = "";
      el.classList.remove("li-finger-pulse", "li-finger-tap");
    }
  }
  const thumb = svg.querySelector("#Thumb") as SVGElement | null;
  if (thumb) { thumb.style.fill = "#7a7268"; thumb.style.opacity = "0.45"; thumb.style.filter = ""; thumb.classList.remove("li-finger-pulse", "li-finger-tap"); }
  const palm = svg.querySelector("#Hand") as SVGElement | null;
  if (palm) { palm.style.fill = "#5a5248"; palm.style.opacity = "0.8"; palm.style.filter = ""; }
}

function prepareGhostHand(container: HTMLElement): void {
  const svg = container.querySelector("svg");
  if (!svg) return;
  const bgRect = svg.querySelector('rect[width="208"]') as SVGElement | null;
  if (bgRect) bgRect.style.display = "none";
  for (const id of ["Pinky", "Ring", "Middle", "Index", "Thumb"]) {
    const el = svg.querySelector(`#${id}`) as SVGElement | null;
    if (el) el.style.display = "none";
  }
}

let tapTimer: ReturnType<typeof setTimeout> | null = null;

function flashFocusedFinger(): void {
  if (!activeHandWrap.value) return;
  const svg = activeHandWrap.value.querySelector("svg");
  if (!svg) return;
  const entry = HAND_FINGER_IDS.find(
    ({ right, left }) => (side.value === "right" ? right : left) === fingerName.value,
  );
  const el = entry ? (svg.querySelector(`#${entry.svgId}`) as SVGElement | null) : null;
  if (!el) return;
  el.classList.remove("li-finger-pulse", "li-finger-tap");
  void el.getBoundingClientRect();
  el.classList.add("li-finger-tap");
  el.style.fill = "#ffffff";
  el.style.filter = `drop-shadow(0 0 28px #fff) drop-shadow(0 0 16px ${fingerColor.value})`;
  el.style.opacity = "1";
  tapTimer = setTimeout(() => {
    tapTimer = null;
    if (activeHandWrap.value) colorFocusedHand(activeHandWrap.value, side.value);
  }, 300);
}

const REQUIRED_PRESSES = 3;
let advancing = false;
let doneTimer: ReturnType<typeof setTimeout> | null = null;

function onCorrectPress(): void {
  if (advancing) return;
  pressCount.value++;
  flashFocusedFinger();
  resizeCanvas();
  if (canvas.value && canvas.value.width > 0) {
    const { x, y } = getFingerBurstOrigin();
    spawnBurst(x, y, fingerColor.value);
  }
  const remaining = REQUIRED_PRESSES - pressCount.value;
  if (promptEl.value) {
    if (remaining === 2) promptEl.value.innerHTML = `Press <kbd>${props.letter.toUpperCase()}</kbd> two more times`;
    else if (remaining === 1) promptEl.value.innerHTML = `Press <kbd>${props.letter.toUpperCase()}</kbd> one more time`;
    else if (remaining <= 0) {
      advancing = true;
      promptEl.value.innerHTML = "";
      screenEl.value?.classList.add("li-complete");
      doneTimer = setTimeout(() => emit("done"), 750);
    }
  }
}

function keyHandler(e: KeyboardEvent): void {
  if (e.repeat) return;
  if (e.key.toLowerCase() === props.letter) onCorrectPress();
}

onMounted(() => {
  if (screenEl.value) {
    screenEl.value.classList.add("screen-enter");
    requestAnimationFrame(() => screenEl.value?.classList.remove("screen-enter"));
  }

  // Hand SVGs
  if (leftHandWrap.value) {
    leftHandWrap.value.innerHTML = handSvgRaw;
  }
  if (rightHandWrap.value) {
    rightHandWrap.value.innerHTML = handSvgRaw;
  }
  if (ghostHandWrap.value) {
    prepareGhostHand(ghostHandWrap.value);
  }
  if (activeHandWrap.value) {
    colorFocusedHand(activeHandWrap.value, side.value);
  }

  // RAF particle loop
  lastTime = performance.now();
  const rafLoop = (now: number) => {
    const dt = Math.min((now - lastTime) / 16.67, 4);
    lastTime = now;
    resizeCanvas();
    drawParticles(dt);
    rafId = requestAnimationFrame(rafLoop);
  };
  rafId = requestAnimationFrame(rafLoop);

  document.addEventListener("keydown", keyHandler);
});

onUnmounted(() => {
  document.removeEventListener("keydown", keyHandler);
  if (rafId !== null) cancelAnimationFrame(rafId);
  if (tapTimer !== null) clearTimeout(tapTimer);
  if (doneTimer !== null) clearTimeout(doneTimer);
});
</script>
