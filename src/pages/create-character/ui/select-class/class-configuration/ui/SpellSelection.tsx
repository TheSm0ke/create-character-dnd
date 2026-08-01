/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Box, Typography, useTheme, Button, Chip, OutlinedInput, InputAdornment } from '@mui/material';
import { SpellCard } from '../../spellCard';
import { damageIcons, searchIcon, recommendedSpells } from '../constants';

interface SpellSelectionProps {
  title: string;
  spells: any[];
  selectedSpells: any[];
  onToggle: (spell: any) => void;
  toChoose: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  damageFilter: string | null;
  setDamageFilter: (type: string | null) => void;
  damageTypes: string[];
  damageDiceFilter: string | null;
  setDamageDiceFilter: (dice: string | null) => void;
  damageDice: string[];
  applyRecommended?: () => void;
  clear?: () => void;
  loading: boolean;
  className: string;
  isCantrip: boolean;
}

export const SpellSelection: React.FC<SpellSelectionProps> = ({
  title,
  spells,
  selectedSpells,
  onToggle,
  toChoose,
  searchQuery,
  setSearchQuery,
  damageFilter,
  setDamageFilter,
  damageTypes,
  damageDiceFilter,
  setDamageDiceFilter,
  damageDice,
  applyRecommended,
  clear,
  loading,
  className,
  isCantrip,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main }}>
          {title} ({selectedSpells.length}/{toChoose})
          <span style={{ color: theme.palette.text.secondary, marginLeft: 8, fontSize: '0.9rem' }}>
            {selectedSpells.length > 0 ? `– ${selectedSpells.map(s => s.name).join(', ')}` : ''}
          </span>
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!loading && spells && spells.length > 0 && (applyRecommended || clear) && (
            <>
              {applyRecommended && <Button size="small" variant="outlined" onClick={applyRecommended} disabled={selectedSpells.length === toChoose} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>Рекомендованные</Button>}
              {clear && <Button size="small" variant="outlined" onClick={clear} disabled={selectedSpells.length === 0} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>Очистить</Button>}
            </>
          )}
        </Box>
      </Box>

      <OutlinedInput
        placeholder={`Поиск ${isCantrip ? 'заговоров' : 'заклинаний'}...`}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        size="small"
        startAdornment={<InputAdornment position="start" sx={{ color: theme.palette.text.secondary }}>{searchIcon}</InputAdornment>}
        sx={{ mb: 1, width: '100%', maxWidth: 400, color: theme.palette.common.white, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main } }}
      />

      {!loading && damageTypes.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          <Chip
            label="Все"
            size="medium"
            onClick={() => setDamageFilter(null)}
            color={damageFilter === null ? 'primary' : 'default'}
            variant={damageFilter === null ? 'filled' : 'outlined'}
            sx={{
              color: 'white',
              padding: '8px 16px',
              height: 'auto',
              fontSize: '0.9rem',
              '& .MuiChip-label': { padding: '4px 12px' },
              '& .MuiChip-icon': { width: 24, height: 24 },
            }}
          />
          {damageTypes.map((type) => {
            const icon = damageIcons[type];
            return (
              <Chip
                key={type}
                label={type}
                size="medium"
                onClick={() => setDamageFilter(damageFilter === type ? null : type)}
                color={damageFilter === type ? 'primary' : 'default'}
                variant={damageFilter === type ? 'filled' : 'outlined'}
                icon={icon ? <img src={icon} alt={type} width={24} height={24} style={{ display: 'block' }} /> : undefined}
                sx={{
                  color: 'white',
                  padding: '8px 16px',
                  height: 'auto',
                  fontSize: '0.9rem',
                  '& .MuiChip-label': { padding: '4px 12px' },
                  '& .MuiChip-icon': { width: 24, height: 24 },
                }}
              />
            );
          })}
        </Box>
      )}

      {!loading && damageDice.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>Урон:</Typography>
          <Chip
            label="Любой"
            size="small"
            onClick={() => setDamageDiceFilter(null)}
            color={damageDiceFilter === null ? 'primary' : 'default'}
            variant={damageDiceFilter === null ? 'filled' : 'outlined'}
          />
          {damageDice.map((dice) => (
            <Chip
              key={dice}
              label={dice}
              size="small"
              onClick={() => setDamageDiceFilter(damageDiceFilter === dice ? null : dice)}
              color={damageDiceFilter === dice ? 'primary' : 'default'}
              variant={damageDiceFilter === dice ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      )}

      {loading ? (
        <Typography sx={{ color: theme.palette.text.secondary }}>Загрузка...</Typography>
      ) : (
        <Box sx={{ maxHeight: 600, overflowY: 'auto', paddingRight: 1, '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-track': { background: 'rgba(255,255,255,0.05)', borderRadius: 4 }, '&::-webkit-scrollbar-thumb': { background: theme.palette.primary.main, borderRadius: 4 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(570px, 1fr))', gap: 1.5 }}>
            {spells && spells.length > 0 ? (
              spells.map((spell) => (
                <SpellCard
                  key={spell._id}
                  spell={spell}
                  selected={selectedSpells.some((s: any) => s._id === spell._id)}
                  onToggle={() => onToggle(spell)}
                  disabled={!selectedSpells.some((s: any) => s._id === spell._id) && selectedSpells.length >= toChoose}
                  recommended={recommendedSpells[className]?.[isCantrip ? 'cantrips' : 'spells1']?.includes(spell.name) ?? false}
                />
              ))
            ) : (
              <Typography sx={{ color: theme.palette.text.secondary }}>Нет {isCantrip ? 'заговоров' : 'заклинаний'} с выбранным типом урона или по запросу</Typography>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};
