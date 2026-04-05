import './mainMenu.css';
import type { PlayerProfile, ScreenMount } from '../types';
import { createScreenMount } from '../screenMount';
import { activeProgress } from '../state/gameState';
import { CHARACTER_PORTRAITS } from '../assets/characters';

export function renderMainMenu(
  profile: PlayerProfile,
  onContinue: () => void,
  onSwitchTeams: () => void,
  onSettings: () => void,
): ScreenMount {
  const screen = document.createElement('div');
  const mount = createScreenMount(screen);
  screen.className = 'screen main-menu-screen';

  const hasSave = profile.teamSelected &&
    (activeProgress(profile).highestUnlockedLevel > 1 || activeProgress(profile).levelRecords[1]?.completed);

  const characterImg = hasSave
    ? `<img class="mm-character" src="${CHARACTER_PORTRAITS[profile.activeTeam]}" alt="" draggable="false">`
    : '';

  screen.innerHTML = `
    <div class="mm-bg" aria-hidden="true">
      <span class="mm-particle"></span>
      <span class="mm-particle"></span>
      <span class="mm-particle"></span>
      <span class="mm-particle"></span>
      <span class="mm-particle"></span>
      <span class="mm-particle"></span>
      <span class="mm-particle"></span>
      <span class="mm-particle"></span>
    </div>

    <header class="mm-header">
      <div class="mm-logo">
        <span class="logo-pp">PP</span><span class="logo-typing">Typing</span>
      </div>
      <p class="mm-tagline">Type your way to victory.</p>
    </header>

    <div class="mm-hero">
      ${characterImg}
    </div>

    <nav class="mm-nav">
      ${hasSave
        ? `<button class="mm-btn mm-btn-primary" data-action="continue">▶ Continue</button>
           <button class="mm-btn mm-btn-ghost" data-action="switch-teams">Switch Teams</button>`
        : `<button class="mm-btn mm-btn-primary" data-action="switch-teams">Start Game</button>`}
      <button class="mm-btn mm-btn-ghost mm-btn-settings" data-action="settings">⚙ Settings</button>
    </nav>
  `;

  mount.listen(screen, 'click', (e: Event) => {
    const btn = (e.target as HTMLElement).closest('[data-action]') as HTMLElement | null;
    if (!btn) return;
    const action = btn.dataset['action'];
    if (action === 'continue') onContinue();
    else if (action === 'switch-teams') onSwitchTeams();
    else if (action === 'settings') onSettings();
  });

  return mount;
}
