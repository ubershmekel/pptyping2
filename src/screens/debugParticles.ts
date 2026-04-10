import "./debugParticles.css";
import type { ScreenMount, Team } from "../types";
import { createScreenMount } from "../screenMount";
import { ParticleManager } from "../particles/particleManager";
import { BURST_CONFIGS, type BurstType } from "../particles/presets";

type ConfigKey = keyof (typeof BURST_CONFIGS)[BurstType];

const ALL_BURSTS: BurstType[] = [
  "correct",
  "error",
  "combo",
  "victory",
  "petal",
  "golden",
  "electric",
  "ripple",
  "lightning",
  "glass",
  "water",
  "confetti",
  "party",
];

// Human-readable labels and the story context behind each burst
const BURST_META: Record<BurstType, { label: string; context: string }> = {
  correct: {
    label: "Correct keystroke",
    context: "Level screen — every correct key",
  },
  error: { label: "Error keystroke", context: "Level screen — every mistake" },
  combo: { label: "Combo ×10", context: "Level screen — every 10 correct" },
  victory: {
    label: "Victory shower",
    context: "Level screen — level complete",
  },
  petal: { label: "Pink petals", context: "Pokémon #0 — Fluttershy's trail" },
  golden: {
    label: "Golden flash",
    context: "Pokémon #1 & MLP #4 — restored keys / warm moment",
  },
  electric: {
    label: "Electric static",
    context: "Pokémon #2 & #4 — Thunder Shrine curtain / cheek charge",
  },
  ripple: {
    label: "Crystal ripple",
    context: "Pokémon #3 — Pikachu touches the wall",
  },
  lightning: { label: "Thunderbolt", context: "Pokémon #5 — the big zap" },
  glass: {
    label: "Shattering glass",
    context: "Pokémon #5 — dimensional barrier breaks",
  },
  water: { label: "Water blast", context: "MLP #0 & #2 — Squirtle's pranks" },
  confetti: {
    label: "Confetti pop",
    context: "MLP #1 & #3 — prank landing / whoopee cushion",
  },
  party: { label: "Party cannon", context: "MLP #5 — the finale party" },
};

export function renderDebugParticles(team: Team): ScreenMount {
  const screen = document.createElement("div");
  const mount = createScreenMount(screen);
  screen.className = `screen debug-particles-screen team-${team}`;

  // Mutable config overrides (start from defaults)
  const cfg: Record<BurstType, (typeof BURST_CONFIGS)[BurstType]> = {} as never;
  for (const type of ALL_BURSTS) {
    cfg[type] = { ...BURST_CONFIGS[type] };
  }

  let activeBurst: BurstType = "victory";

  function fire(type: BurstType): void {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    // Temporarily override the global config so the manager picks up our tweaks
    Object.assign(BURST_CONFIGS[type], cfg[type]);
    particles.triggerBurst(type, cx, cy);
  }

  function buildKnobsHTML(type: BurstType): string {
    const c = cfg[type];
    const fields: [ConfigKey, string, number, number, number][] = [
      ["count", "Count", 1, 800, 1],
      ["speed", "Speed", 0.1, 15, 0.1],
      ["life", "Life ms", 50, 3000, 10],
      ["size", "Size px", 1, 20, 0.5],
      ["gravity", "Gravity", 0, 0.5, 0.005],
    ];
    return fields
      .map(
        ([key, label, min, max, step]) => `
        <div class="dp-knob">
          <label class="dp-knob-label">${label}
            <span class="dp-knob-val" id="val-${type}-${key}">${c[key]}</span>
          </label>
          <input class="dp-knob-range" type="range"
            id="knob-${type}-${key}"
            data-burst="${type}" data-key="${key}"
            min="${min}" max="${max}" step="${step}"
            value="${c[key]}">
        </div>`,
      )
      .join("");
  }

  function buildButtonsHTML(): string {
    return ALL_BURSTS.map((type) => {
      const meta = BURST_META[type];
      return `
        <div class="dp-card" id="card-${type}" data-type="${type}">
          <div class="dp-card-header">
            <span class="dp-type-tag">${type}</span>
            <button class="dp-fire-btn" data-type="${type}">Fire</button>
          </div>
          <div class="dp-card-label">${meta.label}</div>
          <div class="dp-card-context">${meta.context}</div>
          <div class="dp-knobs" id="knobs-${type}">${buildKnobsHTML(type)}</div>
        </div>`;
    }).join("");
  }

  screen.innerHTML = `
    <div class="dp-header">
      <h1 class="dp-title">Particle Debugger</h1>
      <div class="dp-team-badge">team-${team}</div>
      <div class="dp-hint">Click <strong>Fire</strong> on any card — particles spawn at screen center.<br>
        Adjust knobs live. Changes apply immediately on next fire.</div>
    </div>
    <div class="dp-grid">${buildButtonsHTML()}</div>
  `;

  // Mount particles AFTER innerHTML so the canvas isn't wiped
  const particles = new ParticleManager(team);
  particles.mount(screen);
  mount.defer(() => particles.destroy());

  // Event delegation — fire buttons
  mount.listen(screen, "click", (e) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>(
      ".dp-fire-btn",
    );
    if (btn) {
      const type = btn.dataset.type as BurstType;
      activeBurst = type;
      // Highlight active card
      screen
        .querySelectorAll(".dp-card")
        .forEach((c) => c.classList.remove("dp-card--active"));
      screen.querySelector(`#card-${type}`)?.classList.add("dp-card--active");
      fire(type);
    }
  });

  // Event delegation — range knobs
  mount.listen(screen, "input", (e) => {
    const input = e.target as HTMLInputElement;
    if (!input.classList.contains("dp-knob-range")) return;
    const type = input.dataset.burst as BurstType;
    const key = input.dataset.key as ConfigKey;
    const value = parseFloat(input.value);
    (cfg[type] as Record<string, number>)[key] = value;
    const valEl = screen.querySelector(`#val-${type}-${key}`);
    if (valEl) valEl.textContent = String(value);
    // Re-fire so you can see the change immediately
    fire(type);
  });

  // Space / Enter fires the last active burst
  mount.listen(document, "keydown", (e: KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      fire(activeBurst);
    }
  });

  return mount;
}
