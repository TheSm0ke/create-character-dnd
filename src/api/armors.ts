// src/api/armors.ts
import { get } from './apiClient';

export interface Armor {
  _id: string;
  name: string;
  class: string;          // "Лёгкий доспех", "Средний доспех", "Тяжёлый доспех"
  classArmor: string;     // например "11 + модификатор Лов"
  cost: string;
  needStrong: number;     // требование силы (0 если нет)
  Secrecy: boolean;       // помеха скрытности
  weight: string;
}

export const fetchArmors = (): Promise<Armor[]> => get<Armor[]>('/armors');
export const fetchArmorById = (id: string): Promise<Armor> => get<Armor>(`/armors/${id}`);
export const searchArmors = (query: { name?: string; class?: string }): Promise<Armor[]> => {
  const params = new URLSearchParams();
  if (query.name) params.append('name', query.name);
  if (query.class) params.append('class', query.class);
  return get<Armor[]>(`/armors/search?${params.toString()}`);
};