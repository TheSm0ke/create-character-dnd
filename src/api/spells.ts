import { get } from './apiClient';

export interface Spell {
  _id: string;
  name: string;
  level: string;
  school: string;
  casting_time: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  higher_levels?: string | null;
  damage_dice?: string | null;
  damage_type?: string | null;
  classes: string[];
  subclasses: string[];
  category: string;
  source: string;
  url: string;
}

export interface SpellsResponse {
  spells: Spell[];
  totalPages: number;
  currentPage: number;
  totalSpells: number;
}

export const fetchSpells = (page = 1, limit = 50): Promise<SpellsResponse> =>
  get<SpellsResponse>(`/spells?page=${page}&limit=${limit}`);

export const fetchSpellById = (id: string): Promise<Spell> => get<Spell>(`/spells/${id}`);

export const searchSpells = (query: {
  name?: string;
  level?: string;
  school?: string;
  classes?: string;
  damage_type?: string;
  category?: string;
}): Promise<Spell[]> => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  return get<Spell[]>(`/spells/search?${params.toString()}`);
};

export const fetchSpellsByClassAndLevel = (className: string, level: string | number): Promise<Spell[]> => {
  const url = `/spells/search?classes=${encodeURIComponent(className)}&level=${encodeURIComponent(String(level))}`;
  return get<Spell[]>(url);
};

