import React from 'react';
import { Box, Typography, useTheme, FormControl, Select, MenuItem, Checkbox, Chip, OutlinedInput } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { INSTRUMENTS } from '../constants';

interface InstrumentSelectionProps {
  instrumentCount: number;
  selectedInstruments: string[];
  onChange: (event: SelectChangeEvent<string[]>) => void;
}

export const InstrumentSelection: React.FC<InstrumentSelectionProps> = ({
  instrumentCount,
  selectedInstruments,
  onChange,
}) => {
  const theme = useTheme();
  if (instrumentCount === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main }}>
        Выберите {instrumentCount} музыкальных инструмента
      </Typography>
      <FormControl fullWidth sx={{ mt: 1 }}>
        <Select
          multiple
          value={selectedInstruments}
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
              <Checkbox checked={selectedInstruments.indexOf(inst) > -1} />
              <Typography sx={{ color: theme.palette.common.white }}>{inst}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};