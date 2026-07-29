// src/api/equipment.ts
import { get } from './apiClient';
import type { Weapon } from './weapons';
import type { Armor } from './armors';
import type { Item } from './items';
import type { Tool } from './tools';

export type EquipmentType = 'weapon' | 'armor' | 'item' | 'tool' | 'pack' | 'trade_good';

export interface TradeGoodEquipment {
  _id: string;
  name: string;
  category: 'Торговый товар';
  weight?: string;
  detail: string;
  value_cp: number;
}

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
  data: Weapon | Armor | Item | Tool | TradeGoodEquipment | PackData | (Weapon | Armor | Item | Tool | TradeGoodEquipment)[];
};

export const fetchEquipmentDetails = async (
  query: string,
): Promise<{
  type: EquipmentType;
  data: Weapon | Armor | Item | Tool | TradeGoodEquipment | null;
} | null> => {
  const response = await get<EquipmentSearchResponse | EquipmentSearchResponse[]>(
    `/equipment/search?q=${encodeURIComponent(query)}`,
  );
  const entry = Array.isArray(response) ? response[0] : response;

  if (!entry) {
    return null;
  }

  if (Array.isArray(entry.data)) {
    return { type: entry.type, data: entry.data[0] ?? null };
  }

  if (entry.type === 'pack') {
    return { type: entry.type, data: null };
  }

  return { type: entry.type, data: entry.data as Weapon | Armor | Item | Tool | TradeGoodEquipment };
};

export const searchEquipment = async (
  query: string
): Promise<{ items: (Weapon | Armor | Item | Tool | TradeGoodEquipment)[]; isPack: boolean }> => {
  if (!query || query.trim() === '') {
    return { items: [], isPack: false };
  }

  try {
    const response = await get<EquipmentSearchResponse | EquipmentSearchResponse[]>(
      `/equipment/search?q=${encodeURIComponent(query)}`
    );

    if (Array.isArray(response)) {
      const items: (Weapon | Armor | Item | Tool | TradeGoodEquipment)[] = [];
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
        } else if (Array.isArray(entry.data)) {
          items.push(...(entry.data as (Weapon | Armor | Item | Tool | TradeGoodEquipment)[]));
        } else {
          items.push(entry.data as Weapon | Armor | Item | Tool | TradeGoodEquipment);
        }
      }
      return { items, isPack };
    }

    if (response && typeof response === 'object' && 'type' in response && 'data' in response) {
      const data = response.data;

      if (Array.isArray(data)) {
        return { items: data as (Weapon | Armor | Item | Tool | TradeGoodEquipment)[], isPack: false };
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

      return { items: [data as Weapon | Armor | Item | Tool | TradeGoodEquipment], isPack: false };
    }

    return { items: [], isPack: false };
  } catch (error) {
    console.error('Ошибка в searchEquipment:', error);
    return { items: [], isPack: false };
  }
};
