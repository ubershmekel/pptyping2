import "./letterIntro.css";
import type { ScreenMount, Team } from "../types";
import { createScreenMount } from "../screenMount";
import handSvgRaw from "../assets/hand/right-hand.svg?raw";
import {
  FINGER_COLORS,
  FINGER_LABELS,
  KEY_DATA,
  HAND_FINGER_IDS,
} from "./fingerGuide";

// ─── Particle system ─────────────────────────────────────────────────────────

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 1 → 0
  size: number;
  color: string;
}

function spawnBurst(
  particles: Particle[],
  cx: number,
  cy: number,
  color: string,
): void {
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

function drawParticles(
  canvas: HTMLCanvasElement,
  particles: Particle[],
  dt: number,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 0.18 * dt; // gravity
    p.life -= 0.028 * dt;

    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

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

// ─── Hand coloring (focused: only target finger lit) ─────────────────────────

function getActiveFinger(
  container: HTMLElement,
  fingerName: string,
  side: "left" | "right",
): SVGElement | null {
  const svg = container.querySelector("svg");
  if (!svg) return null;
  const entry = HAND_FINGER_IDS.find(
    ({ right, left }) => (side === "right" ? right : left) === fingerName,
  );
  return entry
    ? (svg.querySelector(`#${entry.svgId}`) as SVGElement | null)
    : null;
}

function colorFocusedHand(
  container: HTMLElement,
  fingerName: string,
  fingerColor: string,
  side: "left" | "right",
): void {
  const svg = container.querySelector("svg");
  if (!svg) return;

  // Allow glows to bleed outside the SVG viewport
  svg.style.overflow = "visible";

  const bgRect = svg.querySelector('rect[width="208"]') as SVGElement | null;
  if (bgRect) bgRect.style.display = "none";

  for (const { svgId, right, left } of HAND_FINGER_IDS) {
    const thisFinger = side === "right" ? right : left;
    const el = svg.querySelector(`#${svgId}`) as SVGElement | null;
    if (!el) continue;

    if (thisFinger === fingerName) {
      el.style.fill = fingerColor;
      el.style.opacity = "1";
      el.style.filter = `drop-shadow(0 0 14px ${fingerColor}) drop-shadow(0 0 7px ${fingerColor}90)`;
      // Slow ambient pulse
      el.classList.add("li-finger-pulse");
      el.classList.remove("li-finger-tap");
    } else {
      el.style.fill = "#7a7268";
      el.style.opacity = "0.5";
      el.style.filter = "";
      el.classList.remove("li-finger-pulse", "li-finger-tap");
    }
  }

  const thumb = svg.querySelector("#Thumb") as SVGElement | null;
  if (thumb) {
    thumb.style.fill = "#7a7268";
    thumb.style.opacity = "0.45";
    thumb.style.filter = "";
    thumb.classList.remove("li-finger-pulse", "li-finger-tap");
  }

  const palm = svg.querySelector("#Hand") as SVGElement | null;
  if (palm) {
    palm.style.fill = "#5a5248";
    palm.style.opacity = "0.8";
    palm.style.filter = "";
  }
}

function flashFocusedFinger(
  container: HTMLElement,
  fingerName: string,
  fingerColor: string,
  side: "left" | "right",
  mount: ScreenMount,
): void {
  const el = getActiveFinger(container, fingerName, side);
  if (!el) return;

  // Tap: scale up + white flash, overrides the pulse
  el.classList.remove("li-finger-pulse", "li-finger-tap");
  void el.getBoundingClientRect(); // force reflow
  el.classList.add("li-finger-tap");
  el.style.fill = "#ffffff";
  el.style.filter = `drop-shadow(0 0 28px #fff) drop-shadow(0 0 16px ${fingerColor})`;
  el.style.opacity = "1";

  mount.timeout(() => {
    colorFocusedHand(container, fingerName, fingerColor, side);
  }, 300);
}

// ─── Screen ───────────────────────────────────────────────────────────────────

const REQUIRED_PRESSES = 3;

export function renderLetterIntro(
  team: Team,
  levelNumber: number,
  letter: string,
  onDone: () => void,
  onBack: () => void,
): ScreenMount {
  const meta = KEY_DATA[letter];
  const fingerName = meta.finger;
  const fingerColor = FINGER_COLORS[fingerName] ?? "#ffffff";
  const fingerLabel = FINGER_LABELS[fingerName] ?? fingerName;
  const side: "left" | "right" = fingerName.startsWith("left")
    ? "left"
    : "right";

  const screen = document.createElement("div");
  const mount = createScreenMount(screen);
  screen.className = `screen letter-intro-screen team-${team}`;
  screen.style.setProperty("--li-color", fingerColor);

  screen.innerHTML = `
    <div class="li-layout">
      <div class="li-top-bar">
        <button class="li-back-btn" id="li-back">Back</button>
      </div>
      <div class="li-badge">Level ${levelNumber} &mdash; learn which finger types the letter <strong>${letter.toUpperCase()}</strong></div>

      <div class="li-letter-area">
        <div class="li-letter">${letter.toUpperCase()}</div>
      </div>

      <div class="li-finger-label">${fingerLabel}</div>

      <div class="li-hand-wrap">
        <div class="li-hand-svg${side === "right" ? " li-hand-shadow" : ""} li-hand-flip"></div>
        <div class="li-hand-svg${side === "left" ? " li-hand-shadow" : ""}"></div>
      </div>
      <canvas class="li-canvas"></canvas>

      <div class="li-progress">
        <div class="li-dot"></div>
        <div class="li-dot"></div>
        <div class="li-dot"></div>
      </div>

      <div class="li-prompt">Press <kbd>${letter.toUpperCase()}</kbd> three times to continue</div>
    </div>
  `;

  // ── Hand SVGs ──────────────────────────────────────────────────────────────
  const shadowWrap = screen.querySelector(".li-hand-shadow") as HTMLElement;
  const handWrap = screen.querySelector(
    ".li-hand-svg:not(.li-hand-shadow)",
  ) as HTMLElement;
  shadowWrap.innerHTML = handSvgRaw;
  handWrap.innerHTML = handSvgRaw;
  colorFocusedHand(handWrap, fingerName, fingerColor, side);
  // Shadow: show only the base hand shape — hide all finger paths
  const shadowSvg = shadowWrap.querySelector("svg");
  if (shadowSvg) {
    const bgRect = shadowSvg.querySelector(
      'rect[width="208"]',
    ) as SVGElement | null;
    if (bgRect) bgRect.style.display = "none";
    for (const id of ["Pinky", "Ring", "Middle", "Index", "Thumb"]) {
      const el = shadowSvg.querySelector(`#${id}`) as SVGElement | null;
      if (el) el.style.display = "none";
    }
  }

  // ── Canvas particles (overlays the hand-wrap) ─────────────────────────────
  const canvas = screen.querySelector(".li-canvas") as HTMLCanvasElement;
  const particles: Particle[] = [];
  let lastTime = performance.now();

  function resizeCanvas(): void {
    const w = screen.offsetWidth;
    const h = screen.offsetHeight;
    if (w > 0 && (canvas.width !== w || canvas.height !== h)) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  function getFingerBurstOrigin(): { x: number; y: number } {
    const entry = HAND_FINGER_IDS.find(
      ({ right, left }) => (side === "right" ? right : left) === fingerName,
    );
    if (!entry) return { x: canvas.width / 2, y: canvas.height / 2 };
    const svg = handWrap.querySelector("svg");
    const el = svg?.querySelector(`#${entry.svgId}`) as SVGElement | null;
    if (!el) return { x: canvas.width / 2, y: canvas.height / 2 };
    const rect = el.getBoundingClientRect();
    const screenRect = screen.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - screenRect.left,
      y: rect.top + rect.height / 2 - screenRect.top,
    };
  }

  let rafId: number | null = null;
  const rafLoop = (now: number): void => {
    const dt = Math.min((now - lastTime) / 16.67, 4);
    lastTime = now;
    resizeCanvas();
    drawParticles(canvas, particles, dt);
    rafId = requestAnimationFrame(rafLoop);
  };
  rafId = requestAnimationFrame(rafLoop);
  mount.defer(() => {
    if (rafId !== null) cancelAnimationFrame(rafId);
  });

  // ── Interaction ────────────────────────────────────────────────────────────
  const dots = screen.querySelectorAll(".li-dot") as NodeListOf<HTMLElement>;
  const promptEl = screen.querySelector(".li-prompt") as HTMLElement;
  const backBtn = screen.querySelector("#li-back") as HTMLButtonElement;

  let pressCount = 0;
  let advancing = false;

  function onCorrectPress(): void {
    if (advancing) return;
    pressCount++;

    // Finger flash + particles
    flashFocusedFinger(handWrap, fingerName, fingerColor, side, mount);

    // Progress dot
    if (pressCount <= 3) {
      dots[pressCount - 1].classList.add("li-dot-filled");
    }

    // Particles burst from the finger
    resizeCanvas();
    if (canvas.width > 0) {
      const { x, y } = getFingerBurstOrigin();
      spawnBurst(particles, x, y, fingerColor);
    }

    // Update instruction
    const remaining = REQUIRED_PRESSES - pressCount;
    if (remaining === 2) {
      promptEl.innerHTML = `Press <kbd>${letter.toUpperCase()}</kbd> two more times`;
    } else if (remaining === 1) {
      promptEl.innerHTML = `Press <kbd>${letter.toUpperCase()}</kbd> one more time`;
    } else if (remaining <= 0) {
      advancing = true;
      promptEl.innerHTML = ``;
      screen.classList.add("li-complete");

      mount.timeout(onDone, 750);
    }
  }

  mount.listen(document, "keydown", (e: KeyboardEvent) => {
    if (e.repeat) return;
    if (e.key.toLowerCase() === letter) onCorrectPress();
  });
  mount.listen(backBtn, "click", () => onBack());

  return mount;
}
