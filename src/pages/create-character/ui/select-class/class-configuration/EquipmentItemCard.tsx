import { Box, Typography, useTheme, Chip } from '@mui/material';
import { memo } from 'react';
import type { Weapon, Armor, Item, Tool } from '../../../../../api';
import type { EquipmentType } from '../../../../../api/equipment';
import { damageIcons } from './constants';

interface EquipmentItemCardProps {
  item: Weapon | Armor | Item | Tool;
  type: EquipmentType;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export const EquipmentItemCard = memo(({
  item,
  type,
  selected,
  onSelect,
  disabled = false,
}: EquipmentItemCardProps) => {
  const theme = useTheme();

  const handleClick = () => {
    if (!disabled) onSelect();
  };

  let damageType: string | null = null;
  if (type === 'weapon') {
    damageType = (item as Weapon).damageType;
  } else if (type === 'item') {
    damageType = (item as Item).damage_type;
  }

  // Приводим к регистру, как в damageIcons (первая буква заглавная)
  const normalizedDamageType = damageType ? damageType.charAt(0).toUpperCase() + damageType.slice(1).toLowerCase() : null;
  const damageIcon = normalizedDamageType ? damageIcons[normalizedDamageType] : null;

  const renderDetails = () => {
    switch (type) {
      case 'weapon': {
        const w = item as Weapon;
        return (
          <Box sx={{ mt: 1 }}>
            {w.damage && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Урон: {w.damage} {w.damageType || ''}
              </Typography>
            )}
            {w.properties && w.properties.length > 0 && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                Свойства: {w.properties.map(p => p.name).join(', ')}
              </Typography>
            )}
            {w.cost && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                Стоимость: {w.cost}
              </Typography>
            )}
            {w.weight && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                Вес: {w.weight}
              </Typography>
            )}
          </Box>
        );
      }
      case 'armor': {
        const a = item as Armor;
        return (
          <Box sx={{ mt: 1 }}>
            {a.classArmor && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                КД: {a.classArmor}
              </Typography>
            )}
            {a.needStrong > 0 && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                Требует силы: {a.needStrong}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
              Помеха скрытности: {a.Secrecy ? 'Да' : 'Нет'}
            </Typography>
            {a.cost && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                Стоимость: {a.cost}
              </Typography>
            )}
            {a.weight && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                Вес: {a.weight}
              </Typography>
            )}
          </Box>
        );
      }
      case 'tool': {
        const t = item as Tool;
        return (
          <Box sx={{ mt: 1 }}>
            {t.detail && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                {t.detail}
              </Typography>
            )}
            {t.skills && t.skills.length > 0 && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                Навыки: {t.skills.map(s => s.name).join(', ')}
              </Typography>
            )}
            {t.cost && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                Стоимость: {t.cost}
              </Typography>
            )}
            {t.weight && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                Вес: {t.weight}
              </Typography>
            )}
          </Box>
        );
      }
      case 'item': {
        const i = item as Item;
        return (
          <Box sx={{ mt: 1 }}>
            {i.category && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Категория: {i.category}
              </Typography>
            )}
            {i.damage_dice && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                Урон: {i.damage_dice} {i.damage_type || ''}
              </Typography>
            )}
            {i.description && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                {i.description}
              </Typography>
            )}
            {i.source && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                Источник: {i.source}
              </Typography>
            )}
          </Box>
        );
      }
      default:
        return null;
    }
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        padding: '12px 16px',
        borderRadius: 2,
        border: '2px solid',
        borderColor: selected
          ? theme.palette.primary.main
          : 'rgba(255,255,255,0.08)',
        backgroundColor: selected
          ? 'rgba(170, 59, 255, 0.12)'
          : 'transparent',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.25s ease',
        '&:hover': {
          borderColor: disabled ? 'rgba(255,255,255,0.08)' : theme.palette.primary.light,
          backgroundColor: disabled ? 'transparent' : 'rgba(255,255,255,0.03)',
          transform: disabled ? 'scale(1)' : 'scale(1.02)',
        },
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {selected && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" fill={theme.palette.primary.main} />
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white" />
          </svg>
        )}
        <Typography variant="body2" sx={{ color: theme.palette.common.white, fontWeight: 500, flex: 1 }}>
          {item.name}
        </Typography>
        {damageIcon && (
          <img
            src={damageIcon}
            alt={damageType || 'тип урона'}
            width={24}
            height={24}
            style={{ flexShrink: 0 }}
          />
        )}
        <Chip
          label={type === 'weapon' ? 'Оружие' : type === 'armor' ? 'Броня' : type === 'tool' ? 'Инструмент' : 'Предмет'}
          size="small"
          sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)', ml: 'auto' }}
        />
      </Box>
      {renderDetails()}
    </Box>
  );
});

EquipmentItemCard.displayName = 'EquipmentItemCard';