import { get } from './apiClient';

export interface BackgroundFeature {
  name: string;
  description: string;
}

export interface SpecialtyTableOption {
  value: number;
  name: string;
}

export interface SpecialtyTable {
  title: string;
  description: string;
  roll: string;
  options: SpecialtyTableOption[];
}

export interface PersonalityTable {
  traits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
}

export interface Background {
  _id: string;
  name: string;
  description: string;
  skill_proficiencies: string[];
  tool_proficiencies: string[];
  languages: string[];
  equipment: string[];
  spells?: { name: string; level: string; source: string }[];
  feature: BackgroundFeature;
  specialty_tables: SpecialtyTable[];
  suggested_personality: PersonalityTable;
  parent?: string;
}

export const fetchBackgrounds = (): Promise<Background[]> => get<Background[]>('/backgrounds');
export const fetchBackgroundById = (id: string): Promise<Background> => get<Background>(`/backgrounds/${id}`);
export const fetchBackgroundByName = (name: string): Promise<Background> => get<Background>(`/backgrounds/search?name=${encodeURIComponent(name)}`);