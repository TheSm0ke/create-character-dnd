import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { Race } from './race/Race';
import type { Race as RaceType } from '../../../../api';

interface SelectRaceProps {
  races: RaceType[];
  selectedRace: RaceType | null;
  onSelectRace: (race: RaceType) => void;
}

export const SelectRace = ({ races, selectedRace, onSelectRace }: SelectRaceProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const getColumns = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return 5;
  };

  return (
    <Box sx={{ padding: isMobile ? 1 : 2, width: '100%', boxSizing: 'border-box' }}>
      <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: theme.palette.common.white, mb: isMobile ? 2 : 3 }}>
        Выбор расы
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${getColumns()}, 1fr)`,
          gap: isMobile ? 1 : 2,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {races.map((race) => (
          <Race
            key={race.name}
            {...race}
            selected={selectedRace?.name === race.name}
            onSelect={() => onSelectRace(race)}
          />
        ))}
      </Box>
    </Box>
  );
};