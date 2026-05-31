<template>
  <div :class="`screen abcs-complete-screen team-${team}`">
    <div class="ac-content">
      <h2 class="ac-title">ABC Challenge Complete!</h2>

      <div class="ac-stats">
        <div class="ac-stat">
          <div class="ac-stat-val">{{ stats.wpm }}</div>
          <div class="ac-stat-label">WPM</div>
        </div>
        <div class="ac-stat">
          <div class="ac-stat-val">{{ stats.accuracy }}%</div>
          <div class="ac-stat-label">Accuracy</div>
        </div>
        <div class="ac-stat">
          <div class="ac-stat-val">{{ stats.timeSeconds.toFixed(1) }}s</div>
          <div class="ac-stat-label">Time</div>
        </div>
      </div>

      <div class="ac-actions">
        <button class="btn-primary" @click="emit('retry')">
          Try Again ↺ <EnterKeyIcon />
        </button>
        <button class="btn-secondary" @click="emit('quit')">
          Main Menu
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import EnterKeyIcon from "../components/EnterKeyIcon.vue";
import "./abcsComplete.css";
import type { LevelStats, Team } from "../types";

defineProps<{
  stats: LevelStats;
  team: Team;
}>();

const emit = defineEmits<{ retry: []; quit: [] }>();

function keyHandler(e: KeyboardEvent): void {
  if (e.key === "Enter") emit("retry");
}

onMounted(() => {
  document.title = "ABC Challenge Complete";
  document.addEventListener("keydown", keyHandler);
});

onUnmounted(() => {
  document.removeEventListener("keydown", keyHandler);
});
</script>
