import type { Team } from '../types';
import { pikachuSVG, pinkiePieSVG } from '../components/character';

export function renderTeamSelect(
  onSelect: (team: Team) => void,
  existingTeam?: Team,
): HTMLElement {
  const screen = document.createElement('div');
  screen.className = 'screen team-select-screen';

  screen.innerHTML = `
    <div class="ts-header">
      <div class="ts-logo">
        <span class="logo-pp">PP</span><span class="logo-typing">Typing</span>
      </div>
      <p class="ts-tagline">Choose your side. Cleanse the keyboard. Type your way to victory.</p>
    </div>

    <div class="ts-panels">
      <!-- POKEMON PANEL -->
      <button class="ts-panel ts-panel-pokemon" data-team="pokemon" aria-label="Choose Team Pokémon">
        <div class="ts-panel-bg ts-panel-bg-pokemon"></div>
        <div class="ts-panel-glow ts-panel-glow-pokemon"></div>
        <div class="ts-panel-content">
          <div class="ts-character ts-character-pokemon">
            ${pikachuSVG(100)}
          </div>
          <div class="ts-panel-text">
            <h2 class="ts-team-name">Team <span>Pokémon</span></h2>
            <p class="ts-team-lore">
              Rowlet has been birdnapped.<br>
              Pikachu must zap the keyboard<br>
              clean — one key at a time.
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
            ${pinkiePieSVG(100)}
          </div>
          <div class="ts-panel-text">
            <h2 class="ts-team-name">Team <span>Ponies</span></h2>
            <p class="ts-team-lore">
              Friendship is the only antidote.<br>
              Pinkie Pie must befriend every<br>
              key — one at a time.
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

    ${existingTeam ? `
    <div class="ts-existing-save">
      <span>You have a saved game as Team ${existingTeam === 'pokemon' ? 'Pokémon' : 'Ponies'}.</span>
      <button class="ts-continue-btn" id="ts-continue">Continue saved game</button>
    </div>` : ''}
  `;

  // Click handlers
  screen.querySelectorAll('.ts-panel').forEach(panel => {
    panel.addEventListener('click', () => {
      const team = (panel as HTMLElement).dataset.team as Team;
      // Flash the chosen panel
      panel.classList.add('ts-panel-selected');
      setTimeout(() => onSelect(team), 350);
    });

    // Hover: expand panel slightly via CSS data-hovered
    panel.addEventListener('mouseenter', () => {
      screen.querySelectorAll('.ts-panel').forEach(p => p.removeAttribute('data-hovered'));
      (panel as HTMLElement).dataset.hovered = 'true';
    });
    panel.addEventListener('mouseleave', () => {
      (panel as HTMLElement).removeAttribute('data-hovered');
    });
  });

  // Continue saved game
  const continueBtn = screen.querySelector('#ts-continue');
  if (continueBtn && existingTeam) {
    continueBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      onSelect(existingTeam);
    });
  }

  return screen;
}
