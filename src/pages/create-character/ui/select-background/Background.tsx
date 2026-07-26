import {
  Box,
  ButtonBase,
  Card,
  CardContent,
  Chip,
  Divider,
  Typography,
} from '@mui/material';

interface BackgroundProps {
  _id: string;
  name: string;
  description: string;
  skill_proficiencies: string[];
  tool_proficiencies: string[];
  languages: string[];
  spells?: { name: string; level: string; source: string }[];
  feature?: { name: string; description: string };
  selected?: boolean;
  onSelect?: () => void;
}

const ProficiencyChips = ({
  label,
  values,
  color = 'default',
}: {
  label: string;
  values: string[];
  color?: 'default' | 'primary' | 'secondary';
}) => (
  <Box sx={{ mt: 1.5 }}>
    <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
      {label}
    </Typography>
    {values.length > 0 ? (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {values.map((value) => (
          <Chip key={value} label={value} color={color} size="small" variant="outlined" />
        ))}
      </Box>
    ) : (
      <Typography variant="body2" color="text.secondary">
        Не предоставляется.
      </Typography>
    )}
  </Box>
);

export const Background = ({
  name,
  description,
  skill_proficiencies,
  tool_proficiencies,
  languages,
  spells = [],
  feature,
  selected = false,
  onSelect,
}: BackgroundProps) => (
  <Card
    component="article"
    variant="outlined"
    sx={{
      height: '100%',
      borderColor: selected ? 'primary.main' : 'divider',
      backgroundColor: selected ? 'action.selected' : 'background.paper',
      transition: (theme) => theme.transitions.create(['border-color', 'background-color', 'transform']),
      transform: selected ? 'scale(1.02)' : 'none',
      '&:hover': {
        borderColor: 'primary.light',
        backgroundColor: 'action.hover',
      },
    }}
  >
    <ButtonBase
      onClick={onSelect}
      aria-pressed={selected}
      sx={{ display: 'block', width: '100%', height: '100%', textAlign: 'left' }}
    >
      <CardContent sx={{ width: '100%' }}>
        <Typography variant="h6" component="h2">
          {name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 1,
            maxHeight: 120,
            overflowY: 'auto',
            pr: 0.5,
            whiteSpace: 'pre-line',
          }}
        >
          {description}
        </Typography>

        <ProficiencyChips label="Навыки" values={skill_proficiencies} color="primary" />

        {feature && (
          <Box sx={{ mt: 2, p: 1.5, borderRadius: 1, backgroundColor: 'action.selected' }}>
            <Typography variant="subtitle2" color="secondary.main">
              Особенность: {feature.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {feature.description}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />
        <ProficiencyChips label="Инструменты" values={tool_proficiencies} />
        <ProficiencyChips label="Языки" values={languages} />
        {spells.length > 0 && (
          <ProficiencyChips
            label="Заклинания"
            values={spells.map((spell) => `${spell.name} (${spell.level})`)}
            color="secondary"
          />
        )}
      </CardContent>
    </ButtonBase>
  </Card>
);
