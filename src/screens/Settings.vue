<template>
  <div ref="screenEl" class="screen settings-screen">
    <div class="st-bg"></div>
    <div class="st-layout">
      <div class="st-header">
        <button class="st-back-btn" @click="router.push('/')">← Back</button>
        <h2 class="st-title">Settings</h2>
      </div>
      <div class="st-body">
        <section class="st-card">
          <h3 class="st-card-title">About</h3>
          <p class="st-about-text">
            PP Typing is a free typing game featuring Pokémon and My Little Pony
            characters. Practice your typing while watching your favorite
            characters run! This unofficial fan game is not endorsed by or
            officially licensed by anyone.
          </p>
          <a
            class="st-link-btn"
            href="https://github.com/ubershmekel/pptyping2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              class="st-github-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.11.793-.26.793-.577
                v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756
                -1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237
                1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604
                -2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221
                -.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12
                5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242
                2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921
                .43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24
                12c0-6.63-5.37-12-12-12z"
              />
            </svg>
            View on GitHub
          </a>
        </section>

        <section class="st-card">
          <h3 class="st-card-title">Difficulty</h3>
          <div class="st-diff-options">
            <button
              v-for="d in DIFFICULTIES"
              :key="d"
              class="st-diff-btn"
              :class="{ 'st-diff-active': d === profile.difficulty }"
              :aria-pressed="d === profile.difficulty"
              @click="changeDifficulty(d)"
            >
              <span class="st-diff-name">{{
                DIFFICULTY_DISPLAY[profile.activeTeam][d]
              }}</span>
              <span class="st-diff-req"
                >{{ DIFFICULTY_THRESHOLDS[d].wpm }} WPM ·
                {{ DIFFICULTY_THRESHOLDS[d].accuracy }}% acc</span
              >
            </button>
          </div>
        </section>

        <section class="st-card">
          <h3 class="st-card-title">Activity Log</h3>
          <p v-if="profile.activityLog.length === 0" class="st-log-empty">
            No attempts yet. Complete a level to see your history here.
          </p>
          <div v-else class="st-log-wrap">
            <table class="st-log-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Level</th>
                  <th>WPM</th>
                  <th>Acc</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(entry, i) in [...profile.activityLog].reverse()"
                  :key="i"
                  :class="entry.passed ? 'st-log-pass' : 'st-log-fail'"
                >
                  <td>{{ entry.date }}</td>
                  <td>
                    {{
                      entry.type === "training-speedcheck"
                        ? "Training: Speed Check"
                        : entry.type === "training-drill"
                          ? "Training: Drill"
                          : `Level ${entry.levelNumber}`
                    }}
                  </td>
                  <td>{{ entry.wpm }}</td>
                  <td>{{ entry.accuracy }}%</td>
                  <td class="st-log-result">{{ entry.passed ? "✓" : "✗" }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import "./settings.css";
import { useProfile } from "../composables/useProfile";
import { DIFFICULTY_DISPLAY, DIFFICULTY_THRESHOLDS } from "../types";
import type { Difficulty } from "../types";

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

const router = useRouter();
const { profile: profileRef, onSetDifficulty } = useProfile();
const profile = computed(() => profileRef.value);

const screenEl = ref<HTMLElement | null>(null);

function changeDifficulty(d: Difficulty): void {
  onSetDifficulty(d);
}

onMounted(() => {
  if (screenEl.value) {
    screenEl.value.classList.add("screen-enter");
    requestAnimationFrame(() =>
      screenEl.value?.classList.remove("screen-enter"),
    );
  }
});
</script>
