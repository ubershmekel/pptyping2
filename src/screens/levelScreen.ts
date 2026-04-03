import type { Difficulty, LevelStats, Team } from '../types';
import { DIFFICULTY_DISPLAY, DIFFICULTY_THRESHOLDS } from '../types';
import { getLevelText } from '../data/wordLists';
import { getLevelDef, ARC_ENVIRONMENTS } from '../data/levels';
import { LEVEL_STORIES } from '../data/stories';
import { CharacterCompanion } from '../components/character';

// ─── Typing Engine ────────────────────────────────────────────────────────────

class TypingEngine {
  private text: string;
  private index = 0;
  private correctStrokes = 0;
  private totalStrokes  = 0;
  private startTime: number | null = null;
  private endTime:   number | null = null;
  private spans: HTMLSpanElement[] = [];

  onCorrect?: (charIndex: number) => void;
  onError?:   (charIndex: number) => void;
  onProgress?:(index: number, total: number) => void;
  onComplete?:(stats: LevelStats) => void;

  constructor(text: string) {
    // Normalize: lowercase, no leading/trailing spaces
    this.text = text.trim().toLowerCase();
  }

  /** Render character spans into the given container element. */
  renderInto(container: HTMLElement): void {
    container.innerHTML = '';
    this.spans = [];
    for (let i = 0; i < this.text.length; i++) {
      const span = document.createElement('span');
      const ch = this.text[i];
      span.textContent = ch === '\n' ? ' ' : ch;
      span.className = 'char pending';
      if (ch === ' ')  span.classList.add('is-space');
      if (ch === '\n') { span.classList.add('is-newline'); }
      if (i === 0) span.classList.add('current');
      this.spans.push(span);
      container.appendChild(span);
      if (ch === '\n') container.appendChild(document.createElement('br'));
    }
  }

  handleKey(key: string): void {
    if (this.index >= this.text.length) return;
    if (key.length !== 1) return; // ignore Shift, Ctrl, etc.

    if (this.startTime === null) this.startTime = Date.now();

    const expected = this.text[this.index];
    const pressed  = key.toLowerCase();
    this.totalStrokes++;

    if (pressed === expected || (expected === '\n' && pressed === ' ')) {
      // ✓ Correct
      this.correctStrokes++;
      const span = this.spans[this.index];
      span.classList.remove('current', 'pending');
      span.classList.add('done');
      this.index++;

      if (this.index < this.text.length) {
        this.spans[this.index].classList.remove('pending');
        this.spans[this.index].classList.add('current');
      }

      this.onCorrect?.(this.index - 1);
      this.onProgress?.(this.index, this.text.length);

      if (this.index >= this.text.length) {
        this.endTime = Date.now();
        this.onComplete?.(this.buildStats());
      }
    } else {
      // ✗ Error
      const span = this.spans[this.index];
      span.classList.add('error-flash');
      span.addEventListener('animationend', () => span.classList.remove('error-flash'), { once: true });
      this.onError?.(this.index);
    }
  }

  getLiveStats(): { wpm: number; accuracy: number; progress: number } {
    const elapsed = this.startTime ? (Date.now() - this.startTime) / 1000 : 0;
    const wpm = elapsed > 3
      ? Math.round((this.correctStrokes / 5) / (elapsed / 60))
      : 0;
    const accuracy = this.totalStrokes > 0
      ? Math.round((this.correctStrokes / this.totalStrokes) * 100)
      : 100;
    const progress = this.text.length > 0 ? this.index / this.text.length : 0;
    return { wpm, accuracy, progress };
  }

  getCurrentSpan(): HTMLSpanElement | null {
    return this.spans[this.index] ?? null;
  }

  private buildStats(): LevelStats {
    const elapsed = ((this.endTime ?? Date.now()) - (this.startTime ?? Date.now())) / 1000;
    const wpm = elapsed > 0 ? Math.round((this.correctStrokes / 5) / (elapsed / 60)) : 0;
    const accuracy = this.totalStrokes > 0
      ? Math.round((this.correctStrokes / this.totalStrokes) * 100)
      : 100;
    return {
      wpm,
      accuracy,
      timeSeconds: elapsed,
      errors:          this.totalStrokes - this.correctStrokes,
      totalKeystrokes: this.totalStrokes,
      passed: false, // app.ts will determine passed based on difficulty
    };
  }
}

