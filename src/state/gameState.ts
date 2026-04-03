import type { Difficulty, LevelRecord, LevelStats, PlayerProfile, Team } from '../types';
import { DIFFICULTY_THRESHOLDS } from '../types';

const STORAGE_KEY = 'pptyping_profile';

// ─── Defaults ────────────────────────────────────────────────────────────────

export const DEFAULT_PROFILE: PlayerProfile = {
  team: 'pokemon',
  difficulty: 'easy',
  levelRecords: {
    1: { bestWpm: 0, bestAccuracy: 0, completed: false },
  },
  highestUnlockedLevel: 1,
};

// ─── Load / Save ─────────────────────────────────────────────────────────────

export function loadProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    const parsed = JSON.parse(raw) as PlayerProfile;
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch {
    return { ...DEFAULT_PROFILE };
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
  const fresh = { ...DEFAULT_PROFILE };
  saveProfile(fresh);
  return fresh;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
  const existing: LevelRecord = profile.levelRecords[levelNumber] ?? {
    bestWpm: 0, bestAccuracy: 0, completed: false,
  };

  const updated: LevelRecord = {
    bestWpm:      Math.max(existing.bestWpm, stats.wpm),
    bestAccuracy: Math.max(existing.bestAccuracy, stats.accuracy),
    completed:    existing.completed || passed,
  };

  const newRecords = { ...profile.levelRecords, [levelNumber]: updated };
  let highestUnlocked = profile.highestUnlockedLevel;

  if (passed && levelNumber === highestUnlocked && levelNumber < 14) {
    highestUnlocked = levelNumber + 1;
    // Ensure the next level record exists
    if (!newRecords[highestUnlocked]) {
      newRecords[highestUnlocked] = { bestWpm: 0, bestAccuracy: 0, completed: false };
    }
  }

  const next: PlayerProfile = {
    ...profile,
    levelRecords: newRecords,
    highestUnlockedLevel: highestUnlocked,
  };
  saveProfile(next);
  return next;
}

/** Change team (resets progress). */
export function switchTeam(profile: PlayerProfile, team: Team): PlayerProfile {
  const next: PlayerProfile = { ...DEFAULT_PROFILE, team, difficulty: profile.difficulty };
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
    if (!parsed.team || !parsed.difficulty) return null;
    saveProfile(parsed);
    return parsed;
  } catch {
    return null;
  }
}
