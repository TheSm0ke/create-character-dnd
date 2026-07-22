import { Box, Typography, useTheme, Chip, Avatar } from '@mui/material';
import type { Spell } from '../../../../api/spells';
import { memo } from 'react';

// Импорт иконок урона
import AcidIcon from '../../../../assets/Acid_Damage_Icon.webp';
import BludgeoningIcon from '../../../../assets/Bludgeoning_Damage_Icon.webp';
import ColdIcon from '../../../../assets/Cold_Damage_Icon.webp';
import FireIcon from '../../../../assets/Fire_Damage_Icon.webp';
import ForceIcon from '../../../../assets/Force_Damage_Icon.webp';
import LightningIcon from '../../../../assets/Lightning_Damage_Icon.webp';
import NecroticIcon from '../../../../assets/Necrotic_Damage_Icon.webp';
import PiercingIcon from '../../../../assets/Piercing_Damage_Icon.webp';
import PoisonIcon from '../../../../assets/Poison_Damage_Icon.webp';
import PsychicIcon from '../../../../assets/Psychic_Damage_Icon.webp';
import RadiantIcon from '../../../../assets/Radiant_Damage_Icon.webp';
import SlashingIcon from '../../../../assets/Slashing_Damage_Icon.webp';
import ThunderIcon from '../../../../assets/Thunder_Damage_Icon.webp';

interface SpellCardProps {
  spell: Spell;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
  recommended?: boolean;
}

const damageIcons: Record<string, { icon: string; color: string; label: string }> = {
  'Режущий': { icon: SlashingIcon, color: '#FF4D4D', label: 'Режущий' },
  'Колющий': { icon: PiercingIcon, color: '#B37400', label: 'Колющий' },
  'Дробящий': { icon: BludgeoningIcon, color: '#8C8C8C', label: 'Дробящий' },
  'Огонь': { icon: FireIcon, color: '#FB9800', label: 'Огонь' },
  'Огнём': { icon: FireIcon, color: '#FB9800', label: 'Огонь' },
  'Холод': { icon: ColdIcon, color: '#8CCEE4', label: 'Холод' },
  'Холодом': { icon: ColdIcon, color: '#8CCEE4', label: 'Холод' },
  'Молния': { icon: LightningIcon, color: '#7EADEB', label: 'Молния' },
  'Электричеством': { icon: LightningIcon, color: '#7EADEB', label: 'Молния' },
  'Кислота': { icon: AcidIcon, color: '#EBF61A', label: 'Кислота' },
  'Кислотой': { icon: AcidIcon, color: '#EBF61A', label: 'Кислота' },
  'Звук': { icon: ThunderIcon, color: '#C198FA', label: 'Звук' },
  'Звуком': { icon: ThunderIcon, color: '#C198FA', label: 'Звук' },
  'Силовой': { icon: ForceIcon, color: '#DF7E7D', label: 'Силовой' },
  'Силовым': { icon: ForceIcon, color: '#DF7E7D', label: 'Силовой' },
  'Лучистый': { icon: RadiantIcon, color: '#FCDC87', label: 'Лучистый' },
  'Излучением': { icon: RadiantIcon, color: '#FCDC87', label: 'Лучистый' },
  'Некротический': { icon: NecroticIcon, color: '#B9ECD0', label: 'Некротический' },
  'Некротической': { icon: NecroticIcon, color: '#B9ECD0', label: 'Некротический' },
  'Психический': { icon: PsychicIcon, color: '#E395CF', label: 'Психический' },
  'Психической': { icon: PsychicIcon, color: '#E395CF', label: 'Психический' },
  'Яд': { icon: PoisonIcon, color: '#E0F296', label: 'Яд' },
  'Ядом': { icon: PoisonIcon, color: '#E0F296', label: 'Яд' },
};

