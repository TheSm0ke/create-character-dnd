/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Box, Typography, useTheme, FormControl, Select, MenuItem } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';

interface SubclassSelectionProps {
  subclasses: any[];
  selectedSubclass: string;
  onChange: (event: SelectChangeEvent) => void;
}

export const SubclassSelection: React.FC<SubclassSelectionProps> = ({
  subclasses,
  selectedSubclass,
  onChange,
}) => {
  const theme = useTheme();
  if (subclasses.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main }}>
        Выберите подкласс
      </Typography>
      <FormControl fullWidth sx={{ mt: 1 }}>
        <Select
          value={selectedSubclass}
          onChange={onChange}
          sx={{
            color: theme.palette.common.white,
            '& .MuiSelect-icon': { color: theme.palette.common.white },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
          }}
        >
          {subclasses.map((sub) => (
            <MenuItem key={sub.id} value={sub.id}>
              <Box>
                <Typography variant="body1">{sub.name}</Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {sub.description}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};