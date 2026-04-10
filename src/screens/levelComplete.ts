import "./levelComplete.css";
import type {
  Difficulty,
  LevelStats,
  ScreenMount,
  SpeedTestEntry,
  Team,
} from "../types";
import { createScreenMount } from "../screenMount";
import { DIFFICULTY_THRESHOLDS } from "../types";
import { CHAR_TO_LEARN_LEVEL, getLevelDef, MAX_LEVEL } from "../data/levels";

export function renderLevelComplete(
  team: Team,
  levelNumber: number,
  stats: LevelStats,
  difficulty: Difficulty,
  onNext: () => void,
  onRetry: () => void,
  onLevelSelect: () => void,
  speedTestHistory?: SpeedTestEntry[],
): ScreenMount {
  const isSpeedTest = levelNumber === 1;
  const screen = document.createElement("div");
  const mount = createScreenMount(screen);

  if (isSpeedTest) {
    screen.className = `screen level-complete-screen team-${team} lc-passed`;
    const history = speedTestHistory ?? [];
    // All runs including this one are already in history (appended before navigate).
    // Show all entries newest-first, skip none.
    const historyRows =
      history.length > 0
        ? history
            .slice()
            .reverse()
            .map(
              (e, i) => `
        <tr class="${i === 0 ? "lc-hist-latest" : ""}">
          <td>${e.date}</td>
          <td>${e.wpm} WPM</td>
          <td>${e.accuracy}%</td>
        </tr>`,
            )
            .join("")
        : "";

    screen.innerHTML = `
      <div class="lc-content">
        <div class="lc-header">
          <div class="lc-result-badge badge-pass">Speed Test Done</div>
          <h2 class="lc-level-title">Level 1</h2>
        </div>

        <div class="lc-stats">
          <div class="lc-stat-row">
            <span class="lc-stat-label">Speed</span>
            <div class="lc-stat-bar-track">
              <div class="lc-stat-bar stat-bar-pass lc-bar-animated" style="width: ${Math.min(100, stats.wpm)}%"></div>
            </div>
            <span class="lc-stat-val val-pass">${stats.wpm} WPM</span>
          </div>
          <div class="lc-stat-row">
            <span class="lc-stat-label">Accuracy</span>
            <div class="lc-stat-bar-track">
              <div class="lc-stat-bar stat-bar-pass lc-bar-animated" style="width: ${Math.min(100, stats.accuracy)}%"></div>
            </div>
            <span class="lc-stat-val val-pass">${stats.accuracy}%</span>
          </div>
          <div class="lc-stat-row lc-extras">
            <span>Time: <strong>${formatTime(stats.timeSeconds)}</strong></span>
            <span>Errors: <strong>${stats.errors}</strong></span>
            <span>Keystrokes: <strong>${stats.totalKeystrokes}</strong></span>
          </div>
        </div>

        <div class="lc-message lc-message-pass">
          That's your starting point — keep playing and come back to see how much you've improved.
        </div>

        ${
          historyRows
            ? `<div class="lc-history">
            <div class="lc-history-label">Your speed test history</div>
            <table class="lc-history-table">
              <tbody>${historyRows}</tbody>
            </table>
          </div>`
            : ""
        }

        <div class="lc-actions">
          <button class="lc-btn lc-btn-primary" id="lc-next">Next Level →</button>
          <button class="lc-btn lc-btn-secondary" id="lc-retry">Retry ↺</button>
          <button class="lc-btn lc-btn-secondary" id="lc-level-select">Level Select</button>
        </div>
      </div>

      <div class="lc-particles" aria-hidden="true">
        ${Array.from({ length: 16 }, () => '<span class="lc-particle"></span>').join("")}
      </div>
    `;
  } else {
    const thresholds = DIFFICULTY_THRESHOLDS[difficulty];
    const passed = stats.passed;
    const levelDef = getLevelDef(levelNumber);
    const isSpeedCheck = levelDef.isSpeedTest || levelNumber === MAX_LEVEL;

    screen.className = `screen level-complete-screen team-${team} ${passed ? "lc-passed" : "lc-failed"}`;

    const wpmBar = Math.min(
      100,
      Math.round((stats.wpm / Math.max(thresholds.wpm, 1)) * 100),
    );
    const accBar = Math.min(100, stats.accuracy);

    const wpmColor =
      stats.wpm >= thresholds.wpm ? "stat-bar-pass" : "stat-bar-fail";
    const accColor =
      stats.accuracy >= thresholds.accuracy ? "stat-bar-pass" : "stat-bar-fail";

    const retryRec = levelDef.isFinale
      ? buildRetryRecommendation(stats, levelDef.availableLetters)
      : null;

    screen.innerHTML = `
      <div class="lc-content">
        <!-- Header -->
        <div class="lc-header">
          <div class="lc-result-badge ${passed ? "badge-pass" : "badge-fail"}">
            ${passed ? "✓ Level Complete!" : "✗ Not quite!"}
          </div>
          <h2 class="lc-level-title">${isSpeedCheck ? `Level ${levelNumber} — Speed Check` : `Level ${levelNumber}`}</h2>
        </div>

        <!-- Stats -->
        <div class="lc-stats">
          <div class="lc-stat-row">
            <span class="lc-stat-label">Speed</span>
            <div class="lc-stat-bar-track">
              <div class="lc-stat-bar ${wpmColor}" style="width: ${wpmBar}%"></div>
              <div class="lc-threshold-marker" style="left: ${Math.min(100, Math.round((thresholds.wpm / Math.max(stats.wpm, thresholds.wpm, 1)) * 100))}%"></div>
            </div>
            <span class="lc-stat-val ${stats.wpm >= thresholds.wpm ? "val-pass" : "val-fail"}">
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
            <span class="lc-stat-val ${stats.accuracy >= thresholds.accuracy ? "val-pass" : "val-fail"}">
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
        <div class="lc-message ${passed ? "lc-message-pass" : "lc-message-fail"}">
          ${getFeedbackMessage(team, passed, stats)}
        </div>

        <!-- Retry recommendation (failed finales only) -->
        ${retryRec ? `<div class="lc-retry-rec">${retryRec}</div>` : ""}

        <!-- Actions -->
        <div class="lc-actions">
          ${
            passed
              ? `<button class="lc-btn lc-btn-primary" id="lc-next">
                 ${levelNumber >= MAX_LEVEL ? "🏆 See Finale" : "Next Level →"}
               </button>`
              : `<button class="lc-btn lc-btn-primary" id="lc-retry">
                 Try Again ↺
               </button>`
          }
          ${
            !passed
              ? `<button class="lc-btn lc-btn-secondary" id="lc-next-anyway">
            Skip ahead anyway →
          </button>`
              : ""
          }
          <button class="lc-btn lc-btn-secondary" id="lc-level-select">Level Select</button>
        </div>

      </div>

      <!-- Particles -->
      <div class="lc-particles" aria-hidden="true">
        ${Array.from({ length: 16 }, () => '<span class="lc-particle"></span>').join("")}
      </div>
    `;
  }

  // Next / Retry buttons
  const nextBtn = screen.querySelector("#lc-next");
  const retryBtn = screen.querySelector("#lc-retry");
  const nextAnywayBtn = screen.querySelector("#lc-next-anyway");
  const levelSelectBtn = screen.querySelector("#lc-level-select");
  if (nextBtn) mount.listen(nextBtn, "click", onNext);
  if (retryBtn) mount.listen(retryBtn, "click", onRetry);
  if (nextAnywayBtn) mount.listen(nextAnywayBtn, "click", onNext);
  if (levelSelectBtn) mount.listen(levelSelectBtn, "click", onLevelSelect);

  // Animate stat bars in
  mount.timeout(() => {
    screen.querySelectorAll(".lc-stat-bar").forEach((bar) => {
      (bar as HTMLElement).classList.add("lc-bar-animated");
    });
  }, 200);

  return mount;
}

