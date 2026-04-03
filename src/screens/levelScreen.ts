import type { Difficulty, LevelStats, Team } from '../types';
import { DIFFICULTY_THRESHOLDS } from '../types';
import { getLevelText } from '../data/wordLists';
import { getLevelDef, ARC_ENVIRONMENTS } from '../data/levels';
import { CharacterCompanion } from '../components/character';

type LineDef = {
  text: string;
  start: number;
  end: number;
};

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
    container.innerHTML = '';
    this.visibleSpans = [];

    for (let i = 0; i < line.text.length; i++) {
      const span = document.createElement('span');
      const globalIndex = line.start + i;
      span.className = 'char';
      span.dataset.state = globalIndex < this.index ? 'done' : globalIndex === this.index ? 'current' : 'pending';
      span.textContent = line.text[i] === ' ' ? '\u00A0' : line.text[i];
      if (line.text[i] === ' ') {
        span.classList.add('is-space');
      }
      this.visibleSpans.push(span);
      container.appendChild(span);
    }
  }

  advanceLine(container: HTMLElement): void {
    if (this.currentLineIndex >= this.lines.length - 1) {
      return;
    }
    this.currentLineIndex++;
    this.renderCurrentLine(container);
  }

  handleKey(key: string, container: HTMLElement): void {
    if (this.pausedAt !== null || this.index >= this.text.length || key.length !== 1) {
      return;
    }

    if (this.startTime === null) {
      this.startTime = Date.now();
    }

    const expected = this.text[this.index];
    const pressed = key.toLowerCase();
    this.totalStrokes++;

    if (pressed !== expected) {
      this.visibleSpans[this.index - this.lines[this.currentLineIndex].start]?.classList.add('error-flash');
      this.onError?.(this.index, this.visibleSpans[this.index - this.lines[this.currentLineIndex].start] ?? null);
      return;
    }

    this.correctStrokes++;

    const line = this.lines[this.currentLineIndex];
    const localIndex = this.index - line.start;
    const span = this.visibleSpans[localIndex];
    setSpanState(span, 'done');

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
      setSpanState(this.visibleSpans[localIndex + 1], 'current');
    }
  }

  pause(): void {
    if (this.pausedAt !== null || this.startTime === null || this.endTime !== null) {
      return;
    }
    this.pausedAt = Date.now();
  }

  resume(): void {
    if (this.pausedAt === null) {
      return;
    }
    this.pausedDurationMs += Date.now() - this.pausedAt;
    this.pausedAt = null;
  }

  getLiveStats(): { wpm: number; accuracy: number; progress: number; timeSeconds: number } {
    const elapsedMs = this.getElapsedMs();
    const elapsed = elapsedMs / 1000;
    const wpm = elapsed > 3 ? Math.round((this.correctStrokes / 5) / (elapsed / 60)) : 0;
    const accuracy = this.totalStrokes > 0 ? Math.round((this.correctStrokes / this.totalStrokes) * 100) : 100;
    const progress = this.text.length > 0 ? this.index / this.text.length : 0;

    return { wpm, accuracy, progress, timeSeconds: elapsed };
  }

  getCurrentSpan(): HTMLSpanElement | null {
    const line = this.lines[this.currentLineIndex];
    return this.visibleSpans[this.index - line.start] ?? null;
  }

  private getElapsedMs(): number {
    if (this.startTime === null) {
      return 0;
    }

    const endPoint = this.endTime ?? this.pausedAt ?? Date.now();
    return Math.max(0, endPoint - this.startTime - this.pausedDurationMs);
  }

  private buildStats(): LevelStats {
    const elapsed = this.getElapsedMs() / 1000;
    const wpm = elapsed > 0 ? Math.round((this.correctStrokes / 5) / (elapsed / 60)) : 0;
    const accuracy = this.totalStrokes > 0 ? Math.round((this.correctStrokes / this.totalStrokes) * 100) : 100;

    return {
      wpm,
      accuracy,
      timeSeconds: elapsed,
      errors: this.totalStrokes - this.correctStrokes,
      totalKeystrokes: this.totalStrokes,
      passed: false,
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
    const nextText = nextWords.join(' ');

    if (lineWords.length > 0 && nextText.length > maxLength) {
      const textLine = lineWords.join(' ');
      lines.push({
        text: textLine,
        start: lineStart,
        end: lineStart + textLine.length,
      });
      cursor += textLine.length + 1;
      lineStart = cursor;
      lineWords = [word];
    } else {
      lineWords = nextWords;
    }
  }

  if (lineWords.length > 0) {
    const textLine = lineWords.join(' ');
    lines.push({
      text: textLine,
      start: lineStart,
      end: lineStart + textLine.length,
    });
  }

  return lines;
}

