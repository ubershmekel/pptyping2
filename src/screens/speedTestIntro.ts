import "./speedTestIntro.css";
import type { ScreenMount, Team } from "../types";
import { createScreenMount } from "../screenMount";

export function renderSpeedTestIntro(
  team: Team,
  levelNumber: number,
  onStart: () => void,
  onBack: () => void,
): ScreenMount {
  const screen = document.createElement("div");
  const mount = createScreenMount(screen);
  screen.className = `screen speed-test-intro-screen team-${team}`;

  screen.innerHTML = `
    <div class="sti-layout">
      <div class="sti-level-tag">Level ${levelNumber} — Speed Test</div>
      <h1 class="sti-headline">How fast do you type right now?</h1>
      <p class="sti-body">
        Type through this level at your own pace — there's no passing or failing here.
        This is your starting point. We'll come back to it later so you can see
        how much you've improved.
      </p>
      <div class="sti-actions">
        <button class="sti-btn-primary" id="sti-start">Start →</button>
        <button class="sti-btn-secondary" id="sti-back">← Level Select</button>
      </div>
    </div>
  `;

  const startBtn = screen.querySelector("#sti-start") as HTMLButtonElement;
  const backBtn = screen.querySelector("#sti-back") as HTMLButtonElement;

  let gone = false;
  const go = () => {
    if (gone) return;
    gone = true;
    onStart();
  };

  mount.listen(startBtn, "click", go);
  mount.listen(backBtn, "click", () => onBack());
  mount.listen(document, "keydown", (e: KeyboardEvent) => {
    if (e.key === "Enter") go();
  });

  return mount;
}
