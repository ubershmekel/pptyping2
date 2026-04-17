<template>
  <div ref="screenEl" :class="`screen level-screen team-${team} ${envClass}${def.isFinale ? ' level-finale' : ''}`">
    <div class="level-topbar">
      <div class="level-stats" aria-live="polite">
        <span class="stat-chip">
          <span class="stat-label">WPM</span>
          <span ref="wpmVal" class="stat-val">0</span>
        </span>
        <span class="stat-chip">
          <span class="stat-label">ACC</span>
          <span ref="accVal" class="stat-val">100%</span>
        </span>
      </div>
      <button
        ref="pauseBtn"
        class="pause-btn"
        type="button"
        aria-haspopup="dialog"
        aria-controls="pause-overlay"
        @click="openPause"
      >
        Pause
      </button>
    </div>

    <div class="level-body">
      <div ref="charTrack" class="char-track"></div>
      <div class="text-stage">
        <div
          ref="textDisplay"
          class="text-display"
          tabindex="0"
          aria-label="Typing area"
          role="textbox"
          aria-readonly="true"
        ></div>
      </div>
    </div>

    <div ref="pauseOverlay" class="pause-overlay" hidden>
      <div
        class="pause-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-title"
      >
        <h2 id="pause-title" class="pause-title">Paused</h2>
        <div class="pause-stats">
          <span class="pause-stat">
            <span class="pause-stat-label">WPM</span>
            <span ref="pauseWpm" class="pause-stat-val">0</span>
          </span>
          <span class="pause-stat">
            <span class="pause-stat-label">ACC</span>
            <span ref="pauseAcc" class="pause-stat-val">100%</span>
          </span>
          <span class="pause-stat">
            <span class="pause-stat-label">TIME</span>
            <span ref="pauseTime" class="pause-stat-val">00:00</span>
          </span>
        </div>
        <div class="pause-actions">
          <button
            ref="pauseResume"
            class="pause-action pause-action-primary"
            type="button"
            @click="closePause"
          >
            Resume
          </button>
          <button class="pause-action" type="button" @click="emit('retry')">
            Retry
          </button>
          <button
            class="pause-action"
            type="button"
            @click="emit('levelSelect')"
          >
            Level Select
          </button>
          <button class="pause-action" type="button" @click="emit('quit')">
            Quit to Main Menu
          </button>
        </div>
      </div>
    </div>

    <div ref="progressBeam" class="progress-beam" aria-hidden="true"></div>

    <div class="env-bg-deco" aria-hidden="true">
      <span v-for="n in 8" :key="n" class="env-particle"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import "./levelScreen.css";
import type { Difficulty, LevelStats, Team } from "../types";
import { DIFFICULTY_THRESHOLDS } from "../types";
import { getLevelText } from "../data/wordLists";
import { getLevelDef, ARC_ENVIRONMENTS } from "../data/levels";
import { CharacterCompanion } from "../components/character";
import { ParticleManager } from "../particles/particleManager";

// ─── TypingEngine (unchanged from original) ────────────────────────────────────

type LineDef = { text: string; start: number; end: number };

class TypingEngine {
  private text: string;
  private index = 0;
  private correctStrokes = 0;
  private totalStrokes = 0;
  private startTime: number | null = null;
  private endTime: number | null = null;
  private pausedAt: number | null = null;
  private pausedDurationMs = 0;
  private currentLineIndex = 0;
  private readonly lines: LineDef[];
  private visibleSpans: HTMLSpanElement[] = [];
  private charErrorCounts: Map<string, number> = new Map();
  private charTimings: Map<string, number[]> = new Map();
  private lastCorrectTime: number | null = null;

  onCorrect?: (charIndex: number, span: HTMLSpanElement | null) => void;
  onError?: (charIndex: number, span: HTMLSpanElement | null) => void;
  onProgress?: (index: number, total: number) => void;
  onLineComplete?: (lineIndex: number) => void;
  onComplete?: (stats: LevelStats) => void;

