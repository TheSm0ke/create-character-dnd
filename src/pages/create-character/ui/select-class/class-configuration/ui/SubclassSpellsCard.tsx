import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useState } from 'react';
import type { Subclass } from '../../../../../../api';

interface SubclassSpellsCardProps {
  spellProgression: NonNullable<Subclass['class_spells']>;
}

export const SubclassSpellsCard = ({ spellProgression }: SubclassSpellsCardProps) => {
  const [selectedLevel, setSelectedLevel] = useState(spellProgression[0].level_requirement);
  const selectedSpells = spellProgression.find(
    ({ level_requirement }) => level_requirement === selectedLevel,
  )?.spells ?? [];

  const handleLevelChange = (event: SelectChangeEvent<number>) => {
    setSelectedLevel(Number(event.target.value));
  };

  return (
    <Card component="section" variant="outlined" sx={{ mt: 2, bgcolor: 'background.default' }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          Заклинания подкласса
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Выберите уровень персонажа, чтобы посмотреть заклинания, добавляемые подклассом.
        </Typography>

        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel id="subclass-spell-level-label">Уровень персонажа</InputLabel>
          <Select
            labelId="subclass-spell-level-label"
            value={selectedLevel}
            label="Уровень персонажа"
            onChange={handleLevelChange}
          >
            {spellProgression.map(({ level_requirement }) => (
              <MenuItem key={level_requirement} value={level_requirement}>
                {level_requirement}-й уровень
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
          {selectedSpells.map((spell) => (
            <Chip key={spell} label={spell} color="secondary" variant="outlined" />
          ))}
        </Stack>
        {selectedSpells.length === 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Для этого уровня нет дополнительных заклинаний.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
