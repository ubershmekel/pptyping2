<template>
  <component
    :is="currentComponent"
    :key="componentKey"
    v-bind="currentProps"
    v-on="currentEvents"
  />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useProfile } from "../composables/useProfile";
import { generateDrillText, getLevelText } from "../data/wordLists";
import type { LevelStats } from "../types";

function shuffleWords(text: string): string {
  const words = text.split(" ");
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  return words.join(" ");
}

import LevelScreen from "./LevelScreen.vue";
import DrillIntro from "./DrillIntro.vue";
import DrillComplete from "./DrillComplete.vue";

type SubScreen = "speedcheck" | "drill-intro" | "drill" | "drill-complete";

const router = useRouter();
const { profile, onTrainingActivity } = useProfile();

const subScreen = ref<SubScreen>("speedcheck");
const speedCheckStats = ref<LevelStats | null>(null);
const drillLetters = ref<string[]>(["f", "j", "a", "l", "g", "m"]);
const drillText = ref<string>("");
const drillStats = ref<LevelStats | null>(null);

// Stable key so LevelScreen fully remounts between speedcheck and drill runs.
const runIndex = ref(0);
const componentKey = computed(() => `${subScreen.value}-${runIndex.value}`);

function onSpeedCheckComplete(stats: LevelStats): void {
  speedCheckStats.value = stats;
  onTrainingActivity("training-speedcheck", stats);
  subScreen.value = "drill-intro";
}

function onDrillStart(letters: string[]): void {
  drillLetters.value = letters;
  drillText.value = generateDrillText(letters);
  subScreen.value = "drill";
}

function onDrillComplete(stats: LevelStats): void {
  drillStats.value = stats;
  onTrainingActivity("training-drill", stats);
  subScreen.value = "drill-complete";
}

function restartSpeedCheck(): void {
  runIndex.value++;
  subScreen.value = "speedcheck";
}

function retryDrill(): void {
  runIndex.value++;
  subScreen.value = "drill";
}

const SPEED_CHECK_LEVEL = 21;
const DRILL_LETTERS = computed(() => drillLetters.value.join("") + " ");
const FOCUS_LETTERS = computed(() => drillLetters.value.slice(4).join(""));

const speedCheckText = computed(() => {
  runIndex.value; // re-shuffle on each new run
  return shuffleWords(getLevelText(SPEED_CHECK_LEVEL));
});

const currentComponent = computed(() => {
  switch (subScreen.value) {
    case "speedcheck":
      return LevelScreen;
    case "drill-intro":
      return DrillIntro;
    case "drill":
      return LevelScreen;
    case "drill-complete":
      return DrillComplete;
  }
});

const currentProps = computed(() => {
  const team = profile.value.activeTeam;
  const difficulty = profile.value.difficulty;
  switch (subScreen.value) {
    case "speedcheck":
      return {
        levelNumber: SPEED_CHECK_LEVEL,
        team,
        difficulty,
        noThreshold: true,
        text: speedCheckText.value,
      };
    case "drill-intro":
      return { stats: speedCheckStats.value!, team };
    case "drill":
      return {
        levelNumber: SPEED_CHECK_LEVEL,
        team,
        difficulty,
        text: drillText.value,
        availableLetters: DRILL_LETTERS.value,
        focusLetters: FOCUS_LETTERS.value,
        showKeyboard: true,
        noThreshold: true,
      };
    case "drill-complete":
      return { stats: drillStats.value!, team };
  }
});

const currentEvents = computed(() => {
  switch (subScreen.value) {
    case "speedcheck":
      return {
        complete: onSpeedCheckComplete,
        retry: restartSpeedCheck,
        levelSelect: () => router.push("/level-select"),
        quit: () => router.push("/"),
      };
    case "drill-intro":
      return {
        drill: onDrillStart,
        retry: restartSpeedCheck,
        mainMenu: () => router.push("/"),
      };
    case "drill":
      return {
        complete: onDrillComplete,
        retry: retryDrill,
        levelSelect: () => router.push("/level-select"),
        quit: () => router.push("/"),
      };
    case "drill-complete":
      return {
        next: restartSpeedCheck,
        retry: retryDrill,
        quit: () => router.push("/"),
      };
  }
});
</script>