  constructor(text: string) {
    this.text = text.trim().toLowerCase();
    this.lines = buildLines(this.text);
  }

  renderCurrentLine(container: HTMLElement): void {
    const line = this.lines[this.currentLineIndex];
    container.innerHTML = "";
    this.visibleSpans = [];
    for (let i = 0; i < line.text.length; i++) {
      const span = document.createElement("span");
      const globalIndex = line.start + i;
      span.className = "char";
      span.dataset.state =
        globalIndex < this.index
          ? "done"
          : globalIndex === this.index
            ? "current"
            : "pending";
      const isTrailingSpace =
        line.text[i] === " " && i === line.text.length - 1;
      span.textContent = line.text[i] === " " ? "\u00A0" : line.text[i];
      if (line.text[i] === " ") span.classList.add("is-space");
      if (isTrailingSpace) span.classList.add("is-line-end-space");
      this.visibleSpans.push(span);
      container.appendChild(span);
    }
  }

  renderNextLine(container: HTMLElement): void {
    const nextLine = this.lines[this.currentLineIndex + 1] ?? null;
    if (!nextLine) return;
    const sep = document.createElement("span");
    sep.className = "next-line-sep";
    container.appendChild(sep);
    const previewLength = Math.min(5, nextLine.text.length);
    for (let i = 0; i < previewLength; i++) {
      const span = document.createElement("span");
      span.className = "char next-preview";
      span.dataset.state = "pending";
      span.textContent = nextLine.text[i] === " " ? "\u00A0" : nextLine.text[i];
      if (nextLine.text[i] === " ") span.classList.add("is-space");
      container.appendChild(span);
    }
  }

  advanceLine(container: HTMLElement): void {
    if (this.currentLineIndex >= this.lines.length - 1) return;
    this.currentLineIndex++;
    this.index = this.lines[this.currentLineIndex].start;
    this.renderCurrentLine(container);
  }

  handleKey(key: string): void {
    if (
      this.pausedAt !== null ||
      this.index >= this.text.length ||
      key.length !== 1
    )
      return;
    if (this.startTime === null) this.startTime = Date.now();
    const expected = this.text[this.index];
    const pressed = key.toLowerCase();
    this.totalStrokes++;
    if (pressed !== expected) {
      this.visibleSpans[
        this.index - this.lines[this.currentLineIndex].start
      ]?.classList.add("error-flash");
      if (expected !== " ")
        this.charErrorCounts.set(
          expected,
          (this.charErrorCounts.get(expected) ?? 0) + 1,
        );
      this.onError?.(
        this.index,
        this.visibleSpans[
          this.index - this.lines[this.currentLineIndex].start
        ] ?? null,
      );
      return;
    }
    this.correctStrokes++;
    if (expected !== " ") {
      const now = Date.now();
      if (this.lastCorrectTime !== null) {
        const timings = this.charTimings.get(expected) ?? [];
        timings.push(now - this.lastCorrectTime);
        this.charTimings.set(expected, timings);
      }
      this.lastCorrectTime = now;
    }
    const line = this.lines[this.currentLineIndex];
    const localIndex = this.index - line.start;
    const span = this.visibleSpans[localIndex];
    setSpanState(span, "done");
    this.index++;
    this.onCorrect?.(this.index - 1, span ?? null);
    this.onProgress?.(this.index, this.text.length);
    if (this.index >= this.text.length) {
      this.endTime = Date.now();
      this.onComplete?.(this.buildStats());
      return;
    }
    if (this.index >= line.end) {
      this.onLineComplete?.(this.currentLineIndex);
    } else {
      setSpanState(this.visibleSpans[localIndex + 1], "current");
    }
  }

  pause(): void {
    if (
      this.pausedAt !== null ||
      this.startTime === null ||
      this.endTime !== null
    )
      return;
    this.pausedAt = Date.now();
  }

