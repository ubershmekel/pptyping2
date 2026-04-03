import type { CharacterState, Team } from '../types';

// ─── SVG art ─────────────────────────────────────────────────────────────────

export function pikachuSVG(size = 72): string {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 80 80" class="char-svg pikachu-svg">
    <!-- Lightning bolt tail -->
    <polyline points="64,62 72,48 66,48 74,33" fill="none" stroke="#E8B800" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Body -->
    <ellipse cx="35" cy="60" rx="18" ry="17" fill="#FFD700"/>
    <!-- Left ear -->
    <polygon points="18,30 11,10 27,24" fill="#FFD700"/>
    <polygon points="19,28 14,14 25,23" fill="#1a1a1a"/>
    <!-- Right ear -->
    <polygon points="52,30 59,10 43,24" fill="#FFD700"/>
    <polygon points="51,28 56,14 45,23" fill="#1a1a1a"/>
    <!-- Head -->
    <circle cx="35" cy="36" r="22" fill="#FFD700"/>
    <!-- Eyes -->
    <circle cx="27" cy="32" r="5" fill="#1a1a1a"/>
    <circle cx="43" cy="32" r="5" fill="#1a1a1a"/>
    <circle cx="28.5" cy="30" r="2" fill="white"/>
    <circle cx="44.5" cy="30" r="2" fill="white"/>
    <!-- Cheeks -->
    <circle cx="18" cy="40" r="7" fill="#FF6B6B" opacity="0.8"/>
    <circle cx="52" cy="40" r="7" fill="#FF6B6B" opacity="0.8"/>
    <!-- Nose -->
    <ellipse cx="35" cy="37" rx="2" ry="1.5" fill="#555"/>
    <!-- Mouth -->
    <path d="M29,41 Q35,47 41,41" stroke="#333" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <!-- Back stripes -->
    <path d="M20,55 Q25,52 30,55" stroke="#B8900A" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M22,62 Q27,59 32,62" stroke="#B8900A" stroke-width="2" fill="none" stroke-linecap="round"/>
    <!-- Small feet -->
    <ellipse cx="27" cy="75" rx="7" ry="4" fill="#E8B800"/>
    <ellipse cx="43" cy="75" rx="7" ry="4" fill="#E8B800"/>
  </svg>`;
}

export function pinkiePieSVG(size = 72): string {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 80 80" class="char-svg pinkie-svg">
    <!-- Tail: big curly -->
    <circle cx="68" cy="58" r="8"  fill="#C2007A"/>
    <circle cx="73" cy="48" r="7"  fill="#E0009C"/>
    <circle cx="72" cy="40" r="6"  fill="#C2007A"/>
    <!-- Body -->
    <ellipse cx="40" cy="62" rx="20" ry="17" fill="#FF90C0"/>
    <!-- Mane (curly hair, behind head) -->
    <circle cx="22" cy="30" r="13" fill="#C2007A"/>
    <circle cx="31" cy="18" r="11" fill="#E0009C"/>
    <circle cx="44" cy="14" r="12" fill="#C2007A"/>
    <circle cx="57" cy="19" r="10" fill="#E0009C"/>
    <circle cx="63" cy="30" r="9"  fill="#C2007A"/>
    <!-- Head -->
    <circle cx="40" cy="36" r="21" fill="#FFADD2"/>
    <!-- Eyes: big blue with sparkle -->
    <ellipse cx="32" cy="32" rx="6"  ry="7"  fill="#00C8FF"/>
    <ellipse cx="48" cy="32" rx="6"  ry="7"  fill="#00C8FF"/>
    <ellipse cx="32" cy="33" rx="4"  ry="5"  fill="#0055CC"/>
    <ellipse cx="48" cy="33" rx="4"  ry="5"  fill="#0055CC"/>
    <circle  cx="33.5" cy="30" r="2"  fill="white"/>
    <circle  cx="49.5" cy="30" r="2"  fill="white"/>
    <!-- Nose: tiny pink button -->
    <circle cx="40" cy="40" r="2"  fill="#FF6EB4"/>
    <!-- Wide smile -->
    <path d="M30,44 Q40,52 50,44" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/>
    <!-- Balloon cutie mark -->
    <circle cx="30" cy="65" r="5" fill="#4169E1" opacity="0.9"/>
    <circle cx="40" cy="61" r="5" fill="#FFD700" opacity="0.9"/>
    <circle cx="50" cy="65" r="5" fill="#FF4500" opacity="0.9"/>
    <line x1="30" y1="70" x2="32" y2="76" stroke="#888" stroke-width="1.2"/>
    <line x1="40" y1="66" x2="40" y2="76" stroke="#888" stroke-width="1.2"/>
    <line x1="50" y1="70" x2="48" y2="76" stroke="#888" stroke-width="1.2"/>
  </svg>`;
}

// ─── CharacterCompanion class ─────────────────────────────────────────────────

export class CharacterCompanion {
  private el: HTMLElement;
  private svgWrapper: HTMLElement;
  private currentX = 0;
  private targetX  = 0;
  private state: CharacterState = 'idle';
  private rafId: number | null = null;
  private walkTick = 0;
  private readonly team: Team;

  constructor(team: Team) {
    this.team = team;
    this.el = document.createElement('div');
    this.el.className = 'character-companion';
    this.el.dataset.state = 'idle';
    this.el.dataset.team = team;

    this.svgWrapper = document.createElement('div');
    this.svgWrapper.className = 'char-svg-wrapper';
    this.svgWrapper.innerHTML = team === 'pokemon' ? pikachuSVG(56) : pinkiePieSVG(56);
    this.el.appendChild(this.svgWrapper);
  }

  /** Mount the character into a parent element. */
  mount(parent: HTMLElement): void {
    parent.appendChild(this.el);
    this.startLoop();
  }

  /** Move the character to a target X offset within its container. */
  moveTo(x: number): void {
    this.targetX = Math.max(0, x - 28); // offset so character centers on current char
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

  private setState(s: CharacterState): void {
    if (this.state === s) return;
    this.state = s;
    this.el.dataset.state = s;
  }

  private startLoop(): void {
    const tick = () => {
      const diff = this.targetX - this.currentX;
      if (Math.abs(diff) > 0.5) {
        // Faster lerp for zip-back on line wrap (large negative diff)
        const speed = diff < -60 ? 0.35 : 0.10;
        this.currentX += diff * speed;
        this.el.style.transform = `translateX(${this.currentX}px)`;
        if (this.state === 'idle') this.setState('walking');
      } else {
        this.currentX = this.targetX;
        if (this.state === 'walking') this.setState('idle');
      }

      // Walk bobbing applied via CSS data-state animation, but we can add a tick counter
      this.walkTick++;
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }
}
