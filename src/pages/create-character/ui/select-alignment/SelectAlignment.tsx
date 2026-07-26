import { Box, Card, CardActionArea, CardContent, Chip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { Alignment } from '../../../../api';

interface SelectAlignmentProps {
  alignments: Alignment[];
  selectedAlignment: Alignment | null;
  onSelectAlignment: (alignment: Alignment) => void;
}

export const SelectAlignment = ({
  alignments,
  selectedAlignment,
  onSelectAlignment,
}: SelectAlignmentProps) => {
  const theme = useTheme();

  return (
    <Box component="section" aria-labelledby="alignment-selection-title" sx={{ p: 2 }}>
      <Typography id="alignment-selection-title" variant="h5" sx={{ mb: 0.5 }}>
        Выберите мировоззрение
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Мировоззрение отражает моральные принципы и отношение персонажа к порядку, свободе,
        добру и злу.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        {alignments.map((alignment) => {
          const selected = selectedAlignment?._id === alignment._id;

          return (
            <Card
              key={alignment._id}
              variant="outlined"
              sx={{
                height: '100%',
                borderColor: selected ? 'primary.main' : 'divider',
                backgroundColor: selected
                  ? alpha(theme.palette.primary.main, 0.12)
                  : 'background.paper',
                transition: theme.transitions.create(['border-color', 'background-color']),
                '&:hover': {
                  borderColor: selected ? 'primary.main' : 'secondary.main',
                },
              }}
            >
              <CardActionArea
                onClick={() => onSelectAlignment(alignment)}
                aria-pressed={selected}
                sx={{ height: '100%' }}
              >
                <CardContent sx={{ height: '100%' }}>
                  <Chip
                    label={alignment.abbreviation}
                    color={selected ? 'primary' : 'secondary'}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                    {alignment.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {alignment.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};
