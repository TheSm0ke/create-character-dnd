import React from 'react';
import { Box, Typography, useTheme, FormControl, Select, MenuItem, Checkbox, Chip, OutlinedInput } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';

interface InstrumentSelectionProps {
  instrumentCount: number;
  instruments: string[];
  loading: boolean;
  error: string | null;
  selectedInstruments: string[];
  onChange: (event: SelectChangeEvent<string[]>) => void;
}

export const InstrumentSelection: React.FC<InstrumentSelectionProps> = ({
  instrumentCount,
  instruments,
  loading,
  error,
  selectedInstruments,
  onChange,
}) => {
  const theme = useTheme();
  if (instrumentCount === 0) return null;
  const selectionLimitReached = selectedInstruments.length >= instrumentCount;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main }}>
        Владение музыкальными инструментами
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Выберите владения: {selectedInstruments.length} из {instrumentCount}.
        Эти инструменты не добавляются в инвентарь.
      </Typography>
      <FormControl fullWidth sx={{ mt: 1 }}>
        <Select
          multiple
          disabled={loading || Boolean(error)}
          value={selectedInstruments}
          onChange={onChange}
          input={<OutlinedInput sx={{ color: theme.palette.common.white }} />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as string[]).map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
          sx={{
            color: 'text.primary',
            '& .MuiSelect-icon': { color: 'text.primary' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
          }}
        >
          {instruments.map((inst) => {
            const isSelected = selectedInstruments.includes(inst);

            return (
              <MenuItem
                key={inst}
                value={inst}
                disabled={selectionLimitReached && !isSelected}
              >
                <Checkbox checked={isSelected} />
                <Typography color="text.primary">{inst}</Typography>
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      {loading && (
        <Typography variant="caption" color="text.secondary">
          Загрузка списка инструментов...
        </Typography>
      )}
      {error && (
        <Typography variant="caption" color="error">
          Не удалось загрузить музыкальные инструменты: {error}
        </Typography>
      )}
    </Box>
  );
};
