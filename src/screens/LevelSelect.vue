<template>
  <div
    ref="screenEl"
    :class="`screen level-select-screen team-${profile.activeTeam}`"
  >
    <div class="ls-header">
      <button class="ls-back-btn" @click="router.push('/')">← Back</button>
      <h2 class="ls-title">Choose Level</h2>
      <button class="ls-chest-btn" type="button" @click="showTreasure = true">
        Treasure Chest
      </button>
      <div class="ls-progress-pill">
        <span class="ls-prog-count">{{ totalCompleted }}</span>
        <span class="ls-prog-denom"> / 21</span>
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
              lvl.isFinale ? 'ls-card-finale' : '',
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
              <span v-if="lvl.isFinale" class="ls-boss-badge">🐉 Boss</span>
              <span v-if="isCompleted(lvl.number)" class="ls-status ls-done"
                >✓</span
              >
              <span
                v-else-if="isUnlocked(lvl.number) && !isTried(lvl.number)"
                class="ls-status ls-open"
                >▶</span
              >
              <span v-else-if="!isUnlocked(lvl.number)" class="ls-status ls-locked-icon">⚿</span>
            </div>
            <div
              v-if="(isCompleted(lvl.number) || isTried(lvl.number)) && levelRecord(lvl.number)"
              :class="['ls-card-stats', isTried(lvl.number) ? 'ls-stats-tried' : '']"
            >
              <span :class="isTried(lvl.number) && levelRecord(lvl.number)!.bestWpm < threshold.wpm ? 'ls-wpm-tried' : 'ls-wpm'"
                >{{ levelRecord(lvl.number)!.bestWpm }}<small>wpm</small></span
              >
              <span class="ls-sep">·</span>
              <span :class="isTried(lvl.number) && levelRecord(lvl.number)!.bestAccuracy < threshold.accuracy ? 'ls-acc-tried' : 'ls-acc'"
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
                >{{ letter === " " ? "SPACE" : letter.toUpperCase() }}</span
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

    <Teleport to="body">
      <div
        v-if="showTreasure"
        class="ls-modal-backdrop"
        @click.self="showTreasure = false"
      >
        <section
          class="ls-treasure-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="treasure-title"
        >
          <div class="ls-treasure-head">
            <div>
              <h3 id="treasure-title" class="ls-treasure-title">
                Treasure Chest
              </h3>
              <div class="ls-treasure-sub">
                {{ learnedLetters.length }} learned keys
              </div>
            </div>
            <button
              class="ls-treasure-close"
              type="button"
              aria-label="Close treasure chest"
              @click="showTreasure = false"
            >
              ×
            </button>
          </div>
          <div class="ls-treasure-table" role="table">
            <div class="ls-treasure-row ls-treasure-header" role="row">
              <span role="columnheader">Key</span>
              <span role="columnheader">Medal</span>
              <span role="columnheader">Hits</span>
              <span role="columnheader">Best WPM</span>
              <span role="columnheader">Best Acc</span>
              <span role="columnheader">Recent WPM</span>
              <span role="columnheader">Recent Acc</span>
            </div>
            <div
              v-for="letter in learnedLetters"
              :key="letter"
              class="ls-treasure-row"
              role="row"
            >
              <span class="ls-treasure-letter" role="cell">{{
                letterLabel(letter)
              }}</span>
              <span
                :class="[
                  'ls-treasure-medal',
                  medalClass(letterProgressFor(letter)?.medal ?? 'none'),
                ]"
                role="cell"
              >
                <img
                  v-if="medalIcon(letterProgressFor(letter)?.medal ?? 'none')"
                  class="ls-medal-icon"
                  :src="medalIcon(letterProgressFor(letter)?.medal ?? 'none')!"
                  :alt="medalLabel(letterProgressFor(letter)?.medal ?? 'none')"
                />
                <span v-else>{{ medalLabel("none") }}</span>
              </span>
              <span role="cell">{{
                letterProgressFor(letter)?.totalHits ?? 0
              }}</span>
              <span role="cell">{{ bestWpmLabel(letter) }}</span>
              <span role="cell">{{ bestAccuracyLabel(letter) }}</span>
              <span role="cell">{{ recentWpmLabel(letter) }}</span>
              <span role="cell">{{ recentAccuracyLabel(letter) }}</span>
            </div>
          </div>
          <div v-if="learnedLetters.length === 0" class="ls-treasure-empty">
            Complete letter levels to fill the chest.
          </div>
        </section>
      </div>
    </Teleport>

    <div
      class="ls-training-card"
      @click="router.push('/training')"
      role="button"
      tabindex="0"
      @keydown.enter.space.prevent="router.push('/training')"
    >
      <div class="ls-training-icon">🥋</div>
      <div class="ls-training-text">
        <div class="ls-training-name">Training Mode</div>
        <div class="ls-training-sub">Speed check → targeted drill → repeat</div>
      </div>
      <div class="ls-training-arrow">→</div>
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
import { LEVELS, ARC_ENVIRONMENTS, CHAR_TO_LEARN_LEVEL } from "../data/levels";
import type { LetterMedal, LevelDefinition } from "../types";
import { DIFFICULTY_THRESHOLDS } from "../types";
import { medalIconForTeam } from "../assets/medals";

