<template>
  <div ref="screenEl" class="screen team-select-screen">
    <div class="ts-header">
      <div class="ts-logo">
        <span class="logo-pp">PP</span><span class="logo-typing">Typing</span>
      </div>
      <p class="ts-tagline">
        Choose your side. Cleanse the keyboard. Type your way to victory.
      </p>
    </div>

    <div class="ts-panels">
      <!-- POKEMON PANEL -->
      <button
        class="ts-panel ts-panel-pokemon"
        :class="{ 'ts-panel-selected': selectedTeam === 'pokemon' }"
        aria-label="Choose Team Pokemon"
        @click="selectTeam('pokemon')"
        @mouseenter="hoveredTeam = 'pokemon'"
        @mouseleave="hoveredTeam = null"
        :data-hovered="hoveredTeam === 'pokemon' ? 'true' : undefined"
      >
        <div class="ts-panel-bg ts-panel-bg-pokemon"></div>
        <div class="ts-panel-glow ts-panel-glow-pokemon"></div>
        <div class="ts-panel-content">
          <div class="ts-character ts-character-pokemon">
            <div ref="pokemonSlot" class="ts-character-slot"></div>
          </div>
          <div class="ts-panel-text">
            <h2 class="ts-team-name">Team <span>Pokemon</span></h2>
            <p class="ts-team-lore">
              Rowlet has been birdnapped.<br />
              Pikachu must zap the keyboard<br />
              clean - one key at a time.
            </p>
            <div class="ts-btn ts-btn-pokemon">⚡ Choose Pokémon</div>
          </div>
        </div>
        <div class="ts-particles ts-particles-pokemon" aria-hidden="true">
          <span v-for="n in 6" :key="n" class="ts-particle"></span>
        </div>
      </button>

      <!-- VS divider -->
      <div class="ts-vs" aria-hidden="true">
        <div class="ts-vs-inner">VS</div>
      </div>

      <!-- MLP PANEL -->
      <button
        class="ts-panel ts-panel-mlp"
        :class="{ 'ts-panel-selected': selectedTeam === 'mlp' }"
        aria-label="Choose Team My Little Pony"
        @click="selectTeam('mlp')"
        @mouseenter="hoveredTeam = 'mlp'"
        @mouseleave="hoveredTeam = null"
        :data-hovered="hoveredTeam === 'mlp' ? 'true' : undefined"
      >
        <div class="ts-panel-bg ts-panel-bg-mlp"></div>
        <div class="ts-panel-glow ts-panel-glow-mlp"></div>
        <div class="ts-panel-content">
          <div class="ts-character ts-character-mlp">
            <div ref="mlpSlot" class="ts-character-slot"></div>
          </div>
          <div class="ts-panel-text">
            <h2 class="ts-team-name">Team <span>Ponies</span></h2>
            <p class="ts-team-lore">
              Friendship is the only antidote.<br />
              Pinkie Pie must befriend every<br />
              key - one at a time.
            </p>
            <div class="ts-btn ts-btn-mlp">🌈 Choose Ponies</div>
          </div>
        </div>
        <div class="ts-particles ts-particles-mlp" aria-hidden="true">
          <span v-for="n in 6" :key="n" class="ts-particle"></span>
        </div>
      </button>
    </div>

    <div v-if="existingTeam" class="ts-existing-save">
      <span
        >You have a saved game as Team
        {{ existingTeam === "pokemon" ? "Pokemon" : "Ponies" }}.</span
      >
      <button class="ts-continue-btn" @click.stop="selectTeam(existingTeam)">
        Continue saved game
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import "./teamSelect.css";
import { useProfile } from "../composables/useProfile";
import { activeProgress, selectTeam as selectTeamFn } from "../state/gameState";
import { CHARACTER_PORTRAITS } from "../assets/characters";
import { createCharacterPortraitElement } from "../components/characterPortrait";
import type { Team } from "../types";

const router = useRouter();
const route = useRoute();
const { profile, onSelectTeam } = useProfile();

const screenEl = ref<HTMLElement | null>(null);
const pokemonSlot = ref<HTMLElement | null>(null);
const mlpSlot = ref<HTMLElement | null>(null);

const selectedTeam = ref<Team | null>(null);
const hoveredTeam = ref<Team | null>(null);
let cancelSelect: ReturnType<typeof setTimeout> | null = null;

const existingTeam = computed<Team | undefined>(() => {
  if (!profile.value.teamSelected) return undefined;
  const progress = activeProgress(profile.value);
  const hasProgress =
    progress.highestUnlockedLevel > 1 || progress.levelRecords[1]?.completed;
  return hasProgress ? profile.value.activeTeam : undefined;
});

function selectTeam(team: Team): void {
  selectedTeam.value = team;
  if (cancelSelect !== null) clearTimeout(cancelSelect);
  cancelSelect = setTimeout(() => {
    cancelSelect = null;
    onSelectTeam(team);
    // Honour a redirect param (e.g. when the training guard sent us here).
    const redirectTo = route.query.redirect as string | undefined;
    if (redirectTo && redirectTo.startsWith("/")) {
      router.push(redirectTo);
      return;
    }
    // Navigate: new team or existing progress
    const updatedProfile = selectTeamFn(profile.value, team);
    if (activeProgress(updatedProfile).highestUnlockedLevel > 1) {
      router.push("/level-select");
    } else {
      router.push("/cutscene/0");
    }
  }, 350);
}

const portraitCleanups: (() => void)[] = [];

onMounted(() => {
  document.title = "Team Select";
  if (screenEl.value) {
    screenEl.value.classList.add("screen-enter");
    requestAnimationFrame(() =>
      screenEl.value?.classList.remove("screen-enter"),
    );
  }

  const slots: [HTMLElement | null, Team, string, string | undefined][] = [
    [pokemonSlot.value, "pokemon", "Pikachu companion preview", "stand"],
    [mlpSlot.value, "mlp", "Pinkie Pie companion preview", "Right1"],
  ];
  for (const [slot, team, alt, loopTag] of slots) {
    if (!slot) continue;
    const portrait = createCharacterPortraitElement(
      CHARACTER_PORTRAITS[team],
      alt,
      {
        animated: true,
        className: "ts-character-art",
        loopTag,
      },
    );
    slot.appendChild(portrait.element);
    portraitCleanups.push(portrait.cleanup);
  }
});

onUnmounted(() => {
  if (cancelSelect !== null) clearTimeout(cancelSelect);
  for (const cleanup of portraitCleanups) cleanup();
});
</script>
