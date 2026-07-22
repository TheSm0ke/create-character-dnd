import { get } from './apiClient';

export interface Item {
  _id: string;
  name: string;
  category: string;
  damage_dice: string | null;
  damage_type: string | null;
  description: string;
  source: string | null;
  url: string;
}

export const fetchItems = (): Promise<Item[]> => get<Item[]>('/items');
export const fetchItemById = (id: string): Promise<Item> => get<Item>(`/items/${id}`);
export const searchItems = (query: { name?: string; detail?: string }): Promise<Item[]> => {
  const params = new URLSearchParams();
  if (query.name) params.append('name', query.name);
  if (query.detail) params.append('detail', query.detail);
  return get<Item[]>(`/items/search?${params.toString()}`);
};