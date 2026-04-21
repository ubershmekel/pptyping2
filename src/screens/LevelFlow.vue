<template>
  <!--
    :key forces a full unmount+remount whenever the sub-screen or letter changes.
    Without this, Vue reuses the LetterIntro instance when letterIndex increments,
    so onMounted never re-runs and the second letter's SVG/canvas is never set up.
  -->
  <component
    :is="currentComponent"
    :key="componentKey"
    v-bind="currentProps"
    v-on="currentEvents"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProfile } from "../composables/useProfile";
import {
  getLevelDef,
  levelAfterCutscene,
  cutsceneAfterLevel,
  MAX_LEVEL,
} from "../data/levels";
import { LEVEL_LETTERS } from "../data/wordLists";
import type { LevelStats } from "../types";

import SpeedTestIntro from "./SpeedTestIntro.vue";
import LetterIntro from "./LetterIntro.vue";
import FjIntro from "./FjIntro.vue";
import FingerGuide from "./FingerGuide.vue";
import LevelScreen from "./LevelScreen.vue";
import LevelComplete from "./LevelComplete.vue";

type SubScreen =
  | "speed-test-intro"
  | "letter-intro"
  | "fj-intro"
  | "finger-guide"
  | "level"
  | "level-complete";

const route = useRoute();
const router = useRouter();
const { profile, onLevelResult } = useProfile();

const levelNumber = computed(() => parseInt(route.params.number as string, 10));

/** New letters introduced by this level (for letter-intro drill). */
function getLetterIntroLetters(n: number): string[] {
  const levelDef = getLevelDef(n);
  if (levelDef.isFinale || levelDef.isSpeedTest) return [];
  const prevDef = n > 1 ? getLevelDef(n - 1) : null;
  const prevLetters =
    !prevDef || prevDef.isSpeedTest ? "" : (LEVEL_LETTERS[n - 1] ?? "");
  const prevSet = new Set(prevLetters.split("").filter(Boolean));
  return levelDef.availableLetters.split("").filter((l) => !prevSet.has(l));
}

function computeInitialSubScreen(n: number): SubScreen {
  if (n === 1) return "speed-test-intro";
  const letters = getLetterIntroLetters(n);
  if (letters.length > 0) return "letter-intro";
  return "finger-guide";
}

const subScreen = ref<SubScreen>(computeInitialSubScreen(levelNumber.value));
const letterIndex = ref(0);
const levelStats = ref<LevelStats | null>(null);
const levelAttempt = ref(0);

// Reset sub-screen state when the level number changes (back-nav to same route).
watch(levelNumber, (n) => {
  subScreen.value = computeInitialSubScreen(n);
  letterIndex.value = 0;
  levelStats.value = null;
  levelAttempt.value = 0;
});

// ─── Sub-screen transitions ───────────────────────────────────────────────────

function goToLevel(): void {
  subScreen.value = "level";
}

function onLetterIntroDone(): void {
  const letters = getLetterIntroLetters(levelNumber.value);
  const next = letterIndex.value + 1;
  if (next < letters.length) {
    letterIndex.value = next;
    // Stay on letter-intro with new letterIndex
    return;
  }
  // After all letter intros: level 3 gets fj-intro, others go straight to finger-guide
  if (levelNumber.value === 3) {
    subScreen.value = "fj-intro";
  } else {
    subScreen.value = "finger-guide";
  }
}

function onFjIntroDone(): void {
  subScreen.value = "finger-guide";
}

function onLevelComplete(stats: LevelStats): void {
  onLevelResult(levelNumber.value, stats);
  levelStats.value = stats;
  subScreen.value = "level-complete";
}

function onLevelCompleteNext(): void {
  const cutscene = cutsceneAfterLevel(levelNumber.value);
  if (cutscene !== null) {
    router.push(`/cutscene/${cutscene}`);
  } else if (levelNumber.value < MAX_LEVEL) {
    router.push(`/level/${levelNumber.value + 1}`);
  } else {
    router.push("/cutscene/5"); // finale
  }
}

function restartLevelAttempt(): void {
  levelStats.value = null;
  levelAttempt.value++;
  subScreen.value = "level";
}

function onPauseRetry(): void {
  restartLevelAttempt();
}

function onCompleteRetry(): void {
  levelStats.value = null;
  letterIndex.value = 0;
  levelAttempt.value = 0;
  subScreen.value =
    levelNumber.value === 1 ? "speed-test-intro" : "finger-guide";
}

function onLevelSelect(): void {
  router.push("/level-select");
}

function onQuit(): void {
  router.push("/");
}

// ─── Dynamic component binding ────────────────────────────────────────────────

/**
 * Changing the key forces Vue to fully unmount and remount the component.
 * This is required for letter-intro: when letterIndex increments the subScreen
 * stays at "letter-intro", so without a key change Vue reuses the existing
 * component instance and onMounted never re-runs for the new letter.
 */
const componentKey = computed(() =>
  subScreen.value === "letter-intro"
    ? `letter-intro-${letterIndex.value}`
    : subScreen.value === "level"
      ? `level-${levelAttempt.value}`
      : subScreen.value,
);

const currentComponent = computed(() => {
  switch (subScreen.value) {
    case "speed-test-intro":
      return SpeedTestIntro;
    case "letter-intro":
      return LetterIntro;
    case "fj-intro":
      return FjIntro;
    case "finger-guide":
      return FingerGuide;
    case "level":
      return LevelScreen;
    case "level-complete":
      return LevelComplete;
  }
});

const currentProps = computed(() => {
  const n = levelNumber.value;
  const team = profile.value.activeTeam;
  const letters = getLetterIntroLetters(n);
  const letter = letters[letterIndex.value] ?? letters[0] ?? "f";
  switch (subScreen.value) {
    case "speed-test-intro":
      return { levelNumber: n, team };
    case "letter-intro":
      return { levelNumber: n, letter, team };
    case "fj-intro":
      return { team };
    case "finger-guide":
      return { levelNumber: n, team };
    case "level":
      return { levelNumber: n, team, difficulty: profile.value.difficulty };
    case "level-complete":
      return {
        levelNumber: n,
        stats: levelStats.value!,
        team,
        difficulty: profile.value.difficulty,
        speedTestHistory: profile.value.speedTestHistory,
      };
  }
});

const currentEvents = computed(() => {
  switch (subScreen.value) {
    case "speed-test-intro":
      return { start: goToLevel, back: onLevelSelect };
    case "letter-intro":
      return { done: onLetterIntroDone, back: onLevelSelect };
    case "fj-intro":
      return { done: onFjIntroDone };
    case "finger-guide":
      return { start: goToLevel, back: onLevelSelect };
    case "level":
      return {
        complete: onLevelComplete,
        retry: onPauseRetry,
        levelSelect: onLevelSelect,
        quit: onQuit,
      };
    case "level-complete":
      return {
        next: onLevelCompleteNext,
        retry: onCompleteRetry,
        levelSelect: onLevelSelect,
      };
  }
});
</script>
