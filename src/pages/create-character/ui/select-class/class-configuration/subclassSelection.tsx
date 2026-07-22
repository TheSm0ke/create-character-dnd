import { Box, Typography, FormControl, Select, MenuItem } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface SubclassSelectionProps {
  subclasses: { id: string; name: string; description: string }[];
  selected: string;
  onChange: (event: SelectChangeEvent) => void;
}

export const SubclassSelection = ({ subclasses, selected, onChange }: SubclassSelectionProps) => {
  const theme = useTheme();
  if (subclasses.length === 0) return null;
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main }}>
        Выберите подкласс
      </Typography>
      <FormControl fullWidth sx={{ mt: 1 }}>
        <Select
          value={selected}
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