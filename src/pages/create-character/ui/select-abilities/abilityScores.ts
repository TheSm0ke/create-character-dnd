import type { AbilityKey, RecommendedStats } from "../../../../api";

export type AbilityScores = Record<AbilityKey, number>;

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const;

const ABILITY_KEYS: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

const FALLBACK_SCORES: AbilityScores = {
  str: 15,
  dex: 14,
  con: 13,
  int: 12,
  wis: 10,
  cha: 8,
};

const isStandardArray = (values: number[]) => {
  const sortedValues = [...values].sort((a, b) => b - a);
  return STANDARD_ARRAY.every((value, index) => sortedValues[index] === value);
};

export const createAbilityScores = (
  recommendedStats?: RecommendedStats,
): AbilityScores => {
  if (
    recommendedStats &&
    isStandardArray(ABILITY_KEYS.map((key) => recommendedStats[key]))
  ) {
    return { ...recommendedStats };
  }

  return { ...FALLBACK_SCORES };
};

export const isAbilityScoresValid = (scores: AbilityScores | null) =>
  Boolean(scores && isStandardArray(ABILITY_KEYS.map((key) => scores[key])));
