import './levelComplete.css';
import type { Difficulty, LevelStats, ScreenMount, Team } from '../types';
import { DIFFICULTY_DISPLAY, DIFFICULTY_THRESHOLDS } from '../types';

export function renderLevelComplete(
  team: Team,
  levelNumber: number,
  stats: LevelStats,
  difficulty: Difficulty,
  onNext:             () => void,
  onRetry:            () => void,
  onLevelSelect:      () => void,
  onChangeDifficulty: (d: Difficulty) => void,
): ScreenMount {
  const thresholds = DIFFICULTY_THRESHOLDS[difficulty];
  const diffName   = DIFFICULTY_DISPLAY[team][difficulty];
  const passed     = stats.passed;

  const screen = document.createElement('div');
  screen.className = `screen level-complete-screen team-${team} ${passed ? 'lc-passed' : 'lc-failed'}`;

  const wpmBar  = Math.min(100, Math.round((stats.wpm  / Math.max(thresholds.wpm, 1)) * 100));
  const accBar  = Math.min(100, stats.accuracy);

  const wpmColor  = stats.wpm  >= thresholds.wpm  ? 'stat-bar-pass' : 'stat-bar-fail';
  const accColor  = stats.accuracy >= thresholds.accuracy ? 'stat-bar-pass' : 'stat-bar-fail';

  const difficultyOptions: Difficulty[] = ['easy', 'medium', 'hard'];

  screen.innerHTML = `
    <div class="lc-content">
      <!-- Header -->
      <div class="lc-header">
        <div class="lc-result-badge ${passed ? 'badge-pass' : 'badge-fail'}">
          ${passed ? '✓ Level Complete!' : '✗ Not quite!'}
        </div>
        <h2 class="lc-level-title">Level ${levelNumber}</h2>
        <p class="lc-difficulty-line">Playing as: <strong>${diffName}</strong></p>
      </div>

      <!-- Stats -->
      <div class="lc-stats">
        <div class="lc-stat-row">
          <span class="lc-stat-label">Speed</span>
          <div class="lc-stat-bar-track">
            <div class="lc-stat-bar ${wpmColor}" style="width: ${wpmBar}%"></div>
            <div class="lc-threshold-marker" style="left: ${Math.min(100, Math.round((thresholds.wpm / Math.max(stats.wpm, thresholds.wpm, 1)) * 100))}%"></div>
          </div>
          <span class="lc-stat-val ${stats.wpm >= thresholds.wpm ? 'val-pass' : 'val-fail'}">
            ${stats.wpm} WPM
            <span class="lc-stat-goal">(need ${thresholds.wpm})</span>
          </span>
        </div>
        <div class="lc-stat-row">
          <span class="lc-stat-label">Accuracy</span>
          <div class="lc-stat-bar-track">
            <div class="lc-stat-bar ${accColor}" style="width: ${accBar}%"></div>
            <div class="lc-threshold-marker" style="left: ${thresholds.accuracy}%"></div>
          </div>
          <span class="lc-stat-val ${stats.accuracy >= thresholds.accuracy ? 'val-pass' : 'val-fail'}">
            ${stats.accuracy}%
            <span class="lc-stat-goal">(need ${thresholds.accuracy}%)</span>
          </span>
        </div>
        <div class="lc-stat-row lc-extras">
          <span>Time: <strong>${formatTime(stats.timeSeconds)}</strong></span>
          <span>Errors: <strong>${stats.errors}</strong></span>
          <span>Keystrokes: <strong>${stats.totalKeystrokes}</strong></span>
        </div>
      </div>

      <!-- Feedback message -->
      <div class="lc-message ${passed ? 'lc-message-pass' : 'lc-message-fail'}">
        ${getFeedbackMessage(team, passed, stats)}
      </div>

      <!-- Actions -->
      <div class="lc-actions">
        ${passed
          ? `<button class="lc-btn lc-btn-primary" id="lc-next">
               ${levelNumber >= 14 ? '🏆 See Finale' : 'Next Level →'}
             </button>`
          : `<button class="lc-btn lc-btn-primary" id="lc-retry">
               Try Again ↺
             </button>`
        }
        ${!passed ? `<button class="lc-btn lc-btn-secondary" id="lc-next-anyway">
          Skip ahead anyway →
        </button>` : ''}
        <button class="lc-btn lc-btn-secondary" id="lc-level-select">Level Select</button>
      </div>

      <!-- Difficulty switcher -->
      <div class="lc-difficulty-switcher">
        <span class="lc-diff-label">Change difficulty:</span>
        <div class="lc-diff-options">
          ${difficultyOptions.map(d => `
            <button
              class="lc-diff-btn ${d === difficulty ? 'lc-diff-active' : ''}"
              data-diff="${d}"
              aria-pressed="${d === difficulty}"
            >
              ${DIFFICULTY_DISPLAY[team][d]}
            </button>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Particles -->
    <div class="lc-particles" aria-hidden="true">
      ${Array.from({ length: 16 }, () => '<span class="lc-particle"></span>').join('')}
    </div>
  `;

  // Next / Retry buttons
  const nextBtn = screen.querySelector('#lc-next');
  const retryBtn = screen.querySelector('#lc-retry');
  const nextAnywayBtn = screen.querySelector('#lc-next-anyway');
  const levelSelectBtn = screen.querySelector('#lc-level-select');
  nextBtn?.addEventListener('click', onNext);
  retryBtn?.addEventListener('click', onRetry);
  nextAnywayBtn?.addEventListener('click', onNext);
  levelSelectBtn?.addEventListener('click', onLevelSelect);

  // Difficulty buttons
  const difficultyButtons = Array.from(screen.querySelectorAll<HTMLButtonElement>('.lc-diff-btn'));
  const difficultyHandlers = new Map<HTMLButtonElement, EventListener>();
  difficultyButtons.forEach(btn => {
    const clickHandler: EventListener = () => {
      const d = (btn as HTMLElement).dataset.diff as Difficulty;
      screen.querySelectorAll('.lc-diff-btn').forEach(b => {
        b.classList.toggle('lc-diff-active', b === btn);
        (b as HTMLButtonElement).setAttribute('aria-pressed', String(b === btn));
      });
      onChangeDifficulty(d);
    };
    difficultyHandlers.set(btn, clickHandler);
    btn.addEventListener('click', clickHandler);
  });

  // Animate stat bars in
  let barAnimationTimer: number | null = window.setTimeout(() => {
    screen.querySelectorAll('.lc-stat-bar').forEach(bar => {
      (bar as HTMLElement).classList.add('lc-bar-animated');
    });
    barAnimationTimer = null;
  }, 200);

  return {
    el: screen,
    cleanup: () => {
      nextBtn?.removeEventListener('click', onNext);
      retryBtn?.removeEventListener('click', onRetry);
      nextAnywayBtn?.removeEventListener('click', onNext);
      levelSelectBtn?.removeEventListener('click', onLevelSelect);
      difficultyButtons.forEach(btn => {
        const clickHandler = difficultyHandlers.get(btn);
        if (clickHandler) {
          btn.removeEventListener('click', clickHandler);
        }
      });
      if (barAnimationTimer !== null) {
        window.clearTimeout(barAnimationTimer);
        barAnimationTimer = null;
      }
    },
  };
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function getFeedbackMessage(team: Team, passed: boolean, stats: LevelStats): string {
  if (team === 'pokemon') {
    if (passed) {
      if (stats.wpm >= 50) return "⚡ Incredible! Pikachu's fingers are a blur of lightning!";
      if (stats.wpm >= 30) return "⚡ Great work! The corruption retreats before Pikachu's speed!";
      return "⚡ Well done! Pikachu cleanses the keys with steady determination!";
    } else {
      if (stats.accuracy < DIFFICULTY_THRESHOLDS['easy'].accuracy)
        return "⚡ Slow down and aim carefully — Pikachu's strikes need to hit their mark!";
      return "⚡ So close! A little more speed and Pikachu will break through!";
    }
  } else {
    if (passed) {
      if (stats.wpm >= 50) return "🌈 Spectacular! Pinkie's hooves move at the speed of friendship!";
      if (stats.wpm >= 30) return "🌈 Wonderful! Each keystroke radiates with the magic of friendship!";
      return "🌈 Lovely! Pinkie befriends the keys with warm, steady care!";
    } else {
      if (stats.accuracy < DIFFICULTY_THRESHOLDS['easy'].accuracy)
        return "🌈 Easy does it! Friendship takes patience — slow down and type with care!";
      return "🌈 Almost there! A little more speed and Pinkie wins the day!";
    }
  }
}
