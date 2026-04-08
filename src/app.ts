import type {
  AppScreen,
  Difficulty,
  LevelStats,
  ScreenMount,
  Team,
} from "./types";
import {
  loadProfile,
  saveProfile,
  applyLevelResult,
  activeProgress,
  selectTeam,
  setDifficulty,
} from "./state/gameState";
import {
  cutsceneAfterLevel,
  getLevelDef,
  levelAfterCutscene,
  MAX_LEVEL,
} from "./data/levels";
import { LEVEL_LETTERS } from "./data/wordLists";
import { renderMainMenu } from "./screens/mainMenu";
import { renderTeamSelect } from "./screens/teamSelect";
import { renderLevelSelect } from "./screens/levelSelect";
import { renderCutscene } from "./screens/cutscene";
import { renderSpeedTestIntro } from "./screens/speedTestIntro";
import { renderFingerGuide } from "./screens/fingerGuide";
import { renderLetterIntro } from "./screens/letterIntro";
import { renderFjIntro } from "./screens/fjIntro";
import { renderLevelScreen } from "./screens/levelScreen";
import { renderLevelComplete } from "./screens/levelComplete";
import { renderSettings } from "./screens/settings";
import { createScreenMount } from "./screenMount";
import { Router } from "./router";
import type { Route } from "./router";

type LetterIntroScreen = Extract<AppScreen, { id: "letter-intro" }>;

// Returns the new letters introduced in this level for the letter-intro drill.
// For the first learn level (level 2), the previous level is the speed test —
// treat it as if nothing was learned yet (prev = "").
function getLetterIntroLetters(levelNumber: number): string[] {
  const levelDef = getLevelDef(levelNumber);
  if (levelDef.isFinale || levelDef.isSpeedTest) return [];
  const prevDef = levelNumber > 1 ? getLevelDef(levelNumber - 1) : null;
  const prevLetters =
    !prevDef || prevDef.isSpeedTest ? "" : (LEVEL_LETTERS[levelNumber - 1] ?? "");
  const prevSet = new Set(prevLetters.split("").filter(Boolean));
  return levelDef.availableLetters.split("").filter((l) => !prevSet.has(l));
}

export class App {
  private container: HTMLElement;
  private currentScreen: AppScreen = { id: "main-menu" };
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
    if (route.screen === "not-found") {
      if (!fromPopState) this.router.replace({ screen: "main-menu" });
      this.showScreen({ id: "main-menu" });
      return;
    }

    // ── Guard: no team selected yet → team-select ────────────────────────────
    const needsTeam = !this.profile.teamSelected;
    const gameplayScreens = new Set(["level", "cutscene", "level-select"]);
    if (needsTeam && gameplayScreens.has(route.screen)) {
      if (!fromPopState) {
        this.router.replace({ screen: "team-select" });
      } else {
        window.history.replaceState({}, "", "/team-select");
      }
      this.showScreen({ id: "team-select" });
      return;
    }

    // ── Guard: locked level → level-select with attempted indicator ──────────
    if (route.screen === "level") {
      if (route.number > activeProgress(this.profile).highestUnlockedLevel) {
        const redirect = { screen: "level-select" as const };
        if (!fromPopState) {
          this.router.replace(redirect);
        } else {
          window.history.replaceState({}, "", "/level-select");
        }
        this.showScreen({ id: "level-select", attempted: route.number });
        return;
      }
    }

    // ── Map Route → AppScreen ────────────────────────────────────────────────
    let screen: AppScreen;
    switch (route.screen) {
      case "main-menu":
        screen = { id: "main-menu" };
        break;
      case "team-select":
        screen = { id: "team-select" };
        break;
      case "level-select":
        screen = { id: "level-select" };
        break;
      case "settings":
        screen = { id: "settings" };
        break;
      case "level":
        screen =
          route.number === 1
            ? { id: "speed-test-intro", number: route.number }
            : { id: "finger-guide", number: route.number };
        break;
      case "cutscene":
        screen = { id: "cutscene", index: route.index };
        break;
    }

