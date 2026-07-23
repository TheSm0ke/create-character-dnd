import type { EquipmentType } from '../../../../../../api/equipment';

export const getItemType = (item: unknown): EquipmentType => {
  const obj = item as Record<string, unknown>;
  if ('damage' in obj && 'damageType' in obj && 'properties' in obj) return 'weapon';
  if ('classArmor' in obj && 'needStrong' in obj) return 'armor';
  if ('category' in obj && 'skills' in obj) return 'tool';
  return 'item';
};