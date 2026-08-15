import { Box, Chip, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import type { Spell } from '../../../../api';
import { damageIcons } from '../select-class/class-configuration/constants';
import { SpellCard } from '../select-class/spellCard';

interface SpellListProps {
  title: string;
  spells: Spell[];
  maximumAvailableSpellLevel?: number;
  availableSlots?: number[];
}

const normalize = (value: string) => value.trim().toLocaleLowerCase('ru-RU');

export const SpellList = ({
  title,
  spells,
  maximumAvailableSpellLevel,
  availableSlots,
}: SpellListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [damageFilter, setDamageFilter] = useState<string | null>(null);
  const shouldShowFilters = spells.length > 6;
  const damageTypes = [...new Set(spells.map((spell) => spell.damage_type).filter((type): type is string => Boolean(type)))];
  const filteredSpells = spells.filter((spell) => (
    (!searchQuery || normalize(spell.name).includes(normalize(searchQuery)))
    && (!damageFilter || spell.damage_type === damageFilter)
  ));

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
        {title}
      </Typography>
      {shouldShowFilters && (
        <Box sx={{ mb: 1.5 }}>
          <TextField
            size="small"
            fullWidth
            label={`Поиск: ${title.toLowerCase()}`}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          {damageTypes.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              <Chip label="Все" size="small" color={damageFilter === null ? 'primary' : 'default'} onClick={() => setDamageFilter(null)} />
              {damageTypes.map((damageType) => (
                <Chip
                  key={damageType}
                  label={damageType}
                  size="small"
                  color={damageFilter === damageType ? 'primary' : 'default'}
                  variant={damageFilter === damageType ? 'filled' : 'outlined'}
                  onClick={() => setDamageFilter((current) => current === damageType ? null : damageType)}
                  icon={damageIcons[damageType] ? <Box component="img" src={damageIcons[damageType]} alt="" /> : undefined}
                />
              ))}
            </Box>
          )}
        </Box>
      )}
      {spells.length > 0 ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1 }}>
          {filteredSpells.map((spell) => {
            const spellLevel = Number(spell.level);
            const unavailable = Number.isFinite(spellLevel) && spellLevel > 0 && (
              availableSlots
                ? (availableSlots[spellLevel - 1] ?? 0) === 0
                : maximumAvailableSpellLevel !== undefined && spellLevel > maximumAvailableSpellLevel
            );

            return (
              <SpellCard
                key={spell._id}
                spell={spell}
                selected={false}
                onToggle={() => undefined}
                readOnly
                disabled={unavailable}
              />
            );
          })}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Не выбрано.
        </Typography>
      )}
      {shouldShowFilters && spells.length > 0 && filteredSpells.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Ничего не найдено.</Typography>
      )}
    </Box>
  );
};
