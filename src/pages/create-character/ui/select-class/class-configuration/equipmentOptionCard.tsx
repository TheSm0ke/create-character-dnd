// src/pages/create-character/ui/select-class/class-configuration/equipmentOptionCard.tsx
import { Box, Typography, useTheme, IconButton, Collapse, OutlinedInput, InputAdornment } from '@mui/material';
import { useState, useEffect, useMemo } from 'react';
import { searchEquipment } from '../../../../../api/equipment';
import { EquipmentItemCard } from './EquipmentItemCard';
import type { EquipmentItem } from '../../../../../api/classes';
import type { Weapon, Armor, Item, Tool } from '../../../../../api';
import type { EquipmentType } from '../../../../../api/equipment';

const ExpandMoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.59 8.59L12 13.17L7.41 8.59L6 10L12 16L18 10L16.59 8.59Z" fill="currentColor" />
  </svg>
);

const searchIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" />
  </svg>
);

interface Props {
  items: EquipmentItem[];
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

// Функция определения типа предмета по полям (без использования any)
const getItemType = (item: unknown): EquipmentType => {
  const obj = item as Record<string, unknown>;
  if ('damage' in obj && 'damageType' in obj && 'properties' in obj) return 'weapon';
  if ('classArmor' in obj && 'needStrong' in obj) return 'armor';
  if ('category' in obj && 'skills' in obj) return 'tool';
  return 'item';
};

export const EquipmentOptionCard = ({
  items,
  selected,
  onToggle,
  disabled = false,
}: Props) => {
  const theme = useTheme();
  const [showDetails, setShowDetails] = useState(false);
  const [specificItems, setSpecificItems] = useState<(Weapon | Armor | Item | Tool)[]>([]);
  const [loadingSpecific, setLoadingSpecific] = useState(false);
  const [selectedSpecificIndex, setSelectedSpecificIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const itemName = items[0]?.name || '';

  useEffect(() => {
    if (!selected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSpecificItems([]);
       
      setSelectedSpecificIndex(null);
       
      setSearchQuery('');
      return;
    }

    const fetchItems = async () => {
      setLoadingSpecific(true);
      try {
        const results = await searchEquipment(itemName);
        setSpecificItems(results);
        if (results.length === 1) {
          setSelectedSpecificIndex(0);
        } else {
          setSelectedSpecificIndex(null);
        }
        setSearchQuery('');
      } catch {
        setSpecificItems([]);
        setSelectedSpecificIndex(null);
      } finally {
        setLoadingSpecific(false);
      }
    };

    fetchItems();
  }, [selected, itemName]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return specificItems;
    const query = searchQuery.trim().toLowerCase();
    return specificItems.filter(item => item.name.toLowerCase().includes(query));
  }, [specificItems, searchQuery]);

  const handleToggle = () => {
    if (!disabled) onToggle();
  };

  const handleDetailsToggle = () => {
    setShowDetails(!showDetails);
  };

  const handleSelectItem = (index: number) => {
    setSelectedSpecificIndex(index);
  };

  const selectedItem = selectedSpecificIndex !== null ? specificItems[selectedSpecificIndex] : null;

  return (
    <Box
      onClick={handleToggle}
      sx={{
        padding: '12px 16px',
        borderRadius: 2,
        border: '2px solid',
        borderColor: selected ? theme.palette.primary.main : 'rgba(255,255,255,0.08)',
        backgroundColor: selected ? 'rgba(170, 59, 255, 0.12)' : 'transparent',
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" fill={theme.palette.primary.main} />
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white" />
          </svg>
        )}
        <Typography variant="body2" sx={{ color: theme.palette.common.white, flex: 1 }}>
          {items.map(item => `${item.name} ${item.count > 1 ? `(×${item.count})` : ''}`).join(', ')}
          {selected && selectedItem && (
            <span style={{ color: theme.palette.primary.main, marginLeft: 8 }}>
              → {selectedItem.name}
            </span>
          )}
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
          {specificItems.length > 0 && (
            <OutlinedInput
              placeholder="Поиск по названию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              startAdornment={
                <InputAdornment position="start" sx={{ color: theme.palette.text.secondary }}>
                  {searchIcon}
                </InputAdornment>
              }
              sx={{
                mt: 1,
                width: '100%',
                color: theme.palette.common.white,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
              }}
            />
          )}
          {loadingSpecific ? (
            <Typography sx={{ color: theme.palette.text.secondary, mt: 1 }}>Загрузка...</Typography>
          ) : filteredItems.length === 0 ? (
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
              {searchQuery ? 'Нет предметов по запросу' : 'Нет доступных предметов'}
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              {filteredItems.map((item, index) => {
                const type = getItemType(item);
                const isSelected = selectedSpecificIndex === index;
                return (
                  <EquipmentItemCard
                    key={index}
                    item={item}
                    type={type}
                    selected={isSelected}
                    onSelect={() => handleSelectItem(index)}
                  />
                );
              })}
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};