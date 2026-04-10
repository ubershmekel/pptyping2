import {
  BURST_COLORS,
  BURST_CONFIGS,
  TEAM_COLORS,
  type BurstType,
  type TeamColors,
} from "./presets";
import type { Team } from "../types";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** 0 = just born, 1 = dead */
  life: number;
  /** life increment per 16.67 ms frame */
  decay: number;
  size: number;
  color: string;
  gravity: number;
};

export class ParticleManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private rafId: number | null = null;
  private lastTime: number | null = null;
  private teamColors: TeamColors;

  constructor(team: Team) {
    this.teamColors = TEAM_COLORS[team] ?? TEAM_COLORS["pokemon"];

    this.canvas = document.createElement("canvas");
    this.canvas.style.cssText =
      "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999";
    this.canvas.setAttribute("aria-hidden", "true");

    const ctx = this.canvas.getContext("2d");
    if (ctx === null) throw new Error("Could not get 2D canvas context");
    this.ctx = ctx;

    this.resize();
    window.addEventListener("resize", this.resize);
  }

  mount(container: HTMLElement): void {
    container.appendChild(this.canvas);
  }

  destroy(): void {
    window.removeEventListener("resize", this.resize);
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.canvas.remove();
    this.particles = [];
  }

  /**
   * Trigger a particle burst.
   * @param type - burst type driving color, count, speed, and life
   * @param x    - viewport x (used as spawn origin; ignored for "victory" and "lightning")
   * @param y    - viewport y
   */
  triggerBurst(type: BurstType, x = 0, y = 0): void {
    const cfg = BURST_CONFIGS[type];
    const palette = BURST_COLORS[type](this.teamColors);
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (type === "victory" || type === "lightning") {
      // Rain/explosion from the top edge across the full width
      for (let i = 0; i < cfg.count; i++) {
        const px = Math.random() * w;
        const speed = cfg.speed * (0.5 + Math.random());
        const angle = Math.PI * 0.3 + Math.random() * Math.PI * 0.4;
        this.particles.push(
          makeParticle(
            px,
            -8,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            cfg,
            palette,
          ),
        );
      }
    } else if (type === "party") {
      // Party cannon: upward fan from given position (typically bottom-center)
      for (let i = 0; i < cfg.count; i++) {
        const speed = cfg.speed * (0.5 + Math.random());
        // Fan from roughly straight-up to 60° either side
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.2;
        this.particles.push(
          makeParticle(
            x,
            y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            cfg,
            palette,
          ),
        );
      }
    } else if (type === "petal") {
      // Petals drift from the given position with a strong rightward bias
      for (let i = 0; i < cfg.count; i++) {
        const speed = cfg.speed * (0.4 + Math.random() * 0.8);
        // Spread them vertically across the screen, drifting rightward
        const spawnY = h * (0.1 + Math.random() * 0.8);
        const spawnX = w * (Math.random() * 0.4); // left 40%
        const vx = speed * (0.6 + Math.random() * 0.4); // always rightward
        const vy = (Math.random() - 0.5) * speed * 0.5; // slight vertical wobble
        this.particles.push(makeParticle(spawnX, spawnY, vx, vy, cfg, palette));
      }
    } else if (type === "ripple") {
      // Uniform ring: equal angular spacing, consistent speed
      for (let i = 0; i < cfg.count; i++) {
        const angle = (i / cfg.count) * Math.PI * 2;
        const speed = cfg.speed * (0.85 + Math.random() * 0.3);
        this.particles.push(
          makeParticle(
            x,
            y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            cfg,
            palette,
          ),
        );
      }
    } else {
      // Default: random radial burst from (x, y)
      for (let i = 0; i < cfg.count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = cfg.speed * (0.4 + Math.random() * 0.8);
        this.particles.push(
          makeParticle(
            x,
            y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            cfg,
            palette,
          ),
        );
      }
    }

    if (this.rafId === null) {
      this.lastTime = null;
      this.rafId = requestAnimationFrame(this.loop);
    }
  }

  private resize = (): void => {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };

  private loop = (time: number): void => {
    if (this.lastTime === null) this.lastTime = time;
    const dt = Math.min(time - this.lastTime, 50);
    this.lastTime = time;

    const scale = dt / 16.667;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.life += p.decay * scale;
      if (p.life >= 1) {
        this.particles.splice(i, 1);
        continue;
      }

      p.vy += p.gravity * scale;
      p.x += p.vx * scale;
      p.y += p.vy * scale;

      const alpha = (1 - p.life) * 0.9;
      const radius = p.size * (1 - p.life * 0.4);

      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, Math.max(0.5, radius), 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1;

    if (this.particles.length > 0) {
      this.rafId = requestAnimationFrame(this.loop);
    } else {
      this.rafId = null;
    }
  };
}

function makeParticle(
  x: number,
  y: number,
  vx: number,
  vy: number,
  cfg: (typeof BURST_CONFIGS)[BurstType],
  palette: string[],
): Particle {
  return {
    x,
    y,
    vx,
    vy,
    life: 0,
    decay: 16.667 / cfg.life,
    size: cfg.size * (0.6 + Math.random() * 0.8),
    color: palette[Math.floor(Math.random() * palette.length)],
    gravity: cfg.gravity,
  };
}
