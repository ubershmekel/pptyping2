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
import type { LevelStats } from "../types";

import LevelScreen from "./LevelScreen.vue";
import ABCsIntro from "./ABCsIntro.vue";
import ABCsComplete from "./ABCsComplete.vue";

type SubScreen = "intro" | "typing" | "complete";

const ABC_TEXT = "abcdefghijklmnopqrstuvwxyz";

const router = useRouter();
const { profile, onTrainingActivity } = useProfile();

const subScreen = ref<SubScreen>("intro");
const abcStats = ref<LevelStats | null>(null);
const runIndex = ref(0);
const componentKey = computed(() => `${subScreen.value}-${runIndex.value}`);

function onStart(): void {
  subScreen.value = "typing";
}

function onTypingComplete(stats: LevelStats): void {
  abcStats.value = stats;
  onTrainingActivity("abcs", stats);
  subScreen.value = "complete";
}

function retry(): void {
  runIndex.value++;
  subScreen.value = "intro";
}

const currentComponent = computed(() => {
  switch (subScreen.value) {
    case "intro":
      return ABCsIntro;
    case "typing":
      return LevelScreen;
    case "complete":
      return ABCsComplete;
  }
});

const currentProps = computed(() => {
  const team = profile.value.activeTeam;
  const difficulty = profile.value.difficulty;
  switch (subScreen.value) {
    case "intro":
      return { team };
    case "typing":
      return {
        levelNumber: 1,
        team,
        difficulty,
        text: ABC_TEXT,
        noThreshold: true,
      };
    case "complete":
      return { stats: abcStats.value!, team };
  }
});

const currentEvents = computed(() => {
  switch (subScreen.value) {
    case "intro":
      return {
        start: onStart,
        quit: () => router.push("/"),
      };
    case "typing":
      return {
        complete: onTypingComplete,
        retry: () => { runIndex.value++; subScreen.value = "typing"; },
        levelSelect: () => router.push("/level-select"),
        quit: () => router.push("/"),
      };
    case "complete":
      return {
        retry,
        quit: () => router.push("/"),
      };
  }
});
</script>
