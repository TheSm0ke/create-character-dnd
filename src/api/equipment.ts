// src/api/equipment.ts
import { get } from './apiClient';
import type { Weapon } from './weapons';
import type { Armor } from './armors';
import type { Item } from './items';
import type { Tool } from './tools';

export type EquipmentType = 'weapon' | 'armor' | 'item' | 'tool';

export interface EquipmentSearchResponse {
  type: EquipmentType;
  data: Weapon | Armor | Item | Tool;
}

/**
 * Универсальный поиск по названию (может вернуть массив или объект с type/data)
 * Возвращает всегда массив, если ответ – массив, то это массив предметов,
 * если объект с type/data – то один предмет.
 */
export const searchEquipment = async (query: string): Promise<(Weapon | Armor | Item | Tool)[]> => {
  const response = await get<EquipmentSearchResponse | (Weapon | Armor | Item | Tool)[]>(`/equipment/search?q=${encodeURIComponent(query)}`);
  
  if (Array.isArray(response)) {
    return response;
  } else {
    // response – объект с type и data
    return [response.data];
  }
};

/**
 * Получение деталей конкретного предмета по точному имени
 * (использует тот же эндпоинт, но возвращает один объект)
 */
export const fetchEquipmentDetails = async (name: string): Promise<{ type: EquipmentType; data: Weapon | Armor | Item | Tool } | null> => {
  const response = await get<EquipmentSearchResponse | (Weapon | Armor | Item | Tool)[]>(`/equipment/search?q=${encodeURIComponent(name)}`);
  
  if (Array.isArray(response)) {
    // Если вернулся массив, ищем точное совпадение по имени
    const exact = response.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (!exact) return null;
    // Определяем тип по наличию полей
    let type: EquipmentType = 'item';
    if ('damage' in exact && 'damageType' in exact && 'properties' in exact) type = 'weapon';
    else if ('classArmor' in exact && 'needStrong' in exact) type = 'armor';
    else if ('category' in exact && 'skills' in exact) type = 'tool';
    return { type, data: exact };
  } else {
    // response – объект с type и data
    return response;
  }
};