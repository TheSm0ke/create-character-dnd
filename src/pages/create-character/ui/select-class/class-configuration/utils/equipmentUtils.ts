import type { Weapon, Armor, Item, Tool, PackItem } from '../../../../../../api';

export const getItemType = (
  item: Weapon | Armor | Item | Tool | PackItem | null | undefined
): 'weapon' | 'armor' | 'item' | 'tool' => {
  if (!item) return 'item';
  if ('damage' in item) return 'weapon';
  if ('ac' in item) return 'armor';
  if ('properties' in item && 'skills' in item) return 'tool';
  return 'item';
};