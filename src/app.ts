import type { AppScreen, Difficulty, LevelStats, Team } from './types';
import { loadProfile, saveProfile, applyLevelResult, switchTeam, setDifficulty } from './state/gameState';
import { cutsceneAfterLevel, levelAfterCutscene } from './data/levels';
import { renderTeamSelect }   from './screens/teamSelect';
import { renderCutscene }     from './screens/cutscene';
import { renderLevelScreen }  from './screens/levelScreen';
import { renderLevelComplete } from './screens/levelComplete';

export class App {
  private container: HTMLElement;
  private currentScreen: AppScreen = { id: 'team-select' };
  private profile = loadProfile();
  private levelCleanup: (() => void) | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    // Apply team class to body if already chosen
    this.applyBodyClasses();
  }

  start(): void {
    // If we have a saved game, go to team-select with resume option
    this.navigate({ id: 'team-select' });
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  private navigate(screen: AppScreen): void {
    // Cleanup previous level if needed
    if (this.levelCleanup) {
      this.levelCleanup();
      this.levelCleanup = null;
    }

    this.currentScreen = screen;
    this.applyBodyClasses();
    this.render();
  }

  private render(): void {
    // Fade out old content
    const old = this.container.firstElementChild as HTMLElement | null;
    if (old) {
      old.classList.add('screen-exit');
      setTimeout(() => { if (old.parentNode) old.remove(); }, 300);
    }

    const screen = this.currentScreen;
    let el: HTMLElement;

    if (screen.id === 'team-select') {
      const hasSave = this.profile.highestUnlockedLevel > 1 || this.profile.levelRecords[1]?.completed;
      el = renderTeamSelect(
        (team) => this.onTeamSelected(team),
        hasSave ? this.profile.team : undefined,
      );

    } else if (screen.id === 'cutscene') {
      el = renderCutscene(
        this.profile.team,
        screen.index,
        () => this.onCutsceneDone(screen.index),
      );

    } else if (screen.id === 'level') {
      const { el: lvEl, cleanup } = renderLevelScreen(
        this.profile.team,
        screen.number,
        this.profile.difficulty,
        (stats) => this.onLevelComplete(screen.number, stats),
      );
      el = lvEl;
      this.levelCleanup = cleanup;

    } else if (screen.id === 'level-complete') {
      el = renderLevelComplete(
        this.profile.team,
        screen.number,
        screen.stats,
        this.profile.difficulty,
        () => this.onLevelCompleteNext(screen.number, screen.stats),
        () => this.navigate({ id: 'level', number: screen.number }),
        (d) => this.onDifficultyChange(d),
      );

    } else {
      el = document.createElement('div');
    }

    // Slight delay so old screen can fade
    el.classList.add('screen-enter');
    setTimeout(() => {
      this.container.appendChild(el);
      requestAnimationFrame(() => el.classList.remove('screen-enter'));
    }, old ? 250 : 0);
  }

  // ─── Event handlers ────────────────────────────────────────────────────────

  private onTeamSelected(team: Team): void {
    if (team !== this.profile.team) {
      this.profile = switchTeam(this.profile, team);
    }
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
      // Finale — back to team select
      this.navigate({ id: 'team-select' });
    }
  }

  private onLevelComplete(levelNumber: number, stats: LevelStats): void {
    this.profile = applyLevelResult(this.profile, levelNumber, stats);
    this.navigate({ id: 'level-complete', number: levelNumber, stats });
  }

  private onLevelCompleteNext(levelNumber: number, stats: LevelStats): void {
    if (!stats.passed) {
      // Skipping — just advance without marking complete
    }
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
      this.navigate({ ...this.currentScreen });
    }
  }

  // ─── Body classes for theming ──────────────────────────────────────────────

  private applyBodyClasses(): void {
    document.body.classList.remove('team-pokemon', 'team-mlp');
    document.body.classList.add(`team-${this.profile.team}`);

    // Apply env class based on current screen
    document.body.classList.remove(
      'env-digital-grove', 'env-thunder-shrine', 'env-crystal-cavern',
      'env-stardrift-coast', 'env-apex-summit',
    );
    if (this.currentScreen.id === 'level') {
      // Will be set by the level screen itself via its own class
    }
  }
}
