export type BurstType =
  // level feedback
  | "correct"
  | "error"
  | "combo"
  | "victory"
  // cutscene one-time events
  | "petal"
  | "golden"
  | "electric"
  | "ripple"
  | "lightning"
  | "glass"
  | "water"
  | "confetti"
  | "party";

export type BurstConfig = {
  count: number;
  speed: number; // px per frame at 60 fps
  life: number; // ms
  size: number; // px radius
  gravity: number; // px per frame^2 downward
};

export const BURST_CONFIGS: Record<BurstType, BurstConfig> = {
  // level feedback
  correct: { count: 7, speed: 2.8, life: 340, size: 3, gravity: 0.06 },
  error: { count: 5, speed: 2.0, life: 220, size: 3, gravity: 0.04 },
  combo: { count: 22, speed: 4.5, life: 520, size: 4, gravity: 0.1 },
  victory: { count: 60, speed: 5.0, life: 1400, size: 5, gravity: 0.07 },
  // cutscene
  petal: { count: 22, speed: 1.8, life: 1600, size: 5, gravity: 0.01 },
  golden: { count: 28, speed: 3.5, life: 700, size: 4, gravity: 0.05 },
  electric: { count: 30, speed: 5.5, life: 280, size: 2, gravity: 0.0 },
  ripple: { count: 18, speed: 2.2, life: 750, size: 3, gravity: 0.0 },
  lightning: { count: 800, speed: 7.5, life: 2100, size: 5, gravity: 0.04 },
  glass: { count: 28, speed: 5.0, life: 950, size: 6, gravity: 0.09 },
  water: { count: 450, speed: 3.8, life: 1520, size: 10, gravity: 0.08 },
  confetti: { count: 600, speed: 6.2, life: 1500, size: 4, gravity: 0.2 },
  party: { count: 90, speed: 6.0, life: 1300, size: 5, gravity: 0.05 },
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
  // level feedback
  correct: (t) => [t.primary, t.primary, "#ffffff"],
  error: () => ["#ff4444", "#ff8888", "#cc2222"],
  combo: (t) => [t.primary, t.secondary, t.primary, "#ffffff"],
  victory: (t) => [t.primary, t.secondary, "#ffffff", "#ffd700", "#88eeff"],
  // cutscene — team-independent
  petal: () => ["#ffb3d9", "#ff80bf", "#ffd6eb", "#ffffff"],
  golden: () => ["#ffd700", "#ffe44d", "#fff0a0", "#ffffff"],
  electric: () => ["#ffffff", "#ffe566", "#ccddff", "#aabbff"],
  ripple: () => ["#88ccff", "#aaddff", "#cceeff", "#ffffff"],
  lightning: () => ["#ffd700", "#ffee55", "#ffffff", "#ffe08a"],
  glass: () => ["#e8f4ff", "#c8e0f8", "#ffffff", "#aaccee"],
  water: () => ["#44aaff", "#66ccff", "#aaddff", "#ffffff"],
  confetti: () => [
    "#ff6eb4",
    "#ffd700",
    "#66ff99",
    "#66aaff",
    "#cc66ff",
    "#ffffff",
  ],
  party: () => [
    "#ff6eb4",
    "#ffd700",
    "#9c27b0",
    "#66ff99",
    "#44aaff",
    "#ffffff",
  ],
};
