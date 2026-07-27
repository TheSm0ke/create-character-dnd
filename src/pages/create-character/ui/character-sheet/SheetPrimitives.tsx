import {
  Box,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';
import type { Spell } from '../../../../api';

interface SummaryCardProps {
  title: string;
  children: ReactNode;
  backgroundImage?: string;
}

export const SummaryCard = ({ title, children, backgroundImage }: SummaryCardProps) => (
  <Card component="section" variant="outlined" sx={{ position: backgroundImage ? 'relative' : undefined, height: '100%' }}>
    {backgroundImage && (
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute', top: -12, left: -12, width: { xs: 140, sm: 180 }, height: { xs: 140, sm: 180 },
          backgroundImage: `url("${backgroundImage}")`, backgroundPosition: 'left top', backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain', opacity: 0.14, pointerEvents: 'none',
        }}
      />
    )}
    <CardContent sx={backgroundImage ? { position: 'relative', zIndex: 1 } : undefined}>
      <Typography variant="h6" component="h2" sx={{ mb: 1.5 }}>{title}</Typography>
      {children}
    </CardContent>
  </Card>
);

export const FeatureList = ({
  features,
  characterLevel = 1,
}: {
  features: { name: string; level: number; description: string }[];
  characterLevel?: number;
}) => (
  <List dense disablePadding>
    {[...features].sort((first, second) => first.level - second.level).map((feature) => (
      <ListItem key={`${feature.level}-${feature.name}`} disableGutters alignItems="flex-start">
        <ListItemText
          primary={(
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="subtitle2">{feature.name}</Typography>
              <Chip
                label={feature.level <= characterLevel ? `${feature.level}-й уровень` : `с ${feature.level}-го уровня`}
                color={feature.level <= characterLevel ? 'primary' : 'default'}
                size="small"
                variant="outlined"
              />
            </Box>
          )}
          secondary={feature.description}
          slotProps={{ secondary: { sx: { whiteSpace: 'pre-line' } } }}
        />
      </ListItem>
    ))}
  </List>
);

const getSpellCost = (spell: Spell) => (
  spell.level === 'Заговор' ? 'без ячейки' : `${spell.level}-я ячейка`
);

export const SpellList = ({ title, spells }: { title: string; spells: Spell[] }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle2" sx={{ mb: 0.75 }}>{title}</Typography>
    {spells.length > 0 ? (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1 }}>
        {spells.map((spell) => (
          <Tooltip
            key={spell._id}
            arrow
            enterTouchDelay={0}
            placement="right-start"
            slotProps={{
              tooltip: {
                sx: {
                  maxWidth: 300, height: 240, p: 1, overflowY: 'auto', boxSizing: 'border-box',
                  backgroundColor: 'grey.900', backdropFilter: 'blur(4px)', border: '1px solid', borderColor: 'primary.main',
                },
              },
              arrow: { sx: { color: 'grey.900' } },
            }}
            title={(
              <Box sx={{ p: 0.5, maxWidth: 280 }}>
                <Typography variant="subtitle2" sx={{ color: 'common.white', fontWeight: 'bold', mb: 0.5 }}>{spell.name}</Typography>
                <Typography variant="caption" sx={{ color: 'grey.300', display: 'block', whiteSpace: 'pre-line' }}>
                  {spell.description || 'Описание отсутствует.'}
                </Typography>
                {spell.higher_levels && (
                  <Typography variant="caption" sx={{ color: 'grey.300', display: 'block', mt: 1, whiteSpace: 'pre-line' }}>
                    На больших уровнях: {spell.higher_levels}
                  </Typography>
                )}
              </Box>
            )}
          >
            <Paper
              component="article"
              variant="outlined"
              tabIndex={0}
              aria-label={`${spell.name}. Стоимость: ${getSpellCost(spell)}.`}
              sx={{
                minWidth: 0, p: 1, cursor: 'help', transition: 'background-color 150ms ease, border-color 150ms ease',
                '&:hover, &:focus-visible': { borderColor: 'primary.main', backgroundColor: 'action.hover' },
              }}
            >
              <Typography variant="subtitle2" noWrap title={spell.name}>{spell.name}</Typography>
              <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5, mb: 0 }}>Стоимость: {getSpellCost(spell)}</Typography>
              <Typography variant="caption" color="text.secondary" component="p" sx={{ m: 0 }}>Урон: {spell.damage_dice || '—'}</Typography>
              <Typography variant="caption" color="text.secondary" component="p" sx={{ m: 0 }}>Тип урона: {spell.damage_type || '—'}</Typography>
            </Paper>
          </Tooltip>
        ))}
      </Box>
    ) : <Typography variant="body2" color="text.secondary">Не выбрано.</Typography>}
  </Box>
);

const toRomanNumeral = (value: number) => {
  const numerals = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']] as const;
  let remainder = value;
  return numerals.reduce((result, [arabic, roman]) => {
    const repetitions = Math.floor(remainder / arabic);
    remainder %= arabic;
    return result + roman.repeat(repetitions);
  }, '');
};

export const SpellSlots = ({ slots }: { slots?: number[] }) => {
  const slotGroups = (slots ?? []).map((count, index) => ({ spellLevel: index + 1, count })).filter(({ count }) => count > 0);
  if (slotGroups.length === 0) return <Typography variant="body2" color="text.secondary">Нет ячеек.</Typography>;

  return (
    <Box aria-label="Ячейки заклинаний" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1 }}>
      {slotGroups.map(({ spellLevel, count }) => (
        <Paper
          key={spellLevel}
          variant="outlined"
          sx={{
            position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'flex-end', justifyItems: 'center',
            gap: 0.5, minWidth: 94, minHeight: 66, px: 1, pb: 1, pt: 2.5, overflow: 'visible', borderColor: 'divider',
            backgroundColor: 'background.default', boxShadow: (theme) => `inset 0 -14px 18px ${theme.palette.action.selected}`,
          }}
        >
          <Box
            aria-label={`${spellLevel}-й уровень заклинаний`}
            sx={{
              position: 'absolute', top: -13, left: '50%', display: 'grid', width: 28, height: 28, placeItems: 'center',
              transform: 'translateX(-50%)', border: '1px solid', borderColor: 'divider', borderRadius: '50%',
              backgroundColor: 'background.paper', color: 'text.primary', fontFamily: 'serif', fontSize: '1.25rem', fontWeight: 700,
              lineHeight: 1, boxShadow: (theme) => `0 2px 8px ${theme.palette.action.disabledBackground}`,
            }}
          >
            {toRomanNumeral(spellLevel)}
          </Box>
          {Array.from({ length: count }, (_, slotIndex) => (
            <Box key={slotIndex} role="img" aria-label={`Ячейка ${slotIndex + 1} из ${count}: доступна`} sx={{
              width: 22, height: 22, border: '1px solid', borderColor: 'primary.light', backgroundColor: 'primary.main',
              boxShadow: (theme) => `0 0 10px ${theme.palette.primary.main}`,
            }} />
          ))}
        </Paper>
      ))}
    </Box>
  );
};
