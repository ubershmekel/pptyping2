import type { AsepriteSheetData, AsepriteSpriteSheet } from "../../aseprite";
import { createAsepriteSpriteSheet } from "../../aseprite";
import type { CharacterState, Team } from "../../types";
import pinkiePieUrl from "./mlp/pinkie-pie.svg";
import pinkyData from "../pinky/pinky.json";
import pinkyUrl from "../pinky/pinky.png";
import pikachuStandData from "../pikachu/pikachu-stand.json";
import pikachuStandUrl from "../pikachu/pikachu-stand.png";
import pikachuUrl from "./pokemon/pikachu.svg";

export type CharacterFrameSet = Record<CharacterState, readonly string[]>;

export interface StaticCharacterPortrait {
  kind: "static";
  src: string;
}

export interface SpriteCharacterPortrait {
  kind: "sprite";
  imageUrl: string;
  spriteSheet: AsepriteSpriteSheet;
}

export type CharacterPortrait =
  | StaticCharacterPortrait
  | SpriteCharacterPortrait;

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
    kind: "sprite",
    imageUrl: pikachuStandUrl,
    spriteSheet: createAsepriteSpriteSheet(
      pikachuStandData as AsepriteSheetData,
    ),
  },
  mlp: {
    kind: "sprite",
    imageUrl: pinkyUrl,
    spriteSheet: createAsepriteSpriteSheet(pinkyData as AsepriteSheetData),
  },
};
