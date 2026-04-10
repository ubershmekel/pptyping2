<template>
  <div
    ref="screenEl"
    :class="`screen level-complete-screen team-${team} ${isSpeedTest ? 'lc-passed' : stats.passed ? 'lc-passed' : 'lc-failed'}`"
  >
    <!-- Speed Test completion -->
    <template v-if="isSpeedTest">
      <div class="lc-content">
        <div class="lc-header">
          <div class="lc-result-badge badge-pass">Speed Test Done</div>
          <h2 class="lc-level-title">Level 1</h2>
        </div>
        <div class="lc-stats">
          <div class="lc-stat-row">
            <span class="lc-stat-label">Speed</span>
            <div class="lc-stat-bar-track">
              <div
                class="lc-stat-bar stat-bar-pass lc-bar-animated"
                :style="`width: ${Math.min(100, stats.wpm)}%`"
              ></div>
            </div>
            <span class="lc-stat-val val-pass">{{ stats.wpm }} WPM</span>
          </div>
          <div class="lc-stat-row">
            <span class="lc-stat-label">Accuracy</span>
            <div class="lc-stat-bar-track">
              <div
                class="lc-stat-bar stat-bar-pass lc-bar-animated"
                :style="`width: ${Math.min(100, stats.accuracy)}%`"
              ></div>
            </div>
            <span class="lc-stat-val val-pass">{{ stats.accuracy }}%</span>
          </div>
          <div class="lc-stat-row lc-extras">
            <span
              >Time: <strong>{{ formatTime(stats.timeSeconds) }}</strong></span
            >
            <span
              >Errors: <strong>{{ stats.errors }}</strong></span
            >
            <span
              >Keystrokes: <strong>{{ stats.totalKeystrokes }}</strong></span
            >
          </div>
        </div>
        <div class="lc-message lc-message-pass">
          That's your starting point — keep playing and come back to see how
          much you've improved.
        </div>
        <div
          v-if="speedTestHistory && speedTestHistory.length > 0"
          class="lc-history"
        >
          <div class="lc-history-label">Your speed test history</div>
          <table class="lc-history-table">
            <tbody>
              <tr
                v-for="(entry, i) in [...speedTestHistory].reverse()"
                :key="i"
                :class="i === 0 ? 'lc-hist-latest' : ''"
              >
                <td>{{ entry.date }}</td>
                <td>{{ entry.wpm }} WPM</td>
                <td>{{ entry.accuracy }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="lc-actions">
          <button class="lc-btn lc-btn-primary" @click="emit('next')">
            Next Level →
          </button>
          <button class="lc-btn lc-btn-secondary" @click="emit('retry')">
            Retry ↺
          </button>
          <button class="lc-btn lc-btn-secondary" @click="emit('levelSelect')">
            Level Select
          </button>
        </div>
      </div>
    </template>

    <!-- Regular level completion -->
    <template v-else>
      <div class="lc-content">
        <div class="lc-header">
          <div
            :class="`lc-result-badge ${stats.passed ? 'badge-pass' : 'badge-fail'}`"
          >
            {{ stats.passed ? "✓ Level Complete!" : "✗ Not quite!" }}
          </div>
          <h2 class="lc-level-title">
            {{
              isSpeedCheckLevel
                ? `Level ${levelNumber} — Speed Check`
                : `Level ${levelNumber}`
            }}
          </h2>
        </div>

        <div class="lc-stats">
          <div class="lc-stat-row">
            <span class="lc-stat-label">Speed</span>
            <div class="lc-stat-bar-track">
              <div
                class="lc-stat-bar"
                :class="
                  stats.wpm >= thresholds.wpm
                    ? 'stat-bar-pass'
                    : 'stat-bar-fail'
                "
                :style="`width: ${wpmBarWidth}%`"
                ref="wpmBar"
              ></div>
              <div
                class="lc-threshold-marker"
                :style="`left: ${wpmThresholdLeft}%`"
              ></div>
            </div>
            <span
              class="lc-stat-val"
              :class="stats.wpm >= thresholds.wpm ? 'val-pass' : 'val-fail'"
            >
              {{ stats.wpm }} WPM
              <span class="lc-stat-goal">(need {{ thresholds.wpm }})</span>
            </span>
          </div>
          <div class="lc-stat-row">
            <span class="lc-stat-label">Accuracy</span>
            <div class="lc-stat-bar-track">
              <div
                class="lc-stat-bar"
                :class="
                  stats.accuracy >= thresholds.accuracy
                    ? 'stat-bar-pass'
                    : 'stat-bar-fail'
                "
                :style="`width: ${Math.min(100, stats.accuracy)}%`"
                ref="accBar"
              ></div>
              <div
                class="lc-threshold-marker"
                :style="`left: ${thresholds.accuracy}%`"
              ></div>
            </div>
            <span
              class="lc-stat-val"
              :class="
                stats.accuracy >= thresholds.accuracy ? 'val-pass' : 'val-fail'
              "
            >
              {{ stats.accuracy }}%
              <span class="lc-stat-goal"
                >(need {{ thresholds.accuracy }}%)</span
              >
            </span>
          </div>
          <div class="lc-stat-row lc-extras">
            <span
              >Time: <strong>{{ formatTime(stats.timeSeconds) }}</strong></span
            >
            <span
              >Errors: <strong>{{ stats.errors }}</strong></span
            >
            <span
              >Keystrokes: <strong>{{ stats.totalKeystrokes }}</strong></span
            >
          </div>
        </div>

        <div
          :class="`lc-message ${stats.passed ? 'lc-message-pass' : 'lc-message-fail'}`"
        >
          {{ feedbackMessage }}
        </div>

        <div v-if="retryRec" class="lc-retry-rec" v-html="retryRec"></div>

        <div class="lc-actions">
          <button
            v-if="stats.passed"
            class="lc-btn lc-btn-primary"
            @click="emit('next')"
          >
            {{ levelNumber >= MAX_LEVEL ? "🏆 See Finale" : "Next Level →" }}
          </button>
          <button v-else class="lc-btn lc-btn-primary" @click="emit('retry')">
            Try Again ↺
          </button>
          <button
            v-if="!stats.passed"
            class="lc-btn lc-btn-secondary"
            @click="emit('next')"
          >
            Skip ahead anyway →
          </button>
          <button class="lc-btn lc-btn-secondary" @click="emit('levelSelect')">
            Level Select
          </button>
        </div>
      </div>
    </template>

    <div class="lc-particles" aria-hidden="true">
      <span v-for="n in 16" :key="n" class="lc-particle"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import "./levelComplete.css";
import type { Difficulty, LevelStats, SpeedTestEntry, Team } from "../types";
import { DIFFICULTY_THRESHOLDS } from "../types";
import { CHAR_TO_LEARN_LEVEL, getLevelDef, MAX_LEVEL } from "../data/levels";

const props = defineProps<{
  levelNumber: number;
  stats: LevelStats;
  team: Team;
  difficulty: Difficulty;
  speedTestHistory?: SpeedTestEntry[];
}>();

const emit = defineEmits<{ next: []; retry: []; levelSelect: [] }>();

const screenEl = ref<HTMLElement | null>(null);
const wpmBar = ref<HTMLElement | null>(null);
const accBar = ref<HTMLElement | null>(null);

const isSpeedTest = computed(() => props.levelNumber === 1);
const levelDef = computed(() => getLevelDef(props.levelNumber));
const isSpeedCheckLevel = computed(
  () => levelDef.value.isSpeedTest || props.levelNumber === MAX_LEVEL,
);
const thresholds = computed(() => DIFFICULTY_THRESHOLDS[props.difficulty]);

const wpmBarWidth = computed(() =>
  Math.min(
    100,
    Math.round((props.stats.wpm / Math.max(thresholds.value.wpm, 1)) * 100),
  ),
);
const wpmThresholdLeft = computed(() =>
  Math.min(
    100,
    Math.round(
      (thresholds.value.wpm /
        Math.max(props.stats.wpm, thresholds.value.wpm, 1)) *
        100,
    ),
  ),
);

const CURRICULUM_ORDER = "fjetoainhsrludywmgcpkbvxqz";

const retryRec = computed((): string | null => {
  if (!levelDef.value.isFinale) return null;
  const chars = levelDef.value.availableLetters
    .split("")
    .filter((c) => c !== " ");
  let maxErrors = -1;
  let worstErrorChar = "";
  for (const char of CURRICULUM_ORDER) {
    if (!chars.includes(char)) continue;
    const count = props.stats.charErrors[char] ?? 0;
    if (count >= maxErrors) {
      maxErrors = count;
      worstErrorChar = char;
    }
  }
  let maxAvgTime = -1;
  let slowestChar = "";
  for (const char of CURRICULUM_ORDER) {
    if (!chars.includes(char)) continue;
    const avg = props.stats.charAvgTimes[char] ?? 0;
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
    const hint = level ? ` Replay Level ${level} to work on it.` : "";
    lines.push(
      `<strong>"${worstErrorChar}"</strong> was your most-missed and slowest key.${hint}`,
    );
  } else {
    if (hasErrors) {
      const level = CHAR_TO_LEARN_LEVEL[worstErrorChar];
      const hint = level ? ` — replay Level ${level} to drill it` : "";
      lines.push(
        `You missed <strong>"${worstErrorChar}"</strong> most often${hint}.`,
      );
    }
    if (hasTiming) {
      const level = CHAR_TO_LEARN_LEVEL[slowestChar];
      const hint = level ? ` — replay Level ${level} to build speed` : "";
      lines.push(
        `<strong>"${slowestChar}"</strong> was your slowest key${hint}.`,
      );
    }
  }
  return lines.length > 0 ? lines.join("<br>") : null;
});

const feedbackMessage = computed(() => {
  const { team, stats } = props;
  if (team === "pokemon") {
    if (stats.passed) {
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
    if (stats.passed) {
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
});

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

onMounted(() => {
  if (screenEl.value) {
    screenEl.value.classList.add("screen-enter");
    requestAnimationFrame(() =>
      screenEl.value?.classList.remove("screen-enter"),
    );
  }

  // Animate stat bars in (non-speed-test only)
  if (!isSpeedTest.value) {
    setTimeout(() => {
      screenEl.value?.querySelectorAll(".lc-stat-bar").forEach((bar) => {
        (bar as HTMLElement).classList.add("lc-bar-animated");
      });
    }, 200);
  }
});
</script>
