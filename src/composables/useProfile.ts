import { ref } from "vue";
import type { Difficulty, PlayerProfile, Team } from "../types";
import {
  loadProfile,
  saveProfile,
  selectTeam,
  setDifficulty,
  applyLevelResult,
} from "../state/gameState";
import type { LevelStats } from "../types";

// Module-level singleton — all components share the same reactive profile.
const profile = ref<PlayerProfile>(loadProfile());

export function useProfile() {
  function update(newProfile: PlayerProfile): void {
    profile.value = newProfile;
    saveProfile(newProfile);
  }

  function onSelectTeam(team: Team): void {
    update(selectTeam(profile.value, team));
  }

  function onSetDifficulty(difficulty: Difficulty): void {
    update(setDifficulty(profile.value, difficulty));
  }

  function onLevelResult(levelNumber: number, stats: LevelStats): void {
    update(applyLevelResult(profile.value, levelNumber, stats));
  }

  return { profile, update, onSelectTeam, onSetDifficulty, onLevelResult };
}
