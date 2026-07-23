// src/pages/create-character/ui/select-class/class-configuration/EquipmentDetailsRenderer.tsx
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEquipmentDetails } from './hooks/useEquipmentDetails ';
import type { Weapon, Armor, Item, Tool } from '../../../../../api';

interface Props {
  itemName: string;
}

export const EquipmentDetailsRenderer = ({ itemName }: Props) => {
  const theme = useTheme();
  const { details, loading, error } = useEquipmentDetails(itemName);

  if (loading) return <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Загрузка...</Typography>;
  if (error) return <Typography variant="caption" sx={{ color: theme.palette.error.main }}>Ошибка: {error}</Typography>;
  if (!details.data) return <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Нет данных</Typography>;

  const { type, data } = details;

  const renderWeapon = (w: Weapon) => (
    <Box>
      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Класс: {w.class}</Typography>
      {w.damage && (
        <>
          <br />
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            Урон: {w.damage} {w.damageType || ''}
          </Typography>
        </>
      )}
      {w.properties && w.properties.length > 0 && (
        <>
          <br />
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            Свойства: {w.properties.map(p => p.name).join(', ')}
          </Typography>
        </>
      )}
      {w.cost && (
        <>
          <br />
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Стоимость: {w.cost}</Typography>
        </>
      )}
      {w.weight && (
        <>
          <br />
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Вес: {w.weight}</Typography>
        </>
      )}
    </Box>
  );

  const renderArmor = (a: Armor) => (
    <Box>
      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Тип: {a.class}</Typography>
      {a.classArmor && (
        <>
          <br />
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>КД: {a.classArmor}</Typography>
        </>
      )}
      {a.needStrong !== undefined && a.needStrong > 0 && (
        <>
          <br />
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            Требует силы: {a.needStrong}
          </Typography>
        </>
      )}
      <br />
      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
        Помеха скрытности: {a.Secrecy ? 'Да' : 'Нет'}
      </Typography>
      {a.cost && (
        <>
          <br />
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Стоимость: {a.cost}</Typography>
        </>
      )}
      {a.weight && (
        <>
          <br />
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Вес: {a.weight}</Typography>
        </>
      )}
    </Box>
  );

  const renderTool = (t: Tool) => (
    <Box>
      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Категория: {t.category}</Typography>
      {t.detail && (
        <>
          <br />
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{t.detail}</Typography>
        </>
      )}
      {t.skills && t.skills.length > 0 && (
        <>
          <br />
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            Навыки: {t.skills.map(s => s.name).join(', ')}
          </Typography>
        </>
      )}
      {t.cost && (
        <>
          <br />
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Стоимость: {t.cost}</Typography>
        </>
      )}
      {t.weight && (
        <>
          <br />
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Вес: {t.weight}</Typography>
        </>
      )}
    </Box>
  );

  const renderItem = (i: Item) => (
    <Box>
      {i.category && (
        <>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Категория: {i.category}</Typography>
          <br />
        </>
      )}
      {i.damage_dice && (
        <>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            Урон: {i.damage_dice} {i.damage_type || ''}
          </Typography>
          <br />
        </>
      )}
      {i.description && (
        <>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{i.description}</Typography>
          <br />
        </>
      )}
      {i.source && (
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Источник: {i.source}</Typography>
      )}
    </Box>
  );

  switch (type) {
    case 'weapon': return renderWeapon(data as Weapon);
    case 'armor': return renderArmor(data as Armor);
    case 'tool': return renderTool(data as Tool);
    case 'item': return renderItem(data as Item);
    default: return <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Неизвестный тип</Typography>;
  }
};