// ─── Render level screen ──────────────────────────────────────────────────────

export function renderLevelScreen(
  team: Team,
  levelNumber: number,
  difficulty: Difficulty,
  onComplete: (stats: LevelStats) => void,
): { el: HTMLElement; cleanup: () => void } {
  const def = getLevelDef(levelNumber);
  const env = ARC_ENVIRONMENTS[def.arc];
  const storyText = LEVEL_STORIES[team][levelNumber] ?? '';
  const levelText = getLevelText(levelNumber);
  const thresholds = DIFFICULTY_THRESHOLDS[difficulty];
  const diffName = DIFFICULTY_DISPLAY[team][difficulty];

  // ── Build DOM ──────────────────────────────────────────────────────────────

  const screen = document.createElement('div');
  screen.className = `screen level-screen team-${team} ${env.cssClass}`;

  screen.innerHTML = `
    <!-- Top bar -->
    <div class="level-topbar">
      <div class="level-topbar-left">
        <span class="level-num">Level ${levelNumber}</span>
        <span class="level-env">${env.name}</span>
      </div>
      <div class="level-stats" id="live-stats">
        <span class="stat-wpm">  <span class="stat-val" id="stat-wpm-val">—</span> <span class="stat-label">WPM</span></span>
        <span class="stat-acc">  <span class="stat-val" id="stat-acc-val">100%</span><span class="stat-label">Accuracy</span></span>
        <span class="stat-goal"><span class="stat-label">Goal:</span> ${thresholds.wpm} WPM · ${thresholds.accuracy}% acc</span>
      </div>
      <div class="level-topbar-right">
        <span class="level-diff-badge team-${team}">${diffName}</span>
      </div>
    </div>

    <!-- Story blurb -->
    <div class="level-story" id="level-story">
      <div class="level-story-inner">${storyText}</div>
    </div>

    <!-- Main typing area -->
    <div class="level-body">
      <!-- Character track -->
      <div class="char-track" id="char-track">
        <!-- CharacterCompanion will be inserted here -->
      </div>

      <!-- Progress bar -->
      <div class="level-progress-bar">
        <div class="level-progress-fill" id="progress-fill" style="width:0%"></div>
      </div>

      <!-- Text display (the "document") -->
      <div class="text-display" id="text-display" tabindex="0" aria-label="Typing area" role="textbox" aria-readonly="true">
      </div>

      <!-- Focus hint -->
      <div class="focus-hint" id="focus-hint">
        Click here or press any key to start typing
      </div>
    </div>

    <!-- Combo / feedback overlay -->
    <div class="combo-overlay" id="combo-overlay" aria-hidden="true"></div>

    <!-- Env background decoration -->
    <div class="env-bg-deco" aria-hidden="true">
      <span class="env-particle"></span><span class="env-particle"></span>
      <span class="env-particle"></span><span class="env-particle"></span>
      <span class="env-particle"></span><span class="env-particle"></span>
      <span class="env-particle"></span><span class="env-particle"></span>
    </div>
  `;

  // ── Init engine ────────────────────────────────────────────────────────────

  const engine = new TypingEngine(levelText);
  const textDisplay = screen.querySelector('#text-display') as HTMLElement;
  const charTrack   = screen.querySelector('#char-track')   as HTMLElement;
  const focusHint   = screen.querySelector('#focus-hint')   as HTMLElement;
  const progressFill= screen.querySelector('#progress-fill')as HTMLElement;
  const wpmVal      = screen.querySelector('#stat-wpm-val') as HTMLElement;
  const accVal      = screen.querySelector('#stat-acc-val') as HTMLElement;
  const comboOverlay= screen.querySelector('#combo-overlay')as HTMLElement;

  engine.renderInto(textDisplay);

  // ── Character companion ───────────────────────────────────────────────────

  const character = new CharacterCompanion(team);
  character.mount(charTrack);

  // Keep character aligned with current span
  function updateCharacterPosition(): void {
    const span = engine.getCurrentSpan();
    if (!span) return;
    const trackRect = charTrack.getBoundingClientRect();
    const spanRect  = span.getBoundingClientRect();
    const relX = spanRect.left - trackRect.left + spanRect.width * 0.5;
    character.moveTo(relX);
  }

  // ── Live stats ticker ──────────────────────────────────────────────────────

  const statsInterval = setInterval(() => {
    const { wpm, accuracy, progress } = engine.getLiveStats();
    wpmVal.textContent = wpm > 0 ? String(wpm) : '—';
    accVal.textContent = `${accuracy}%`;
    progressFill.style.width = `${Math.round(progress * 100)}%`;
    updateCharacterPosition();
  }, 250);

  // ── Combo counter ─────────────────────────────────────────────────────────

  let comboCount = 0;
  let comboTimer: number | null = null;

  function showCombo(n: number): void {
    if (n < 10 || n % 10 !== 0) return;
    comboOverlay.textContent = `🔥 ${n} COMBO!`;
    comboOverlay.classList.add('combo-show');
    if (comboTimer !== null) clearTimeout(comboTimer);
    comboTimer = window.setTimeout(() => {
      comboOverlay.classList.remove('combo-show');
    }, 1200);
  }

  // ── Keystroke effects ─────────────────────────────────────────────────────

  function spawnEffect(span: HTMLSpanElement | null, type: 'correct' | 'error'): void {
    if (!span) return;
    const effect = document.createElement('div');
    effect.className = `keystroke-effect keystroke-${type}`;
    const rect   = span.getBoundingClientRect();
    const bodyRect = document.body.getBoundingClientRect();
    effect.style.left = `${rect.left - bodyRect.left + rect.width * 0.5}px`;
    effect.style.top  = `${rect.top  - bodyRect.top  - 6}px`;
    effect.textContent = type === 'correct' ? (team === 'pokemon' ? '⚡' : '✨') : '✗';
    document.body.appendChild(effect);
    effect.addEventListener('animationend', () => effect.remove(), { once: true });
  }

  // ── Engine callbacks ───────────────────────────────────────────────────────

  engine.onCorrect = (i) => {
    comboCount++;
    const prev = engine.getCurrentSpan();
    // spawnEffect on the span BEFORE advance (index i is the typed one)
    const spans = textDisplay.querySelectorAll('.char');
    spawnEffect(spans[i] as HTMLSpanElement, 'correct');
    showCombo(comboCount);
    if (comboCount % 10 === 0) character.celebrate();
    updateCharacterPosition();
    void prev;
  };

  engine.onError = (i) => {
    comboCount = 0;
    const spans = textDisplay.querySelectorAll('.char');
    spawnEffect(spans[i] as HTMLSpanElement, 'error');
    character.flinch();
  };

  engine.onComplete = (stats) => {
    clearInterval(statsInterval);
    const passed = stats.accuracy >= thresholds.accuracy && stats.wpm >= thresholds.wpm;
    const finalStats: LevelStats = { ...stats, passed };

    // Victory effect
    character.celebrate();
    screen.classList.add('level-complete-flash');
    document.removeEventListener('keydown', keyHandler);

    setTimeout(() => onComplete(finalStats), 800);
  };

  // ── Keyboard listener ──────────────────────────────────────────────────────

  let started = false;

  const keyHandler = (e: KeyboardEvent) => {
    // Ignore modifier-only keys
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Tab') { e.preventDefault(); return; }

    if (!started) {
      started = true;
      focusHint.classList.add('hint-hidden');
    }
    engine.handleKey(e.key);
  };

  document.addEventListener('keydown', keyHandler);

  // Click on text area focuses it and hides hint
  textDisplay.addEventListener('click', () => {
    focusHint.classList.add('hint-hidden');
  });

  // Initial character position
  setTimeout(updateCharacterPosition, 100);

  const cleanup = () => {
    clearInterval(statsInterval);
    document.removeEventListener('keydown', keyHandler);
    if (comboTimer !== null) clearTimeout(comboTimer);
    character.destroy();
  };

  return { el: screen, cleanup };
}
