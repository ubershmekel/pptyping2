import type { AppScreen, Difficulty, LevelStats, ScreenMount, Team } from './types';
import { loadProfile, saveProfile, applyLevelResult, selectTeam, switchTeam, setDifficulty } from './state/gameState';
import { cutsceneAfterLevel, levelAfterCutscene } from './data/levels';
import { renderTeamSelect }    from './screens/teamSelect';
import { renderLevelSelect }   from './screens/levelSelect';
import { renderCutscene }      from './screens/cutscene';
import { renderLevelScreen }   from './screens/levelScreen';
import { renderLevelComplete }  from './screens/levelComplete';
import { Router }              from './router';
import type { Route }          from './router';

export class App {
  private container: HTMLElement;
  private currentScreen: AppScreen = { id: 'main-menu' };
  private currentMount: ScreenMount | null = null;
  private profile = loadProfile();
  private router: Router;
  private enterAnimationFrame: number | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.router = new Router(this.handleRoute);
  }

  start(): void {
    // Read the URL the browser is actually at and dispatch it.
    // fromPopState=true so handleRoute doesn't push another history entry.
    const initial = this.router.currentRoute();
    this.handleRoute(initial, true);
  }

  // ─── Router callback ────────────────────────────────────────────────────────

  /**
   * Central dispatch: apply guards, resolve the AppScreen for this Route, then
   * render it.  When `fromPopState` is true the URL is already correct and we
   * must not call pushState again.
   */
  private handleRoute = (route: Route, fromPopState: boolean): void => {
    // ── Guard: unknown URL → main menu ───────────────────────────────────────
    if (route.screen === 'not-found') {
      if (!fromPopState) this.router.replace({ screen: 'main-menu' });
      this.showScreen({ id: 'main-menu' });
      return;
    }

    // ── Guard: no team selected yet → team-select ────────────────────────────
    const needsTeam = !this.profile.teamSelected;
    const gameplayScreens = new Set(['level', 'cutscene', 'level-select']);
    if (needsTeam && gameplayScreens.has(route.screen)) {
      if (!fromPopState) {
        this.router.replace({ screen: 'team-select' });
      } else {
        window.history.replaceState({}, '', '/team-select');
      }
      this.showScreen({ id: 'team-select' });
      return;
    }

    // ── Guard: locked level → level-select with attempted indicator ──────────
    if (route.screen === 'level') {
      if (route.number > this.profile.highestUnlockedLevel) {
        const redirect = { screen: 'level-select' as const };
        if (!fromPopState) {
          this.router.replace(redirect);
        } else {
          window.history.replaceState({}, '', '/level-select');
        }
        this.showScreen({ id: 'level-select', attempted: route.number });
        return;
      }
    }

    // ── Map Route → AppScreen ────────────────────────────────────────────────
    let screen: AppScreen;
    switch (route.screen) {
      case 'main-menu':    screen = { id: 'main-menu' };                               break;
      case 'team-select':  screen = { id: 'team-select' };                             break;
      case 'level-select': screen = { id: 'level-select' };                            break;
      case 'settings':     screen = { id: 'settings' };                                break;
      case 'level':        screen = { id: 'level', number: route.number };             break;
      case 'cutscene':     screen = { id: 'cutscene', index: route.index };            break;
    }

    this.showScreen(screen);
  };

  // ─── Navigation helpers ─────────────────────────────────────────────────────

  /** Navigate to an AppScreen that has a canonical URL (pushes history). */
  private navigate(screen: AppScreen): void {
    switch (screen.id) {
      case 'main-menu':
        this.router.go({ screen: 'main-menu' });
        break;
      case 'team-select':
        this.router.go({ screen: 'team-select' });
        break;
      case 'level-select':
        this.router.go({ screen: 'level-select' });
        break;
      case 'settings':
        this.router.go({ screen: 'settings' });
        break;
      case 'level':
        this.router.go({ screen: 'level', number: screen.number });
        break;
      case 'cutscene':
        this.router.go({ screen: 'cutscene', index: screen.index });
        break;
      case 'level-complete':
        // level-complete has no URL; keep the URL at /level/<N> and render locally.
        this.router.replace({ screen: 'level', number: screen.number });
        this.showScreen(screen);
        break;
    }
  }

  // ─── Rendering ──────────────────────────────────────────────────────────────

  /** Tear down current screen and mount the new one. */
  private showScreen(screen: AppScreen): void {
    if (this.enterAnimationFrame !== null) {
      cancelAnimationFrame(this.enterAnimationFrame);
      this.enterAnimationFrame = null;
    }

    if (this.currentMount !== null) {
      this.currentMount.cleanup();
      this.currentMount = null;
    }

    this.currentScreen = screen;
    this.applyBodyClasses();

    const mount = this.buildScreenMount(screen);
    mount.el.classList.add('screen-enter');
    this.currentMount = mount;
    this.container.replaceChildren(mount.el);

    this.enterAnimationFrame = window.requestAnimationFrame(() => {
      if (this.currentMount === mount) {
        console.log(`[transition] fade in → ${screen.id}`);
        mount.el.classList.remove('screen-enter');
      }
      this.enterAnimationFrame = null;
    });
  }

  /** Instantiate the mount object for the given screen. */
  private buildScreenMount(screen: AppScreen): ScreenMount {
    if (screen.id === 'main-menu') {
      return this.renderMainMenu();

    } else if (screen.id === 'team-select') {
      const hasSave = this.profile.teamSelected &&
        (this.profile.highestUnlockedLevel > 1 || this.profile.levelRecords[1]?.completed);
      return renderTeamSelect(
        (team) => this.onTeamSelected(team),
        hasSave ? this.profile.team : undefined,
      );

    } else if (screen.id === 'level-select') {
      return renderLevelSelect(
        this.profile,
        (n)   => this.navigate({ id: 'level', number: n }),
        (idx) => this.navigate({ id: 'cutscene', index: idx }),
        ()    => this.navigate({ id: 'main-menu' }),
        screen.attempted,
      );

    } else if (screen.id === 'cutscene') {
      return renderCutscene(
        this.profile.team,
        screen.index,
        () => this.onCutsceneDone(screen.index),
      );

    } else if (screen.id === 'level') {
      return renderLevelScreen(
        this.profile.team,
        screen.number,
        this.profile.difficulty,
        (stats) => this.onLevelComplete(screen.number, stats),
        () => this.navigate({ id: 'level', number: screen.number }),
        () => this.navigate({ id: 'level-select', attempted: screen.number }),
        () => this.navigate({ id: 'main-menu' }),
      );

    } else if (screen.id === 'level-complete') {
      return renderLevelComplete(
        this.profile.team,
        screen.number,
        screen.stats,
        this.profile.difficulty,
        () => this.onLevelCompleteNext(screen.number, screen.stats),
        () => this.navigate({ id: 'level', number: screen.number }),
        () => this.navigate({ id: 'level-select', attempted: screen.number }),
        (d) => this.onDifficultyChange(d),
      );

    } else if (screen.id === 'settings') {
      return this.renderSettings();
    }

    const el = document.createElement('div');
    return { el, cleanup: () => {} };
  }

  // ─── Stub screen renderers (placeholders until dedicated screen files exist) ──

  private renderMainMenu(): ScreenMount {
    const el = document.createElement('div');
    el.className = 'screen main-menu-screen';

    const hasSave = this.profile.teamSelected &&
      (this.profile.highestUnlockedLevel > 1 || this.profile.levelRecords[1]?.completed);

    el.innerHTML = `
      <div class="main-menu-content">
        <h1 class="game-title">PPTyping</h1>
        <p class="game-subtitle">Type Your Way to Victory!</p>
        <nav class="main-menu-nav">
          ${hasSave
            ? `<button class="btn btn-primary" data-action="continue">Continue</button>`
            : ''}
          <button class="btn ${hasSave ? 'btn-secondary' : 'btn-primary'}" data-action="new-game">
            ${hasSave ? 'New Game' : 'Start Game'}
          </button>
          <button class="btn btn-secondary" data-action="settings">Settings</button>
        </nav>
      </div>
    `;

    const clickHandler = (e: Event) => {
      const btn = (e.target as HTMLElement).closest('[data-action]') as HTMLElement | null;
      if (!btn) return;
      const action = btn.dataset['action'];
      if (action === 'continue') {
        // Resume at highest unlocked level
        this.navigate({ id: 'level', number: this.profile.highestUnlockedLevel });
      } else if (action === 'new-game') {
        this.navigate({ id: 'team-select' });
      } else if (action === 'settings') {
        this.navigate({ id: 'settings' });
      }
    };
    el.addEventListener('click', clickHandler);

    return {
      el,
      cleanup: () => {
        el.removeEventListener('click', clickHandler);
      },
    };
  }

  private renderSettings(): ScreenMount {
    const el = document.createElement('div');
    el.className = 'screen settings-screen';

    el.innerHTML = `
      <div class="screen-header">
        <button class="btn btn-ghost back-btn" data-action="back">← Back</button>
        <h2>Settings</h2>
      </div>
      <div class="settings-content">
        <p class="settings-placeholder">Settings screen — coming soon.</p>
      </div>
    `;

    const clickHandler = (e: Event) => {
      const btn = (e.target as HTMLElement).closest('[data-action]') as HTMLElement | null;
      if (btn?.dataset['action'] === 'back') {
        this.navigate({ id: 'main-menu' });
      }
    };
    el.addEventListener('click', clickHandler);

    return {
      el,
      cleanup: () => {
        el.removeEventListener('click', clickHandler);
      },
    };
  }

  // ─── Event handlers ─────────────────────────────────────────────────────────

  private onTeamSelected(team: Team): void {
    this.profile = selectTeam(this.profile, team);
    // If continuing existing game, jump to highest unlocked level
    if (this.profile.highestUnlockedLevel > 1) {
      this.navigate({ id: 'level', number: this.profile.highestUnlockedLevel });
    } else {
      this.navigate({ id: 'cutscene', index: 0 });
    }
  }

  private onCutsceneDone(index: number): void {
    const nextLevel = levelAfterCutscene(index);
    if (nextLevel !== null) {
      this.navigate({ id: 'level', number: nextLevel });
    } else {
      // Finale — back to main menu
      this.navigate({ id: 'main-menu' });
    }
  }

  private onLevelComplete(levelNumber: number, stats: LevelStats): void {
    this.profile = applyLevelResult(this.profile, levelNumber, stats);
    this.navigate({ id: 'level-complete', number: levelNumber, stats });
  }

  private onLevelCompleteNext(levelNumber: number, stats: LevelStats): void {
    const cutscene = cutsceneAfterLevel(levelNumber);
    if (cutscene !== null) {
      this.navigate({ id: 'cutscene', index: cutscene });
    } else if (levelNumber < 14) {
      this.navigate({ id: 'level', number: levelNumber + 1 });
    } else {
      this.navigate({ id: 'cutscene', index: 5 }); // finale
    }
  }

  private onDifficultyChange(difficulty: Difficulty): void {
    this.profile = setDifficulty(this.profile, difficulty);
    saveProfile(this.profile);
    // Refresh the level-complete screen to update thresholds
    if (this.currentScreen.id === 'level-complete') {
      this.showScreen({ ...this.currentScreen });
    }
  }

  // ─── Body classes for theming ────────────────────────────────────────────────

  private applyBodyClasses(): void {
    document.body.classList.remove('team-pokemon', 'team-mlp');
    document.body.classList.add(`team-${this.profile.team}`);

    document.body.classList.remove(
      'env-digital-grove', 'env-thunder-shrine', 'env-crystal-cavern',
      'env-stardrift-coast', 'env-apex-summit',
    );
    // Level-specific env class is applied by the level screen itself
  }
}
