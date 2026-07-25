import type { PackItem, Weapon, Armor, Item, Tool } from '../../../../../../api';

export const getItemType = (
  item: Weapon | Armor | Item | Tool | PackItem | null | undefined
): 'weapon' | 'armor' | 'item' | 'tool' => {
  if (!item) return 'item';
  if ('damage' in item) return 'weapon';
  // Броня: проверяем наличие специфических полей
  if ('classArmor' in item && 'needStrong' in item) return 'armor';
  if ('properties' in item && 'skills' in item) return 'tool';
  return 'item';
};