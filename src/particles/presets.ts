export type BurstType = "correct" | "error" | "combo" | "victory";

export type BurstConfig = {
  count: number;
  speed: number; // px per frame at 60 fps
  life: number; // ms
  size: number; // px radius
  gravity: number; // px per frame^2 downward
};

export const BURST_CONFIGS: Record<BurstType, BurstConfig> = {
  correct: { count: 7, speed: 2.8, life: 340, size: 3, gravity: 0.06 },
  error: { count: 5, speed: 2.0, life: 220, size: 3, gravity: 0.04 },
  combo: { count: 22, speed: 4.5, life: 520, size: 4, gravity: 0.1 },
  victory: { count: 60, speed: 5.0, life: 1400, size: 5, gravity: 0.07 },
};

export type TeamColors = {
  primary: string;
  secondary: string;
};

export const TEAM_COLORS: Record<string, TeamColors> = {
  pokemon: { primary: "#ffd700", secondary: "#e3350d" },
  mlp: { primary: "#ff6eb4", secondary: "#9c27b0" },
};

export const BURST_COLORS: Record<BurstType, (team: TeamColors) => string[]> = {
  correct: (t) => [t.primary, t.primary, "#ffffff"],
  error: () => ["#ff4444", "#ff8888", "#cc2222"],
  combo: (t) => [t.primary, t.secondary, t.primary, "#ffffff"],
  victory: (t) => [t.primary, t.secondary, "#ffffff", "#ffd700", "#88eeff"],
};