// Curriculum order — used to break ties (prefer latest)
const CURRICULUM_ORDER = "fjetoainhsrludywmgcpkbvxqz";

function buildRetryRecommendation(
  stats: LevelStats,
  availableLetters: string,
): string {
  const chars = availableLetters.split("").filter((c) => c !== " ");

  // Most-errored char
  let maxErrors = -1;
  let worstErrorChar = "";
  for (const char of CURRICULUM_ORDER) {
    if (!chars.includes(char)) continue;
    const count = stats.charErrors[char] ?? 0;
    if (count >= maxErrors) {
      maxErrors = count;
      worstErrorChar = char;
    }
  }

  // Slowest char (highest average time between keystrokes)
  let maxAvgTime = -1;
  let slowestChar = "";
  for (const char of CURRICULUM_ORDER) {
    if (!chars.includes(char)) continue;
    const avg = stats.charAvgTimes[char] ?? 0;
    if (avg >= maxAvgTime) {
      maxAvgTime = avg;
      slowestChar = char;
    }
  }

  const lines: string[] = [];
  const hasErrors = maxErrors > 0 && worstErrorChar;
  const hasTiming = !!slowestChar;

  if (hasErrors && hasTiming && worstErrorChar === slowestChar) {
    const level = CHAR_TO_LEARN_LEVEL[worstErrorChar];
    const levelHint = level ? ` Replay Level ${level} to work on it.` : "";
    lines.push(
      `<strong>"${worstErrorChar}"</strong> was your most-missed and slowest key.${levelHint}`,
    );
  } else {
    if (hasErrors) {
      const level = CHAR_TO_LEARN_LEVEL[worstErrorChar];
      const levelHint = level ? ` — replay Level ${level} to drill it` : "";
      lines.push(
        `You missed <strong>"${worstErrorChar}"</strong> most often${levelHint}.`,
      );
    }

    if (hasTiming) {
      const level = CHAR_TO_LEARN_LEVEL[slowestChar];
      const levelHint = level ? ` — replay Level ${level} to build speed` : "";
      lines.push(
        `<strong>"${slowestChar}"</strong> was your slowest key${levelHint}.`,
      );
    }
  }

  return lines.join("<br>");
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function getFeedbackMessage(
  team: Team,
  passed: boolean,
  stats: LevelStats,
): string {
  if (team === "pokemon") {
    if (passed) {
      if (stats.wpm >= 50)
        return "⚡ Incredible! Pikachu's fingers are a blur of lightning!";
      if (stats.wpm >= 30)
        return "⚡ Great work! The corruption retreats before Pikachu's speed!";
      return "⚡ Well done! Pikachu cleanses the keys with steady determination!";
    } else {
      if (stats.accuracy < DIFFICULTY_THRESHOLDS["easy"].accuracy)
        return "⚡ Slow down and aim carefully — Pikachu's strikes need to hit their mark!";
      return "⚡ So close! A little more speed and Pikachu will break through!";
    }
  } else {
    if (passed) {
      if (stats.wpm >= 50)
        return "🌈 Spectacular! Pinkie's hooves move at the speed of friendship!";
      if (stats.wpm >= 30)
        return "🌈 Wonderful! Each keystroke radiates with the magic of friendship!";
      return "🌈 Lovely! Pinkie befriends the keys with warm, steady care!";
    } else {
      if (stats.accuracy < DIFFICULTY_THRESHOLDS["easy"].accuracy)
        return "🌈 Easy does it! Friendship takes patience — slow down and type with care!";
      return "🌈 Almost there! A little more speed and Pinkie wins the day!";
    }
  }
}
