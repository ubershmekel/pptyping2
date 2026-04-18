<template>
  <div :class="`screen drill-complete-screen team-${team}`">
    <div class="dc-content">
      <h2 class="dc-title">Drill Complete</h2>

      <div class="dc-stats">
        <div class="dc-stat">
          <div class="dc-stat-val">{{ stats.wpm }}</div>
          <div class="dc-stat-label">WPM</div>
        </div>
        <div class="dc-stat">
          <div class="dc-stat-val">{{ stats.accuracy }}%</div>
          <div class="dc-stat-label">Accuracy</div>
        </div>
      </div>

      <div class="dc-actions">
        <button class="dc-btn-primary" @click="emit('next')">
          Speed Check Again →
        </button>
        <button class="dc-btn-secondary" @click="emit('retry')">
          Retry Drill ↺
        </button>
        <button class="dc-btn-secondary" @click="emit('quit')">
          Main Menu
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import "./drillComplete.css";
import type { LevelStats, Team } from "../types";

onMounted(() => {
  document.title = "Drill Complete";
});

defineProps<{
  stats: LevelStats;
  team: Team;
}>();

const emit = defineEmits<{ next: []; retry: []; quit: [] }>();
</script>