  resume(): void {
    if (this.pausedAt === null) return;
    this.pausedDurationMs += Date.now() - this.pausedAt;
    this.pausedAt = null;
  }

  getLiveStats(): {
    wpm: number;
    accuracy: number;
    progress: number;
    timeSeconds: number;
  } {
    const elapsedMs = this.getElapsedMs();
    const elapsed = elapsedMs / 1000;
    const wpm =
      elapsed > 3 ? Math.round(this.correctStrokes / 5 / (elapsed / 60)) : 0;
    const accuracy =
      this.totalStrokes > 0
        ? Math.round((this.correctStrokes / this.totalStrokes) * 100)
        : 100;
    return {
      wpm,
      accuracy,
      progress: this.text.length > 0 ? this.index / this.text.length : 0,
      timeSeconds: elapsed,
    };
  }

  getCurrentSpan(): HTMLSpanElement | null {
    const line = this.lines[this.currentLineIndex];
    return this.visibleSpans[this.index - line.start] ?? null;
  }

  private getElapsedMs(): number {
    if (this.startTime === null) return 0;
    return Math.max(
      0,
      (this.endTime ?? this.pausedAt ?? Date.now()) -
        this.startTime -
        this.pausedDurationMs,
    );
  }

  private buildStats(): LevelStats {
    const elapsed = this.getElapsedMs() / 1000;
    const wpm =
      elapsed > 0 ? Math.round(this.correctStrokes / 5 / (elapsed / 60)) : 0;
    const accuracy =
      this.totalStrokes > 0
        ? Math.round((this.correctStrokes / this.totalStrokes) * 100)
        : 100;
    const charErrors: Record<string, number> = {};
    this.charErrorCounts.forEach((count, char) => {
      charErrors[char] = count;
    });
    const charAvgTimes: Record<string, number> = {};
    this.charTimings.forEach((times, char) => {
      if (times.length > 0)
        charAvgTimes[char] = times.reduce((a, b) => a + b, 0) / times.length;
    });
    return {
      wpm,
      accuracy,
      timeSeconds: elapsed,
      errors: this.totalStrokes - this.correctStrokes,
      totalKeystrokes: this.totalStrokes,
      passed: false,
      charErrors,
      charAvgTimes,
    };
  }
}

function buildLines(text: string, maxLength = 32): LineDef[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: LineDef[] = [];
  let cursor = 0;
  let lineWords: string[] = [];
  let lineStart = 0;
  for (const word of words) {
    const nextWords = lineWords.length === 0 ? [word] : [...lineWords, word];
    const nextText = nextWords.join(" ");
    if (lineWords.length > 0 && nextText.length > maxLength) {
      const textLine = lineWords.join(" ");
      lines.push({
        text: textLine + " ",
        start: lineStart,
        end: lineStart + textLine.length + 1,
      });
      cursor += textLine.length + 1;
      lineStart = cursor;
      lineWords = [word];
    } else {
      lineWords = nextWords;
    }
  }
  if (lineWords.length > 0) {
    const textLine = lineWords.join(" ");
    lines.push({
      text: textLine,
      start: lineStart,
      end: lineStart + textLine.length,
    });
  }
  return lines;
}

function setSpanState(
  span: HTMLSpanElement | undefined,
  state: "done" | "current" | "pending",
): void {
  if (!span) return;
  span.dataset.state = state;
}

