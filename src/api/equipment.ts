// src/api/equipment.ts
import { get } from './apiClient';
import type { Weapon } from './weapons';
import type { Armor } from './armors';
import type { Item } from './items';
import type { Tool } from './tools';

export type EquipmentType = 'weapon' | 'armor' | 'item' | 'tool' | 'pack';

export interface PackItem {
  name: string;
  cost: string;
  weight: string;
  detail: string;
  count: number;
}

export interface PackData {
  _id: string;
  name: string;
  cost: string;
  weight: string;
  items: PackItem[];
}

export type EquipmentSearchResponse = {
  type: EquipmentType;
  data: Weapon | Armor | Item | Tool | PackData | (Weapon | Armor | Item | Tool)[];
};

export const searchEquipment = async (
  query: string
): Promise<{ items: (Weapon | Armor | Item | Tool)[]; isPack: boolean }> => {
  if (!query || query.trim() === '') {
    return { items: [], isPack: false };
  }

  try {
    const response = await get<EquipmentSearchResponse | EquipmentSearchResponse[]>(
      `/equipment/search?q=${encodeURIComponent(query)}`
    );

    if (Array.isArray(response)) {
      const items: (Weapon | Armor | Item | Tool)[] = [];
      let isPack = false;
      for (const entry of response) {
        if (entry.type === 'pack' && entry.data && typeof entry.data === 'object' && 'items' in entry.data) {
          isPack = true;
          const packItems = (entry.data as PackData).items.map((packItem) => ({
            _id: `${(entry.data as PackData)._id}-${packItem.name}`,
            name: packItem.name,
            cost: packItem.cost,
            weight: packItem.weight,
            detail: packItem.detail || '',
            count: packItem.count,
            type: 'item' as const,
          })) as unknown as (Weapon | Armor | Item | Tool)[];
          items.push(...packItems);
        } else {
          items.push(entry.data as Weapon | Armor | Item | Tool);
        }
      }
      return { items, isPack };
    }

    if (response && typeof response === 'object' && 'type' in response && 'data' in response) {
      const data = response.data;

      if (Array.isArray(data)) {
        return { items: data as (Weapon | Armor | Item | Tool)[], isPack: false };
      }

      if (data && typeof data === 'object' && 'items' in data) {
        const packData = data as PackData;
        const items = packData.items.map((packItem) => ({
          _id: `${packData._id}-${packItem.name}`,
          name: packItem.name,
          cost: packItem.cost,
          weight: packItem.weight,
          detail: packItem.detail || '',
          count: packItem.count,
          type: 'item' as const,
        })) as unknown as (Weapon | Armor | Item | Tool)[];
        return { items, isPack: true };
      }

      return { items: [data as Weapon | Armor | Item | Tool], isPack: false };
    }

    return { items: [], isPack: false };
  } catch (error) {
    console.error('Ошибка в searchEquipment:', error);
    return { items: [], isPack: false };
  }
};