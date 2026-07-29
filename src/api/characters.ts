import { get, patch, post, remove } from './apiClient';
import type { AbilityKey } from './classes';

export interface CharacterEquipmentItem {
  name: string;
  count: number;
}

export interface CharacterCurrency {
  copper: number;
  silver: number;
  electrum: number;
  gold: number;
  platinum: number;
}

export interface CreateCharacterPayload {
  name: string;
  level: number;
  experience?: number;
  feat_ids?: string[];
  hit_points: {
    current: number;
    maximum: number;
  };
  race_id: string;
  class_id: string;
  subclass_id?: string;
  background_id: string;
  alignment_id: string;
  ability_scores: {
    base: Record<AbilityKey, number>;
    total: Record<AbilityKey, number>;
  };
  skills: {
    selected: string[];
    granted_by_race: string[];
    granted_by_background: string[];
  };
  background_language_choices: string[];
  personality: {
    traits: string[];
    ideals: string[];
    bonds: string[];
    flaws: string[];
  };
  inventory: {
    fixed_equipment: CharacterEquipmentItem[];
    selected_equipment: string[][];
    instruments: string[];
    custom_equipment?: CharacterEquipmentItem[];
    removed_equipment?: CharacterEquipmentItem[];
    currency?: CharacterCurrency;
  };
  spells: {
    cantrip_ids: string[];
    spell_ids: string[];
  };
}

export interface Character extends CreateCharacterPayload {
  _id: string;
  created_at: string;
  updated_at: string;
}

export type UpdateCharacterPayload = Partial<CreateCharacterPayload>;

export const createCharacter = (payload: CreateCharacterPayload): Promise<Character> =>
  post<Character, CreateCharacterPayload>('/characters', payload);

export const fetchCharacters = (): Promise<Character[]> => get<Character[]>('/characters');

export const fetchCharacterById = (id: string): Promise<Character> =>
  get<Character>(`/characters/${id}`);

export const updateCharacter = (
  id: string,
  payload: UpdateCharacterPayload,
): Promise<Character> => patch<Character, UpdateCharacterPayload>(`/characters/${id}`, payload);

export const deleteCharacter = (id: string): Promise<void> => remove(`/characters/${id}`);
