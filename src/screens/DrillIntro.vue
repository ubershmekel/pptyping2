<template>
  <div :class="`screen drill-intro-screen team-${team}`">
    <div class="di-content">
      <div class="di-header">
        <h2 class="di-title">Speed Check Complete</h2>
        <div class="di-summary">
          <span
            ><strong>{{ stats.wpm }}</strong> WPM</span
          >
          <span
            ><strong>{{ stats.accuracy }}</strong
            >% accuracy</span
          >
        </div>
      </div>

      <div>
        <div class="di-section-label">
          Your keys by reaction time (slowest first)
        </div>
        <div class="di-table-wrap">
          <table class="di-table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Avg ms</th>
                <th>Errors</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="entry in sortedKeys"
                :key="entry.char"
                :class="focusLetters.has(entry.char) ? 'di-row-target' : ''"
              >
                <td class="di-key-cell">{{ entry.char.toUpperCase() }}</td>
                <td>{{ entry.avgMs }}</td>
                <td>{{ entry.errors }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="di-drill-announce">
        <strong>Today's drill:</strong>
        <span
          v-for="ch in drillLetters"
          :key="ch"
          :class="[
            'di-key-chip',
            focusLetters.has(ch) ? 'di-key-chip-focus' : '',
          ]"
          >{{ ch.toUpperCase() }}</span
        >
      </div>

      <div class="di-actions">
        <button class="di-btn-primary" @click="emit('drill', drillLetters)">
          Start Drill →
        </button>
        <button class="di-btn-secondary" @click="emit('retry')">
          Retry Speed Check
        </button>
        <button class="di-btn-secondary" @click="emit('mainMenu')">
          Main Menu
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import "./drillIntro.css";
import type { LevelStats, Team } from "../types";

const props = defineProps<{
  stats: LevelStats;
  team: Team;
}>();

const emit = defineEmits<{
  drill: [letters: string[]];
  retry: [];
  mainMenu: [];
}>();

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

const sortedKeys = computed(() => {
  return ALPHABET.split("")
    .filter((ch) => props.stats.charAvgTimes[ch] !== undefined)
    .map((ch) => ({
      char: ch,
      avgMs: Math.round(props.stats.charAvgTimes[ch]),
      errors: props.stats.charErrors[ch] ?? 0,
    }))
    .sort((a, b) => b.avgMs - a.avgMs);
});

const ANCHORS = ["f", "j", "a", "l"];
const ANCHOR_SET = new Set(ANCHORS);

// fjal always included; add the 2 slowest non-anchor letters to reach 6.
const extraLetters = computed(() =>
  sortedKeys.value
    .filter((e) => !ANCHOR_SET.has(e.char))
    .slice(0, 2)
    .map((e) => e.char),
);

const drillLetters = computed(() => [...ANCHORS, ...extraLetters.value]);

// The 2 extra (non-anchor) letters get visual emphasis.
const focusLetters = computed(() => new Set(extraLetters.value));
</script>
