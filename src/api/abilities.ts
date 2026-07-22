import { get } from './apiClient';

export interface AbilityModifier {
  score: number;
  mod: number;
}

export interface Ability {
  _id: string;
  name: string;
  description: string;
  modifiers: AbilityModifier[];
}

export const fetchAbilities = (): Promise<Ability[]> => get<Ability[]>('/abilities');
export const fetchAbilityById = (id: string): Promise<Ability> => get<Ability>(`/abilities/${id}`);
export const fetchAbilityByName = (name: string): Promise<Ability[]> =>
  get<Ability[]>(`/abilities/search?name=${encodeURIComponent(name)}`);