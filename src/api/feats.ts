import { get } from './apiClient';

export interface Feat {
  _id: string;
  name: string;
  description: string;
  prerequisite?: string | null;
  benefits: string[];
}

export const fetchFeats = (): Promise<Feat[]> => get<Feat[]>('/feats');
export const fetchFeatById = (id: string): Promise<Feat> => get<Feat>(`/feats/${id}`);
export const fetchFeatByName = (name: string): Promise<Feat[]> => get<Feat[]>(`/feats/search?name=${encodeURIComponent(name)}`);