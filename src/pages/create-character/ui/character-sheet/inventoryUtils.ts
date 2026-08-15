import type { Armor } from '../../../../api';

const normalize = (value: string) => value.trim().toLocaleLowerCase('ru-RU');

export interface InventoryEntry {
  name: string;
  count: number;
  editableCount: number;
  type: string;
  weight?: string;
  details: string;
  sourcePack?: string;
  sourceName: string;
}

export interface SearchInventoryItem {
  _id: string;
  name: string;
  count?: number;
  weight?: string;
  detail?: string;
  description?: string;
  category?: string;
  type?: string;
  damage?: string | null;
  damageType?: string | null;
  classArmor?: string;
  needStrong?: number;
  Secrecy?: boolean;
  properties?: { name: string }[];
  skills?: unknown[];
}

export const calculateArmorClass = (armors: Armor[], dexterityModifier: number) => {
  const shield = armors.find((armor) => normalize(armor.name).includes('щит'));
  const wornArmor = armors.find((armor) => !normalize(armor.name).includes('щит'));
  const shieldBonus = Number(shield?.classArmor.match(/\d+/)?.[0] ?? 0);

  if (!wornArmor) return 10 + dexterityModifier + shieldBonus;

  const baseArmorClass = Number(wornArmor.classArmor.match(/\d+/)?.[0] ?? 10);
  const armorText = normalize(wornArmor.classArmor);
  const dexterityCap = Number(armorText.match(/максимум\s*(\d+)/)?.[1] ?? dexterityModifier);
  const dexterityBonus = armorText.includes('лов')
    ? Math.min(dexterityModifier, dexterityCap)
    : 0;

  return baseArmorClass + dexterityBonus + shieldBonus;
};

export const getWeightInPounds = (weight?: string) => {
  if (!weight) return undefined;

  const normalizedWeight = weight.replace(',', '.');
  const fraction = normalizedWeight.match(/(\d+)\s*\/\s*(\d+)/);
  if (fraction) return Number(fraction[1]) / Number(fraction[2]);

  const value = normalizedWeight.match(/\d+(?:\.\d+)?/)?.[0];
  return value ? Number(value) : undefined;
};

const getInventoryTypeLabel = (type?: string) => {
  if (type?.toLocaleLowerCase('ru-RU') === 'item') return 'Предмет';
  return type || 'Снаряжение';
};

export const getInventoryEntryFromSearchItem = (
  item: SearchInventoryItem,
  count: number,
  editableCount: number,
  sourceName: string,
  sourcePack?: string,
): InventoryEntry => {
  if (item.damage !== undefined) {
    return {
      name: item.name,
      count,
      editableCount,
      sourceName,
      type: 'Оружие',
      weight: item.weight,
      details: `Урон: ${item.damage ?? '—'} ${item.damageType ?? ''}. ${item.properties?.map((property) => property.name).join(', ') || 'Без особых свойств.'}`,
      sourcePack,
    };
  }

  if (item.classArmor) {
    return {
      name: item.name,
      count,
      editableCount,
      sourceName,
      type: 'Броня',
      weight: item.weight,
      details: `КД: ${item.classArmor}. Требование Силы: ${item.needStrong || 'нет'}. Помеха скрытности: ${item.Secrecy ? 'да' : 'нет'}.`,
      sourcePack,
    };
  }

  return {
    name: item.name,
    count,
    editableCount,
    sourceName,
    type: getInventoryTypeLabel(item.category || item.type),
    weight: item.weight,
    details: item.detail || item.description || 'Описание отсутствует в справочнике.',
    sourcePack,
  };
};

export const mergeInventoryEntries = (entries: InventoryEntry[]): InventoryEntry[] => {
  const entriesByName = new Map<string, InventoryEntry>();

  entries.forEach((entry) => {
    const key = normalize(entry.name);
    const current = entriesByName.get(key);
    if (!current) {
      entriesByName.set(key, { ...entry, sourceName: entry.name });
      return;
    }

    const sourcePacks = [current.sourcePack, entry.sourcePack]
      .flatMap((sourcePack) => sourcePack?.split(', ') ?? []);
    const sourcePack = [...new Set(sourcePacks)].join(', ') || undefined;
    const entryWithDetails = !current.weight && entry.weight ? entry : current;

    entriesByName.set(key, {
      ...entryWithDetails,
      name: current.name,
      sourceName: current.name,
      count: current.count + entry.count,
      editableCount: current.editableCount + entry.editableCount,
      sourcePack,
    });
  });

  return [...entriesByName.values()];
};
