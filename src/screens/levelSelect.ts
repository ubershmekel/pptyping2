import "./levelSelect.css";
import type { LevelDefinition, PlayerProfile } from "../types";
import { LEVELS, ARC_ENVIRONMENTS } from "../data/levels";

const ARC_ICONS: Record<number, string> = {
  1: "🌿",
  2: "⚡",
  3: "💎",
  4: "🌊",
  5: "🏔️",
};

// Cutscene index that closes each arc
const ARC_OUTRO_CS: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 };

// Which level's completion unlocks each arc's outro cutscene
const CS_TRIGGER_LEVEL: Record<number, number> = {
  1: 2,
  2: 5,
  3: 8,
  4: 11,
  5: 14,
};

export function renderLevelSelect(
  profile: PlayerProfile,
  onLevel: (n: number) => void,
  onCutscene: (index: number) => void,
  onBack: () => void,
  attempted?: number,
): HTMLElement {
  const screen = document.createElement("div");
  screen.className = `screen level-select-screen team-${profile.team}`;

  const arcMap: Record<number, LevelDefinition[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  };
  for (const lvl of LEVELS) arcMap[lvl.arc].push(lvl);

  const totalCompleted = Object.values(profile.levelRecords).filter(
    (r) => r.completed,
  ).length;

  screen.innerHTML = `
    <div class="ls-header">
      <button class="ls-back-btn" data-action="back">← Back</button>
      <h2 class="ls-title">Choose Level</h2>
      <div class="ls-progress-pill">
        <span class="ls-prog-count">${totalCompleted}</span>
        <span class="ls-prog-denom"> / 14</span>
      </div>
    </div>
    ${attempted ? `<div class="ls-notice">Level ${attempted} is locked — complete earlier levels first.</div>` : ""}
    <div class="ls-map">
      ${([1, 2, 3, 4, 5] as const).map((a) => buildArc(a, arcMap[a], profile, attempted)).join("")}
    </div>
    <div class="ls-particles" aria-hidden="true">
      ${Array.from({ length: 14 }, () => '<span class="ls-particle"></span>').join("")}
    </div>
  `;

  // Wire events
  screen.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;

    if (t.closest('[data-action="back"]')) {
      onBack();
      return;
    }

    const card = t.closest<HTMLElement>("[data-level]");
    if (card) {
      const n = parseInt(card.dataset["level"]!, 10);
      if (n <= profile.highestUnlockedLevel) {
        onLevel(n);
      } else {
        // Shake on locked click — clean up so the card stays visible
        card.classList.remove("ls-shake");
        void card.offsetWidth; // reflow to restart animation
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
      return;
    }

    const csNode = t.closest<HTMLElement>("[data-cutscene]");
    if (csNode && csNode.dataset["unlocked"] === "true") {
      onCutscene(parseInt(csNode.dataset["cutscene"]!, 10));
    }
  });

  // Keyboard activation
  screen.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const el = (e.target as HTMLElement).closest<HTMLElement>(
      "[data-level], [data-cutscene]",
    );
    if (el) {
      e.preventDefault();
      el.click();
    }
  });

  // Staggered entrance — after animation, lock opacity so shake can't steal it
  requestAnimationFrame(() => {
    const items = screen.querySelectorAll<HTMLElement>(
      ".ls-level-card, .ls-cs-node",
    );
    items.forEach((el, i) => {
      el.style.setProperty("--enter-delay", `${i * 40}ms`);
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

  return screen;
}

function buildArc(
  arcNum: number,
  levels: LevelDefinition[],
  profile: PlayerProfile,
  attempted?: number,
): string {
  const env = ARC_ENVIRONMENTS[arcNum];
  const icon = ARC_ICONS[arcNum];

  const csOutroIdx = ARC_OUTRO_CS[arcNum];
  const csTrigger = CS_TRIGGER_LEVEL[arcNum];
  const csUnlocked = profile.levelRecords[csTrigger]?.completed ?? false;

  const introCs = arcNum === 1 ? buildCutsceneNode(0, true) : "";
  const levelCards = levels
    .map((lvl) => buildLevelCard(lvl, profile, attempted))
    .join("");
  const outroCs = buildCutsceneNode(csOutroIdx, csUnlocked);

  return `
    <div class="ls-arc arc-${arcNum}">
      <div class="ls-arc-header">
        <span class="ls-arc-icon">${icon}</span>
        <div class="ls-arc-text">
          <div class="ls-arc-name">${env.name}</div>
          <div class="ls-arc-label">Arc ${arcNum}</div>
        </div>
      </div>
      <div class="ls-arc-nodes">
        ${introCs}${levelCards}${outroCs}
      </div>
    </div>
  `;
}

function buildLevelCard(
  lvl: LevelDefinition,
  profile: PlayerProfile,
  attempted?: number,
): string {
  const n = lvl.number;
  const unlocked = n <= profile.highestUnlockedLevel;
  const record = profile.levelRecords[n];
  const completed = record?.completed ?? false;
  const isNext = unlocked && !completed && n === profile.highestUnlockedLevel;

  const stateClass = completed
    ? "ls-card-done"
    : unlocked
      ? `ls-card-open${isNext ? " ls-card-next" : ""}`
      : "ls-card-locked";

  const newLetters = lvl.isSpeedTest ? "" : computeNewLetters(lvl);
  const letterChips = newLetters
    .split("")
    .map((c) => `<span class="ls-chip">${c.toUpperCase()}</span>`)
    .join("");

  const statsRow =
    completed && record
      ? `<div class="ls-card-stats">
         <span class="ls-wpm">${record.bestWpm}<small>wpm</small></span>
         <span class="ls-sep">·</span>
         <span class="ls-acc">${record.bestAccuracy}<small>%</small></span>
       </div>`
      : `<div class="ls-card-stats ls-stats-empty">${unlocked ? "Not played yet" : "Locked"}</div>`;

  const statusIcon = completed
    ? `<span class="ls-status ls-done">✓</span>`
    : unlocked
      ? `<span class="ls-status ls-open">▶</span>`
      : `<span class="ls-status ls-locked-icon">⚿</span>`;

  const speedBadge = lvl.isSpeedTest
    ? `<span class="ls-speed-badge">⚡ Speed check</span>`
    : "";

  return `
    <div class="ls-level-card ${stateClass}${n === attempted ? " ls-attempted" : ""}"
      data-level="${n}"
      tabindex="${unlocked ? 0 : -1}"
      role="button"
      aria-label="Level ${n}${completed ? ", completed" : unlocked ? ", available" : ", locked"}"
    >
      <div class="ls-card-row1">
        <span class="ls-lv-num">LV.${n}</span>
        ${speedBadge}
        ${statusIcon}
      </div>
      ${statsRow}
      <div class="ls-card-letters">${letterChips}</div>
    </div>
  `;
}

function buildCutsceneNode(index: number, unlocked: boolean): string {
  const labels = ["Intro", "Ch. 1", "Ch. 2", "Ch. 3", "Ch. 4", "Finale"];
  const label = labels[index] ?? `Ch.${index}`;
  const icon = index === 5 ? "🏆" : index === 0 ? "🎬" : "▶";

  return `
    <div class="ls-cs-node${unlocked ? " ls-cs-open" : " ls-cs-locked"}"
      data-cutscene="${index}"
      data-unlocked="${unlocked}"
      tabindex="${unlocked ? 0 : -1}"
      role="button"
      aria-label="${label} cutscene${unlocked ? "" : " (locked)"}"
    >
      <span class="ls-cs-icon">${unlocked ? icon : "🔒"}</span>
      <span class="ls-cs-label">${label}</span>
    </div>
  `;
}

function computeNewLetters(lvl: LevelDefinition): string {
  if (lvl.number === 1) return lvl.availableLetters;
  const prev = LEVELS.find((l) => l.number === lvl.number - 1);
  if (!prev || prev.isSpeedTest) return lvl.availableLetters;
  const prevSet = new Set(prev.availableLetters);
  return lvl.availableLetters
    .split("")
    .filter((c) => !prevSet.has(c))
    .join("");
}