const ARC_ICONS: Record<number, string> = {
  1: "🌿",
  2: "⚡",
  3: "💎",
  4: "🌊",
  5: "🏔️",
};
const ARC_OUTRO_CS: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 };
const CS_TRIGGER_LEVEL: Record<number, number> = {
  1: 5,
  2: 9,
  3: 13,
  4: 17,
  5: 21,
};

const router = useRouter();
const route = useRoute();
const { profile: profileRef } = useProfile();
const profile = computed(() => profileRef.value);

const screenEl = ref<HTMLElement | null>(null);
const levelCardEls = ref<HTMLElement[]>([]);
const showTreasure = ref(false);

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

const learnedLetters = computed(() =>
  Object.entries(CHAR_TO_LEARN_LEVEL)
    .filter(
      ([, level]) => progress.value.levelRecords[level]?.completed ?? false,
    )
    .sort((a, b) => a[1] - b[1] || curriculumSort(a[0], b[0]))
    .map(([letter]) => letter),
);

function isUnlocked(n: number): boolean {
  return n <= progress.value.highestUnlockedLevel;
}

function isCompleted(n: number): boolean {
  return progress.value.levelRecords[n]?.completed ?? false;
}

function isTried(n: number): boolean {
  return isUnlocked(n) && !isCompleted(n) && (levelRecord(n)?.bestWpm ?? 0) > 0;
}

const threshold = computed(() => DIFFICULTY_THRESHOLDS[profile.value.difficulty]);

function levelRecord(n: number) {
  return progress.value.levelRecords[n];
}

function letterProgressFor(letter: string) {
  return progress.value.letterProgress?.[letter];
}

function medalLabel(medal: LetterMedal): string {
  const labels: Record<LetterMedal, string> = {
    none: "-",
    bronze: "Bronze medal",
    silver: "Silver medal",
    gold: "Gold medal",
  };
  return labels[medal];
}

function medalIcon(medal: LetterMedal): string | null {
  return medalIconForTeam(profile.value.activeTeam, medal);
}

function medalClass(medal: LetterMedal): string {
  return `ls-medal-${medal}`;
}

function bestWpmLabel(letter: string): string {
  const stats = letterProgressFor(letter);
  return stats && (stats.bestWpm ?? 0) > 0 ? String(stats.bestWpm) : "--";
}

function bestAccuracyLabel(letter: string): string {
  const stats = letterProgressFor(letter);
  return stats && (stats.bestWpm ?? 0) > 0 ? `${stats.bestAccuracy}%` : "--";
}

function recentWpmLabel(letter: string): string {
  const stats = letterProgressFor(letter);
  return stats && Array.isArray(stats.recentRuns) && stats.recentRuns.length > 0
    ? String(stats.recentWpm)
    : "--";
}

function recentAccuracyLabel(letter: string): string {
  const stats = letterProgressFor(letter);
  return stats && Array.isArray(stats.recentRuns) && stats.recentRuns.length > 0
    ? `${stats.recentAccuracy}%`
    : "--";
}

function letterLabel(letter: string): string {
  return letter === " " ? "SPACE" : letter.toUpperCase();
}

function curriculumSort(a: string, b: string): number {
  if (a === " ") return 1;
  if (b === " ") return -1;
  return a.localeCompare(b);
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
  document.title = "Level Select";
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
          el.classList.remove("ls-entering");
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        },
        { once: true },
      );
    });
  });
});
</script>