    this.showScreen(screen);
  };

  // ─── Navigation helpers ─────────────────────────────────────────────────────

  /** Navigate to an AppScreen that has a canonical URL (pushes history). */
  private navigate(screen: AppScreen): void {
    switch (screen.id) {
      case "main-menu":
        this.router.go({ screen: "main-menu" });
        break;
      case "team-select":
        this.router.go({ screen: "team-select" });
        break;
      case "level-select":
        this.router.go({ screen: "level-select" });
        break;
      case "settings":
        this.router.go({ screen: "settings" });
        break;
      case "level":
        this.router.go({ screen: "level", number: screen.number });
        break;
      case "cutscene":
        this.router.go({ screen: "cutscene", index: screen.index });
        break;
      case "level-complete":
        // level-complete has no URL; keep the URL at /level/<N> and render locally.
        this.router.replace({ screen: "level", number: screen.number });
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
    mount.el.classList.add("screen-enter");
    this.currentMount = mount;
    this.container.replaceChildren(mount.el);

    this.enterAnimationFrame = window.requestAnimationFrame(() => {
      if (this.currentMount === mount) {
        console.log(`[transition] fade in → ${screen.id}`);
        mount.el.classList.remove("screen-enter");
      }
      this.enterAnimationFrame = null;
    });
  }

  /** Instantiate the mount object for the given screen. */
  private buildScreenMount(screen: AppScreen): ScreenMount {
    if (screen.id === "main-menu") {
      return renderMainMenu(
        this.profile,
        () => this.navigate({ id: "level-select" }),
        () => this.navigate({ id: "team-select" }),
        () => this.navigate({ id: "settings" }),
      );
    } else if (screen.id === "team-select") {
      const hasSave =
        this.profile.teamSelected &&
        (activeProgress(this.profile).highestUnlockedLevel > 1 ||
          activeProgress(this.profile).levelRecords[1]?.completed);
      return renderTeamSelect(
        (team) => this.onTeamSelected(team),
        hasSave ? this.profile.activeTeam : undefined,
      );
    } else if (screen.id === "level-select") {
      return renderLevelSelect(
        this.profile,
        (n) => this.navigate({ id: "level", number: n }),
        (idx) => this.navigate({ id: "cutscene", index: idx }),
        () => this.navigate({ id: "main-menu" }),
        screen.attempted,
      );
    } else if (screen.id === "cutscene") {
      return renderCutscene(this.profile.activeTeam, screen.index, () =>
        this.onCutsceneDone(screen.index),
      );
    } else if (screen.id === "speed-test-intro") {
      return renderSpeedTestIntro(
        this.profile.activeTeam,
        screen.number,
        () => this.showScreen({ id: "level", number: screen.number }),
        () => this.navigate({ id: "level-select" }),
      );
    } else if (screen.id === "letter-intro") {
      const letters = getLetterIntroLetters(screen.number);
      const letter = letters[screen.letterIndex] ?? letters[0] ?? "f";
      const nextScreen = this.getNextLetterIntroScreen(screen, letters.length);
      return renderLetterIntro(
        this.profile.activeTeam,
        screen.number,
        letter,
        () => this.showScreen(nextScreen),
      );
    } else if (screen.id === "fj-intro") {
      return renderFjIntro(this.profile.activeTeam, () =>
        this.showScreen({
          id: "finger-guide",
          number: screen.number,
          skipLetterIntro: true,
        }),
      );
    } else if (screen.id === "finger-guide") {
      // Route through letter-intro screens first for levels that introduce new letters
      if (!screen.skipLetterIntro) {
        const letters = getLetterIntroLetters(screen.number);
        if (letters.length > 0) {
          return this.buildScreenMount({
            id: "letter-intro",
            number: screen.number,
            letterIndex: 0,
          });
        }
      }
      return renderFingerGuide(
        this.profile.activeTeam,
        screen.number,
        () => this.showScreen({ id: "level", number: screen.number }),
        () => this.navigate({ id: "level-select" }),
      );
    } else if (screen.id === "level") {
      return renderLevelScreen(
        this.profile.activeTeam,
        screen.number,
        this.profile.difficulty,
        (stats) => this.onLevelComplete(screen.number, stats),
        () => this.navigate({ id: "level", number: screen.number }),
        () => this.navigate({ id: "level-select", attempted: screen.number }),
        () => this.navigate({ id: "main-menu" }),
      );
    } else if (screen.id === "level-complete") {
      return renderLevelComplete(
        this.profile.activeTeam,
        screen.number,
        screen.stats,
        this.profile.difficulty,
        () => this.onLevelCompleteNext(screen.number, screen.stats),
        () => this.navigate({ id: "level", number: screen.number }),
        () => this.navigate({ id: "level-select", attempted: screen.number }),
        (d) => this.onDifficultyChange(d),
        this.profile.speedTestHistory,
      );
    } else if (screen.id === "settings") {
      return renderSettings(() => this.navigate({ id: "main-menu" }));
    }

    return createScreenMount(document.createElement("div"));
  }

  // ─── Event handlers ─────────────────────────────────────────────────────────

  private getNextLetterIntroScreen(
    screen: LetterIntroScreen,
    letterCount: number,
  ): AppScreen {
    const nextLetterIndex = screen.letterIndex + 1;
    if (nextLetterIndex < letterCount) {
      return {
        id: "letter-intro",
        number: screen.number,
        letterIndex: nextLetterIndex,
      };
    }

    if (screen.number === 3) {
      return { id: "fj-intro", number: screen.number };
    }

    return {
      id: "finger-guide",
      number: screen.number,
      skipLetterIntro: true,
    };
  }

  private onTeamSelected(team: Team): void {
    this.profile = selectTeam(this.profile, team);
    // If this team already has progress, go to level select; otherwise start from the beginning.
    if (activeProgress(this.profile).highestUnlockedLevel > 1) {
      this.navigate({ id: "level-select" });
    } else {
      this.navigate({ id: "cutscene", index: 0 });
    }
  }

  private onCutsceneDone(index: number): void {
    const nextLevel = levelAfterCutscene(index);
    if (nextLevel !== null) {
      this.navigate({ id: "level", number: nextLevel });
    } else {
      // Finale — back to main menu
      this.navigate({ id: "main-menu" });
    }
  }

  private onLevelComplete(levelNumber: number, stats: LevelStats): void {
    this.profile = applyLevelResult(this.profile, levelNumber, stats);
    this.navigate({ id: "level-complete", number: levelNumber, stats });
  }

  private onLevelCompleteNext(levelNumber: number, stats: LevelStats): void {
    const cutscene = cutsceneAfterLevel(levelNumber);
    if (cutscene !== null) {
      this.navigate({ id: "cutscene", index: cutscene });
    } else if (levelNumber < MAX_LEVEL) {
      this.navigate({ id: "level", number: levelNumber + 1 });
    } else {
      this.navigate({ id: "cutscene", index: 5 }); // finale
    }
  }

  private onDifficultyChange(difficulty: Difficulty): void {
    this.profile = setDifficulty(this.profile, difficulty);
    saveProfile(this.profile);
    // Refresh the level-complete screen to update thresholds
    if (this.currentScreen.id === "level-complete") {
      this.showScreen({ ...this.currentScreen });
    }
  }

  // ─── Body classes for theming ────────────────────────────────────────────────

  private applyBodyClasses(): void {
    document.body.classList.remove("team-pokemon", "team-mlp");
    document.body.classList.add(`team-${this.profile.activeTeam}`);

    document.body.classList.remove(
      "env-digital-grove",
      "env-thunder-shrine",
      "env-crystal-cavern",
      "env-stardrift-coast",
      "env-apex-summit",
    );
    // Level-specific env class is applied by the level screen itself
  }
}
