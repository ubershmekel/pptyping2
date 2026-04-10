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
  mount.timeout(() => art?.classList.add("cs-art-revealed"), 0);

  return mount;
}

function renderEmphasis(text: string): string {
  return text.replace(/_([^_]+)_/g, "<em>$1</em>");
}

function generateCutsceneArt(team: Team, index: number): string {
  const prefix = team === "pokemon" ? "pok" : "mlp";
  const src = `/cutscenes/${prefix}${index}.jpg`;
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
