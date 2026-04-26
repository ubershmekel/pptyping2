import type { LetterMedal, Team } from "../../types";
import mlpBronzeMedalUrl from "./mlp/bronze-rank-keycap.svg";
import mlpGoldMedalUrl from "./mlp/gold-rank-keycap.svg";
import mlpSilverMedalUrl from "./mlp/silver-rank-keycap.svg";
import pokemonBronzeMedalUrl from "./pok/bronze-rank-keycap.svg";
import pokemonGoldMedalUrl from "./pok/gold-rank-keycap.svg";
import pokemonSilverMedalUrl from "./pok/silver-rank-keycap.svg";

export const MEDAL_ICONS: Record<
  Team,
  Partial<Record<LetterMedal, string>>
> = {
  pokemon: {
    bronze: pokemonBronzeMedalUrl,
    silver: pokemonSilverMedalUrl,
    gold: pokemonGoldMedalUrl,
  },
  mlp: {
    bronze: mlpBronzeMedalUrl,
    silver: mlpSilverMedalUrl,
    gold: mlpGoldMedalUrl,
  },
};

export function medalIconForTeam(
  team: Team,
  medal: LetterMedal,
): string | null {
  return MEDAL_ICONS[team][medal] ?? null;
}
