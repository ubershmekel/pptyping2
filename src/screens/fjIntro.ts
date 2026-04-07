import "./fjIntro.css";
import type { ScreenMount, Team } from "../types";
import { createScreenMount } from "../screenMount";

export function renderFjIntro(team: Team, onDone: () => void): ScreenMount {
  const screen = document.createElement("div");
  const mount = createScreenMount(screen);
  screen.className = `screen fj-intro-screen team-${team}`;

  screen.innerHTML = `
    <div class="fji-layout">
      <div class="fji-keys">
        <div class="fji-key">F</div>
        <div class="fji-and">and</div>
        <div class="fji-key">J</div>
      </div>
      <h2 class="fji-title">Always come back here</h2>
      <p class="fji-body">After typing E or T, slide your fingers back to <kbd>F</kbd> and <kbd>J</kbd>.</p>
      <p class="fji-nub">Both keys have a small bump — feel for it and you can find home without looking down.</p>
      <div class="fji-prompt">Try it now — press <kbd>F</kbd> or <kbd>J</kbd> to continue</div>
    </div>
  `;

  let advanced = false;
  mount.listen(document, "keydown", (e: KeyboardEvent) => {
    if (e.repeat || advanced) return;
    const key = e.key.toLowerCase();
    if (key === "f" || key === "j") {
      advanced = true;
      screen.classList.add("fji-complete");
      mount.timeout(onDone, 500);
    }
  });

  return mount;
}
