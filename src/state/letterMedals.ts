import type {
  LetterMedal,
  LetterProgress,
  LevelDefinition,
  LevelStats,
  TeamProgress,
} from "../types";

const MEDAL_RANK: Record<LetterMedal, number> = {
  none: 0,
  bronze: 1,
  silver: 2,
  gold: 3,
};

const MEDAL_BY_RANK: LetterMedal[] = ["none", "bronze", "silver", "gold"];

export interface LetterMedalResult {
  letter: string;
  hits: number;
  errors: number;
  wpm: number;
  accuracy: number;
  medal: LetterMedal;
  heartbreak: boolean;
  weakest: boolean;
}

export interface FinaleMedalEvaluation {
  heartbreak: boolean;
  results: LetterMedalResult[];
}

export function avgTimeToLetterWpm(avgMs: number): number {
  return avgMs > 0 ? Math.round(12000 / avgMs) : 0;
}

export function medalForWpm(wpm: number): LetterMedal {
  if (wpm >= 30) return "gold";
  if (wpm >= 20) return "silver";
  if (wpm >= 15) return "bronze";
  return "none";
}

export function betterMedal(a: LetterMedal, b: LetterMedal): LetterMedal {
  return MEDAL_RANK[b] > MEDAL_RANK[a] ? b : a;
}

export function medalRank(medal: LetterMedal): number {
  return MEDAL_RANK[medal];
}

export function evaluateFinaleMedals(
  level: LevelDefinition,
  stats: LevelStats,
): FinaleMedalEvaluation {
  if (!level.isFinale) return { heartbreak: false, results: [] };

  const letters = [...new Set(level.availableLetters.split(""))];
  const measured = buildLetterResults(letters, stats);

  const heartbreak = measured.some(
    (result) => result.wpm <= 10 || result.accuracy <= 70,
  );
  const lowestMedalRank = Math.min(
    ...measured.map((result) => MEDAL_RANK[result.medal]),
  );
  const slowestWpm = Math.min(...measured.map((result) => result.wpm));
  const lowestAccuracy = Math.min(...measured.map((result) => result.accuracy));

  return {
    heartbreak,
    results: measured.map((result) => ({
      ...result,
      medal: heartbreak ? "none" : result.medal,
      heartbreak,
      weakest:
        MEDAL_RANK[result.medal] === lowestMedalRank ||
        result.wpm === slowestWpm ||
        result.accuracy === lowestAccuracy,
    })),
  };
}

export function applyLetterProgress(
  progress: TeamProgress,
  stats: LevelStats,
  level?: LevelDefinition,
): TeamProgress {
  const letterProgress = { ...(progress.letterProgress ?? {}) };
  const typedLetters = [
    ...new Set([
      ...Object.keys(stats.charHits),
      ...Object.keys(stats.charErrors),
      ...Object.keys(stats.charAvgTimes),
    ]),
  ];
  if (typedLetters.length === 0) return progress;

  const medalEvaluation = level?.isFinale
    ? evaluateFinaleMedals(level, stats)
    : null;
  const medalByLetter = new Map(
    medalEvaluation?.results.map((result) => [result.letter, result.medal]) ??
      [],
  );

  for (const result of buildLetterResults(typedLetters, stats)) {
    const existing = letterProgress[result.letter] ?? emptyLetterProgress();
    const recentRuns = [
      ...(Array.isArray(existing.recentRuns) ? existing.recentRuns : []),
      { wpm: result.wpm, accuracy: result.accuracy },
    ].slice(-2);
    const recentWpm = Math.round(
      recentRuns.reduce((sum, run) => sum + run.wpm, 0) / recentRuns.length,
    );
    const recentAccuracy = Math.round(
      recentRuns.reduce((sum, run) => sum + run.accuracy, 0) /
        recentRuns.length,
    );

    letterProgress[result.letter] = {
      medal:
        medalEvaluation && !medalEvaluation.heartbreak
          ? betterMedal(
              existing.medal,
              medalByLetter.get(result.letter) ?? "none",
            )
          : existing.medal,
      totalHits: existing.totalHits + result.hits,
      recentWpm,
      recentAccuracy,
      recentRuns,
    };
  }

  return { ...progress, letterProgress };
}

function buildLetterResults(
  letters: string[],
  stats: LevelStats,
): Array<Omit<LetterMedalResult, "heartbreak" | "weakest">> {
  return letters.map((letter) => {
    const hits = stats.charHits[letter] ?? 0;
    const errors = stats.charErrors[letter] ?? 0;
    const attempts = hits + errors;
    const accuracy = attempts > 0 ? Math.round((hits / attempts) * 100) : 0;
    const wpm = avgTimeToLetterWpm(stats.charAvgTimes[letter] ?? 0);
    return {
      letter,
      hits,
      errors,
      wpm,
      accuracy,
      medal: medalForWpm(wpm),
    };
  });
}

function emptyLetterProgress(): LetterProgress {
  return {
    medal: MEDAL_BY_RANK[0],
    totalHits: 0,
    recentWpm: 0,
    recentAccuracy: 0,
    recentRuns: [],
  };
}
