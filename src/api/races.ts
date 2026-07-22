import { get } from './apiClient';

export interface RaceAbilityBonus {
  ability: string;
  bonus: number;
}

export interface RaceTrait {
  name: string;
  description: string;
}

export interface Subrace {
  name: string;
  ability_bonuses: RaceAbilityBonus[];
  traits: RaceTrait[];
}

export interface Race {
  _id: string;
  name: string;
  description: string;
  ability_bonuses: RaceAbilityBonus[];
  speed: number;
  size: string;
  languages: { name: string; source: string }[];
  traits: RaceTrait[];
  subraces: Subrace[];
}

export const fetchRaces = (): Promise<Race[]> => get<Race[]>('/races');
export const fetchRaceById = (id: string): Promise<Race> => get<Race>(`/races/${id}`);
export const fetchRaceByName = (name: string): Promise<Race[]> => get<Race[]>(`/races/search?name=${encodeURIComponent(name)}`);