export const SpellCard = memo(({ spell, selected, onToggle, disabled = false, recommended = false }: SpellCardProps) => {
  const theme = useTheme();

  const handleClick = () => {
    if (!disabled) onToggle();
  };

  const damageInfo = spell.damage_type ? damageIcons[spell.damage_type] : null;
  const hoverBorderColor = damageInfo?.color || theme.palette.primary.light;
  const scrollbarColor = damageInfo?.color || theme.palette.primary.main;

  // Определение ритуала из school (если есть "(ритуал)")
  let isRitual = false;
  let schoolName = spell.school || '';

  if (spell.school) {
    const lowerSchool = spell.school.toLowerCase();
    if (lowerSchool.includes('ритуал')) {
      isRitual = true;
      schoolName = spell.school.replace(/\(ритуал\)/i, '').replace(/ритуал/i, '').trim();
    }
  }

  // Определение концентрации из duration
  const hasConcentration = spell.duration?.toLowerCase().includes('концентрац') || false;

  // Разбор компонентов
  let verbal = false, somatic = false, material: string | null = null;
  if (spell.components && typeof spell.components === 'string') {
    const parts = spell.components.split(',').map(s => s.trim());
    verbal = parts.some(p => p === 'В');
    somatic = parts.some(p => p === 'С');
    const materialPart = parts.find(p => p.includes('(') || p.includes('М'));
    if (materialPart) {
      material = materialPart;
    }
  }

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
        maxHeight: 260,
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
        {/* Строка с названием, галочкой, звёздочкой и иконкой урона */}
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
            {spell.name}
            {recommended && (
              <span style={{ color: theme.palette.warning.main, marginLeft: 4 }}>⭐</span>
            )}
          </Typography>
          {damageInfo && (
            <img
              src={damageInfo.icon}
              alt={damageInfo.label}
              width={24}
              height={24}
              style={{ flexShrink: 0 }}
            />
          )}
        </Box>

        {/* Чипы */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {/* Уровень */}
          {spell.level !== undefined && spell.level !== null && spell.level !== '' && (
            <Chip
              avatar={
                <Avatar
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    width: 18,
                    height: 18,
                    fontSize: '0.7rem',
                  }}
                >
                  {spell.level}
                </Avatar>
              }
              label="Ур."
              size="small"
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
            />
          )}

          {/* Школа (без упоминания ритуала) */}
          {schoolName && (
            <Chip
              label={schoolName}
              size="small"
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
            />
          )}

          {/* Ритуал */}
          {isRitual && (
            <Chip
              label="Ритуал"
              size="small"
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
            />
          )}

          {/* Концентрация */}
          {hasConcentration && (
            <Chip
              label="Конц."
              size="small"
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
            />
          )}

          {/* Компоненты */}
          {verbal && (
            <Chip
              label="В"
              size="small"
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)', minWidth: 30 }}
            />
          )}
          {somatic && (
            <Chip
              label="С"
              size="small"
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)', minWidth: 30 }}
            />
          )}
          {material && (
            <Chip
              label={material}
              size="small"
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
            />
          )}

          {/* Длительность */}
          {spell.duration && (
            <Chip
              label={spell.duration}
              size="small"
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
            />
          )}

          {/* Время сотворения */}
          {spell.casting_time && (
            <Chip
              label={spell.casting_time}
              size="small"
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
            />
          )}
          {/* Дальность */}
          {spell.range && (
            <Chip
              label={spell.range}
              size="small"
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
            />
          )}
          {/* Урон */}
          {spell.damage_dice && (
            <Chip
              label={`Урон: ${spell.damage_dice}`}
              size="small"
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
            />
          )}
        </Box>
      </Box>

      {/* Описание */}
      {spell.description && (
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            mt: 0.5,
            whiteSpace: 'normal',
            wordWrap: 'break-word',
          }}
        >
          {spell.description}
        </Typography>
      )}
    </Box>
  );
});
SpellCard.displayName = 'SpellCard';