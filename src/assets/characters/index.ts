import type { AsepriteSheetData, AsepriteSpriteSheet } from "../../aseprite";
import { createAsepriteSpriteSheet } from "../../aseprite";
import type { CharacterState, Team } from "../../types";
import pinkyData from "../pinky/pinky.json";
import pinkyUrl from "../pinky/pinky.png";
import pikachuStandData from "../pikachu/pikachu-stand.json";
import pikachuStandUrl from "../pikachu/pikachu-stand.png";
import pikachuRunData from "../pikachu/pikachu-run.json";
import pikachuRunUrl from "../pikachu/pikachu-run.png";

export interface StaticCharacterPortrait {
  kind: "static";
  src: string;
}

export interface SpriteCharacterPortrait {
  kind: "sprite";
  imageUrl: string;
  spriteSheet: AsepriteSpriteSheet;
}

export type CharacterPortrait = StaticCharacterPortrait | SpriteCharacterPortrait;

export interface CharacterAnimationSpec {
  imageUrl: string;
  sheet: AsepriteSpriteSheet;
  tag?: string;
}

export type CharacterAnimationSet = Record<CharacterState, CharacterAnimationSpec>;

const pikachuStandSheet = createAsepriteSpriteSheet(
  pikachuStandData as AsepriteSheetData,
);
const pikachuRunSheet = createAsepriteSpriteSheet(
  pikachuRunData as AsepriteSheetData,
);
const pinkySheet = createAsepriteSpriteSheet(pinkyData as AsepriteSheetData);

export const CHARACTER_ANIMATIONS: Record<Team, CharacterAnimationSet> = {
  pokemon: {
    idle: { imageUrl: pikachuStandUrl, sheet: pikachuStandSheet, tag: "Stand" },
    walking: { imageUrl: pikachuRunUrl, sheet: pikachuRunSheet, tag: "Run" },
    celebrating: {
      imageUrl: pikachuStandUrl,
      sheet: pikachuStandSheet,
      tag: "Peace",
    },
    flinch: {
      imageUrl: pikachuStandUrl,
      sheet: pikachuStandSheet,
      tag: "Stand",
    },
  },
  mlp: {
    idle: { imageUrl: pinkyUrl, sheet: pinkySheet, tag: "Stand" },
    walking: { imageUrl: pinkyUrl, sheet: pinkySheet, tag: "Right1" },
    celebrating: { imageUrl: pinkyUrl, sheet: pinkySheet, tag: "Celebrate" },
    flinch: { imageUrl: pinkyUrl, sheet: pinkySheet, tag: "Hit1" },
  },
};

export const CHARACTER_PORTRAITS: Record<Team, CharacterPortrait> = {
  pokemon: {
    kind: "sprite",
    imageUrl: pikachuStandUrl,
    spriteSheet: pikachuStandSheet,
  },
  mlp: {
    kind: "sprite",
    imageUrl: pinkyUrl,
    spriteSheet: pinkySheet,
  },
};
