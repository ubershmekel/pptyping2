import './teamSelect.css';
import { createCharacterPortraitElement } from '../components/characterPortrait';
import { CHARACTER_PORTRAITS } from '../assets/characters';
import { createScreenMount } from '../screenMount';
import type { ScreenMount, Team } from "../types";

export function renderTeamSelect(
  onSelect: (team: Team) => void,
  existingTeam?: Team,
): ScreenMount {
  const screen = document.createElement("div");
  const mount = createScreenMount(screen);
  screen.className = "screen team-select-screen";
  let cancelSelect: (() => void) | null = null;

  screen.innerHTML = `
    <div class="ts-header">
      <div class="ts-logo">
        <span class="logo-pp">PP</span><span class="logo-typing">Typing</span>
      </div>
      <p class="ts-tagline">Choose your side. Cleanse the keyboard. Type your way to victory.</p>
    </div>

    <div class="ts-panels">
      <!-- POKEMON PANEL -->
      <button class="ts-panel ts-panel-pokemon" data-team="pokemon" aria-label="Choose Team Pokemon">
        <div class="ts-panel-bg ts-panel-bg-pokemon"></div>
        <div class="ts-panel-glow ts-panel-glow-pokemon"></div>
        <div class="ts-panel-content">
          <div class="ts-character ts-character-pokemon">
            <div class="ts-character-slot" data-portrait-slot="pokemon"></div>
          </div>
          <div class="ts-panel-text">
            <h2 class="ts-team-name">Team <span>Pokemon</span></h2>
            <p class="ts-team-lore">
              Rowlet has been birdnapped.<br>
              Pikachu must zap the keyboard<br>
              clean - one key at a time.
            </p>
            <div class="ts-btn ts-btn-pokemon">
              ⚡ Choose Pokémon
            </div>
          </div>
        </div>
        <div class="ts-particles ts-particles-pokemon" aria-hidden="true">
          <span class="ts-particle"></span><span class="ts-particle"></span>
          <span class="ts-particle"></span><span class="ts-particle"></span>
          <span class="ts-particle"></span><span class="ts-particle"></span>
        </div>
      </button>

      <!-- VS divider -->
      <div class="ts-vs" aria-hidden="true">
        <div class="ts-vs-inner">VS</div>
      </div>

      <!-- MLP PANEL -->
      <button class="ts-panel ts-panel-mlp" data-team="mlp" aria-label="Choose Team My Little Pony">
        <div class="ts-panel-bg ts-panel-bg-mlp"></div>
        <div class="ts-panel-glow ts-panel-glow-mlp"></div>
        <div class="ts-panel-content">
          <div class="ts-character ts-character-mlp">
            <div class="ts-character-slot" data-portrait-slot="mlp"></div>
          </div>
          <div class="ts-panel-text">
            <h2 class="ts-team-name">Team <span>Ponies</span></h2>
            <p class="ts-team-lore">
              Friendship is the only antidote.<br>
              Pinkie Pie must befriend every<br>
              key - one at a time.
            </p>
            <div class="ts-btn ts-btn-mlp">
              🌈 Choose Ponies
            </div>
          </div>
        </div>
        <div class="ts-particles ts-particles-mlp" aria-hidden="true">
          <span class="ts-particle"></span><span class="ts-particle"></span>
          <span class="ts-particle"></span><span class="ts-particle"></span>
          <span class="ts-particle"></span><span class="ts-particle"></span>
        </div>
      </button>
    </div>

    ${
      existingTeam
        ? `
    <div class="ts-existing-save">
      <span>You have a saved game as Team ${existingTeam === "pokemon" ? "Pokemon" : "Ponies"}.</span>
      <button class="ts-continue-btn" id="ts-continue">Continue saved game</button>
    </div>`
        : ""
    }
  `;

  const portraitConfig: Record<Team, { alt: string; animated: boolean; loopTag?: string }> = {
    pokemon: {
      alt: 'Pikachu companion preview',
      animated: true,
      loopTag: 'stand',
    },
    mlp: {
      alt: 'Pinkie Pie companion preview',
      animated: false,
    },
  };

  (Object.entries(portraitConfig) as Array<[Team, { alt: string; animated: boolean; loopTag?: string }]>)
    .forEach(([team, config]) => {
      const slot = screen.querySelector<HTMLElement>(`[data-portrait-slot="${team}"]`);
      if (slot === null) {
        return;
      }

      const portrait = createCharacterPortraitElement(CHARACTER_PORTRAITS[team], config.alt, {
        animated: config.animated,
        className: 'ts-character-art',
        loopTag: config.loopTag,
      });
      slot.appendChild(portrait.element);
      mount.defer(portrait.cleanup);
    });

  screen.querySelectorAll<HTMLElement>(".ts-panel").forEach((panel) => {
    mount.listen(panel, "click", () => {
      const team = (panel as HTMLElement).dataset.team as Team;
      panel.classList.add("ts-panel-selected");
      if (cancelSelect !== null) {
        cancelSelect();
      }
      cancelSelect = mount.timeout(() => {
        cancelSelect = null;
        onSelect(team);
      }, 350);
    });
    mount.listen(panel, "mouseenter", () => {
      screen
        .querySelectorAll(".ts-panel")
        .forEach((p) => p.removeAttribute("data-hovered"));
      (panel as HTMLElement).dataset.hovered = "true";
    });
    mount.listen(panel, "mouseleave", () => {
      (panel as HTMLElement).removeAttribute("data-hovered");
    });
  });

  const continueBtn = screen.querySelector("#ts-continue");
  if (continueBtn && existingTeam) {
    mount.listen(continueBtn, "click", (e: Event) => {
      e.stopPropagation();
      onSelect(existingTeam);
    });
  }

  return mount;
}
