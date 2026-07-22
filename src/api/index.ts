// ---------- abilities ----------
export {
  fetchAbilities,
  fetchAbilityById,
  fetchAbilityByName,
} from './abilities';
export type { Ability, AbilityModifier } from './abilities';

// ---------- classes ----------
export * from './classes';
export * from './spells';
export * from './skills';
export * from './weapons';
export * from './armors';
export * from './items';
export * from './tools';

// ---------- races ----------
export {
  fetchRaces,
  fetchRaceById,
  fetchRaceByName,
} from './races';
export type { Race, RaceAbilityBonus, RaceTrait, Subrace } from './races';

// ---------- backgrounds ----------
export {
  fetchBackgrounds,
  fetchBackgroundById,
  fetchBackgroundByName,
} from './backgrounds';
export type {
  Background,
  BackgroundFeature,
  SpecialtyTable,
  SpecialtyTableOption,
  PersonalityTable,
} from './backgrounds';

// ---------- skills ----------
export {
  fetchSkills,
  fetchSkillById,
  fetchSkillByName,
} from './skills';
export type { Skill } from './skills';

// ---------- feats ----------
export {
  fetchFeats,
  fetchFeatById,
  fetchFeatByName,
} from './feats';
export type { Feat } from './feats';

// ---------- languages ----------
export {
  fetchLanguages,
  fetchLanguageById,
  fetchLanguageByName,
} from './languages';
export type { Language } from './languages';

// ---------- alignments ----------
export {
  fetchAlignments,
  fetchAlignmentById,
  fetchAlignmentByName,
} from './alignments';
export type { Alignment } from './alignments';