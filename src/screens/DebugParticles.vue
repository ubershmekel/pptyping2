<template>
  <div ref="screenEl" :class="`screen debug-particles-screen team-${team}`">
    <div class="dp-header">
      <h1 class="dp-title">Particle Debugger</h1>
      <div class="dp-team-badge">team-{{ team }}</div>
      <div class="dp-hint">
        Click <strong>Fire</strong> on any card — particles spawn at screen
        center.<br />
        Adjust knobs live. Changes apply immediately on next fire.
      </div>
    </div>
    <div class="dp-grid">
      <div
        v-for="type in ALL_BURSTS"
        :key="type"
        :id="`card-${type}`"
        :class="['dp-card', activeBurst === type ? 'dp-card--active' : '']"
      >
        <div class="dp-card-header">
          <span class="dp-type-tag">{{ type }}</span>
          <button class="dp-fire-btn" @click="fire(type)">Fire</button>
        </div>
        <div class="dp-card-label">{{ BURST_META[type].label }}</div>
        <div class="dp-card-context">{{ BURST_META[type].context }}</div>
        <div class="dp-knobs">
          <div
            v-for="[key, label, min, max, step] in FIELDS"
            :key="key"
            class="dp-knob"
          >
            <label class="dp-knob-label">
              {{ label }}
              <span class="dp-knob-val">{{ cfg[type][key] }}</span>
            </label>
            <input
              class="dp-knob-range"
              type="range"
              :min="min"
              :max="max"
              :step="step"
              :value="cfg[type][key]"
              @input="
                onKnobInput(
                  type,
                  key,
                  ($event.target as HTMLInputElement).valueAsNumber,
                )
              "
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from "vue";
import "./debugParticles.css";
import { useProfile } from "../composables/useProfile";
import { ParticleManager } from "../particles/particleManager";
import { BURST_CONFIGS, type BurstType } from "../particles/presets";

type ConfigKey = "count" | "speed" | "life" | "size" | "gravity";

const ALL_BURSTS: BurstType[] = [
  "correct",
  "error",
  "combo",
  "victory",
  "petal",
  "golden",
  "electric",
  "ripple",
  "lightning",
  "glass",
  "water",
  "confetti",
  "party",
];

const BURST_META: Record<BurstType, { label: string; context: string }> = {
  correct: {
    label: "Correct keystroke",
    context: "Level screen — every correct key",
  },
  error: { label: "Error keystroke", context: "Level screen — every mistake" },
  combo: { label: "Combo ×10", context: "Level screen — every 10 correct" },
  victory: {
    label: "Victory shower",
    context: "Level screen — level complete",
  },
  petal: { label: "Pink petals", context: "Pokémon #0 — Fluttershy's trail" },
  golden: {
    label: "Golden flash",
    context: "Pokémon #1 & MLP #4 — restored keys / warm moment",
  },
  electric: {
    label: "Electric static",
    context: "Pokémon #2 & #4 — Thunder Shrine curtain / cheek charge",
  },
  ripple: {
    label: "Crystal ripple",
    context: "Pokémon #3 — Pikachu touches the wall",
  },
  lightning: { label: "Thunderbolt", context: "Pokémon #5 — the big zap" },
  glass: {
    label: "Shattering glass",
    context: "Pokémon #5 — dimensional barrier breaks",
  },
  water: { label: "Water blast", context: "MLP #0 & #2 — Squirtle's pranks" },
  confetti: {
    label: "Confetti pop",
    context: "MLP #1 & #3 — prank landing / whoopee cushion",
  },
  party: { label: "Party cannon", context: "MLP #5 — the finale party" },
};

const FIELDS: [ConfigKey, string, number, number, number][] = [
  ["count", "Count", 1, 800, 1],
  ["speed", "Speed", 0.1, 15, 0.1],
  ["life", "Life ms", 50, 3000, 10],
  ["size", "Size px", 1, 20, 0.5],
  ["gravity", "Gravity", 0, 0.5, 0.005],
];

const { profile } = useProfile();
const team = profile.value.activeTeam;

const screenEl = ref<HTMLElement | null>(null);
const activeBurst = ref<BurstType>("victory");

// Reactive copy of configs for live editing
const cfg = reactive<Record<BurstType, (typeof BURST_CONFIGS)[BurstType]>>(
  Object.fromEntries(
    ALL_BURSTS.map((t) => [t, { ...BURST_CONFIGS[t] }]),
  ) as Record<BurstType, (typeof BURST_CONFIGS)[BurstType]>,
);

let particles: ParticleManager | null = null;

function fire(type: BurstType): void {
  activeBurst.value = type;
  Object.assign(BURST_CONFIGS[type], cfg[type]);
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  particles?.triggerBurst(type, cx, cy);
}

function onKnobInput(type: BurstType, key: ConfigKey, value: number): void {
  (cfg[type] as Record<string, number>)[key] = value;
  fire(type);
}

function keyHandler(e: KeyboardEvent): void {
  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    fire(activeBurst.value);
  }
}

onMounted(() => {
  document.title = "Debug Particles";
  if (screenEl.value) {
    screenEl.value.classList.add("screen-enter");
    requestAnimationFrame(() =>
      screenEl.value?.classList.remove("screen-enter"),
    );

    particles = new ParticleManager(team);
    particles.mount(screenEl.value);
  }
  document.addEventListener("keydown", keyHandler);
});

onUnmounted(() => {
  document.removeEventListener("keydown", keyHandler);
  particles?.destroy();
});
</script>
