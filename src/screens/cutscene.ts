import "./cutscene.css";
import type { ScreenMount, Team } from "../types";
import { createScreenMount } from "../screenMount";
import { CUTSCENE_STORIES } from "../data/stories";
import { ParticleManager } from "../particles/particleManager";
import type { BurstType } from "../particles/presets";
import { withBasePath } from "../basePath";

// Cutscene index -> arc environment class (cutscene 0 intro = grove, 5 = summit)
const CUTSCENE_ENV = [
  "env-digital-grove",
  "env-digital-grove",
  "env-thunder-shrine",
  "env-crystal-cavern",
  "env-stardrift-coast",
  "env-apex-summit",
] as const;

// One-time burst(s) per [team][cutsceneIndex]: [{delay ms, type}]
type BurstEvent = { delay: number; type: BurstType };
const CUTSCENE_BURSTS: Record<Team, BurstEvent[][]> = {
  pokemon: [
    [{ delay: 1800, type: "petal" }], // 0: pink feather trail
    [{ delay: 1200, type: "golden" }], // 1: restored keys flash
    [{ delay: 1400, type: "electric" }], // 2: static curtain parts
    [{ delay: 1600, type: "ripple" }], // 3: crystal wall ripple
    [{ delay: 1200, type: "electric" }], // 4: cheek charge sparks
    [
      { delay: 900, type: "lightning" },
      { delay: 2200, type: "glass" },
    ], // 5: Thunderbolt + shatter
  ],
  mlp: [
    [{ delay: 1400, type: "water" }], // 0: water blast
    [{ delay: 1500, type: "confetti" }], // 1: prank landing
    [{ delay: 1300, type: "water" }], // 2: misfired prank
    [{ delay: 1600, type: "confetti" }], // 3: whoopee cushion pop
    [{ delay: 1700, type: "golden" }], // 4: warm moment settling
    [{ delay: 800, type: "party" }], // 5: party cannon blast
  ],
};

export function renderCutscene(
  team: Team,
  cutsceneIndex: number,
  onNext: () => void,
  onLevelSelect: () => void,
): ScreenMount {
  const story = CUTSCENE_STORIES[team][cutsceneIndex];
  const envClass = CUTSCENE_ENV[cutsceneIndex] ?? "env-digital-grove";
  const screen = document.createElement("div");
  const mount = createScreenMount(screen);
  screen.className = `screen cutscene-screen team-${team} ${envClass}`;

  screen.innerHTML = `
    <div class="cs-content">
      <div class="cs-story" aria-live="polite">
        <div class="cs-chapter">Chapter ${cutsceneIndex + 1}</div>
        <h1 class="cs-title">${story.title}</h1>
        <div class="cs-paragraphs">
          ${story.paragraphs
            .map(
              (p, i) =>
                `<p class="cs-p" style="animation-delay:${0.4 + i * 0.35}s">${renderEmphasis(p)}</p>`,
            )
            .join("")}
        </div>
      </div>

      <div class="cs-art-container">
        <div class="cs-art ${story.artClass}" aria-hidden="true">
          <div class="cs-art-reveal"></div>
          ${generateCutsceneArt(team, cutsceneIndex)}
        </div>
        <div class="cs-art-caption">${getArtCaption(team, cutsceneIndex)}</div>
      </div>

      <div class="cs-actions">
        <div class="cs-action-row">
          <button class="cs-next-btn" id="cs-next">
            ${cutsceneIndex === 5 ? "Play Again" : "Continue"}
          </button>
          <button class="cs-level-select-btn" id="cs-level-select">
            Level Select
          </button>
        </div>
        <div class="cs-hint">Press Enter or click to continue</div>
      </div>
    </div>

    <div class="cs-bg-particles" aria-hidden="true">
      ${Array.from({ length: 12 }, () => '<span class="cs-particle"></span>').join("")}
    </div>
  `;

  const particles = new ParticleManager(team);
  particles.mount(screen);
  mount.defer(() => particles.destroy());

  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  for (const burst of CUTSCENE_BURSTS[team][cutsceneIndex] ?? []) {
    mount.timeout(() => {
      particles.triggerBurst(burst.type, cx, cy);
    }, burst.delay);
  }

  const art = screen.querySelector(".cs-art") as HTMLElement;
  let advanced = false;
  let stopKeyHandler: (() => void) | null = null;

  const nextBtn = screen.querySelector("#cs-next") as HTMLButtonElement;
  const levelSelectBtn = screen.querySelector(
    "#cs-level-select",
  ) as HTMLButtonElement;

  const leave = (onLeave: () => void) => {
    if (advanced) {
      return;
    }
    advanced = true;
    console.log(`[transition] fade out <- cutscene ${cutsceneIndex}`);
    screen.classList.add("screen-exit");
    stopKeyHandler?.();
    stopKeyHandler = null;
    mount.timeout(onLeave, 350);
  };

  const go = () => leave(onNext);
  mount.listen(nextBtn, "click", go);
  mount.listen(levelSelectBtn, "click", () => leave(onLevelSelect));

  const keyHandler = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest("button")) {
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      go();
    }
  };
  mount.timeout(() => {
    stopKeyHandler = mount.listen(document, "keydown", keyHandler);
  }, 500);
  mount.timeout(() => art?.classList.add("cs-art-revealed"), 0);

  return mount;
}

function renderEmphasis(text: string): string {
  return text.replace(/_([^_]+)_/g, "<em>$1</em>");
}

function generateCutsceneArt(team: Team, index: number): string {
  const prefix = team === "pokemon" ? "pok" : "mlp";
  const src = withBasePath(`/cutscenes/${prefix}${index}.jpg`);
  const caption = getArtCaption(team, index);
  return `<img class="cs-art-img" src="${src}" alt="${caption}">`;
}

function getArtCaption(team: Team, index: number): string {
  const captions: Record<Team, string[]> = {
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
  return captions[team][index] ?? "";
}
