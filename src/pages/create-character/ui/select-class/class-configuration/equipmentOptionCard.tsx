import React from 'react';
import { Box, Typography, Paper, Checkbox } from '@mui/material';
import type { Weapon, Armor, Item, Tool, PackData, PackItem } from '../../../../../api';

type EquipmentItem = Weapon | Armor | Item | Tool | PackData;
type AnyItem = Item | PackItem;

interface EquipmentOptionCardProps {
  item: EquipmentItem;
  type: 'weapon' | 'armor' | 'item' | 'tool' | 'pack';
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export const EquipmentOptionCard: React.FC<EquipmentOptionCardProps> = ({
  item,
  type,
  selected,
  onSelect,
  disabled = false,
}) => {
  const renderPackDetails = (pack: PackData) => (
    <Box sx={{ mt: 1, pl: 1 }}>
      <Typography variant="caption" color="textSecondary">
        Состав набора:
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2, mt: 0.5 }}>
        {pack.items.map((i, idx) => (
          <Typography component="li" variant="body2" key={idx} sx={{ listStyle: 'disc' }}>
            {i.name} {i.count > 1 && `(×${i.count})`} — {i.cost}, {i.weight}
          </Typography>
        ))}
      </Box>
      <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
        Общая стоимость: {pack.cost}, общий вес: {pack.weight}
      </Typography>
    </Box>
  );

  const renderWeaponDetails = (weapon: Weapon) => (
    <Box sx={{ mt: 1 }}>
      <Typography variant="body2">Урон: {weapon.damage || '—'}</Typography>
      <Typography variant="body2">Тип урона: {weapon.damageType || '—'}</Typography>
      <Typography variant="body2">
        Свойства: {weapon.properties.map((p) => p.name).join(', ') || '—'}
      </Typography>
      <Typography variant="body2">Стоимость: {weapon.cost}</Typography>
      <Typography variant="body2">Вес: {weapon.weight}</Typography>
    </Box>
  );

  const renderArmorDetails = (armor: Armor) => (
    <Box sx={{ mt: 1 }}>
      <Typography variant="body2">КД: {armor.classArmor}</Typography>
      <Typography variant="body2">Тип: {armor.class}</Typography>
      {armor.needStrong > 0 && (
        <Typography variant="body2">Требуемая Сила: {armor.needStrong}</Typography>
      )}
      <Typography variant="body2">
        Помеха скрытности: {armor.Secrecy ? 'Да' : 'Нет'}
      </Typography>
      <Typography variant="body2">Стоимость: {armor.cost}</Typography>
      <Typography variant="body2">Вес: {armor.weight}</Typography>
    </Box>
  );

  const renderItemDetails = (item: AnyItem) => {
    const isPackItem = 'cost' in item && 'weight' in item && 'detail' in item;
    return (
      <Box sx={{ mt: 1 }}>
        {isPackItem ? (
          // Это предмет из набора (PackItem)
          <>
            {item.detail && <Typography variant="body2">{item.detail}</Typography>}
            <Typography variant="body2">Стоимость: {item.cost}</Typography>
            <Typography variant="body2">Вес: {item.weight}</Typography>
            {'count' in item && item.count > 1 && (
              <Typography variant="body2">Количество: {item.count}</Typography>
            )}
          </>
        ) : (
          // Это обычный Item из API
          <>
            {item.description && <Typography variant="body2">{item.description}</Typography>}
            {item.damage_dice && (
              <Typography variant="body2">Кость урона: {item.damage_dice}</Typography>
            )}
            {item.damage_type && (
              <Typography variant="body2">Тип урона: {item.damage_type}</Typography>
            )}
            <Typography variant="body2">Категория: {item.category}</Typography>
          </>
        )}
      </Box>
    );
  };

  const renderToolDetails = (tool: Tool) => (
    <Box sx={{ mt: 1 }}>
      {tool.detail && <Typography variant="body2">{tool.detail}</Typography>}
      <Typography variant="body2">Стоимость: {tool.cost}</Typography>
      <Typography variant="body2">Вес: {tool.weight}</Typography>
      {tool.properties.length > 0 && (
        <Typography variant="body2">
          Свойства: {tool.properties.map((p) => p.name).join(', ')}
        </Typography>
      )}
    </Box>
  );

  const renderDetails = () => {
    switch (type) {
      case 'weapon':
        return renderWeaponDetails(item as Weapon);
      case 'armor':
        return renderArmorDetails(item as Armor);
      case 'tool':
        return renderToolDetails(item as Tool);
      case 'item':
        return renderItemDetails(item as AnyItem);
      case 'pack':
        return renderPackDetails(item as PackData);
      default:
        return null;
    }
  };

  return (
    <Paper
      elevation={selected ? 4 : 1}
      sx={{
        p: 2,
        border: selected ? '2px solid #b71c1c' : '2px solid transparent',
        borderRadius: 2,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s',
        '&:hover': disabled ? {} : { borderColor: '#b71c1c', bgcolor: 'rgba(255,255,255,0.03)' },
      }}
      onClick={disabled ? undefined : onSelect}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body1" sx={{ fontWeight: selected ? 600 : 400 }}>
          {item.name}
        </Typography>
        <Checkbox checked={selected} disabled={disabled} />
      </Box>
      {selected && renderDetails()}
    </Paper>
  );
};