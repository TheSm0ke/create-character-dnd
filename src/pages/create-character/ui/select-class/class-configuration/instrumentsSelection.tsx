import { Box, Typography, FormControl, Select, MenuItem, Checkbox, Chip, OutlinedInput } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const INSTRUMENTS = [
  'Лютня', 'Флейта', 'Арфа', 'Виола', 'Барабан',
  'Рожок', 'Труба', 'Цимбалы', 'Скрипка', 'Гитара',
];

interface InstrumentsSelectionProps {
  count: number;
  selected: string[];
  onChange: (event: SelectChangeEvent<string[]>) => void;
}

export const InstrumentsSelection = ({ count, selected, onChange }: InstrumentsSelectionProps) => {
  const theme = useTheme();
  if (count === 0) return null;
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main }}>
        Выберите {count} музыкальных инструмента
      </Typography>
      <FormControl fullWidth sx={{ mt: 1 }}>
        <Select
          multiple
          value={selected}
          onChange={onChange}
          input={<OutlinedInput sx={{ color: theme.palette.common.white }} />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as string[]).map((value) => (
                <Chip key={value} label={value} sx={{ color: 'white' }} />
              ))}
            </Box>
          )}
          sx={{
            color: theme.palette.common.white,
            '& .MuiSelect-icon': { color: theme.palette.common.white },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
          }}
        >
          {INSTRUMENTS.map((inst) => (
            <MenuItem key={inst} value={inst}>
              <Checkbox checked={selected.indexOf(inst) > -1} />
              <Typography sx={{ color: theme.palette.common.white }}>{inst}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};