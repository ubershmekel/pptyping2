import type { CharacterState, Team } from '../../types';
import pinkiePieUrl from './mlp/pinkie-pie.svg';
import pikachuStandData from '../pikachu/pikachu-stand.json';
import pikachuStandUrl from '../pikachu/pikachu-stand.png';
import pikachuUrl from './pokemon/pikachu.svg';

export type CharacterFrameSet = Record<CharacterState, readonly string[]>;

interface SpriteRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface SpriteSourceSize {
  w: number;
  h: number;
}

interface AsepriteFrame {
  frame: SpriteRect;
  spriteSourceSize: SpriteRect;
  sourceSize: SpriteSourceSize;
  duration: number;
}

interface AsepriteSheet {
  frames: Record<string, AsepriteFrame>;
  meta: {
    size: SpriteSourceSize;
  };
}

export interface StaticCharacterPortrait {
  kind: 'static';
  src: string;
}

export interface SpriteCharacterPortrait {
  kind: 'sprite';
  imageUrl: string;
  frames: readonly AsepriteFrame[];
  sheetSize: SpriteSourceSize;
}

export type CharacterPortrait = StaticCharacterPortrait | SpriteCharacterPortrait;

export interface CharacterPortraitHandle {
  element: HTMLElement;
  cleanup: () => void;
}

function getFrameOrder(frameName: string): number {
  const match = frameName.match(/(\d+)(?=\.aseprite$)/);
  return match === null ? 0 : Number(match[1]);
}

function parseAsepriteFrames(data: AsepriteSheet): readonly AsepriteFrame[] {
  return Object.entries(data.frames)
    .sort(([left], [right]) => getFrameOrder(left) - getFrameOrder(right))
    .map(([, frame]) => frame);
}

const pikachuStandFrames = parseAsepriteFrames(pikachuStandData as AsepriteSheet);

const pokemonFrames: CharacterFrameSet = {
  idle: [pikachuUrl],
  walking: [pikachuUrl],
  celebrating: [pikachuUrl],
  flinch: [pikachuUrl],
};

const mlpFrames: CharacterFrameSet = {
  idle: [pinkiePieUrl],
  walking: [pinkiePieUrl],
  celebrating: [pinkiePieUrl],
  flinch: [pinkiePieUrl],
};

export const CHARACTER_FRAMES: Record<Team, CharacterFrameSet> = {
  pokemon: pokemonFrames,
  mlp: mlpFrames,
};

export const CHARACTER_PORTRAITS: Record<Team, CharacterPortrait> = {
  pokemon: {
    kind: 'sprite',
    imageUrl: pikachuStandUrl,
    frames: pikachuStandFrames,
    sheetSize: pikachuStandData.meta.size,
  },
  mlp: {
    kind: 'static',
    src: pinkiePieUrl,
  },
};

export function createCharacterPortraitElement(
  portrait: CharacterPortrait,
  altText: string,
  options: {
    animated?: boolean;
    className?: string;
  } = {},
): CharacterPortraitHandle {
  if (portrait.kind === 'static') {
    const image = document.createElement('img');
    image.className = options.className ?? '';
    image.src = portrait.src;
    image.alt = altText;
    image.draggable = false;
    image.dataset.portraitKind = portrait.kind;
    return {
      element: image,
      cleanup: () => {},
    };
  }

  const firstFrame = portrait.frames[0];
  const canvas = document.createElement('canvas');
  canvas.className = options.className ?? '';
  canvas.width = firstFrame.sourceSize.w;
  canvas.height = firstFrame.sourceSize.h;
  canvas.draggable = false;
  canvas.dataset.portraitKind = portrait.kind;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', altText);

  let timeoutId: number | null = null;
  let frameIndex = 0;
  let disposed = false;

  const spriteImage = new Image();

  const drawFrame = (context: CanvasRenderingContext2D, frame: AsepriteFrame): void => {
    if (canvas.width !== frame.sourceSize.w || canvas.height !== frame.sourceSize.h) {
      canvas.width = frame.sourceSize.w;
      canvas.height = frame.sourceSize.h;
    }

    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(
      spriteImage,
      frame.frame.x,
      frame.frame.y,
      frame.frame.w,
      frame.frame.h,
      frame.spriteSourceSize.x,
      frame.spriteSourceSize.y,
      frame.spriteSourceSize.w,
      frame.spriteSourceSize.h,
    );
  };

  const step = (): void => {
    if (disposed) {
      return;
    }

    const context = canvas.getContext('2d');
    if (context === null) {
      return;
    }

    const frame = portrait.frames[frameIndex];
    drawFrame(context, frame);

    if (options.animated === false || portrait.frames.length < 2) {
      return;
    }

    timeoutId = window.setTimeout(() => {
      frameIndex = (frameIndex + 1) % portrait.frames.length;
      step();
    }, frame.duration);
  };

  const handleImageLoad = (): void => {
    frameIndex = 0;
    step();
  };

  spriteImage.addEventListener('load', handleImageLoad, { once: true });
  spriteImage.src = portrait.imageUrl;
  if (spriteImage.complete && spriteImage.naturalWidth > 0) {
    spriteImage.removeEventListener('load', handleImageLoad);
    handleImageLoad();
  }

  return {
    element: canvas,
    cleanup: () => {
      disposed = true;
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    },
  };
}
