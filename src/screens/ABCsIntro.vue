<template>
  <div :class="`screen abcs-intro-screen team-${team}`">
    <div class="ai-content">
      <h2 class="ai-title">Blind ABC Challenge</h2>

      <div class="ai-eye-icon" aria-hidden="true">👁️</div>

      <p class="ai-instruction">
        Close your eyes and type the alphabet from memory.
      </p>
      <p class="ai-sub">
        a b c d e f g h i j k l m n o p q r s t u v w x y z
      </p>

      <div class="ai-actions">
        <button class="ai-btn-primary" @click="emit('start')">
          Close Eyes &amp; Start
        </button>
        <button class="ai-btn-secondary" @click="emit('quit')">
          Main Menu
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import "./abcsIntro.css";
import type { Team } from "../types";

onMounted(() => {
  document.title = "Blind ABC Challenge";
});

defineProps<{ team: Team }>();

const emit = defineEmits<{ start: []; quit: [] }>();
</script>
