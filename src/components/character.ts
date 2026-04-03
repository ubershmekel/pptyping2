import { CHARACTER_FRAMES } from '../assets/characters';
import type { CharacterState, Team } from '../types';

export class CharacterCompanion {
  private el: HTMLElement;
  private svgWrapper: HTMLElement;
  private imageEl: HTMLImageElement;
  private currentX = 0;
  private targetX = 0;
  private state: CharacterState = 'idle';
  private rafId: number | null = null;
  private readonly team: Team;

  constructor(team: Team) {
    this.team = team;
    this.el = document.createElement('div');
    this.el.className = 'character-companion';
    this.el.dataset.state = 'idle';
    this.el.dataset.team = team;

    this.svgWrapper = document.createElement('div');
    this.svgWrapper.className = 'char-svg-wrapper';

    this.imageEl = document.createElement('img');
    this.imageEl.className = 'char-svg';
    this.imageEl.alt = `${team} companion`;
    this.imageEl.draggable = false;
    this.updateFrame();

    this.svgWrapper.appendChild(this.imageEl);
    this.el.appendChild(this.svgWrapper);
  }

  mount(parent: HTMLElement): void {
    parent.appendChild(this.el);
    this.startLoop();
  }

  moveTo(x: number): void {
    this.targetX = Math.max(0, x - 28);
    if (Math.abs(this.targetX - this.currentX) > 2) {
      this.setState('walking');
    }
  }

  celebrate(): void {
    this.setState('celebrating');
    setTimeout(() => this.setState('idle'), 1200);
  }

  flinch(): void {
    this.setState('flinch');
    setTimeout(() => {
      if (this.state === 'flinch') this.setState('idle');
    }, 350);
  }

  destroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.el.remove();
  }

  private setState(state: CharacterState): void {
    if (this.state === state) return;
    this.state = state;
    this.el.dataset.state = state;
    this.updateFrame();
  }

  private updateFrame(): void {
    const frames = CHARACTER_FRAMES[this.team][this.state];
    this.imageEl.src = frames[0];
  }

  private startLoop(): void {
    const tick = () => {
      const diff = this.targetX - this.currentX;
      if (Math.abs(diff) > 0.5) {
        const speed = diff < -60 ? 0.35 : 0.1;
        this.currentX += diff * speed;
        this.el.style.transform = `translateX(${this.currentX}px)`;
        if (this.state === 'idle') this.setState('walking');
      } else {
        this.currentX = this.targetX;
        if (this.state === 'walking') this.setState('idle');
      }

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }
}
