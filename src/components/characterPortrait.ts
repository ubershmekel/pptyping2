import type { AsepriteFrameData } from "../aseprite";
import { selectAsepriteAnimation } from "../aseprite";
import type { CharacterPortrait } from "../assets/characters";

export interface CharacterPortraitHandle {
  element: HTMLElement;
  cleanup: () => void;
}

export interface CharacterPortraitRenderOptions {
  animated?: boolean;
  className?: string;
  loopTag?: string;
}

export function createCharacterPortraitElement(
  portrait: CharacterPortrait,
  altText: string,
  options: CharacterPortraitRenderOptions = {},
): CharacterPortraitHandle {
  if (portrait.kind === "static") {
    const image = document.createElement("img");
    image.className = options.className ?? "";
    image.src = portrait.src;
    image.alt = altText;
    image.draggable = false;
    image.dataset.portraitKind = portrait.kind;
    return {
      element: image,
      cleanup: () => {},
    };
  }

  const animation = selectAsepriteAnimation(
    portrait.spriteSheet,
    options.loopTag,
  );
  const firstFrame = animation.frames[0];
  const canvas = document.createElement("canvas");
  canvas.className = options.className ?? "";
  canvas.width = firstFrame.sourceSize.w;
  canvas.height = firstFrame.sourceSize.h;
  canvas.draggable = false;
  canvas.dataset.portraitKind = portrait.kind;
  if (animation.tagName !== null) {
    canvas.dataset.portraitTag = animation.tagName;
  }
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", altText);

  let timeoutId: number | null = null;
  let frameIndex = 0;
  let disposed = false;

  const spriteImage = new Image();

  const drawFrame = (
    context: CanvasRenderingContext2D,
    frame: AsepriteFrameData,
  ): void => {
    if (
      canvas.width !== frame.sourceSize.w ||
      canvas.height !== frame.sourceSize.h
    ) {
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

    const context = canvas.getContext("2d");
    if (context === null) {
      return;
    }

    const frame = animation.frames[frameIndex];
    drawFrame(context, frame);

    if (options.animated === false || animation.frames.length < 2) {
      return;
    }

    timeoutId = window.setTimeout(() => {
      frameIndex = (frameIndex + 1) % animation.frames.length;
      step();
    }, frame.duration);
  };

  const handleImageLoad = (): void => {
    frameIndex = 0;
    step();
  };

  spriteImage.addEventListener("load", handleImageLoad, { once: true });
  spriteImage.src = portrait.imageUrl;
  if (spriteImage.complete && spriteImage.naturalWidth > 0) {
    spriteImage.removeEventListener("load", handleImageLoad);
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
