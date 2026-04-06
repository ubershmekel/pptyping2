import "./cutscene.css";
import type { ScreenMount, Team } from "../types";
import { createScreenMount } from "../screenMount";
import { CUTSCENE_STORIES } from "../data/stories";

export function renderCutscene(
  team: Team,
  cutsceneIndex: number,
  onNext: () => void,
): ScreenMount {
  const story = CUTSCENE_STORIES[team][cutsceneIndex];
  const screen = document.createElement("div");
  const mount = createScreenMount(screen);
  screen.className = `screen cutscene-screen team-${team}`;

  screen.innerHTML = `
    <div class="cs-content">
      <div class="cs-story" aria-live="polite">
        <div class="cs-chapter">Chapter ${cutsceneIndex + 1}</div>
        <h1 class="cs-title">${story.title}</h1>
        <div class="cs-paragraphs">
          ${story.paragraphs
            .map(
              (p, i) =>
                `<p class="cs-p" style="animation-delay:${0.4 + i * 0.35}s">${p}</p>`,
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
        <button class="cs-next-btn" id="cs-next">
          ${cutsceneIndex === 5 ? "🏆 Play Again" : "Continue →"}
        </button>
        <div class="cs-hint">Press Enter or click to continue</div>
      </div>
    </div>

    <div class="cs-bg-particles" aria-hidden="true">
      ${Array.from({ length: 12 }, () => '<span class="cs-particle"></span>').join("")}
    </div>
  `;

  // Art reveal animation trigger (slight delay)
  const art = screen.querySelector(".cs-art") as HTMLElement;
  let advanced = false;
  let stopKeyHandler: (() => void) | null = null;

  // Next button
  const nextBtn = screen.querySelector("#cs-next") as HTMLButtonElement;
  const go = () => {
    if (advanced) {
      return;
    }
    advanced = true;
    console.log(`[transition] fade out ← cutscene ${cutsceneIndex}`);
    screen.classList.add("screen-exit");
    stopKeyHandler?.();
    stopKeyHandler = null;
    mount.timeout(onNext, 350);
  };
  mount.listen(nextBtn, "click", go);

  // Enter key
  const keyHandler = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      go();
    }
  };
  mount.timeout(() => {
    stopKeyHandler = mount.listen(document, "keydown", keyHandler);
  }, 500);
  mount.timeout(() => art?.classList.add("cs-art-revealed"), 800);

  return mount;
}

// ─── Inline CSS art placeholders ─────────────────────────────────────────────
// Beautiful CSS paintings — each tells a visual story without external images.

function generateCutsceneArt(team: Team, index: number): string {
  if (team === "pokemon") {
    const arts = [
      // 0: Pikachu looking at a corrupted keyboard
      `<div class="cs-art-scene">
        <div class="cs-sky cs-sky-electric"></div>
        <div class="cs-ground"></div>
        <div class="cs-art-pikachu-big"></div>
        <div class="cs-keyboard-corrupted"></div>
        <div class="cs-sparkles-electric"></div>
      </div>`,
      // 1: Pikachu celebrating, first keys glowing
      `<div class="cs-art-scene">
        <div class="cs-sky cs-sky-dawn"></div>
        <div class="cs-ground cs-ground-lit"></div>
        <div class="cs-art-pikachu-big cs-pikachu-celebrate"></div>
        <div class="cs-keys-glowing"></div>
        <div class="cs-lightning-burst"></div>
      </div>`,
      // 2–5: Progressive scenes
      `<div class="cs-art-scene cs-art-cavern">
        <div class="cs-sky cs-sky-cave"></div>
        <div class="cs-crystals"></div>
        <div class="cs-art-pikachu-big"></div>
      </div>`,
      `<div class="cs-art-scene cs-art-coast">
        <div class="cs-sky cs-sky-ocean"></div>
        <div class="cs-waves"></div>
        <div class="cs-art-pikachu-big"></div>
        <div class="cs-rowlet-silhouette"></div>
      </div>`,
      `<div class="cs-art-scene cs-art-mountain">
        <div class="cs-sky cs-sky-summit"></div>
        <div class="cs-mountains"></div>
        <div class="cs-art-pikachu-big cs-pikachu-determined"></div>
      </div>`,
      `<div class="cs-art-scene cs-art-finale">
        <div class="cs-sky cs-sky-victory"></div>
        <div class="cs-art-pikachu-big cs-pikachu-celebrate"></div>
        <div class="cs-art-rowlet"></div>
        <div class="cs-confetti-burst"></div>
        <div class="cs-keys-all-glowing"></div>
      </div>`,
    ];
    return arts[index] ?? arts[0];
  } else {
    const arts = [
      // 0: Pinkie at keyboard, looking excited
      `<div class="cs-art-scene">
        <div class="cs-sky cs-sky-ponyville"></div>
        <div class="cs-ground cs-ground-rainbow"></div>
        <div class="cs-art-pinkie-big"></div>
        <div class="cs-keyboard-corrupted cs-keyboard-yellow"></div>
        <div class="cs-sparkles-rainbow"></div>
      </div>`,
      // 1: Pinkie celebrating first restored keys
      `<div class="cs-art-scene">
        <div class="cs-sky cs-sky-dawn cs-sky-pink"></div>
        <div class="cs-ground cs-ground-flowers"></div>
        <div class="cs-art-pinkie-big cs-pinkie-celebrate"></div>
        <div class="cs-rainbow-burst"></div>
        <div class="cs-keys-glowing cs-keys-pink"></div>
      </div>`,
      `<div class="cs-art-scene cs-art-meadow">
        <div class="cs-sky cs-sky-noon"></div>
        <div class="cs-ground cs-ground-flowers"></div>
        <div class="cs-art-pinkie-big"></div>
        <div class="cs-balloons"></div>
      </div>`,
      `<div class="cs-art-scene cs-art-crystal">
        <div class="cs-sky cs-sky-cave cs-sky-pink-cave"></div>
        <div class="cs-crystals cs-crystals-pink"></div>
        <div class="cs-art-pinkie-big"></div>
        <div class="cs-party-cannon"></div>
      </div>`,
      `<div class="cs-art-scene cs-art-mountain">
        <div class="cs-sky cs-sky-summit cs-sky-pink-summit"></div>
        <div class="cs-mountains cs-mountains-pastel"></div>
        <div class="cs-art-pinkie-big cs-pinkie-determined"></div>
      </div>`,
      `<div class="cs-art-scene cs-art-finale cs-finale-mlp">
        <div class="cs-sky cs-sky-victory cs-sky-rainbow"></div>
        <div class="cs-art-pinkie-big cs-pinkie-celebrate"></div>
        <div class="cs-confetti-burst cs-confetti-rainbow"></div>
        <div class="cs-keys-all-glowing cs-keys-rainbow"></div>
        <div class="cs-balloons cs-balloons-many"></div>
      </div>`,
    ];
    return arts[index] ?? arts[0];
  }
}

function getArtCaption(team: Team, index: number): string {
  const captions: Record<Team, string[]> = {
    pokemon: [
      "Pikachu discovers the corrupted keyboard",
      "The first keys are restored with a lightning strike",
      "Deeper into the crystal cavern",
      "Rowlet spotted on the distant shore",
      "The Apex Summit — final keys ahead",
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