function formatSeconds(timeSeconds: number): string {
  const whole = Math.max(0, Math.floor(timeSeconds));
  const m = Math.floor(whole / 60);
  const s = whole % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

const props = defineProps<{
  levelNumber: number;
  team: Team;
  difficulty: Difficulty;
}>();
const emit = defineEmits<{
  complete: [stats: LevelStats];
  retry: [];
  levelSelect: [];
  quit: [];
}>();

const def = computed(() => getLevelDef(props.levelNumber));
const envClass = computed(() => ARC_ENVIRONMENTS[def.value.arc].cssClass);

const screenEl = ref<HTMLElement | null>(null);
const textDisplay = ref<HTMLElement | null>(null);
const charTrack = ref<HTMLElement | null>(null);
const wpmVal = ref<HTMLElement | null>(null);
const accVal = ref<HTMLElement | null>(null);
const pauseOverlay = ref<HTMLDivElement | null>(null);
const pauseBtn = ref<HTMLButtonElement | null>(null);
const pauseWpm = ref<HTMLElement | null>(null);
const pauseAcc = ref<HTMLElement | null>(null);
const pauseTime = ref<HTMLElement | null>(null);
const pauseResume = ref<HTMLButtonElement | null>(null);
const progressBeam = ref<HTMLElement | null>(null);

let engine: TypingEngine | null = null;
let character: CharacterCompanion | null = null;
let particles: ParticleManager | null = null;
let isPaused = false;
let cancelComplete: ReturnType<typeof setTimeout> | null = null;
let statsInterval: ReturnType<typeof setInterval> | null = null;
let keydownHandler: ((e: KeyboardEvent) => void) | null = null;
let positionTimeout: ReturnType<typeof setTimeout> | null = null;

function syncStats(): void {
  if (!engine) return;
  const { wpm, accuracy, timeSeconds, progress } = engine.getLiveStats();
  if (wpmVal.value) wpmVal.value.textContent = String(wpm);
  if (accVal.value) accVal.value.textContent = `${accuracy}%`;
  if (pauseWpm.value) pauseWpm.value.textContent = String(wpm);
  if (pauseAcc.value) pauseAcc.value.textContent = `${accuracy}%`;
  if (pauseTime.value) pauseTime.value.textContent = formatSeconds(timeSeconds);
  if (progressBeam.value)
    progressBeam.value.style.width = `${Math.round(progress * 100)}%`;
}

function updateCharacterPosition(reset = false): void {
  if (!character || !charTrack.value || !engine) return;
  if (reset) {
    character.moveTo(28);
    return;
  }
  const span = engine.getCurrentSpan();
  if (!span) return;
  const trackRect = charTrack.value.getBoundingClientRect();
  const spanRect = span.getBoundingClientRect();
  character.moveTo(spanRect.left - trackRect.left + spanRect.width * 0.5);
}

function playLineEnter(container: HTMLElement): void {
  container.classList.remove("line-enter");
  void container.offsetWidth;
  container.classList.add("line-enter");
  container.addEventListener(
    "animationend",
    () => {
      container.classList.remove("line-enter");
    },
    { once: true },
  );
}

function spawnLineExitOverlay(container: HTMLElement): void {
  const parent = container.parentElement;
  if (!parent) return;
  const overlay = container.cloneNode(true) as HTMLDivElement;
  overlay.classList.remove("line-enter");
  overlay.classList.add("text-display-overlay", "line-exit");
  overlay.setAttribute("aria-hidden", "true");
  overlay.removeAttribute("tabindex");
  overlay.removeAttribute("role");
  overlay.removeAttribute("aria-label");
  overlay.addEventListener(
    "animationend",
    () => {
      overlay.remove();
    },
    { once: true },
  );
  parent.appendChild(overlay);
}

function openPause(): void {
  if (isPaused) return;
  isPaused = true;
  engine?.pause();
  syncStats();
  screenEl.value?.classList.add("level-paused");
  if (pauseOverlay.value) pauseOverlay.value.hidden = false;
  pauseBtn.value?.setAttribute("aria-expanded", "true");
  pauseResume.value?.focus();
}

function closePause(): void {
  if (!isPaused) return;
  isPaused = false;
  engine?.resume();
  screenEl.value?.classList.remove("level-paused");
  if (pauseOverlay.value) pauseOverlay.value.hidden = true;
  pauseBtn.value?.setAttribute("aria-expanded", "false");
  textDisplay.value?.focus();
}

function spawnEffect(
  span: HTMLSpanElement | null,
  type: "correct" | "error",
): void {
  if (!span) return;
  span.classList.remove("letter-hit", "letter-error");
  void span.offsetWidth;
  span.classList.add(type === "correct" ? "letter-hit" : "letter-error");
  span.addEventListener(
    "animationend",
    () => {
      span.classList.remove("letter-hit", "letter-error", "error-flash");
    },
    { once: true },
  );
}

onMounted(() => {
  if (screenEl.value) {
    screenEl.value.classList.add("screen-enter");
    requestAnimationFrame(() =>
      screenEl.value?.classList.remove("screen-enter"),
    );
  }

  const levelText = getLevelText(props.levelNumber);
  const thresholds = DIFFICULTY_THRESHOLDS[props.difficulty];
  engine = new TypingEngine(levelText);

  // Character companion
  if (charTrack.value) {
    character = new CharacterCompanion(props.team);
    character.mount(charTrack.value);
  }

  // Particles
  if (screenEl.value) {
    particles = new ParticleManager(props.team);
    particles.mount(screenEl.value);
  }

  if (textDisplay.value) {
    engine.renderCurrentLine(textDisplay.value);
    engine.renderNextLine(textDisplay.value);
  }
  pauseBtn.value?.setAttribute("aria-expanded", "false");

  let comboCount = 0;

  engine.onCorrect = (_charIndex, span) => {
    comboCount++;
    spawnEffect(span, "correct");
    if (span) {
      const r = span.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      if (comboCount > 0 && comboCount % 10 === 0) {
        character?.celebrate();
        particles?.triggerBurst("combo", cx, cy);
      } else {
        particles?.triggerBurst("correct", cx, cy);
      }
    }
    syncStats();
    updateCharacterPosition();
  };

  engine.onError = (_charIndex, span) => {
    comboCount = 0;
    const errSpan = span ?? engine!.getCurrentSpan();
    spawnEffect(errSpan, "error");
    if (errSpan) {
      const r = errSpan.getBoundingClientRect();
      particles?.triggerBurst(
        "error",
        r.left + r.width / 2,
        r.top + r.height / 2,
      );
    }
    character?.flinch();
    syncStats();
  };

  engine.onLineComplete = () => {
    if (textDisplay.value && engine) {
      spawnLineExitOverlay(textDisplay.value);
      engine.advanceLine(textDisplay.value);
      engine.renderNextLine(textDisplay.value);
      playLineEnter(textDisplay.value);
    }
    updateCharacterPosition(true);
    requestAnimationFrame(() => updateCharacterPosition());
  };

  engine.onComplete = (stats) => {
    const passed =
      stats.accuracy >= thresholds.accuracy && stats.wpm >= thresholds.wpm;
    const finalStats: LevelStats = { ...stats, passed };
    syncStats();
    character?.celebrate();
    particles?.triggerBurst("victory");
    screenEl.value?.classList.add("level-complete-flash");
    if (keydownHandler) document.removeEventListener("keydown", keydownHandler);
    keydownHandler = null;
    cancelComplete = setTimeout(() => {
      cancelComplete = null;
      emit("complete", finalStats);
    }, 800);
  };

  statsInterval = setInterval(() => {
    syncStats();
    if (!isPaused) updateCharacterPosition();
  }, 250);

  keydownHandler = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Escape") {
      e.preventDefault();
      isPaused ? closePause() : openPause();
      return;
    }
    if (isPaused || e.key === "Tab") {
      e.preventDefault();
      return;
    }
    engine?.handleKey(e.key);
  };
  document.addEventListener("keydown", keydownHandler);

  positionTimeout = setTimeout(() => updateCharacterPosition(), 60);
});

onUnmounted(() => {
  if (keydownHandler) document.removeEventListener("keydown", keydownHandler);
  if (statsInterval !== null) clearInterval(statsInterval);
  if (cancelComplete !== null) clearTimeout(cancelComplete);
  if (positionTimeout !== null) clearTimeout(positionTimeout);
  character?.destroy();
  particles?.destroy();
});
</script>
