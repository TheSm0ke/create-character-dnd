import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Radio,
  Stack,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useState } from 'react';
import type { Subclass } from '../../../../../../api';
import { getSubclassUnlockLevel } from '../subclassUtils';
import { SubclassSpellsCard } from './SubclassSpellsCard';

interface SubclassSelectionProps {
  subclasses: Subclass[];
  selectedSubclass: string;
  currentLevel: number;
  onChange: (subclassId: string) => void;
}

const getShortDescription = (description: string) => {
  const normalizedDescription = description.replace(/\s+/g, ' ').trim();
  const maxLength = 180;

  if (normalizedDescription.length <= maxLength) return normalizedDescription;
  return `${normalizedDescription.slice(0, maxLength).trimEnd()}…`;
};

export const SubclassSelection = ({
  subclasses,
  selectedSubclass,
  currentLevel,
  onChange,
}: SubclassSelectionProps) => {
  const theme = useTheme();
  const [expandedSubclass, setExpandedSubclass] = useState(selectedSubclass);

  if (subclasses.length === 0) return null;

  return (
    <Box component="section" aria-labelledby="subclass-selection-title" sx={{ mb: 3 }}>
      <Typography id="subclass-selection-title" variant="h6" sx={{ mb: 0.5 }}>
        Выберите подкласс
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Подкласс определяет способности персонажа и их развитие. Выбор доступен только после
        достижения требуемого уровня.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 2,
          maxHeight: { xs: '68vh', sm: '76vh' },
          overflowY: 'auto',
          pr: 1,
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'primary.main',
            borderRadius: 1,
          },
        }}
      >
        {subclasses.map((subclass) => {
          const unlockLevel = getSubclassUnlockLevel(subclass);
          const isAvailable = unlockLevel <= currentLevel;
          const selected = selectedSubclass === subclass.id;
          const expanded = expandedSubclass === subclass.id;
          const features = [...subclass.features].sort((first, second) => first.level - second.level);

          return (
            <Card
              key={subclass.id}
              component="label"
              variant="outlined"
              onClick={() => setExpandedSubclass(subclass.id)}
              sx={{
                cursor: 'pointer',
                borderColor: selected ? 'primary.main' : expanded ? 'secondary.main' : 'divider',
                backgroundColor: selected
                  ? alpha(theme.palette.primary.main, 0.1)
                  : 'background.paper',
                opacity: isAvailable ? 1 : 0.72,
                height: expanded ? { xs: '62vh', sm: '70vh' } : undefined,
                maxHeight: expanded ? { xs: '62vh', sm: '70vh' } : undefined,
                overflowY: expanded ? 'auto' : 'visible',
                pr: expanded ? 0.5 : 0,
                transition: theme.transitions.create(['border-color', 'background-color']),
                '&:hover': {
                  borderColor: isAvailable
                    ? selected
                      ? 'primary.main'
                      : 'secondary.main'
                    : 'divider',
                },
                '&::-webkit-scrollbar': {
                  width: 6,
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'primary.main',
                  borderRadius: 1,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Radio
                    checked={selected}
                    value={subclass.id}
                    disabled={!isAvailable}
                    onChange={() => onChange(subclass.id)}
                    slotProps={{ input: { 'aria-label': `Выбрать подкласс ${subclass.name}` } }}
                    sx={{ mt: -0.75, ml: -1 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" component="h3">
                      {subclass.name}
                    </Typography>
                    <Chip
                      label={
                        isAvailable
                          ? `Доступен на ${unlockLevel}-м уровне`
                          : `Доступен с ${unlockLevel}-го уровня`
                      }
                      color={isAvailable ? 'secondary' : 'default'}
                      size="small"
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                    {selected && subclass.source && (
                      <Typography variant="caption" color="text.secondary">
                        Источник: {subclass.source}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {subclass.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ whiteSpace: 'pre-line', mt: 1 }}
                  >
                    {expanded ? subclass.description : getShortDescription(subclass.description)}
                  </Typography>
                )}

                {expanded && (
                  <>
                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Способности подкласса
                    </Typography>
                    {features.length > 0 ? (
                      <Stack component="ul" spacing={1.5} sx={{ listStyle: 'none', m: 0, p: 0 }}>
                        {features.map((feature) => (
                          <Box component="li" key={`${feature.level}-${feature.name}`}>
                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{ mb: 0.5, alignItems: 'center' }}
                            >
                              <Chip
                                label={`${feature.level} уровень`}
                                color="secondary"
                                size="small"
                                variant="outlined"
                              />
                              <Typography variant="subtitle2">{feature.name}</Typography>
                            </Stack>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ whiteSpace: 'pre-line' }}
                            >
                              {feature.description}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Способности для этого подкласса пока не добавлены в справочник.
                      </Typography>
                    )}
                    {subclass.class_spells && subclass.class_spells.length > 0 && (
                      <SubclassSpellsCard spellProgression={subclass.class_spells} />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};
