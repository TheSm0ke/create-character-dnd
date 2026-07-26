import {
  Autocomplete,
  Box,
  Button,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useMemo, useState } from 'react';
import type { Race as RaceType } from '../../../../api';
import { Race } from './race/Race';

interface SelectRaceProps {
  races: RaceType[];
  selectedRace: RaceType | null;
  onSelectRace: (race: RaceType) => void;
}

const normalize = (value: string) =>
  value.trim().toLocaleLowerCase('ru-RU').replace(/ё/g, 'е');

export const SelectRace = ({ races, selectedRace, onSelectRace }: SelectRaceProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [search, setSearch] = useState('');
  const [selectedAbilities, setSelectedAbilities] = useState<string[]>([]);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);

  const abilityOptions = useMemo(
    () => [...new Set(races.flatMap((race) => race.ability_bonuses.map((bonus) => bonus.ability)))]
      .sort((first, second) => first.localeCompare(second, 'ru-RU')),
    [races],
  );
  const traitOptions = useMemo(
    () => [...new Set(races.flatMap((race) => race.traits.map((trait) => trait.name)))]
      .sort((first, second) => first.localeCompare(second, 'ru-RU')),
    [races],
  );
  const filteredRaces = useMemo(() => {
    const normalizedSearch = normalize(search);

    return races.filter((race) => {
      const matchesName = !normalizedSearch || normalize(race.name).includes(normalizedSearch);
      const matchesAbilities = selectedAbilities.every((ability) =>
        race.ability_bonuses.some((bonus) => normalize(bonus.ability) === normalize(ability)),
      );
      const traitNames = race.traits.map((trait) => trait.name);
      const matchesTraits = selectedTraits.every((trait) => traitNames.includes(trait));

      return matchesName && matchesAbilities && matchesTraits;
    });
  }, [races, search, selectedAbilities, selectedTraits]);

  const getColumns = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return 5;
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedAbilities([]);
    setSelectedTraits([]);
  };

  return (
    <Box sx={{ padding: isMobile ? 1 : 2, width: '100%', boxSizing: 'border-box' }}>
      <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: 'text.primary', mb: isMobile ? 2 : 3 }}>
        Выбор расы
      </Typography>

      <Box
        component="section"
        aria-label="Фильтры рас"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr)) auto' },
          gap: 1.5,
          alignItems: 'start',
          mb: 3,
        }}
      >
        <TextField
          label="Поиск по названию"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          fullWidth
        />
        <Autocomplete
          multiple
          options={abilityOptions}
          value={selectedAbilities}
          onChange={(_, values) => setSelectedAbilities(values)}
          renderInput={(params) => <TextField {...params} label="Бонусы к характеристикам" />}
        />
        <Autocomplete
          multiple
          options={traitOptions}
          value={selectedTraits}
          onChange={(_, values) => setSelectedTraits(values)}
          renderInput={(params) => <TextField {...params} label="Особенности расы" />}
        />
        <Button
          variant="outlined"
          onClick={resetFilters}
          disabled={!search && selectedAbilities.length === 0 && selectedTraits.length === 0}
          sx={{ minHeight: 56 }}
        >
          Сбросить
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Найдено рас: {filteredRaces.length}
      </Typography>

      {filteredRaces.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${getColumns()}, 1fr)`,
            gap: isMobile ? 1 : 2,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {filteredRaces.map((race) => (
            <Race
              key={race._id}
              {...race}
              selected={selectedRace?._id === race._id}
              onSelect={() => onSelectRace(race)}
            />
          ))}
        </Box>
      ) : (
        <Typography variant="body1" color="text.secondary">
          По выбранным фильтрам расы не найдены.
        </Typography>
      )}
    </Box>
  );
};
