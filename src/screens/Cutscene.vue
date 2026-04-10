<template>
  <div ref="screenEl" :class="`screen cutscene-screen team-${team} ${envClass}`">
    <div class="cs-content">
      <div class="cs-story" aria-live="polite">
        <div class="cs-chapter">Chapter {{ cutsceneIndex + 1 }}</div>
        <h1 class="cs-title">{{ story.title }}</h1>
        <div class="cs-paragraphs">
          <p v-for="(p, i) in story.paragraphs" :key="i" class="cs-p" :style="`animation-delay:${0.4 + i * 0.35}s`"
            v-html="renderEmphasis(p)"></p>
        </div>
      </div>

      <div class="cs-art-container">
        <div :class="`cs-art ${story.artClass}`" ref="artEl" aria-hidden="true" title="Click to replay particle effects"
          @click.stop="replayArtBursts">
          <div class="cs-art-reveal"></div>
          <img class="cs-art-img" :src="artSrc" :alt="artCaption" />
        </div>
        <div class="cs-art-caption">{{ artCaption }}</div>
      </div>

      <div class="cs-actions">
        <div class="cs-action-row">
          <button class="cs-next-btn" @click="go">
            {{ cutsceneIndex === 5 ? "Play Again" : "Continue" }}
          </button>
          <button class="cs-level-select-btn" @click="leave(goLevelSelect)">
            Level Select
          </button>
        </div>
        <div class="cs-hint">Press Enter or use Continue to advance</div>
      </div>
    </div>

    <div class="cs-bg-particles" aria-hidden="true">
      <span v-for="n in 12" :key="n" class="cs-particle"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import "./cutscene.css";
import { useProfile } from "../composables/useProfile";
import { CUTSCENE_STORIES } from "../data/stories";
import { ParticleManager } from "../particles/particleManager";
import type { BurstType } from "../particles/presets";
import { levelAfterCutscene } from "../data/levels";

const CUTSCENE_ENV = [
  "env-digital-grove",
  "env-digital-grove",
  "env-thunder-shrine",
  "env-crystal-cavern",
  "env-stardrift-coast",
  "env-apex-summit",
] as const;

type BurstEvent = { delay: number; type: BurstType };
const CUTSCENE_BURSTS: Record<string, BurstEvent[][]> = {
  pokemon: [
    [{ delay: 1800, type: "petal" }],
    [{ delay: 1200, type: "golden" }],
    [{ delay: 1400, type: "electric" }],
    [{ delay: 1600, type: "ripple" }],
    [{ delay: 1200, type: "electric" }],
    [
      { delay: 900, type: "lightning" },
      { delay: 2200, type: "glass" },
    ],
  ],
  mlp: [
    [{ delay: 1400, type: "water" }],
    [{ delay: 1500, type: "confetti" }],
    [{ delay: 1300, type: "water" }],
    [{ delay: 1600, type: "confetti" }],
    [{ delay: 1700, type: "golden" }],
    [{ delay: 800, type: "party" }],
  ],
};

const appBaseUrl = import.meta.env.BASE_URL;

const route = useRoute();
const router = useRouter();
const { profile } = useProfile();

const team = computed(() => profile.value.activeTeam);
const cutsceneIndex = computed(() =>
  parseInt(route.params.index as string, 10),
);
const story = computed(() => CUTSCENE_STORIES[team.value][cutsceneIndex.value]);
const envClass = computed(
  () => CUTSCENE_ENV[cutsceneIndex.value] ?? "env-digital-grove",
);

const artSrc = computed(() => {
  const prefix = team.value === "pokemon" ? "pok" : "mlp";
  return `${appBaseUrl}cutscenes/${prefix}${cutsceneIndex.value}.jpg`;
});

const artCaption = computed(() => {
  const captions: Record<string, string[]> = {
    pokemon: [
      "Pikachu discovers the corrupted keyboard",
      "The first keys are restored with a lightning strike",
      "Deeper into the crystal cavern",
      "Rowlet spotted on the distant shore",
      "The Apex Summit - final keys ahead",
      "Victory! The keyboard is saved!",
    ],
    mlp: [
      "Pinkie Pie meets the corrupted keyboard",
      "Friendship restores the first keys",
      "Making friends in the meadow",
      "Party cannon deployed in the crystal cavern",
      "Pinkie reaches the Apex Summit",
      "Every single key has a friend!",
    ],
  };
  return captions[team.value][cutsceneIndex.value] ?? "";
});

function renderEmphasis(text: string): string {
  return text.replace(/_([^_]+)_/g, "<em>$1</em>");
}

const screenEl = ref<HTMLElement | null>(null);
const artEl = ref<HTMLElement | null>(null);

let advanced = false;
let particles: ParticleManager | null = null;
const timers: ReturnType<typeof setTimeout>[] = [];
let keyHandler: ((e: KeyboardEvent) => void) | null = null;
let stopKeyTimer: ReturnType<typeof setTimeout> | null = null;

function getArtBurstOrigin(): { x: number; y: number } {
  const rect = artEl.value?.getBoundingClientRect();
  if (!rect) {
    return {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
  }

  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function scheduleCutsceneBursts(x: number, y: number): void {
  for (const burst of CUTSCENE_BURSTS[team.value][cutsceneIndex.value] ?? []) {
    const t = setTimeout(
      () => particles?.triggerBurst(burst.type, x, y),
      burst.delay,
    );
    timers.push(t);
  }
}

function triggerCutsceneBurstsNow(x: number, y: number): void {
  for (const burst of CUTSCENE_BURSTS[team.value][cutsceneIndex.value] ?? []) {
    particles?.triggerBurst(burst.type, x, y);
  }
}

function replayArtBursts(): void {
  if (advanced || particles === null) return;
  const { x, y } = getArtBurstOrigin();
  triggerCutsceneBurstsNow(x, y);
}

function leave(action: () => void): void {
  if (advanced) return;
  advanced = true;
  screenEl.value?.classList.add("screen-exit");
  keyHandler && document.removeEventListener("keydown", keyHandler);
  keyHandler = null;
  const t = setTimeout(action, 350);
  timers.push(t);
}

function go(): void {
  leave(goNext);
}

function goNext(): void {
  const nextLevel = levelAfterCutscene(cutsceneIndex.value);
  if (nextLevel !== null) {
    router.push(`/level/${nextLevel}`);
  } else {
    router.push("/");
  }
}

function goLevelSelect(): void {
  router.push("/level-select");
}

onMounted(() => {
  if (screenEl.value) {
    screenEl.value.classList.add("screen-enter");
    requestAnimationFrame(() =>
      screenEl.value?.classList.remove("screen-enter"),
    );
  }

  // Art reveal
  setTimeout(() => artEl.value?.classList.add("cs-art-revealed"), 0);

  // Particles
  if (screenEl.value) {
    particles = new ParticleManager(team.value);
    particles.mount(screenEl.value);

    const { x, y } = getArtBurstOrigin();
    scheduleCutsceneBursts(x, y);
  }

  // Key handler (activated after 500ms to prevent accidental skip)
  stopKeyTimer = setTimeout(() => {
    keyHandler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("button")) return;
      if (e.key === "Enter" || e.key === " ") go();
    };
    document.addEventListener("keydown", keyHandler);
  }, 500);
});

onUnmounted(() => {
  for (const t of timers) clearTimeout(t);
  if (stopKeyTimer !== null) clearTimeout(stopKeyTimer);
  if (keyHandler) document.removeEventListener("keydown", keyHandler);
  particles?.destroy();
});
</script>
