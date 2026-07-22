import { memo, useMemo } from 'react';
import { Box, Typography, Button, Chip, OutlinedInput, InputAdornment } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { Spell } from '../../../../../api';
import { filterChipSx, searchIcon } from './constants';
import { SpellCard } from '../spellCard';

interface SpellSelectionProps {
  title: string;
  filteredSpells: Spell[];
  selectedSpells: Spell[];
  onToggle: (spell: Spell) => void;
  maxToChoose: number;
  loading: boolean;
  damageTypes: string[];
  damageFilter: string | null;
  onDamageFilterChange: (type: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  damageIcons: Record<string, string>;
  recommendedNames?: string[];
  onApplyRecommended?: () => void;
  onClear?: () => void;
}

export const SpellSelection = memo(({
  title,
  filteredSpells,
  selectedSpells,
  onToggle,
  maxToChoose,
  loading,
  damageTypes,
  damageFilter,
  onDamageFilterChange,
  searchQuery,
  onSearchChange,
  damageIcons,
  recommendedNames,
  onApplyRecommended,
  onClear,
}: SpellSelectionProps) => {
  const theme = useTheme();

  const spellCards = useMemo(() => {
    return filteredSpells.map((spell) => {
      const isSelected = selectedSpells.some((s) => s._id === spell._id);
      const disabled = !isSelected && selectedSpells.length >= maxToChoose;
      const recommended = recommendedNames?.includes(spell.name) ?? false;

      return (
        <SpellCard
          key={spell._id}
          spell={spell}
          selected={isSelected}
          onToggle={() => onToggle(spell)}
          disabled={disabled}
          recommended={recommended}
        />
      );
    });
  }, [filteredSpells, selectedSpells, maxToChoose, onToggle, recommendedNames]);

  // Формируем текст с выбранными названиями
  const selectedNames = selectedSpells.length > 0
    ? `– ${selectedSpells.map(s => s.name).join(', ')}`
    : '';

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main }}>
          {title} ({selectedSpells.length}/{maxToChoose})
          <span style={{ color: theme.palette.text.secondary, marginLeft: 8, fontSize: '0.9rem' }}>
            {selectedNames}
          </span>
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {onApplyRecommended && (
            <Button
              size="small"
              variant="outlined"
              onClick={onApplyRecommended}
              disabled={selectedSpells.length === maxToChoose}
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
            >
              Рекомендованные
            </Button>
          )}
          {onClear && (
            <Button
              size="small"
              variant="outlined"
              onClick={onClear}
              disabled={selectedSpells.length === 0}
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
            >
              Очистить
            </Button>
          )}
        </Box>
      </Box>

      <OutlinedInput
        placeholder={`Поиск ${title.toLowerCase()}...`}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        size="small"
        startAdornment={
          <InputAdornment position="start" sx={{ color: theme.palette.text.secondary }}>
            {searchIcon}
          </InputAdornment>
        }
        sx={{
          mb: 1,
          width: '100%',
          maxWidth: 400,
          color: theme.palette.common.white,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
        }}
      />

      {damageTypes.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          <Chip
            label="Все"
            size="medium"
            onClick={() => onDamageFilterChange(null)}
            color={damageFilter === null ? 'primary' : 'default'}
            variant={damageFilter === null ? 'filled' : 'outlined'}
            sx={filterChipSx}
          />
          {damageTypes.map((type) => {
            const icon = damageIcons[type];
            return (
              <Chip
                key={type}
                label={type}
                size="medium"
                onClick={() => onDamageFilterChange(damageFilter === type ? null : type)}
                color={damageFilter === type ? 'primary' : 'default'}
                variant={damageFilter === type ? 'filled' : 'outlined'}
                icon={icon ? <img src={icon} alt={type} width={24} height={24} style={{ display: 'block' }} /> : undefined}
                sx={filterChipSx}
              />
            );
          })}
        </Box>
      )}

      {loading ? (
        <Typography sx={{ color: theme.palette.text.secondary }}>Загрузка...</Typography>
      ) : (
        <Box
          sx={{
            maxHeight: 600, // фиксированная высота
            overflowY: 'auto',
            paddingRight: 1,
            '&::-webkit-scrollbar': {
              width: 6,
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.primary.main,
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: theme.palette.primary.light,
            },
          }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(570px, 1fr))', gap: 1.5 }}>
            {spellCards.length > 0 ? spellCards : (
              <Typography sx={{ color: theme.palette.text.secondary }}>
                Нет заклинаний с выбранным типом урона или по запросу
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
});

SpellSelection.displayName = 'SpellSelection';