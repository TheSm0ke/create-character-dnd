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
import type { KeyboardEvent } from 'react';
import type { Subclass } from '../../../../../../api';
import { getSubclassUnlockLevel } from '../subclassUtils';
import { SubclassSpellsCard } from './SubclassSpellsCard';

interface SubclassSelectionProps {
  subclasses: Subclass[];
  selectedSubclass: string;
  currentLevel: number;
  onChange: (subclassId: string) => void;
}

export const SubclassSelection = ({
  subclasses,
  selectedSubclass,
  currentLevel,
  onChange,
}: SubclassSelectionProps) => {
  const theme = useTheme();

  if (subclasses.length === 0) return null;

  const handleKeyboardSelect = (
    event: KeyboardEvent<HTMLElement>,
    subclassId: string,
    isAvailable: boolean,
  ) => {
    if (!isAvailable || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    onChange(subclassId);
  };

  return (
    <Box component="section" aria-labelledby="subclass-selection-title">
      <Typography id="subclass-selection-title" variant="h6" sx={{ mb: 0.5 }}>
        Подклассы
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Выберите доступный подкласс или изучите варианты, которые откроются на следующих уровнях.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
          },
          gap: 2,
          alignItems: 'stretch',
        }}
      >
        {subclasses.map((subclass) => {
          const unlockLevel = getSubclassUnlockLevel(subclass);
          const isAvailable = unlockLevel <= currentLevel;
          const selected = selectedSubclass === subclass.id;
          const features = [...subclass.features].sort(
            (first, second) => first.level - second.level,
          );

          return (
            <Card
              key={subclass.id}
              component="article"
              variant="outlined"
              role={isAvailable ? 'radio' : undefined}
              aria-checked={isAvailable ? selected : undefined}
              aria-disabled={!isAvailable}
              tabIndex={isAvailable ? 0 : -1}
              onClick={() => {
                if (isAvailable) onChange(subclass.id);
              }}
              onKeyDown={(event) => handleKeyboardSelect(event, subclass.id, isAvailable)}
              sx={{
                position: 'relative',
                display: 'flex',
                minWidth: 0,
                height: { xs: 500, sm: 540 },
                cursor: isAvailable ? 'pointer' : 'default',
                borderWidth: 2,
                borderColor: selected ? 'primary.main' : 'divider',
                backgroundColor: selected
                  ? alpha(theme.palette.primary.main, 0.1)
                  : 'background.paper',
                opacity: isAvailable ? 1 : 0.7,
                boxShadow: selected
                  ? `0 0 20px ${alpha(theme.palette.primary.main, 0.2)}`
                  : 'none',
                transition: theme.transitions.create([
                  'border-color',
                  'background-color',
                  'box-shadow',
                  'transform',
                ]),
                '&:hover': isAvailable
                  ? {
                      borderColor: selected ? 'primary.main' : 'primary.light',
                      transform: 'translateY(-2px)',
                    }
                  : undefined,
                '&:focus-visible': {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: 2,
                },
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  minWidth: 0,
                  p: 2,
                  '&:last-child': { pb: 2 },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Radio
                    checked={selected}
                    value={subclass.id}
                    disabled={!isAvailable}
                    onChange={() => onChange(subclass.id)}
                    onClick={(event) => event.stopPropagation()}
                    slotProps={{ input: { 'aria-label': `Выбрать подкласс ${subclass.name}` } }}
                    sx={{ mt: -0.75, ml: -1 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" component="h3" sx={{ lineHeight: 1.25 }}>
                      {subclass.name}
                    </Typography>
                    <Chip
                      label={
                        isAvailable
                          ? `Доступен на ${unlockLevel}-м уровне`
                          : `Откроется с ${unlockLevel}-го уровня`
                      }
                      color={isAvailable ? 'secondary' : 'default'}
                      size="small"
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Box>

                {subclass.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ whiteSpace: 'pre-line', mt: 1.5 }}
                  >
                    {subclass.description}
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    pr: 1,
                    '&::-webkit-scrollbar': { width: 6 },
                    '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'primary.main',
                      borderRadius: 1,
                    },
                  }}
                >
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
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};
