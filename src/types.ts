// ─── Core types ─────────────────────────────────────────────────────────────

export type Team = "pokemon" | "mlp";
export type Difficulty = "easy" | "medium" | "hard";
export type CharacterState = "idle" | "walking" | "celebrating" | "flinch";

export interface DifficultyThreshold {
  accuracy: number; // 0–100
  wpm: number;
}

export const DIFFICULTY_THRESHOLDS: Record<Difficulty, DifficultyThreshold> = {
  easy: { accuracy: 70, wpm: 15 },
  medium: { accuracy: 80, wpm: 25 },
  hard: { accuracy: 90, wpm: 35 },
};

export const DIFFICULTY_DISPLAY: Record<Team, Record<Difficulty, string>> = {
  pokemon: { easy: "Casual Trainer", medium: "Gym Leader", hard: "Elite Four" },
  mlp: { easy: "Friendship Student", medium: "Royal Guard", hard: "Alicorn" },
};

export const TEAM_DISPLAY: Record<Team, string> = {
  pokemon: "Pokémon",
  mlp: "My Little Pony",
};

// ─── Level stats ────────────────────────────────────────────────────────────

export interface LevelStats {
  wpm: number;
  accuracy: number; // 0–100
  timeSeconds: number;
  errors: number;
  totalKeystrokes: number;
  passed: boolean;
}

// ─── Persistence ────────────────────────────────────────────────────────────

export interface LevelRecord {
  bestWpm: number;
  bestAccuracy: number;
  completed: boolean;
}

export interface TeamProgress {
  levelRecords: Record<number, LevelRecord>;
  highestUnlockedLevel: number;
}

export interface PlayerProfile {
  activeTeam: Team;
  teamSelected: boolean; // true once the player has explicitly picked a team
  difficulty: Difficulty;
  teams: Record<Team, TeamProgress>;
}

// ─── Screen lifecycle ───────────────────────────────────────────────────────

/**
 * Every screen render function must return this. `app.ts` calls `cleanup()`
 * before mounting the next screen, so document-level listeners, intervals, and
 * timers can never outlive the screen that created them.
 */
export interface ScreenMount {
  el: HTMLElement;
  cleanup: () => void;
  defer: (cleanup: () => void) => () => void;
  listen: <TEvent extends Event = Event>(
    target: EventTarget,
    type: string,
    listener: (event: TEvent) => void,
    options?: boolean | AddEventListenerOptions,
  ) => () => void;
  timeout: (callback: () => void, ms: number) => () => void;
  interval: (callback: () => void, ms: number) => () => void;
  frame: (callback: FrameRequestCallback) => () => void;
}

// ─── Screen navigation ──────────────────────────────────────────────────────

export type AppScreen =
  | { id: "main-menu" }
  | { id: "team-select" }
  | { id: "level-select"; attempted?: number } // attempted = locked level the user tried to deep-link to
  | { id: "cutscene"; index: number }
  | { id: "finger-guide"; number: number } // pre-level finger explainer; no canonical URL, stays at /level/<N>
  | { id: "level"; number: number }
  | { id: "level-complete"; number: number; stats: LevelStats }
  | { id: "settings" };

// ─── Level & story definitions ───────────────────────────────────────────────

export interface LevelDefinition {
  number: number;
  arc: number; // 1–5
  isSpeedTest: boolean;
  isFinale: boolean; // arc finale or final review — triggers cumulative-review feedback
  availableLetters: string;
}

export interface CutsceneStory {
  title: string;
  paragraphs: string[];
  artClass: string; // CSS class for placeholder art
}
