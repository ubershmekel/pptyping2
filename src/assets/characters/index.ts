import type { CharacterState, Team } from '../../types';
import pinkiePieUrl from './mlp/pinkie-pie.svg';
import pikachuUrl from './pokemon/pikachu.svg';

export type CharacterFrameSet = Record<CharacterState, readonly string[]>;

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

export const CHARACTER_PORTRAITS: Record<Team, string> = {
  pokemon: pikachuUrl,
  mlp: pinkiePieUrl,
};
