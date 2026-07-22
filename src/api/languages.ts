import { get } from './apiClient';

export interface Language {
  _id: string;
  name: string;
  typical_speakers?: string;
  script?: string;
  rarity: string;
  description: string;
}

export const fetchLanguages = (): Promise<Language[]> => get<Language[]>('/languages');
export const fetchLanguageById = (id: string): Promise<Language> => get<Language>(`/languages/${id}`);
export const fetchLanguageByName = (name: string): Promise<Language[]> => get<Language[]>(`/languages/search?name=${encodeURIComponent(name)}`);