function setSpanState(span: HTMLSpanElement | undefined, state: 'done' | 'current' | 'pending'): void {
  if (!span) {
    return;
  }
  span.dataset.state = state;
}

function formatSeconds(timeSeconds: number): string {
  const whole = Math.max(0, Math.floor(timeSeconds));
  const minutes = Math.floor(whole / 60);
  const seconds = whole % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function renderLevelScreen(
  team: Team,
  levelNumber: number,
  difficulty: Difficulty,
  onComplete: (stats: LevelStats) => void,
  onRetry: () => void,
  onQuit: () => void,
): { el: HTMLElement; cleanup: () => void } {
  const def = getLevelDef(levelNumber);
  const env = ARC_ENVIRONMENTS[def.arc];
  const levelText = getLevelText(levelNumber);
  const thresholds = DIFFICULTY_THRESHOLDS[difficulty];

  const screen = document.createElement('div');
  screen.className = `screen level-screen team-${team} ${env.cssClass}`;

  screen.innerHTML = `
    <div class="level-topbar">
      <div class="level-stats" aria-live="polite">
        <span class="stat-chip"><span class="stat-label">WPM</span><span class="stat-val" id="stat-wpm-val">0</span></span>
        <span class="stat-chip"><span class="stat-label">ACC</span><span class="stat-val" id="stat-acc-val">100%</span></span>
      </div>
      <button class="pause-btn" id="pause-btn" type="button" aria-haspopup="dialog" aria-controls="pause-overlay">
        Pause
      </button>
    </div>

    <div class="level-body">
      <div class="char-track" id="char-track"></div>
      <div class="text-stage">
        <div class="text-display" id="text-display" tabindex="0" aria-label="Typing area" role="textbox" aria-readonly="true"></div>
      </div>
    </div>

    <div class="pause-overlay" id="pause-overlay" hidden>
      <div class="pause-card" role="dialog" aria-modal="true" aria-labelledby="pause-title">
        <h2 id="pause-title" class="pause-title">Paused</h2>
        <div class="pause-stats">
          <span class="pause-stat"><span class="pause-stat-label">WPM</span><span class="pause-stat-val" id="pause-wpm">0</span></span>
          <span class="pause-stat"><span class="pause-stat-label">ACC</span><span class="pause-stat-val" id="pause-acc">100%</span></span>
          <span class="pause-stat"><span class="pause-stat-label">TIME</span><span class="pause-stat-val" id="pause-time">00:00</span></span>
        </div>
        <div class="pause-actions">
          <button class="pause-action pause-action-primary" id="pause-resume" type="button">Resume</button>
          <button class="pause-action" id="pause-retry" type="button">Retry</button>
          <button class="pause-action" id="pause-quit" type="button">Quit to Main Menu</button>
        </div>
      </div>
    </div>

    <div class="env-bg-deco" aria-hidden="true">
      <span class="env-particle"></span><span class="env-particle"></span>
      <span class="env-particle"></span><span class="env-particle"></span>
      <span class="env-particle"></span><span class="env-particle"></span>
      <span class="env-particle"></span><span class="env-particle"></span>
    </div>
  `;

  const engine = new TypingEngine(levelText);
  const textDisplay = screen.querySelector('#text-display') as HTMLElement;
  const charTrack = screen.querySelector('#char-track') as HTMLElement;
  const wpmVal = screen.querySelector('#stat-wpm-val') as HTMLElement;
  const accVal = screen.querySelector('#stat-acc-val') as HTMLElement;
  const pauseOverlay = screen.querySelector('#pause-overlay') as HTMLDivElement;
  const pauseBtn = screen.querySelector('#pause-btn') as HTMLButtonElement;
  const pauseWpm = screen.querySelector('#pause-wpm') as HTMLElement;
  const pauseAcc = screen.querySelector('#pause-acc') as HTMLElement;
  const pauseTime = screen.querySelector('#pause-time') as HTMLElement;
  const pauseResume = screen.querySelector('#pause-resume') as HTMLButtonElement;
  const pauseRetry = screen.querySelector('#pause-retry') as HTMLButtonElement;
  const pauseQuit = screen.querySelector('#pause-quit') as HTMLButtonElement;

  const character = new CharacterCompanion(team);
  character.mount(charTrack);
  engine.renderCurrentLine(textDisplay);
  pauseBtn.setAttribute('aria-expanded', 'false');

  let comboCount = 0;
  let isPaused = false;
  let isTransitioningLine = false;
  let lineTransitionTimer: number | null = null;

  function updateCharacterPosition(reset = false): void {
    if (reset) {
      character.moveTo(28);
      return;
    }

    const span = engine.getCurrentSpan();
    if (!span) {
      return;
    }

    const trackRect = charTrack.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();
    const relX = spanRect.left - trackRect.left + spanRect.width * 0.5;
    character.moveTo(relX);
  }

  function syncStats(): void {
    const { wpm, accuracy, timeSeconds } = engine.getLiveStats();
    wpmVal.textContent = String(wpm);
    accVal.textContent = `${accuracy}%`;
    pauseWpm.textContent = String(wpm);
    pauseAcc.textContent = `${accuracy}%`;
    pauseTime.textContent = formatSeconds(timeSeconds);
  }

  function openPause(): void {
    if (isPaused) {
      return;
    }

    isPaused = true;
    engine.pause();
    syncStats();
    screen.classList.add('level-paused');
    pauseOverlay.hidden = false;
    pauseBtn.setAttribute('aria-expanded', 'true');
    pauseResume.focus();
  }

  function closePause(): void {
    if (!isPaused) {
      return;
    }

    isPaused = false;
    engine.resume();
    screen.classList.remove('level-paused');
    pauseOverlay.hidden = true;
    pauseBtn.setAttribute('aria-expanded', 'false');
    textDisplay.focus();
  }

  function spawnEffect(span: HTMLSpanElement | null, type: 'correct' | 'error'): void {
    if (!span) {
      return;
    }

    span.classList.remove('letter-hit', 'letter-error');
    void span.offsetWidth;
    span.classList.add(type === 'correct' ? 'letter-hit' : 'letter-error');
    span.addEventListener(
      'animationend',
      () => {
        span.classList.remove('letter-hit', 'letter-error', 'error-flash');
      },
      { once: true },
    );
  }

  engine.onCorrect = (_charIndex, span) => {
    comboCount++;
    spawnEffect(span, 'correct');
    if (comboCount > 0 && comboCount % 10 === 0) {
      character.celebrate();
    }
    syncStats();
    updateCharacterPosition();
  };

  engine.onError = (_charIndex, span) => {
    comboCount = 0;
    spawnEffect(span ?? engine.getCurrentSpan(), 'error');
    character.flinch();
    syncStats();
  };

  engine.onLineComplete = () => {
    isTransitioningLine = true;
    textDisplay.classList.remove('line-enter');
    textDisplay.classList.add('line-exit');
    updateCharacterPosition(true);

    if (lineTransitionTimer !== null) {
      clearTimeout(lineTransitionTimer);
    }

    lineTransitionTimer = window.setTimeout(() => {
      engine.advanceLine(textDisplay);
      textDisplay.classList.remove('line-exit');
      textDisplay.classList.add('line-enter');
      isTransitioningLine = false;
      updateCharacterPosition();
    }, 170);
  };

  engine.onComplete = (stats) => {
    const passed = stats.accuracy >= thresholds.accuracy && stats.wpm >= thresholds.wpm;
    const finalStats: LevelStats = { ...stats, passed };

    syncStats();
    character.celebrate();
    screen.classList.add('level-complete-flash');
    document.removeEventListener('keydown', keyHandler);

    window.setTimeout(() => onComplete(finalStats), 800);
  };

  const statsInterval = window.setInterval(() => {
    syncStats();
    if (!isPaused) {
      updateCharacterPosition();
    }
  }, 250);

  const keyHandler = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      if (isPaused) {
        closePause();
      } else {
        openPause();
      }
      return;
    }

    if (isPaused || isTransitioningLine || e.key === 'Tab') {
      e.preventDefault();
      return;
    }

    engine.handleKey(e.key, textDisplay);
  };

  pauseBtn.addEventListener('click', openPause);
  pauseResume.addEventListener('click', closePause);
  pauseRetry.addEventListener('click', onRetry);
  pauseQuit.addEventListener('click', onQuit);
  document.addEventListener('keydown', keyHandler);
  window.setTimeout(() => updateCharacterPosition(), 60);

  const cleanup = () => {
    window.clearInterval(statsInterval);
    document.removeEventListener('keydown', keyHandler);
    if (lineTransitionTimer !== null) {
      clearTimeout(lineTransitionTimer);
    }
    character.destroy();
  };

  return { el: screen, cleanup };
}
