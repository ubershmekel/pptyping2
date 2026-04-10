<template>
  <div
    ref="screenEl"
    :class="`screen level-select-screen team-${profile.activeTeam}`"
  >
    <div class="ls-header">
      <button class="ls-back-btn" @click="router.push('/')">← Back</button>
      <h2 class="ls-title">Choose Level</h2>
      <div class="ls-progress-pill">
        <span class="ls-prog-count">{{ totalCompleted }}</span>
        <span class="ls-prog-denom"> / 20</span>
      </div>
    </div>

    <div v-if="attempted" class="ls-notice">
      Level {{ attempted }} is locked - complete earlier levels first.
    </div>

    <div class="ls-map">
      <div
        v-for="arcNum in [1, 2, 3, 4, 5]"
        :key="arcNum"
        :class="`ls-arc arc-${arcNum}`"
      >
        <div class="ls-arc-header">
          <span class="ls-arc-icon">{{ ARC_ICONS[arcNum] }}</span>
          <div class="ls-arc-text">
            <div class="ls-arc-name">{{ ARC_ENVIRONMENTS[arcNum].name }}</div>
            <div class="ls-arc-label">Arc {{ arcNum }}</div>
          </div>
        </div>
        <div class="ls-arc-nodes">
          <!-- Opening intro cutscene (arc 1 only) -->
          <div
            v-if="arcNum === 1"
            class="ls-cs-node ls-cs-open"
            data-cutscene="0"
            data-unlocked="true"
            tabindex="0"
            role="button"
            aria-label="Intro cutscene"
            @click="router.push('/cutscene/0')"
            @keydown.enter.space.prevent="router.push('/cutscene/0')"
          >
            <span class="ls-cs-icon">🎬</span>
            <span class="ls-cs-label">Intro</span>
          </div>

          <!-- Level cards -->
          <div
            v-for="lvl in arcLevels[arcNum]"
            :key="lvl.number"
            ref="levelCardEls"
            :class="[
              'ls-level-card',
              levelStateClass(lvl.number),
              lvl.number === attempted ? 'ls-attempted' : '',
            ]"
            :data-level="lvl.number"
            :tabindex="isUnlocked(lvl.number) ? 0 : -1"
            role="button"
            :aria-label="`Level ${lvl.number}${isCompleted(lvl.number) ? ', completed' : isUnlocked(lvl.number) ? ', available' : ', locked'}`"
            @click="onLevelClick(lvl.number)"
            @keydown.enter.space.prevent="onLevelClick(lvl.number)"
          >
            <div class="ls-card-row1">
              <span class="ls-lv-num">LV.{{ lvl.number }}</span>
              <span v-if="lvl.isSpeedTest" class="ls-speed-badge"
                >⚡ Speed check</span
              >
              <span v-if="isCompleted(lvl.number)" class="ls-status ls-done"
                >✓</span
              >
              <span v-else-if="isUnlocked(lvl.number)" class="ls-status ls-open"
                >▶</span
              >
              <span v-else class="ls-status ls-locked-icon">⚿</span>
            </div>
            <div
              v-if="isCompleted(lvl.number) && levelRecord(lvl.number)"
              class="ls-card-stats"
            >
              <span class="ls-wpm"
                >{{ levelRecord(lvl.number)!.bestWpm }}<small>wpm</small></span
              >
              <span class="ls-sep">·</span>
              <span class="ls-acc"
                >{{ levelRecord(lvl.number)!.bestAccuracy
                }}<small>%</small></span
              >
            </div>
            <div v-else class="ls-card-stats ls-stats-empty">
              {{ isUnlocked(lvl.number) ? "Not played yet" : "Locked" }}
            </div>
            <div class="ls-card-letters">
              <span
                v-for="letter in newLettersFor(lvl)"
                :key="letter"
                class="ls-chip"
                >{{ letter.toUpperCase() }}</span
              >
            </div>
          </div>

          <!-- Arc outro cutscene -->
          <div
            :class="[
              'ls-cs-node',
              arcOutroUnlocked(arcNum) ? 'ls-cs-open' : 'ls-cs-locked',
            ]"
            :data-cutscene="ARC_OUTRO_CS[arcNum]"
            :data-unlocked="arcOutroUnlocked(arcNum)"
            :tabindex="arcOutroUnlocked(arcNum) ? 0 : -1"
            role="button"
            :aria-label="`${arcOutroLabel(arcNum)} cutscene${arcOutroUnlocked(arcNum) ? '' : ' (locked)'}`"
            @click="
              arcOutroUnlocked(arcNum) &&
              router.push(`/cutscene/${ARC_OUTRO_CS[arcNum]}`)
            "
            @keydown.enter.space.prevent="
              arcOutroUnlocked(arcNum) &&
              router.push(`/cutscene/${ARC_OUTRO_CS[arcNum]}`)
            "
          >
            <span class="ls-cs-icon">{{
              arcOutroUnlocked(arcNum) ? (arcNum === 5 ? "🏆" : "▶") : "🔒"
            }}</span>
            <span class="ls-cs-label">{{ arcOutroLabel(arcNum) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="ls-particles" aria-hidden="true">
      <span v-for="n in 20" :key="n" class="ls-particle"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import "./levelSelect.css";
import { useProfile } from "../composables/useProfile";
import { activeProgress } from "../state/gameState";
import { LEVELS, ARC_ENVIRONMENTS } from "../data/levels";
import type { LevelDefinition } from "../types";

const ARC_ICONS: Record<number, string> = {
  1: "🌿",
  2: "⚡",
  3: "💎",
  4: "🌊",
  5: "🏔️",
};
const ARC_OUTRO_CS: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 };
const CS_TRIGGER_LEVEL: Record<number, number> = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
};

