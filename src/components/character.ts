import "./character.css";
import { CHARACTER_ANIMATIONS } from "../assets/characters";
import { selectAsepriteAnimation } from "../aseprite";
import type { AsepriteFrameData } from "../aseprite";
import type { CharacterState, Team } from "../types";

export class CharacterCompanion {
  private el: HTMLElement;
  private svgWrapper: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private spriteImg: HTMLImageElement;
  private currentImageUrl = "";
  private frames: readonly AsepriteFrameData[] = [];
  private frameIndex = 0;
  private frameTimerId: number | null = null;
  private currentX = 0;
  private targetX = 0;
  private state: CharacterState = "idle";
  private rafId: number | null = null;
  private readonly team: Team;

  constructor(team: Team) {
    this.team = team;
    this.el = document.createElement("div");
    this.el.className = "character-companion";
    this.el.dataset.state = "idle";
    this.el.dataset.team = team;

    this.svgWrapper = document.createElement("div");
    this.svgWrapper.className = "char-svg-wrapper";

    this.canvas = document.createElement("canvas");
    this.canvas.className = "char-svg";
    this.canvas.setAttribute("role", "img");
    this.canvas.setAttribute("aria-label", `${team} companion`);

    const ctx = this.canvas.getContext("2d");
    if (ctx === null) throw new Error("Could not get 2D canvas context");
    this.ctx = ctx;

    this.spriteImg = new Image();
    this.spriteImg.addEventListener("load", () => {
      this.drawFrame();
      if (this.frames.length > 1) {
        this.scheduleNextFrame();
      }
    });

    this.svgWrapper.appendChild(this.canvas);
    this.el.appendChild(this.svgWrapper);

    this.applyAnimation();
  }

  mount(parent: HTMLElement): void {
    parent.appendChild(this.el);
    this.startLoop();
  }

  moveTo(x: number): void {
    this.targetX = Math.max(0, x - 40);
    if (Math.abs(this.targetX - this.currentX) > 2) {
      this.setState("walking");
    }
  }

  celebrate(): void {
    this.setState("celebrating");
    setTimeout(() => this.setState("idle"), 1200);
  }

  flinch(): void {
    this.setState("flinch");
    setTimeout(() => {
      if (this.state === "flinch") this.setState("idle");
    }, 350);
  }

  destroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.stopFrameTimer();
    this.el.remove();
  }

  private setState(state: CharacterState): void {
    if (this.state === state) return;
    this.state = state;
    this.el.dataset.state = state;
    this.applyAnimation();
  }

  private applyAnimation(): void {
    const spec = CHARACTER_ANIMATIONS[this.team][this.state];
    const { frames } = selectAsepriteAnimation(spec.sheet, spec.tag);
    this.frames = frames;
    this.frameIndex = 0;
    this.stopFrameTimer();

    if (frames.length > 0) {
      const f = frames[0];
      this.canvas.width = f.sourceSize.w;
      this.canvas.height = f.sourceSize.h;
    }

    if (spec.imageUrl !== this.currentImageUrl) {
      this.currentImageUrl = spec.imageUrl;
      this.spriteImg.src = spec.imageUrl;
      // drawFrame + scheduleNextFrame called by the load event
    } else {
      this.drawFrame();
      if (frames.length > 1) {
        this.scheduleNextFrame();
      }
    }
  }

  private drawFrame(): void {
    const frame = this.frames[this.frameIndex];
    if (
      !frame ||
      !this.spriteImg.complete ||
      this.spriteImg.naturalWidth === 0
    ) {
      return;
    }

    if (
      this.canvas.width !== frame.sourceSize.w ||
      this.canvas.height !== frame.sourceSize.h
    ) {
      this.canvas.width = frame.sourceSize.w;
      this.canvas.height = frame.sourceSize.h;
    }

    this.ctx.imageSmoothingEnabled = false;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(
      this.spriteImg,
      frame.frame.x,
      frame.frame.y,
      frame.frame.w,
      frame.frame.h,
      frame.spriteSourceSize.x,
      frame.spriteSourceSize.y,
      frame.spriteSourceSize.w,
      frame.spriteSourceSize.h,
    );
  }

  private scheduleNextFrame(): void {
    const frame = this.frames[this.frameIndex];
    if (!frame) return;
    this.frameTimerId = window.setTimeout(() => {
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
      this.drawFrame();
      this.scheduleNextFrame();
    }, frame.duration);
  }

  private stopFrameTimer(): void {
    if (this.frameTimerId !== null) {
      clearTimeout(this.frameTimerId);
      this.frameTimerId = null;
    }
  }

  private startLoop(): void {
    const tick = () => {
      const diff = this.targetX - this.currentX;
      if (Math.abs(diff) > 0.5) {
        const speed = diff < -60 ? 0.35 : 0.1;
        this.currentX += diff * speed;
        this.el.style.transform = `translateX(${this.currentX}px)`;
        if (this.state === "idle") this.setState("walking");
      } else {
        this.currentX = this.targetX;
        if (this.state === "walking") this.setState("idle");
      }

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }
}
