<template>
  <div ref="screenEl" :class="`screen speed-test-intro-screen team-${team}`">
    <div class="sti-layout">
      <div class="sti-level-tag">Level {{ levelNumber }} — Speed Test</div>
      <h1 class="sti-headline">How fast do you type right now?</h1>
      <p class="sti-body">
        Type through this level at your own pace — there's no passing or failing
        here. This is your starting point. We'll come back to it later so you
        can see how much you've improved.
      </p>
      <div class="sti-actions">
        <button class="sti-btn-primary" @click="onStart">Start →</button>
        <button class="sti-btn-secondary" @click="emit('back')">
          ← Level Select
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import "./speedTestIntro.css";
import type { Team } from "../types";

const props = defineProps<{ levelNumber: number; team: Team }>();
const emit = defineEmits<{ start: []; back: [] }>();

const screenEl = ref<HTMLElement | null>(null);
let gone = false;

function onStart(): void {
  if (gone) return;
  gone = true;
  emit("start");
}

function keyHandler(e: KeyboardEvent): void {
  if (e.key === "Enter") onStart();
}

onMounted(() => {
  if (screenEl.value) {
    screenEl.value.classList.add("screen-enter");
    requestAnimationFrame(() =>
      screenEl.value?.classList.remove("screen-enter"),
    );
  }
  document.addEventListener("keydown", keyHandler);
});

onUnmounted(() => {
  document.removeEventListener("keydown", keyHandler);
});
</script>
