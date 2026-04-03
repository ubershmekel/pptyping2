// ─── Core types ─────────────────────────────────────────────────────────────

export type Team = 'pokemon' | 'mlp';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type CharacterState = 'idle' | 'walking' | 'celebrating' | 'flinch';

export interface DifficultyThreshold {
  accuracy: number; // 0–100
  wpm: number;
}

export const DIFFICULTY_THRESHOLDS: Record<Difficulty, DifficultyThreshold> = {
  easy:   { accuracy: 70, wpm: 15 },
  medium: { accuracy: 80, wpm: 25 },
  hard:   { accuracy: 90, wpm: 35 },
};

export const DIFFICULTY_DISPLAY: Record<Team, Record<Difficulty, string>> = {
  pokemon: { easy: 'Casual Trainer', medium: 'Gym Leader', hard: 'Elite Four' },
  mlp:     { easy: 'Friendship Student', medium: 'Royal Guard', hard: 'Alicorn' },
};

export const TEAM_DISPLAY: Record<Team, string> = {
  pokemon: 'Pokémon',
  mlp: 'My Little Pony',
};

// ─── Level stats ────────────────────────────────────────────────────────────

export interface LevelStats {
  wpm: number;
  accuracy: number;        // 0–100
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

export interface PlayerProfile {
  team: Team;
  difficulty: Difficulty;
  levelRecords: Record<number, LevelRecord>;
  highestUnlockedLevel: number;
}

// ─── Screen navigation ──────────────────────────────────────────────────────

export type AppScreen =
  | { id: 'team-select' }
  | { id: 'cutscene'; index: number }
  | { id: 'level'; number: number }
  | { id: 'level-complete'; number: number; stats: LevelStats };

// ─── Level & story definitions ───────────────────────────────────────────────

export interface LevelDefinition {
  number: number;
  arc: number;             // 1–5
  isSpeedTest: boolean;
  availableLetters: string;
}

export interface CutsceneStory {
  title: string;
  paragraphs: string[];
  artClass: string;        // CSS class for placeholder art
}
