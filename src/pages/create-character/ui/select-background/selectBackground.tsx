import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { Background } from './Background';
import type { Background as BackgroundType } from '../../../../api';

interface SelectBackgroundProps {
  backgrounds: BackgroundType[];
  selectedBackground: BackgroundType | null;
  onSelectBackground: (bg: BackgroundType) => void;
}

export const SelectBackground = ({
  backgrounds,
  selectedBackground,
  onSelectBackground,
}: SelectBackgroundProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const getColumns = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return 3; // или 4, если нужно больше колонок
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ color: theme.palette.common.white, mb: 2 }}>
        Выбор происхождения
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${getColumns()}, 1fr)`,
          gap: 2,
        }}
      >
        {backgrounds.map((bg) => (
          <Background
            key={bg._id}
            {...bg}
            selected={selectedBackground?._id === bg._id}
            onSelect={() => onSelectBackground(bg)}
          />
        ))}
      </Box>
    </Box>
  );
};