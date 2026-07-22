import { Typography, Box, useTheme, Tooltip } from '@mui/material';
import { useState } from 'react';
import type { RaceAbilityBonus } from '../../../../../api';

interface RaceProps {
  name: string;
  description: string;
  ability_bonuses: RaceAbilityBonus[];
  speed: number;
  size: string;
  languages: { name: string; source: string }[];
  traits?: { name: string; description: string }[];
  selected?: boolean;
  onSelect?: () => void;
}

export const Race = ({
  name,
  description,
  ability_bonuses,
  speed,
  size,
  languages,
  traits = [],
  selected = false,
  onSelect,
}: RaceProps) => {
  const [hover, setHover] = useState(false);
  const theme = useTheme();

  const handleClick = () => {
    if (onSelect) onSelect();
  };

  // Содержимое тултипа
  const tooltipContent = traits.length > 0 ? (
    <Box sx={{ p: 0.5, maxWidth: 280 }}>
      <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5 }}>
        Особенности:
      </Typography>
      {traits.map((trait, idx) => (
        <Box key={idx} sx={{ mb: 0.5 }}>
          <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
            {trait.name}
          </Typography>
          <Typography variant="caption" sx={{ color: '#ccc', display: 'block' }}>
            {trait.description}
          </Typography>
        </Box>
      ))}
    </Box>
  ) : undefined;

  return (
    <Tooltip
      title={tooltipContent}
      placement="right"
      arrow
      disableHoverListener={traits.length === 0}
      // В MUI v9 используется slotProps вместо componentsProps
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(170,59,255,0.3)',
            maxWidth: 300,
            padding: '8px',
          },
        },
        arrow: {
          sx: {
            color: 'rgba(0,0,0,0.85)',
          },
        },
      }}
    >
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
          margin: 1,
          textAlign: 'left',
          position: 'relative',
          overflow: 'hidden',
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
        <Typography
          variant="h5"
          sx={{
            textAlign: 'left',
            color: theme.palette.common.white,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {name}
          {traits.length > 0 && (
            <span style={{ fontSize: '0.8rem', color: theme.palette.primary.main, marginLeft: 4 }}>
              ⭐
            </span>
          )}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            color: theme.palette.text.secondary,
            mt: 0.5,
          }}
        >
          {description}
        </Typography>

        <Box
          sx={{
            position: 'relative',
            top: hover || selected ? 0 : '120px',
            opacity: hover || selected ? 1 : 0,
            transition: 'all 0.35s ease',
            color: theme.palette.grey[300],
            mt: 1,
            '& .MuiTypography-root': {
              fontSize: '0.9rem',
              lineHeight: 1.6,
            },
          }}
        >
          <Typography>
            Бонусы к характеристикам:{' '}
            {ability_bonuses.map((bonus, index) => (
              <span key={index}>
                <span style={{ color: theme.palette.primary.main }}>
                  {bonus.ability} +{bonus.bonus}
                </span>
                {index < ability_bonuses.length - 1 && ', '}
              </span>
            ))}
          </Typography>
          <Typography>Скорость: {speed} футов</Typography>
          <Typography>Размер: {size}</Typography>
          <Typography>Языки: {languages.map((lang) => lang.name).join(', ')}</Typography>
        </Box>
      </Box>
    </Tooltip>
  );
};