import { get } from './apiClient';

export interface WeaponProperty {
  name: string;
  info: string;
}

export interface Weapon {
  _id: string;
  name: string;
  class: string;          // "простое" или "воинское"
  cost: string;           // например "2 зм"
  damage: string | null;  // "1к8" или null
  damageType: string | null; // "рубящий" или null
  properties: WeaponProperty[];
  weight: string;         // "1.5" или "2"
}

export const fetchWeapons = (): Promise<Weapon[]> => get<Weapon[]>('/weapons');
export const fetchWeaponById = (id: string): Promise<Weapon> => get<Weapon>(`/weapons/${id}`);
export const searchWeapons = (query: { name?: string; class?: string; damageType?: string }): Promise<Weapon[]> => {
  const params = new URLSearchParams();
  if (query.name) params.append('name', query.name);
  if (query.class) params.append('class', query.class);
  if (query.damageType) params.append('damageType', query.damageType);
  return get<Weapon[]>(`/weapons/search?${params.toString()}`);
};