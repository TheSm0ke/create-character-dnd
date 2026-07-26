import { Typography, Box, useTheme } from '@mui/material';
import { useState } from 'react';

interface BackgroundProps {
  _id: string;
  name: string;
  description: string;
  skill_proficiencies: string[];
  tool_proficiencies: string[];
  languages: string[];
  feature: { name: string; description: string };
  selected?: boolean;
  onSelect?: () => void;
}

export const Background = ({
  name,
  description,
  skill_proficiencies,
  tool_proficiencies,
  languages,
  feature,
  selected = false,
  onSelect,
}: BackgroundProps) => {
  const [hover, setHover] = useState(false);
  const theme = useTheme();

  const handleClick = () => {
    if (onSelect) onSelect();
  };

  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={handleClick}
      sx={{
        padding: 2,
        borderRadius: 2,
        border: '2px solid',
        borderColor: selected
          ? theme.palette.primary.main
          : hover
          ? theme.palette.primary.light
          : 'rgba(255,255,255,0.08)',
        textAlign: 'left',
        transition: 'transform 0.25s ease, border-color 0.3s ease, background-color 0.3s ease',
        transform: selected ? 'scale(1.03)' : hover ? 'scale(1.02)' : 'scale(1)',
        backgroundColor: selected
          ? 'rgba(170, 59, 255, 0.12)'
          : hover
          ? 'rgba(255,255,255,0.03)'
          : 'transparent',
        cursor: 'pointer',
        boxShadow: selected ? `0 0 20px ${theme.palette.primary.main}40` : 'none',
      }}
    >
      <Typography variant="h6" sx={{ color: theme.palette.common.white }}>
        {name}
      </Typography>

      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
        {description}
      </Typography>

      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
          Владение навыками: {skill_proficiencies.join(', ')}
        </Typography>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
          Владение инструментами: {tool_proficiencies.join(', ')}
        </Typography>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
          Языки: {languages.join(', ')}
        </Typography>
        <Typography variant="caption" sx={{ color: theme.palette.primary.main, display: 'block', mt: 0.5 }}>
          Особенность: {feature.name} — {feature.description}
        </Typography>
      </Box>
    </Box>
  );
};