const router = useRouter();
const route = useRoute();
const { profile: profileRef } = useProfile();
const profile = computed(() => profileRef.value);

const screenEl = ref<HTMLElement | null>(null);
const levelCardEls = ref<HTMLElement[]>([]);

const attempted = computed(() => {
  const q = route.query.attempted;
  return q ? parseInt(q as string, 10) : undefined;
});

const progress = computed(() => activeProgress(profile.value));

const totalCompleted = computed(
  () =>
    Object.values(progress.value.levelRecords).filter((r) => r.completed)
      .length,
);

const arcLevels = computed<Record<number, LevelDefinition[]>>(() => {
  const map: Record<number, LevelDefinition[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  };
  for (const lvl of LEVELS) map[lvl.arc].push(lvl);
  return map;
});

function isUnlocked(n: number): boolean {
  return n <= progress.value.highestUnlockedLevel;
}

function isCompleted(n: number): boolean {
  return progress.value.levelRecords[n]?.completed ?? false;
}

function levelRecord(n: number) {
  return progress.value.levelRecords[n];
}

function levelStateClass(n: number): string {
  if (isCompleted(n)) return "ls-card-done";
  if (isUnlocked(n)) {
    const isNext = n === progress.value.highestUnlockedLevel;
    return `ls-card-open${isNext ? " ls-card-next" : ""}`;
  }
  return "ls-card-locked";
}

function newLettersFor(lvl: LevelDefinition): string[] {
  if (lvl.isSpeedTest || lvl.isFinale) return [];
  if (lvl.number === 1) return lvl.availableLetters.split("");
  const prev = LEVELS.find((l) => l.number === lvl.number - 1);
  if (!prev || prev.isSpeedTest) return lvl.availableLetters.split("");
  const prevSet = new Set(prev.availableLetters);
  return lvl.availableLetters.split("").filter((c) => !prevSet.has(c));
}

function arcOutroUnlocked(arcNum: number): boolean {
  return (
    progress.value.levelRecords[CS_TRIGGER_LEVEL[arcNum]]?.completed ?? false
  );
}

function arcOutroLabel(arcNum: number): string {
  const labels: Record<number, string> = {
    1: "Ch. 1",
    2: "Ch. 2",
    3: "Ch. 3",
    4: "Ch. 4",
    5: "Finale",
  };
  return labels[arcNum] ?? `Ch.${arcNum}`;
}

function onLevelClick(n: number): void {
  if (isUnlocked(n)) {
    router.push(`/level/${n}`);
    return;
  }
  // Shake animation on locked click
  const card = levelCardEls.value.find((el) => el.dataset.level === String(n));
  if (card) {
    card.classList.remove("ls-shake");
    void card.offsetWidth;
    card.classList.add("ls-shake");
    card.addEventListener(
      "animationend",
      () => {
        card.classList.remove("ls-shake");
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      },
      { once: true },
    );
  }
}

onMounted(() => {
  if (screenEl.value) {
    screenEl.value.classList.add("screen-enter");
    requestAnimationFrame(() =>
      screenEl.value?.classList.remove("screen-enter"),
    );
  }

  // Staggered enter animation for level cards and cutscene nodes
  requestAnimationFrame(() => {
    const items = screenEl.value?.querySelectorAll<HTMLElement>(
      ".ls-level-card, .ls-cs-node",
    );
    items?.forEach((el, index) => {
      el.style.setProperty("--enter-delay", `${index * 40}ms`);
      el.classList.add("ls-entering");
      el.addEventListener(
        "animationend",
        () => {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        },
        { once: true },
      );
    });
  });
});
</script>
