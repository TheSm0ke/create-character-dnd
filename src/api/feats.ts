import { get } from './apiClient';

export interface Feat {
  _id: string;
  name: string;
  description: string;
  prerequisite?: string | null;
  benefits: string[];
  ability_bonuses: Array<{
    abilities: Array<'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'>;
    bonus: number;
    choose: number;
    maximum: number;
  }>;
}

export const fetchFeats = (): Promise<Feat[]> => get<Feat[]>('/feats');
export const fetchFeatById = (id: string): Promise<Feat> => get<Feat>(`/feats/${id}`);
export const fetchFeatByName = (name: string): Promise<Feat[]> => get<Feat[]>(`/feats/search?name=${encodeURIComponent(name)}`);
