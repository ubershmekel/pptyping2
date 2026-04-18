<template>
  <div
    ref="screenEl"
    :class="`screen fj-intro-screen team-${team}`"
    :class2="completedClass"
  >
    <div class="fji-layout">
      <div class="fji-keys">
        <div class="fji-key">F</div>
        <div class="fji-and">and</div>
        <div class="fji-key">J</div>
      </div>
      <h2 class="fji-title">Always come back here</h2>
      <p class="fji-body">
        After typing E or T, slide your fingers back to <kbd>F</kbd> and
        <kbd>J</kbd>.
      </p>
      <p class="fji-nub">
        Both keys have a small bump — feel for it and you can find home without
        looking down.
      </p>
      <div class="fji-prompt">
        Try it now — press <kbd>F</kbd> or <kbd>J</kbd> to continue
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import "./fjIntro.css";
import type { Team } from "../types";

const props = defineProps<{ team: Team }>();
const emit = defineEmits<{ done: [] }>();

const screenEl = ref<HTMLElement | null>(null);
let advanced = false;
let doneTimer: ReturnType<typeof setTimeout> | null = null;

function keyHandler(e: KeyboardEvent): void {
  if (e.repeat || advanced) return;
  const key = e.key.toLowerCase();
  if (key === "f" || key === "j") {
    advanced = true;
    screenEl.value?.classList.add("fji-complete");
    doneTimer = setTimeout(() => emit("done"), 500);
  }
}

onMounted(() => {
  document.title = "FJ Intro";
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
  if (doneTimer !== null) clearTimeout(doneTimer);
});
</script>
