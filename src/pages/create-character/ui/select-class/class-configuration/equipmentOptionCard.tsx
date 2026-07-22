import { Box, Typography, useTheme, IconButton, Collapse } from '@mui/material';
import { useState } from 'react';
import type { EquipmentItem } from '../../../../../api/classes';
import { useEquipmentDetails } from './hooks/useEquipmentDetails ';
import type { Armor, Item, Tool, Weapon } from '../../../../../api';

interface EquipmentOptionCardProps {
  items: EquipmentItem[];
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const ExpandMoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.59 8.59L12 13.17L7.41 8.59L6 10L12 16L18 10L16.59 8.59Z" fill="currentColor" />
  </svg>
);

export const EquipmentOptionCard = ({
  items,
  selected,
  onToggle,
  disabled = false,
}: EquipmentOptionCardProps) => {
  const theme = useTheme();
  const [showDetails, setShowDetails] = useState(false);

  const itemName = items[0]?.name || '';
  const { details, loading, error } = useEquipmentDetails(selected ? itemName : ''); // загружаем только если выбрано

  const handleToggle = () => {
    if (!disabled) onToggle();
  };

  const handleDetailsToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

  // Рендеринг деталей в зависимости от типа
  const renderDetails = () => {
    if (loading) return <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Загрузка...</Typography>;
    if (error) return <Typography variant="caption" sx={{ color: theme.palette.error.main }}>Ошибка: {error}</Typography>;
    if (!details.data) return <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Нет данных</Typography>;

    const { type, data } = details;

    switch (type) {
      case 'weapon': {
        const w = data as Weapon;
        return (
          <Box>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Класс: {w.class}
            </Typography>
            <br />
            {w.damage && (
              <>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Урон: {w.damage} {w.damageType || ''}
                </Typography>
                <br />
              </>
            )}
            {w.properties.length > 0 && (
              <>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Свойства: {w.properties.map(p => p.name).join(', ')}
                </Typography>
                <br />
              </>
            )}
            {w.cost && <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Стоимость: {w.cost}</Typography>}
            {w.weight && <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Вес: {w.weight} фунтов</Typography>}
          </Box>
        );
      }
      case 'armor': {
        const a = data as Armor;
        return (
          <Box>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Тип: {a.class}
            </Typography>
            <br />
            {a.classArmor && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                КД: {a.classArmor}
              </Typography>
            )}
            <br />
            {a.needStrong > 0 && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Требует силы: {a.needStrong}
              </Typography>
            )}
            <br />
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Помеха скрытности: {a.Secrecy ? 'Да' : 'Нет'}
            </Typography>
            <br />
            {a.cost && <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Стоимость: {a.cost}</Typography>}
            {a.weight && <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Вес: {a.weight} фунтов</Typography>}
          </Box>
        );
      }
      case 'tool': {
        const t = data as Tool;
        return (
          <Box>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Категория: {t.category}
            </Typography>
            <br />
            {t.detail && <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{t.detail}</Typography>}
            <br />
            {t.skills.length > 0 && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Навыки: {t.skills.map(s => s.name).join(', ')}
              </Typography>
            )}
            <br />
            {t.cost && <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Стоимость: {t.cost}</Typography>}
            {t.weight && <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Вес: {t.weight} фунтов</Typography>}
          </Box>
        );
      }
      case 'item': {
        const i = data as Item;
        return (
          <Box>
            {i.category && <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Категория: {i.category}</Typography>}
            <br />
            {i.damage_dice && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Урон: {i.damage_dice} {i.damage_type || ''}
              </Typography>
            )}
            <br />
            {i.description && <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{i.description}</Typography>}
            <br />
            {i.source && <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Источник: {i.source}</Typography>}
          </Box>
        );
      }
      default:
        return <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Неизвестный тип предмета</Typography>;
    }
  };

  return (
    <Box
      onClick={handleToggle}
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
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        minHeight: 50,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {selected && (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            style={{ flexShrink: 0 }}
          >
            <circle cx="12" cy="12" r="10" fill={theme.palette.primary.main} />
            <path
              d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
              fill="white"
            />
          </svg>
        )}
        <Typography variant="body2" sx={{ color: theme.palette.common.white, flex: 1 }}>
          {items.map(item => `${item.name} ${item.count > 1 ? `(×${item.count})` : ''}`).join(', ')}
        </Typography>
        {selected && (
          <IconButton
            size="small"
            onClick={handleDetailsToggle}
            sx={{
              color: theme.palette.text.secondary,
              transition: 'transform 0.3s',
              transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        )}
      </Box>

      <Collapse in={showDetails && selected}>
        <Box sx={{ mt: 1, p: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
          {renderDetails()}
        </Box>
      </Collapse>
    </Box>
  );
};