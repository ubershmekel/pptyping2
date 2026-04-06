export interface AsepriteRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AsepriteSourceSize {
  w: number;
  h: number;
}

export interface AsepriteFrameData {
  frame: AsepriteRect;
  spriteSourceSize: AsepriteRect;
  sourceSize: AsepriteSourceSize;
  duration: number;
}

export interface AsepriteFrameTag {
  name: string;
  from: number;
  to: number;
  direction: "forward" | "reverse" | "pingpong" | "pingpong_reverse" | string;
  color?: string;
}

export interface AsepriteSheetData {
  frames: Record<string, AsepriteFrameData>;
  meta: {
    size: AsepriteSourceSize;
    frameTags?: readonly AsepriteFrameTag[];
  };
}

export interface AsepriteSpriteSheet {
  frames: readonly AsepriteFrameData[];
  frameTags: readonly AsepriteFrameTag[];
  sheetSize: AsepriteSourceSize;
}

export interface AsepriteAnimationSelection {
  frames: readonly AsepriteFrameData[];
  tagName: string | null;
}

function getFrameOrder(frameName: string): number {
  const match = frameName.match(/(\d+)(?=\.aseprite$)/);
  return match === null ? 0 : Number(match[1]);
}

function normalizeTagName(tagName: string): string {
  return tagName.trim().toLowerCase();
}

function expandFrameTag(
  frames: readonly AsepriteFrameData[],
  tag: AsepriteFrameTag,
): readonly AsepriteFrameData[] {
  if (frames.length === 0) {
    return frames;
  }

  const start = Math.max(0, Math.min(tag.from, tag.to));
  const end = Math.min(frames.length - 1, Math.max(tag.from, tag.to));
  const range = frames.slice(start, end + 1);

  if (range.length < 2) {
    return range;
  }

  switch (tag.direction) {
    case "reverse":
      return [...range].reverse();
    case "pingpong":
      return [...range, ...range.slice(1, -1).reverse()];
    case "pingpong_reverse": {
      const reversed = [...range].reverse();
      return [...reversed, ...reversed.slice(1, -1).reverse()];
    }
    case "forward":
    default:
      return range;
  }
}

export function createAsepriteSpriteSheet(
  data: AsepriteSheetData,
): AsepriteSpriteSheet {
  const frames = Object.entries(data.frames)
    .sort(([left], [right]) => getFrameOrder(left) - getFrameOrder(right))
    .map(([, frame]) => frame);

  if (frames.length === 0) {
    throw new Error("Aseprite sprite sheets must contain at least one frame.");
  }

  return {
    frames,
    frameTags: data.meta.frameTags ?? [],
    sheetSize: data.meta.size,
  };
}

export function selectAsepriteAnimation(
  sheet: AsepriteSpriteSheet,
  requestedTagName?: string,
): AsepriteAnimationSelection {
  const requestedTag =
    requestedTagName === undefined
      ? null
      : (sheet.frameTags.find(
          (tag) =>
            normalizeTagName(tag.name) === normalizeTagName(requestedTagName),
        ) ?? null);
  const selectedTag = requestedTag ?? sheet.frameTags[0] ?? null;

  if (selectedTag === null) {
    return {
      frames: sheet.frames,
      tagName: null,
    };
  }

  return {
    frames: expandFrameTag(sheet.frames, selectedTag),
    tagName: selectedTag.name,
  };
}
