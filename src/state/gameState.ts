import type { Difficulty, LevelRecord, LevelStats, PlayerProfile, Team, TeamProgress } from '../types';
import { DIFFICULTY_THRESHOLDS } from '../types';
import { MAX_LEVEL } from '../data/levels';

const STORAGE_KEY = 'pptyping_profile';

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_TEAM_PROGRESS: TeamProgress = {
  levelRecords: { 1: { bestWpm: 0, bestAccuracy: 0, completed: false } },
  highestUnlockedLevel: 1,
};

export const DEFAULT_PROFILE: PlayerProfile = {
  activeTeam: 'pokemon',
  teamSelected: false,
  difficulty: 'easy',
  teams: {
    pokemon: { levelRecords: { 1: { bestWpm: 0, bestAccuracy: 0, completed: false } }, highestUnlockedLevel: 1 },
    mlp:     { levelRecords: { 1: { bestWpm: 0, bestAccuracy: 0, completed: false } }, highestUnlockedLevel: 1 },
  },
};

// ─── Load / Save ─────────────────────────────────────────────────────────────

export function loadProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE, teams: { ...DEFAULT_PROFILE.teams } };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsed = JSON.parse(raw) as any;

    // Migration: old saves stored levelRecords/highestUnlockedLevel at the top level.
    if (parsed.levelRecords !== undefined || parsed.highestUnlockedLevel !== undefined) {
      const oldTeam: Team = parsed.team ?? 'pokemon';
      const otherTeam: Team = oldTeam === 'pokemon' ? 'mlp' : 'pokemon';
      const migrated: PlayerProfile = {
        activeTeam: oldTeam,
        teamSelected: parsed.teamSelected ?? false,
        difficulty: parsed.difficulty ?? 'easy',
        teams: {
          [oldTeam]: {
            levelRecords: parsed.levelRecords ?? { 1: { bestWpm: 0, bestAccuracy: 0, completed: false } },
            highestUnlockedLevel: parsed.highestUnlockedLevel ?? 1,
          },
          [otherTeam]: { ...DEFAULT_TEAM_PROGRESS },
        } as Record<Team, TeamProgress>,
      };
      saveProfile(migrated);
      return migrated;
    }

    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      teams: {
        pokemon: { ...DEFAULT_TEAM_PROGRESS, ...(parsed.teams?.pokemon ?? {}) },
        mlp:     { ...DEFAULT_TEAM_PROGRESS, ...(parsed.teams?.mlp ?? {}) },
      },
    };
  } catch {
    return { ...DEFAULT_PROFILE, teams: { ...DEFAULT_PROFILE.teams } };
  }
}

export function saveProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // storage unavailable — play on
  }
}

export function resetProfile(): PlayerProfile {
  const fresh: PlayerProfile = {
    ...DEFAULT_PROFILE,
    teams: {
      pokemon: { levelRecords: { 1: { bestWpm: 0, bestAccuracy: 0, completed: false } }, highestUnlockedLevel: 1 },
      mlp:     { levelRecords: { 1: { bestWpm: 0, bestAccuracy: 0, completed: false } }, highestUnlockedLevel: 1 },
    },
  };
  saveProfile(fresh);
  return fresh;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns the TeamProgress for whichever team is currently active. */
export function activeProgress(profile: PlayerProfile): TeamProgress {
  return profile.teams[profile.activeTeam];
}

/** Returns true if the player passed the level at the given difficulty. */
export function didPass(stats: LevelStats, difficulty: Difficulty): boolean {
  const threshold = DIFFICULTY_THRESHOLDS[difficulty];
  return stats.accuracy >= threshold.accuracy && stats.wpm >= threshold.wpm;
}

/** Update a profile after a level is completed (may unlock the next level). */
export function applyLevelResult(
  profile: PlayerProfile,
  levelNumber: number,
  stats: LevelStats,
): PlayerProfile {
  const passed = didPass(stats, profile.difficulty);
  const progress = profile.teams[profile.activeTeam];
  const existing: LevelRecord = progress.levelRecords[levelNumber] ?? {
    bestWpm: 0, bestAccuracy: 0, completed: false,
  };

  const updated: LevelRecord = {
    bestWpm:      Math.max(existing.bestWpm, stats.wpm),
    bestAccuracy: Math.max(existing.bestAccuracy, stats.accuracy),
    completed:    existing.completed || passed,
  };

  const newRecords = { ...progress.levelRecords, [levelNumber]: updated };
  let highestUnlocked = progress.highestUnlockedLevel;

  if (passed && levelNumber === highestUnlocked && levelNumber < MAX_LEVEL) {
    highestUnlocked = levelNumber + 1;
    // Ensure the next level record exists
    if (!newRecords[highestUnlocked]) {
      newRecords[highestUnlocked] = { bestWpm: 0, bestAccuracy: 0, completed: false };
    }
  }

  const next: PlayerProfile = {
    ...profile,
    teams: {
      ...profile.teams,
      [profile.activeTeam]: { levelRecords: newRecords, highestUnlockedLevel: highestUnlocked },
    },
  };
  saveProfile(next);
  return next;
}

/** Switch active team. Progress for both teams is always preserved. */
export function selectTeam(profile: PlayerProfile, team: Team): PlayerProfile {
  const next: PlayerProfile = { ...profile, activeTeam: team, teamSelected: true };
  saveProfile(next);
  return next;
}

/** Change difficulty (doesn't reset progress). */
export function setDifficulty(profile: PlayerProfile, difficulty: Difficulty): PlayerProfile {
  const next: PlayerProfile = { ...profile, difficulty };
  saveProfile(next);
  return next;
}

// ─── Export / Import (JSON copy-paste) ───────────────────────────────────────

export function exportProfile(profile: PlayerProfile): string {
  return JSON.stringify(profile, null, 2);
}

export function importProfile(json: string): PlayerProfile | null {
  try {
    const parsed = JSON.parse(json) as PlayerProfile;
    if (!parsed.activeTeam || !parsed.difficulty) return null;
    saveProfile(parsed);
    return parsed;
  } catch {
    return null;
  }
}
