import { Box, Typography, useTheme, Chip, Avatar } from '@mui/material';
import type { Skill } from '../../../../api/skills';
import { memo } from 'react';

interface SkillCardProps {
  skill: Skill;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
  recommended?: boolean;
}

// Сопоставление способностей с цветами и эмодзи
const abilityMap: Record<string, { color: string; label: string; icon: string }> = {
  'Сила': { color: '#FF4D4D', label: 'Сила', icon: '💪' },
  'Ловкость': { color: '#4CAF50', label: 'Ловкость', icon: '🏃' },
  'Интеллект': { color: '#2196F3', label: 'Интеллект', icon: '🧠' },
  'Мудрость': { color: '#FF9800', label: 'Мудрость', icon: '🕊️' },
  'Харизма': { color: '#E91E63', label: 'Харизма', icon: '✨' },
};

export const SkillCard = memo(({ skill, selected, onToggle, disabled = false, recommended = false }: SkillCardProps) => {
  const theme = useTheme();

  const handleClick = () => {
    if (!disabled) onToggle();
  };

  const abilityInfo = skill.ability ? abilityMap[skill.ability] : null;
  const hoverBorderColor = abilityInfo?.color || theme.palette.primary.light;
  const scrollbarColor = abilityInfo?.color || theme.palette.primary.main;

  return (
    <Box
      onClick={handleClick}
      sx={{
        padding: "0px 12px 12px 12px",
        borderRadius: 2,
        border: '2px solid',
        borderColor: selected
          ? theme.palette.primary.main
          : 'rgba(255,255,255,0.08)',
        backgroundColor: selected
          ? 'rgba(170, 59, 255, 0.12)'
          : 'transparent',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.25s ease',
        '&:hover': {
          borderColor: disabled ? 'rgba(255,255,255,0.08)' : hoverBorderColor,
          backgroundColor: disabled ? 'transparent' : 'rgba(255,255,255,0.03)',
          transform: disabled ? 'scale(1)' : 'scale(1.02)',
        },
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        maxHeight: 200,
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: `${scrollbarColor} transparent`,
        '&::-webkit-scrollbar': {
          width: 4,
          transition: 'width 0.2s ease',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 4,
        },
        '&::-webkit-scrollbar-thumb': {
          background: scrollbarColor,
          borderRadius: 4,
          transition: 'background 0.2s ease',
        },
        '&:hover::-webkit-scrollbar': {
          width: 6,
        },
        '&:hover::-webkit-scrollbar-thumb': {
          background: scrollbarColor,
          filter: 'brightness(1.3)',
        },
      }}
    >
      {/* Sticky часть */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          paddingTop: '8px',
          backdropFilter: 'blur(4px)',
          zIndex: 1,
          pb: 0.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {selected && (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ flexShrink: 0 }}
            >
              <circle cx="12" cy="12" r="10" fill={theme.palette.primary.main} />
              <path
                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                fill="white"
              />
            </svg>
          )}
          <Typography variant="body1" sx={{ color: theme.palette.common.white, fontWeight: 500 }}>
            {skill.name}
            {recommended && (
              <span style={{ color: theme.palette.warning.main, marginLeft: 4 }}>⭐</span>
            )}
          </Typography>
          {abilityInfo && (
            <Chip
              avatar={
                <Avatar
                  sx={{
                    bgcolor: abilityInfo.color,
                    width: 20,
                    height: 20,
                    fontSize: '0.7rem',
                  }}
                >
                  {abilityInfo.icon}
                </Avatar>
              }
              label={abilityInfo.label}
              size="small"
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
            />
          )}
        </Box>
      </Box>

      {/* Описание */}
      {skill.description && (
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            mt: 0.5,
            whiteSpace: 'normal',
            wordWrap: 'break-word',
          }}
        >
          {skill.description}
        </Typography>
      )}
    </Box>
  );
});

SkillCard.displayName = 'skillCard';