<template>
  <div ref="screenEl" class="screen main-menu-screen">
    <div class="mm-bg" aria-hidden="true">
      <span v-for="n in 8" :key="n" class="mm-particle"></span>
    </div>

    <header class="mm-header">
      <div class="mm-logo">
        <span class="logo-pp">PP</span><span class="logo-typing">Typing</span>
      </div>
      <p class="mm-tagline">Type your way to victory.</p>
    </header>

    <div class="mm-hero">
      <div ref="portraitSlot" class="mm-character-slot"></div>
    </div>

    <nav class="mm-nav">
      <button
        class="mm-btn mm-btn-primary"
        @click="router.push(hasSave ? '/level-select' : '/team-select')"
      >
        <span class="mm-btn-label">{{
          hasSave ? "▶ Continue" : "▶ Start Game"
        }}</span>
        <span class="mm-btn-sub">levels to learn finger placement</span>
      </button>
      <button
        v-if="hasSave"
        class="mm-btn mm-btn-ghost"
        @click="router.push('/team-select')"
      >
        Switch Teams
      </button>
      <button class="mm-btn mm-btn-ghost" @click="router.push('/training')">
        <span class="mm-btn-label">Training Mode</span>
        <span class="mm-btn-sub">speed check + drill on slow keys</span>
      </button>
      <button
        class="mm-btn mm-btn-ghost mm-btn-settings"
        @click="router.push('/settings')"
      >
        ⚙ Settings
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import "./mainMenu.css";
import { useProfile } from "../composables/useProfile";
import { activeProgress } from "../state/gameState";
import { CHARACTER_PORTRAITS } from "../assets/characters";
import { createCharacterPortraitElement } from "../components/characterPortrait";

const router = useRouter();
const { profile } = useProfile();
const screenEl = ref<HTMLElement | null>(null);
const portraitSlot = ref<HTMLElement | null>(null);

const hasSave = computed(() => {
  if (!profile.value.teamSelected) return false;
  const progress = activeProgress(profile.value);
  return (
    progress.highestUnlockedLevel > 1 || progress.levelRecords[1]?.completed
  );
});

let portraitCleanup: (() => void) | null = null;

onMounted(() => {
  // Screen enter animation
  if (screenEl.value) {
    screenEl.value.classList.add("screen-enter");
    requestAnimationFrame(() =>
      screenEl.value?.classList.remove("screen-enter"),
    );
  }

  // Character portrait
  if (portraitSlot.value) {
    const portrait = createCharacterPortraitElement(
      CHARACTER_PORTRAITS[profile.value.activeTeam],
      `${profile.value.activeTeam} companion`,
      { className: "mm-character", loopTag: "stand" },
    );
    portraitSlot.value.appendChild(portrait.element);
    portraitCleanup = portrait.cleanup;
  }
});

onUnmounted(() => {
  portraitCleanup?.();
});
</script>
