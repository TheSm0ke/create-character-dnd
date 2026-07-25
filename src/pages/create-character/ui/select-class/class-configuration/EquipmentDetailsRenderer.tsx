// src/pages/create-character/ui/select-class/class-configuration/EquipmentDetailsRenderer.tsx
import { Box, Typography, useTheme } from '@mui/material';
import type { Weapon, Armor, Item, Tool, PackData, PackItem  } from '../../../../../api';

// Общий тип для предмета (может быть Item или PackItem)
type AnyItem = Item | PackItem;

interface EquipmentDetailsRendererProps {
  type: 'weapon' | 'armor' | 'item' | 'tool' | 'pack';
  data: Weapon | Armor | AnyItem | Tool | PackData;
}

export const EquipmentDetailsRenderer = ({ type, data }: EquipmentDetailsRendererProps) => {
  const theme = useTheme();

  const renderWeapon = (weapon: Weapon) => (
    <Box sx={{ mt: 1 }}>
      <Typography variant="body2">
        <strong>Урон:</strong> {weapon.damage || '—'}
      </Typography>
      <Typography variant="body2">
        <strong>Тип урона:</strong> {weapon.damageType || '—'}
      </Typography>
      <Typography variant="body2">
        <strong>Свойства:</strong> {weapon.properties.map(p => p.name).join(', ') || '—'}
      </Typography>
      <Typography variant="body2">
        <strong>Стоимость:</strong> {weapon.cost}
      </Typography>
      <Typography variant="body2">
        <strong>Вес:</strong> {weapon.weight}
      </Typography>
    </Box>
  );

  const renderArmor = (armor: Armor) => (
    <Box sx={{ mt: 1 }}>
      <Typography variant="body2">
        <strong>Класс доспеха:</strong> {armor.classArmor}
      </Typography>
      <Typography variant="body2">
        <strong>Тип:</strong> {armor.class}
      </Typography>
      {armor.needStrong > 0 && (
        <Typography variant="body2">
          <strong>Требуемая Сила:</strong> {armor.needStrong}
        </Typography>
      )}
      <Typography variant="body2">
        <strong>Помеха скрытности:</strong> {armor.Secrecy ? 'Да' : 'Нет'}
      </Typography>
      <Typography variant="body2">
        <strong>Стоимость:</strong> {armor.cost}
      </Typography>
      <Typography variant="body2">
        <strong>Вес:</strong> {armor.weight}
      </Typography>
    </Box>
  );

  // Рендеринг обычного предмета из API (Item) или предмета из набора (PackItem)
  const renderItem = (item: AnyItem) => {
    const isPackItem = 'cost' in item && 'weight' in item && 'detail' in item;
    return (
      <Box sx={{ mt: 1 }}>
        {isPackItem ? (
          // Это предмет из набора (PackItem)
          <>
            {item.detail && (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {item.detail}
              </Typography>
            )}
            <Typography variant="body2">
              <strong>Стоимость:</strong> {item.cost}
            </Typography>
            <Typography variant="body2">
              <strong>Вес:</strong> {item.weight}
            </Typography>
            {'count' in item && item.count > 1 && (
              <Typography variant="body2">
                <strong>Количество:</strong> {item.count}
              </Typography>
            )}
          </>
        ) : (
          // Это обычный Item из API
          <>
            {item.description && (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {item.description}
              </Typography>
            )}
            {item.damage_dice && (
              <Typography variant="body2">
                <strong>Кость урона:</strong> {item.damage_dice}
              </Typography>
            )}
            {item.damage_type && (
              <Typography variant="body2">
                <strong>Тип урона:</strong> {item.damage_type}
              </Typography>
            )}
            <Typography variant="body2">
              <strong>Категория:</strong> {item.category}
            </Typography>
          </>
        )}
      </Box>
    );
  };

  const renderTool = (tool: Tool) => (
    <Box sx={{ mt: 1 }}>
      {tool.detail && (
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {tool.detail}
        </Typography>
      )}
      <Typography variant="body2">
        <strong>Стоимость:</strong> {tool.cost}
      </Typography>
      <Typography variant="body2">
        <strong>Вес:</strong> {tool.weight}
      </Typography>
      {tool.properties.length > 0 && (
        <>
          <Typography variant="body2">
            <strong>Свойства:</strong>
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {tool.properties.map((p, idx) => (
              <Typography component="li" variant="body2" key={idx}>
                {p.name}: {p.info}
              </Typography>
            ))}
          </Box>
        </>
      )}
      {tool.skills.length > 0 && (
        <>
          <Typography variant="body2">
            <strong>Навыки:</strong>
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {tool.skills.map((s, idx) => (
              <Typography component="li" variant="body2" key={idx}>
                {s.name} (Сл {s.difficulty})
              </Typography>
            ))}
          </Box>
        </>
      )}
    </Box>
  );

  const renderPack = (pack: PackData) => (
    <Box sx={{ mt: 1 }}>
      <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
        Состав набора:
      </Typography>
      {pack.items.map((item: PackItem, index: number) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            py: 0.5,
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <Typography variant="body2">
            {item.name} {item.count > 1 && `(×${item.count})`}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            {item.cost} • {item.weight}
          </Typography>
        </Box>
      ))}
      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1, display: 'block' }}>
        Общая стоимость: {pack.cost} • Общий вес: {pack.weight}
      </Typography>
    </Box>
  );

  switch (type) {
    case 'weapon':
      return renderWeapon(data as Weapon);
    case 'armor':
      return renderArmor(data as Armor);
    case 'tool':
      return renderTool(data as Tool);
    case 'item':
      return renderItem(data as AnyItem);
    case 'pack':
      return renderPack(data as PackData);
    default:
      return <Typography variant="body2">Неизвестный тип снаряжения</Typography>;
  }
};